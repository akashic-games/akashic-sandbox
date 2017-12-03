import { RunnerV1 } from "./RunnerV1";

declare var window: any;
if (!window.__akashicSandbox)
	window.__akashicSandbox = {};

window.__akashicSandbox.Runner = RunnerV1;
