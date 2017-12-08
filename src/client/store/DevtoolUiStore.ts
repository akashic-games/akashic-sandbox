import { observable, computed, action, ObservableMap } from 'mobx';
import * as rt from "../../runtime/types";

export interface EntityInfo {
	constructorName: string;
	local: boolean;
	x: number;
	y: number;
	width: number;
	height: number;
	angle: number;
	scaleX: number;
	scaleY: number;
	visible: boolean;
	touchable: boolean;
	childIds: number[];
}

export interface SceneInfo {
	constructorName: string | null;
	name: string | null;
	childIds: number[];
}

export class DevtoolUiStore {
	@observable sceneInfo: SceneInfo;
	entityTable: ObservableMap<EntityInfo>;
	rawEntityTable: { [key: number]: any };
	rawScene: any;
	private _runner: rt.RunnerLike;
	private _notifiers: rt.Notifiers;

	constructor(runner: rt.RunnerLike, notifiers: rt.Notifiers) {
		this.entityTable = observable.map<EntityInfo>();
		this.sceneInfo = { constructorName: null, name: null, childIds: [] };
		this.rawEntityTable = {};
		this.rawScene = null;
		this._runner = runner;
		this._notifiers = notifiers;
		notifiers.onNotifySceneChange.add(this._onNotifySceneChange);
		notifiers.onNotifyEntityChange.add(this._onNotifyEntityChange);
	}

	@action
	_onNotifySceneChange = (info: rt.SceneChangeInfo) => {
		this.rawScene = info.raw;
		info.raw = null;  // mobxに追跡されないよう生Sceneは削っておく(重要度未検証)
		this.sceneInfo = info;
	}

	@action
	_onNotifyEntityChange = (info: rt.EntityChangeInfo) => {
		switch (info.infoType) {
		case "register":
		case "modified":
			this.rawEntityTable[info.id] = info.raw;
			info.raw = null;  // mobxに追跡されないよう生Eは削っておく(重要度未検証)
			this.entityTable.set("" + info.id, info);
			break;
		case "unregister":
			delete this.rawEntityTable[info.id];
			this.entityTable.delete("" + info.id);
			break;
		}
	}
}
