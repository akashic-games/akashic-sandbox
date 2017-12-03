export interface PerfRecordEntry {
	ave: number;
	max: number;
	min: number;
}

export interface PerfRecord {
	skippedFrameCount: PerfRecordEntry;
	rawFrameInterval: PerfRecordEntry;
	framePerSecond: PerfRecordEntry;
	frameTime: PerfRecordEntry;
	renderingTime: PerfRecordEntry;
}
