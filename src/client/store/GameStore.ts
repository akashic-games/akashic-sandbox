import { observable, computed } from 'mobx';
import { RunnerLike, BoundingRectData } from "../../runtime/types";

export class GameStore {
	@observable activeBoundingRectData: BoundingRectData;

	private _runner: RunnerLike;

	constructor(runner: RunnerLike) {
		this.activeBoundingRectData = null;
		this._runner = runner;
	}

	@computed get containerElement() {
		return this._runner.containerElement;
	}
}
