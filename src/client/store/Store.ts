import { observable } from 'mobx';
import * as rt from "../../runtime/types";
import { GameStore } from "./GameStore";
import { SceneToolStore } from "./SceneToolStore";
import { EventsToolStore } from "./EventsToolStore";
import { SandboxConfig } from "../../common/SandboxConfig";

export type DevtoolPosition = "right" | "bottom";
export type DevtoolType = "Scene" | "Events" | "Game" | "Storage" | "Settings";

export class Store {
	gameStore: GameStore;
	sceneToolStore: SceneToolStore;
	eventsToolStore: EventsToolStore;

	@observable showDevtool: boolean;
	@observable devtoolPosition: DevtoolPosition;
	@observable devtoolWidth: number;
	@observable devtoolHeight: number;
	@observable activeDevtool: DevtoolType;

	constructor(runner: rt.RunnerLike, watcher: rt.EngineWatcherLike, sandboxConfig: SandboxConfig = {}) {
		this.gameStore = new GameStore(runner);
		this.sceneToolStore = new SceneToolStore(runner, watcher);
		this.eventsToolStore = new EventsToolStore(sandboxConfig);

		this.showDevtool = (sandboxConfig.showMenu != null) ? sandboxConfig.showMenu : true;

		// TODO read from storage
		this.devtoolPosition = "right";
		this.devtoolWidth = 400;
		this.devtoolHeight = 400;
		this.activeDevtool = "Scene";
	}
}
