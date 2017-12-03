import { PerfRecord } from "./PerfRecord";

export interface RunnerLike {
	containerElement: HTMLDivElement;
	initialize(): Promise<void>;
	start(): void;
}

export interface RunnerParameterObject {
	configurationUrl: string;
	assetBase: string;
	nameHash: string;
	disablePreventDefaultOnScreen?: boolean;
	onNotifyPerformance?: (record: PerfRecord) => void;
	onError?: (err: any) => void;
}

export interface RunnerConstructorLike {
	new (param: RunnerParameterObject): RunnerLike;
}
