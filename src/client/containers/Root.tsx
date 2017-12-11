import * as React from 'react';
import { action } from "mobx";
import { observer } from 'mobx-react';
import { Store } from "../store/Store";
import { Handlers } from "../handlers/Handlers";
import { Game } from "./Game";
import { Devtool } from "./Devtool";
import { CommandBar } from "./CommandBar";
import { Resizable } from "../components/Resizable";
import { ToggleMenuBar } from "../components/ToggleMenuBar";
import { SceneTool } from "./SceneTool";
import * as styles from "./Root.css";

export interface RootProps {
	store: Store;
	handlers: Handlers;
}

@observer
export class Root extends React.Component<RootProps, {}> {
	render() {
		const { store, handlers } = this.props;
		const pos = store.devtoolPosition;
		const realClassName = styles["devtool"] + " " + styles[(pos === "right") ? "right" : "bottom"];
		return <div className={styles["root"]}>
			<CommandBar />
			<Game gameStore={store.gameStore} />
			<Resizable className={realClassName} innerClassName={styles["devtool-inner"]}
			           initialWidth={store.devtoolWidth} initialHeight={store.devtoolHeight}
			           pos={pos} onWidthChanged={this._onChangeResizableWidth}>
				<ToggleMenuBar className={styles["menubar"]}>
					<span className={"icon fa fa-times-circle"} title={"Close"} />
					<span className={"icon fa " + (pos === "right" ? "fa-toggle-down" : "fa-toggle-right")}
					      onClick={this._onClickToggleTool} title={"Toggle devtool position"} />
					<div className="splitter" />
					<span className="item">Scene</span>
					<span className="item active">Game</span>
					<span className="item">Events</span>
					<span className="item">Storage</span>
					<span className="item">Settings</span>
				</ToggleMenuBar>
				<SceneTool className={styles["content"]} store={store} handlers={handlers}
				           vertical={pos === "right" && store.devtoolWidth < 500} />
			</Resizable>
		</div>;
	}

	private _onClickToggleTool = () => {
		const current = this.props.store.devtoolPosition;
		const next = (current === "right") ? "bottom" : "right";
		this.props.handlers.setDevtoolPosition(next);
	}

	private _onChangeResizableWidth = (w: number) => {
		this.props.handlers.setDevtoolWidth(w);
	}
}
