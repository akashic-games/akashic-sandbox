import * as React from 'react';
import { observer } from 'mobx-react';
import { Store, DevtoolType } from "../store/Store";
import { Handlers } from "../handlers/Handlers";
import { Game } from "./Game";
import { Devtool } from "./Devtool";
import { CommandBar } from "./CommandBar";
import { Resizable } from "../components/Resizable";
import { MenuBar } from "../components/MenuBar";
import { SceneTool } from "./SceneTool";
import { EventsTool } from "./EventsTool";
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
		const activeDevtool = store.activeDevtool;
		const realClassName = styles["devtool"] + " " + styles[(pos === "right") ? "right" : "bottom"];
		return <div className={styles["root"]}>
			{ store.showDevtool ? <CommandBar /> : null }
			<Game gameStore={store.gameStore} />
			{
				store.showDevtool ?
					<Resizable className={realClassName} innerClassName={styles["devtool-inner"]}
					           initialWidth={store.devtoolWidth} initialHeight={store.devtoolHeight}
					           pos={pos} onWidthChanged={this._onChangeResizableWidth}>
						<MenuBar className={styles["menubar"]}>
							<span className={"icon fa fa-times-circle"}
							      title={"Close"}
							      onClick={() => handlers.closeDevtool() } />
							<span className={"icon fa " + (pos === "right" ? "fa-toggle-down" : "fa-toggle-right")}
							      onClick={this._onClickToggleTool} title={"Toggle devtool position"} />
							<div className="splitter" />
							<span className={`item ${this._devtoolClassName("Scene")}`} onClick={this._onClickScene}>Scene</span>
							<span className={`item ${this._devtoolClassName("Game")}`} onClick={this._onClickGame}>Game</span>
							<span className={`item ${this._devtoolClassName("Events")}`} onClick={this._onClickEvents}>Events</span>
							<span className={`item ${this._devtoolClassName("Storage")}`} onClick={this._onClickStorage}>Storage</span>
							<span className={`item ${this._devtoolClassName("Settings")}`} onClick={this._onClickSettings}>Settings</span>
						</MenuBar>
						{
							(activeDevtool === "Scene") ?
								<SceneTool className={styles["content"]} store={store} handlers={handlers}
								           vertical={pos === "right" && store.devtoolWidth < 500} /> :
								null
						}
						{
							(activeDevtool === "Events") ?
								<EventsTool className={styles["content"]} store={store} handlers={handlers}
								            vertical={pos === "right" && store.devtoolWidth < 500} /> :
								null
						}
					</Resizable> :
					<span className={"fa fa-fw fa-cog"}
					      style={{ position: "fixed", right: 3, top: 3, color: "silver" }}
					      onClick={() => handlers.openDevtool()} />
			}
		</div>;
	}

	private _devtoolClassName(t: DevtoolType): string {
		return (this.props.store.activeDevtool === t) ? "active" : "";
	}

	private _onClickScene = () => { this.props.handlers.setActiveDevtool("Scene"); }
	private _onClickGame = () => { this.props.handlers.setActiveDevtool("Game"); }
	private _onClickEvents = () => { this.props.handlers.setActiveDevtool("Events"); }
	private _onClickStorage = () => { this.props.handlers.setActiveDevtool("Storage"); }
	private _onClickSettings = () => { this.props.handlers.setActiveDevtool("Settings"); }

	private _onClickToggleTool = () => {
		const current = this.props.store.devtoolPosition;
		const next = (current === "right") ? "bottom" : "right";
		this.props.handlers.setDevtoolPosition(next);
	}

	private _onChangeResizableWidth = (w: number) => {
		this.props.handlers.setDevtoolWidth(w);
	}
}
