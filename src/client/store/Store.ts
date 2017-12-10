import { observable } from 'mobx';
import * as rt from "../../runtime/types";
import { GameStore } from "./GameStore";
import { DevtoolUiStore } from "./DevtoolUiStore";

export class Store {
	gameStore: GameStore;
	devtoolUiStore: DevtoolUiStore;

	constructor(runner: rt.RunnerLike, watcher: rt.EngineWatcherLike) {
		this.gameStore = new GameStore(runner);
		this.devtoolUiStore = new DevtoolUiStore(runner, watcher);
	}
}
