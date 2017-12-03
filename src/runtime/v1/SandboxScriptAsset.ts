import * as g from "@akashic/akashic-engine";

interface Window {
	gScriptContainer: {[key: string]: Function};
}

declare var window: Window;

export class SandboxScriptAsset extends g.ScriptAsset {
	private _loading: boolean;
	private _script: string;

	constructor(id: string, path: string) {
		super(id, path);
		this._script = undefined;
		this._loading = false;
		var heads = document.getElementsByTagName("head");
		var container: Node = (heads.length === 0) ? document.body : heads[0];
		var script = document.createElement("script") as HTMLScriptElement;
		script.onload = () => {
			this._script = script.text; // TODO: とれない・・
			this._loading = false;
		};
		script.onerror = () => {
			this._loading = false;
		};
		script.src = this.path + "?id=" + this.id;
		this._loading = true;
		container.appendChild(script);
	}

	_load(loader: g.AssetLoadHandler): void {
		var waitLoader = () => {
			if (this._loading) {
				setTimeout(waitLoader, 100);
				return;
			}
			if (this._script !== undefined) {
				loader._onAssetLoad(this);
			} else {
				loader._onAssetError(this, g.ExceptionFactory.createAssetLoadError("can not load script"));
			}
		};
		setTimeout(waitLoader, this._loading ? 100 : 0);
	}

	execute(execEnv: g.ScriptAssetExecuteEnvironment): any {
		window.gScriptContainer[this.id](execEnv);
		return execEnv.module.exports;
	}
}
