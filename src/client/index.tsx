import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { injectGlobal } from "styled-components";
import * as mobx from 'mobx';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import DevTools from 'mobx-react-devtools';
import { Store } from "./store/Store";
import { Root } from "./components/Root";

mobx.useStrict(true);

injectGlobal`
	@font-face {
		font-family: 'Roboto';
		src: url(./robotottf/Roboto-Light.ttf) format('truetype');
	}
	@font-face {
		font-family: 'Ricty';
		src: url(./RictyDiminished-Regular.ttf) format('truetype');
	}
	:root {
		--akashic-red: #c51e1e;
		--tool-bg-color: #f0f0f0;
		--tool-bg-color-active: #e0e0e0;
		--tool-bg-color-accent: #fe3c3c;
		--tool-bg-color-white: #f8f8f8;
		--tool-bg-color-white-active: #f0f8ff;
		--tool-border-color: #c0c0c8;
		--tool-inner-border-color: #c0c0c8;
		--tool-color-disabled: silver;
		--tool-color: #777;
		--tool-color-hover: #444;
		--tool-text-color: #555;
		--tool-text-color-light: #999;
		--tool-font: Roboto, sans-serif;
		--tool-font-monospace: Ricty, monospace;
	}
	* {
		margin: 0;
		padding: 0;
	}
	html, body, #app {
		width: 100%;
		height: 100%;
	}
`;

const store = new Store();
ReactDOM.render(<Root store={store} />, document.getElementById('app'));
