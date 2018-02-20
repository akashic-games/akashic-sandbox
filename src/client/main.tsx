import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as mobx from 'mobx';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { AkashicSandboxGlobal } from "../runtime/types/AkashicSandboxGlobal";
import { Handlers } from "./handlers/Handlers";
import { Store } from "./store/Store";
import { Root } from "./containers/Root";
import "./global.css";
import "./main.css";

mobx.useStrict(true);

function load(url: string, responseType: XMLHttpRequestResponseType, callback: (error: any, data?: any) => void): void {
	var request = new XMLHttpRequest();
	request.open("GET", url, true);
	request.responseType = responseType;
	request.timeout = 15000; // TODO ugh! magic number
	request.addEventListener("timeout", (() => callback(new Error("timeout"))), false);
	request.addEventListener("load", () => {
		if (request.status >= 200 && request.status < 300) {
			var response = responseType === "text" ? request.responseText : request.response;
			callback(null, response);
		} else {
			callback(new Error("loading error. status: " + request.status));
		}
	}, false);
	request.addEventListener("error", (e => callback(e)), false);
	request.send();
}

export function main(sbg: AkashicSandboxGlobal) {
	load("/sandboxconfig", "json", (e, sandboxConfig) => {
		if (e) {
			console.error(e);
			return;
		}
		const watcher = sbg.patchEngine();
		watcher.start();

		const runner = new sbg.Runner({
			configurationUrl: "/configuration",
			assetBase: "/game/",
			nameHash: "dummyGameId",
			notifyPerformance: true,
			disablePreventDefaultOnScreen: false
		});

		const store = new Store(runner, watcher, sandboxConfig);
		const handlers = new Handlers(store, runner);

		ReactDOM.render(<Root store={store} handlers={handlers} />, document.getElementById('app'));
		runner.initialize().then(() => runner.start());
	});
}
