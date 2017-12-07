import { RunnerConstructorLike } from "./RunnerLike";
import { CommonTriggerLike, CommonTriggerConstructorLike } from "./CommonTriggerLike";
import { EntityChangeInfo } from "../types/EntityChangeInfo";
import { SceneChangeInfo } from "../types/SceneChangeInfo";

export interface Notifiers {
	onNotifyEntityChange: CommonTriggerLike<EntityChangeInfo>;
	onNotifySceneChange: CommonTriggerLike<SceneChangeInfo>;
}

export interface AkashicSandboxGlobal {
	Runner: RunnerConstructorLike;
	Trigger: CommonTriggerConstructorLike;
	patchEngine: () => Notifiers;
}
