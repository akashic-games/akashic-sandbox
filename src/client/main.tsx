import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as mobx from 'mobx';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
// import DevTools from 'mobx-react-devtools';
import { AkashicSandboxGlobal } from "../runtime/types/AkashicSandboxGlobal";
import { Store } from "./store/Store";
import { Root } from "./containers/Root";
import "./global.css";
import "./main.css";

mobx.useStrict(true);

export function main(sbg: AkashicSandboxGlobal) {

	const ns = sbg.patchEngine();

	const runner = new sbg.Runner({
		configurationUrl: "/configuration",
		assetBase: "/game/",
		nameHash: "dummyGameId",
		notifyPerformance: true,
		disablePreventDefaultOnScreen: false
	});

	const store = new Store(runner, ns);
	ReactDOM.render(<Root store={store} />, document.getElementById('app'));
	runner.initialize().then(() => runner.start());
}
