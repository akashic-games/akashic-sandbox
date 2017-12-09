import * as g from "@akashic/akashic-engine";
import { AkashicSandboxGlobal } from "../types/AkashicSandboxGlobal";
import { ContentChangeInfo } from "../types/ContentChangeInfo";
import { EngineWatcher } from "../shared/EngineWatcher";
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
	const onNotifyContentChange = new CommonTriggerV1<ContentChangeInfo>();
	return new EngineWatcher(g, onNotifyContentChange);
};
