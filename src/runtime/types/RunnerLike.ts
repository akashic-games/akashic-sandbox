import { PerfRecord } from "./PerfRecord";
import { CommonTriggerLike } from "./CommonTriggerLike";
import { BoundingRectData } from "./BoundingRectData";

export interface RunnerLike {
	containerElement: HTMLDivElement;
	onNotifyPerformance: CommonTriggerLike<PerfRecord>;
	onError: CommonTriggerLike<any>

	initialize(): Promise<void>;
	start(): void;
	setScale(scale: number): void;
	getBoundingRectData(eid: number): BoundingRectData;
}

export interface RunnerParameterObject {
	configurationUrl: string;
	assetBase: string;
	nameHash: string;
	notifyPerformance?: boolean;
	notifyModification?: boolean;
	disablePreventDefaultOnScreen?: boolean;
}

export interface RunnerConstructorLike {
	new (param: RunnerParameterObject): RunnerLike;
}
