import { RunnerConstructorLike } from "./RunnerLike";
import { CommonTriggerConstructorLike } from "./CommonTriggerLike";

export interface AkashicSandboxGlobal {
	Runner: RunnerConstructorLike;
	Trigger: CommonTriggerConstructorLike;
}
