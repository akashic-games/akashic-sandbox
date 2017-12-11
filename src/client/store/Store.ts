import { observable } from 'mobx';
import * as rt from "../../runtime/types";
import { GameStore } from "./GameStore";
import { SceneToolStore } from "./SceneToolStore";

export type DevtoolPosition = "right" | "bottom";

export class Store {
	gameStore: GameStore;
	sceneToolStore: SceneToolStore;

	@observable devtoolPosition: DevtoolPosition;
	@observable devtoolWidth: number;
	@observable devtoolHeight: number;

	constructor(runner: rt.RunnerLike, watcher: rt.EngineWatcherLike) {
		this.gameStore = new GameStore(runner);
		this.sceneToolStore = new SceneToolStore(runner, watcher);

		// TODO read from storage
		this.devtoolPosition = "right";
		this.devtoolWidth = 400;
		this.devtoolHeight = 400;
	}
}
