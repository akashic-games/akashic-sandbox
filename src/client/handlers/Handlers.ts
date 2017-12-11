import { action } from 'mobx';
import { RunnerLike } from "../../runtime/types";
import { Store, DevtoolPosition } from "../store/Store";
import { SceneToolStore } from "../store/SceneToolStore";

export class Handlers {
	private _store: Store;
	private _runner: RunnerLike;

	constructor(store: Store, runner: RunnerLike) {
		this._store = store;
		this._runner = runner;
	}

	@action
	toggleExpandEntity(eid: number): void {
		const sceneToolStore = this._store.sceneToolStore;
		const current = sceneToolStore.entityExpandTable.get("" + eid);
		sceneToolStore.entityExpandTable.set("" + eid, !current);
	}

	@action
	showGuideOnEntity(eid: number | null): void {
		const gameStore = this._store.gameStore;
		gameStore.activeBoundingRectData = (typeof eid == "number") ? this._runner.getBoundingRectData(eid) : null;
	}

	@action
	selectEntity(eid: number | null): void {
		this._store.sceneToolStore.selectedEntityId = eid;
	}

	@action
	setDevtoolPosition(pos: DevtoolPosition): void {
		this._store.devtoolPosition = pos;
	}

	@action
	setDevtoolWidth(w: number): void {
		this._store.devtoolWidth = w;
	}

	dumpEntity(eid: number): void {
		console.log(this._store.sceneToolStore.rawEntityTable[eid]);
	}

	assignToGlobalVariable(eid: number): void {
		(window as any).$e = this._store.sceneToolStore.rawEntityTable[eid];
	}
}
