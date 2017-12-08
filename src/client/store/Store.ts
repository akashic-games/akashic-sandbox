import { observable } from 'mobx';
import * as rt from "../../runtime/types";
import { GameStore } from "./GameStore";
import { DevtoolUiStore } from "./DevtoolUiStore";

export class Store {
	@observable activePane: string = "E";
	@observable message: string = "FOO";

	gameStore: GameStore;
	devtoolUiStore: DevtoolUiStore;

	constructor(runner: rt.RunnerLike, notifiers: rt.Notifiers) {
		this.gameStore = new GameStore(runner);
		this.devtoolUiStore = new DevtoolUiStore(runner, notifiers);
	}
}
