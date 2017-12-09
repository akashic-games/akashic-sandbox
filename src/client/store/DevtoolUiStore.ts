import { observable, computed, action, ObservableMap } from 'mobx';
import * as rt from "../../runtime/types";

export interface EntityInfo {
	constructorName: string;
	id: number;
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
	private _watcher: rt.EngineWatcherLike;

	constructor(runner: rt.RunnerLike, watcher: rt.EngineWatcherLike) {
		this.entityTable = observable.map<EntityInfo>();
		this.sceneInfo = { constructorName: null, name: null, childIds: [] };
		this.rawEntityTable = {};
		this.rawScene = null;
		this._runner = runner;
		this._watcher = watcher;
		watcher.onNotifyContentChange.add(this._onNotifyContentChange);
	}

	@action
	_onNotifyContentChange = (cci: rt.ContentChangeInfo) => {
		for (let i = 0; i < cci.entity.length; ++i) {
			const info = cci.entity[i];
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
			default:
				// never
			}
		}
		this.rawScene = cci.scene.raw;
		cci.scene.raw = null;  // mobxに追跡されないよう生Sceneは削っておく(重要度未検証)
		this.sceneInfo = cci.scene;
	}
}
