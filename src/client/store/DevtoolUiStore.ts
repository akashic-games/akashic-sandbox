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
	static entityInfoKeys = [
		"id", "local",
		"x", "y", "width", "height",
		"angle", "scaleX", "scaleY",
		"visible", "touchable"
	];

	@observable sceneInfo: SceneInfo;
	@observable selectedEntityId: number;
	entityTable: ObservableMap<EntityInfo>;
	entityExpandTable: ObservableMap<boolean>;
	rawEntityTable: { [key: number]: any };
	rawScene: any;
	private _watcher: rt.EngineWatcherLike;

	constructor(runner: rt.RunnerLike /* TODO unused */, watcher: rt.EngineWatcherLike) {
		this.sceneInfo = { constructorName: null, name: null, childIds: [] };
		this.selectedEntityId = null;
		this.entityTable = observable.map<EntityInfo>();
		this.entityExpandTable = observable.map<boolean>();
		this.rawEntityTable = {};
		this.rawScene = null;
		this._watcher = watcher;
		watcher.onNotifyContentChange.add(this._onNotifyContentChange);
	}

	// TODO handler 側に移すべき？(storeはrunnerを直接監視すべきではない？)
	@action
	private _onNotifyContentChange = (cci: rt.ContentChangeInfo) => {
		for (let i = 0; i < cci.entity.length; ++i) {
			const info = cci.entity[i];
			const eid = info.id;
			switch (info.infoType) {
			case "register":
				this.entityExpandTable.set("" + eid, false);
				// fall-through
			case "modified":
				this.rawEntityTable[eid] = info.raw;
				info.raw = null;  // mobxに追跡されないよう生Eは削っておく(重要度未検証)
				this.entityTable.set("" + eid, info);
				break;
			case "unregister":
				delete this.rawEntityTable[eid];
				this.entityTable.delete("" + eid);
				this.entityExpandTable.delete("" + eid);
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
