import { RunnerConstructorLike } from "./RunnerLike";
import { CommonTriggerLike, CommonTriggerConstructorLike } from "./CommonTriggerLike";
import { EngineWatcherLike } from "./EngineWatcherLike";

export interface AkashicSandboxGlobal {
	Runner: RunnerConstructorLike;
	Trigger: CommonTriggerConstructorLike;
	patchEngine: () => EngineWatcherLike;
}
