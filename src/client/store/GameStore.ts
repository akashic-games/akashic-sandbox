import { observable, computed } from 'mobx';
import { RunnerLike } from "../../runtime/types/RunnerLike";

export class GameStore {
	private _runner: RunnerLike;

	constructor(runner: RunnerLike) {
		this._runner = runner;
	}

	@computed get containerElement() {
		return this._runner.containerElement;
	}
}
