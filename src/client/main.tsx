import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as mobx from 'mobx';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
// import Devtools from "mobx-react-devtools";
import { AkashicSandboxGlobal } from "../runtime/types/AkashicSandboxGlobal";
import { Handlers } from "./handlers/Handlers";
import { Store } from "./store/Store";
import { Root } from "./containers/Root";
import "./global.css";
import "./main.css";

mobx.useStrict(true);

export function main(sbg: AkashicSandboxGlobal) {

	const watcher = sbg.patchEngine();
	watcher.start();

	const runner = new sbg.Runner({
		configurationUrl: "/configuration",
		assetBase: "/game/",
		nameHash: "dummyGameId",
		notifyPerformance: true,
		disablePreventDefaultOnScreen: false
	});

	const store = new Store(runner, watcher);
	const handlers = new Handlers(store);

	ReactDOM.render(<Root store={store} handlers={handlers} />, document.getElementById('app'));
	// ReactDOM.render(<div><Root store={store} /><Devtools /></div>, document.getElementById('app'));
	runner.initialize().then(() => runner.start());
}
