import { main } from "./main";
import { RunnerConstructorLike } from "../runtime/common/RunnerLike";
import { AkashicSandboxGlobal } from "../runtime/common/AkashicSandboxGlobal";

declare var window: Window;
interface Window {
	__akashicSandbox: AkashicSandboxGlobal;
}

main(window.__akashicSandbox.Runner);
