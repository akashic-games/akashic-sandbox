import { main } from "./main";
import { RunnerConstructorLike } from "../runtime/types/RunnerLike";
import { AkashicSandboxGlobal } from "../runtime/types/AkashicSandboxGlobal";

declare var window: Window;
interface Window {
	__akashicSandbox: AkashicSandboxGlobal;
}

main(window.__akashicSandbox.Runner);
