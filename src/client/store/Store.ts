import { observable } from 'mobx';
import * as rt from "../../runtime/types";
import { GameStore } from "./GameStore";
import { DevtoolUiStore } from "./DevtoolUiStore";

export type DevtoolPosition = "right" | "bottom";

export class Store {
	gameStore: GameStore;
	devtoolUiStore: DevtoolUiStore;

	@observable devtoolPosition: DevtoolPosition;
	@observable devtoolWidth: number;
	@observable devtoolHeight: number;

	constructor(runner: rt.RunnerLike, watcher: rt.EngineWatcherLike) {
		this.gameStore = new GameStore(runner);
		this.devtoolUiStore = new DevtoolUiStore(runner, watcher);

		// TODO read from storage
		this.devtoolPosition = "right";
		this.devtoolWidth = 400;
		this.devtoolHeight = 400;
	}
}
