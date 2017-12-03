import * as React from 'react';
import {action} from "mobx";
import {observer} from 'mobx-react';
import { Store } from "../store/Store";  // should be interface?
import { Game } from "./Game";
import { Devtool } from "./Devtool";
import * as styles from "./Root.css";

export interface RootProps {
	store: Store;
}

@observer
export class Root extends React.Component<RootProps, {}> {
	render() {
		return <div className={styles["root"]} onClick={this.onClick}>
			<Game store={this.props.store} />
			{ this.props.store.message }
			<Devtool store={this.props.store} />
		</div>;
	}

	@action
	onClick = () => {
		console.log("click");
		this.props.store.message += "!";
	}
}
