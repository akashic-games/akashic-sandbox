import { action } from 'mobx';
import { RunnerLike } from "../../runtime/types";
import { Store, DevtoolPosition } from "../store/Store";
import { DevtoolUiStore } from "../store/DevtoolUiStore";

export class Handlers {
	private _store: Store;
	private _runner: RunnerLike;

	constructor(store: Store, runner: RunnerLike) {
		this._store = store;
		this._runner = runner;
	}

	@action
	toggleExpandEntity(eid: number): void {
		const devUiStore = this._store.devtoolUiStore;
		const current = devUiStore.entityExpandTable.get("" + eid);
		devUiStore.entityExpandTable.set("" + eid, !current);
	}

	@action
	showGuideOnEntity(eid: number | null): void {
		const gameStore = this._store.gameStore;
		gameStore.activeBoundingRectData = (typeof eid == "number") ? this._runner.getBoundingRectData(eid) : null;
	}

	@action
	selectEntity(eid: number | null): void {
		this._store.devtoolUiStore.selectedEntityId = eid;
	}

	@action
	setDevtoolPosition(pos: DevtoolPosition): void {
		this._store.devtoolPosition = pos;
	}

	@action
	setDevtoolWidth(w: number): void {
		this._store.devtoolWidth = w;
	}
}
