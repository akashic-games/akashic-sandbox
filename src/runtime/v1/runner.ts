import * as g from "@akashic/akashic-engine";
import { AkashicSandboxGlobal } from "../types/AkashicSandboxGlobal";
import { EntityInfo } from "../types/EntityInfo";
import { SceneInfo } from "../types/SceneInfo";
import { patchAkashicEngine } from "../shared/enginePatch";
import { RunnerV1 } from "./RunnerV1";
import { CommonTriggerV1 } from "./CommonTriggerV1";

declare var window: any;
if (!window.__akashicSandbox) {
	window.__akashicSandbox = {
		Runner: null,
		Trigger: null,
		patchEngine: null
	} as AkashicSandboxGlobal;
}

window.__akashicSandbox.Runner = RunnerV1;
window.__akashicSandbox.Trigger = CommonTriggerV1;
window.__akashicSandbox.patchEngine = function () {
	const onNotifyEntityChange = new CommonTriggerV1<EntityInfo>();
	const onNotifySceneChange = new CommonTriggerV1<SceneInfo>();
	const ns = { onNotifyEntityChange, onNotifySceneChange };
	patchAkashicEngine(g, ns);
	return ns;
};
