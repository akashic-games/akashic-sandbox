import { observable } from 'mobx';
import { RunnerLike } from "../../runtime/common/RunnerLike";
import { GameStore } from "./GameStore";

export class Store {
	@observable activePane: string = "E";
	@observable message: string = "FOO";

	gameStore: GameStore;

	constructor(runner: RunnerLike) {
		this.gameStore = new GameStore(runner);
	}
}
