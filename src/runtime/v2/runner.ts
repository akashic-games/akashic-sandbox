import { AkashicSandboxGlobal } from "../types/AkashicSandboxGlobal";
import { RunnerV2 } from "./RunnerV2";
import { CommonTriggerV2 } from "./CommonTriggerV2";

declare var window: any;
if (!window.__akashicSandbox) {
	window.__akashicSandbox = {
		Runner: null,
		Trigger: null
	} as AkashicSandboxGlobal;
}

window.__akashicSandbox.Runner = RunnerV2;
window.__akashicSandbox.Trigger = CommonTriggerV2;
