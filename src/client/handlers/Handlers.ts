import { Store } from "../store/Store";
import { DevtoolUiStore } from "../store/DevtoolUiStore";

export class DevtoolHandlers {
	private _store: DevtoolUiStore;

	constructor(store: DevtoolUiStore) {
		this._store = store;
	}

	toggleExpandEntity(eid: number): void {
		this._store.setExpandEntity(eid, !this._store.entityExpandTable.get("" + eid));
	}
}

// TODO 機能分割検討: Storeに対する全権を持ちすぎているかもしれない。
export class Handlers {
	devtoolHanlders: DevtoolHandlers;
	private _store: Store;

	constructor(store: Store) {
		this._store = store;
		this.devtoolHanlders = new DevtoolHandlers(this._store.devtoolUiStore);
	}
}
