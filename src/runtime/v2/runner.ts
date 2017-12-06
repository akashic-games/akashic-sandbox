import * as g from "@akashic/akashic-engine";
import { AkashicSandboxGlobal } from "../types/AkashicSandboxGlobal";
import { EntityInfo } from "../types/EntityInfo";
import { SceneInfo } from "../types/SceneInfo";
import { patchAkashicEngine } from "../shared/enginePatch";
import { RunnerV2 } from "./RunnerV2";
import { CommonTriggerV2 } from "./CommonTriggerV2";

declare var window: any;
if (!window.__akashicSandbox) {
	window.__akashicSandbox = {
		Runner: null,
		Trigger: null,
		patchEngine: null
	} as AkashicSandboxGlobal;
}

window.__akashicSandbox.Runner = RunnerV2;
window.__akashicSandbox.Trigger = CommonTriggerV2;
window.__akashicSandbox.patchEngine = function () {
	const onNotifyEntityChange = new CommonTriggerV2<EntityInfo>();
	const onNotifySceneChange = new CommonTriggerV2<SceneInfo>();
	const ns = { onNotifyEntityChange, onNotifySceneChange };
	patchAkashicEngine(g, ns);
	return ns;
};
