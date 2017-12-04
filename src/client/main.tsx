import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as mobx from 'mobx';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
// import DevTools from 'mobx-react-devtools';
import { RunnerConstructorLike } from "../runtime/common/RunnerLike";
import { Store } from "./store/Store";
import { Root } from "./containers/Root";
import "./global.css";
import "./main.css";

mobx.useStrict(true);

export function main(runnerClass: RunnerConstructorLike) {

	const runner = new runnerClass({
		configurationUrl: "/configuration",
		assetBase: "/game/",
		nameHash: "dummyGameId",
		disablePreventDefaultOnScreen: false
		// onNotifyPerformance: (record: PerfRecord) => void;
		// onError?: (err: any) => void;
	});

	const store = new Store(runner);
	ReactDOM.render(<Root store={store} />, document.getElementById('app'));
	runner.initialize().then(() => runner.start());
}
