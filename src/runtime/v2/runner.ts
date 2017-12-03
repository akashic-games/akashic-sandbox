import { RunnerV2 } from "./RunnerV2";

declare var window: any;
if (!window.__akashicSandbox)
	window.__akashicSandbox = {};

window.__akashicSandbox.Runner = RunnerV2;
