import { PerfRecord } from "./PerfRecord";
import { EntityInfo } from "./EntityInfo";
import { CommonTriggerLike } from "./CommonTriggerLike";

export interface RunnerLike {
	containerElement: HTMLDivElement;
	onNotifyPerformance: CommonTriggerLike<PerfRecord>;
	onNotifyEntityChange: CommonTriggerLike<EntityInfo>;
	onError: CommonTriggerLike<any>
	initialize(): Promise<void>;
	start(): void;
}

export interface RunnerParameterObject {
	configurationUrl: string;
	assetBase: string;
	nameHash: string;
	notifyPerformance?: boolean;
	notifyEntityChange?: boolean;
	disablePreventDefaultOnScreen?: boolean;
}

export interface RunnerConstructorLike {
	new (param: RunnerParameterObject): RunnerLike;
}
