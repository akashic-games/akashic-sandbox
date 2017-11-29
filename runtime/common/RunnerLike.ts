export interface RunnerLike {
	containerElement: HTMLDivElement;
	initialize(): Promise<void>;
	start(): void;
}

export interface RunnerParameterObject {
	nameHash: string;
	disablePreventDefaultOnScreen?: boolean;
	onNotifyPerformance?: (record: PerfRecord) => void;
	onError?: (err: any) => void;
}

export interface RunnerConstructorLike {
	new (param: RunnerParameterObject): RunnerLike;
}
