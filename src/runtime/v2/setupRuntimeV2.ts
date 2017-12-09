import * as g from "@akashic/akashic-engine";
import { AkashicSandboxGlobal } from "../types/AkashicSandboxGlobal";
import { ContentChangeInfo } from "../types/ContentChangeInfo";
import { EngineWatcher } from "../shared/EngineWatcher";
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
	const onNotifyContentChange = new CommonTriggerV2<ContentChangeInfo>();
	return new EngineWatcher(g, onNotifyContentChange);
};
