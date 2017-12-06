import { RunnerConstructorLike } from "./RunnerLike";
import { CommonTriggerLike, CommonTriggerConstructorLike } from "./CommonTriggerLike";
import { EntityInfo } from "../types/EntityInfo";
import { SceneInfo } from "../types/SceneInfo";

export interface Notifiers {
	onNotifyEntityChange: CommonTriggerLike<EntityInfo>;
	onNotifySceneChange: CommonTriggerLike<SceneInfo>;
}

export interface AkashicSandboxGlobal {
	Runner: RunnerConstructorLike;
	Trigger: CommonTriggerConstructorLike;
	patchEngine: () => Notifiers;
}
