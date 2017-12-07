import * as g from "@akashic/akashic-engine";
import { AkashicSandboxGlobal } from "../types/AkashicSandboxGlobal";
import { EntityChangeInfo } from "../types/EntityChangeInfo";
import { SceneChangeInfo } from "../types/SceneChangeInfo";
import { patchAkashicEngine } from "../shared/patchAkashicEngine";
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
	const onNotifyEntityChange = new CommonTriggerV2<EntityChangeInfo>();
	const onNotifySceneChange = new CommonTriggerV2<SceneChangeInfo>();
	const ns = { onNotifyEntityChange, onNotifySceneChange };
	patchAkashicEngine(g, ns);
	return ns;
};
