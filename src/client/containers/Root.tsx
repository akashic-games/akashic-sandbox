import * as React from 'react';
import {action} from "mobx";
import {observer} from 'mobx-react';
import { Store } from "../store/Store";
import { Handlers } from "../handlers/Handlers";
import { Game } from "./Game";
import { Devtool } from "./Devtool";
import { CommandBar } from "./CommandBar";
import { EntityTree } from "./EntityTree";
import { StickyPane } from "../components/StickyPane";
import { ToggleMenuBar } from "../components/ToggleMenuBar";
import * as styles from "./Root.css";

export interface RootProps {
	store: Store;
	handlers: Handlers;
}

@observer
export class Root extends React.Component<RootProps, {}> {
	render() {
		const { store, handlers } = this.props;
		return <div className={styles["root"]}>
			<CommandBar />
			<Game gameStore={store.gameStore} />
			<StickyPane className={styles["devtool"]} innerClassName={styles["devtool-inner"]} pos="right" >
				<ToggleMenuBar className={styles["menubar"]}>
					<span className="icon fa fa-times-circle"></span>
					<span className="icon fa fa-toggle-down"></span>
					<div className="splitter" />
					<span className="item">Scene</span>
					<span className="item active">Game</span>
					<span className="item">Events</span>
					<span className="item">Storage</span>
					<span className="item">Settings</span>
				</ToggleMenuBar>
				<EntityTree className={styles["content"]} store={store} handlers={handlers} />
			</StickyPane>
		</div>;
	}
}
