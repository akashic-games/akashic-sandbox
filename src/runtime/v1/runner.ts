import { AkashicSandboxGlobal } from "../common/AkashicSandboxGlobal";
import { RunnerV1 } from "./RunnerV1";
import { CommonTriggerV1 } from "./CommonTriggerV1";

declare var window: any;
if (!window.__akashicSandbox) {
	window.__akashicSandbox = {
		Runner: null,
		Trigger: null
	} as AkashicSandboxGlobal;
}

window.__akashicSandbox.Runner = RunnerV1;
window.__akashicSandbox.Trigger = CommonTriggerV1;
