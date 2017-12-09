import { CommonTriggerLike } from "./CommonTriggerLike";
import { ContentChangeInfo } from "./ContentChangeInfo";

export interface EngineWatcherLike {
	onNotifyContentChange: CommonTriggerLike<ContentChangeInfo>;
	start(): void;
	stop(): void;
}
