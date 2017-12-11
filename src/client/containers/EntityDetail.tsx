import * as React from 'react';
import { action } from "mobx";
import { observer } from 'mobx-react';
import { Store } from "../store/Store";
import { SceneToolStore } from "../store/SceneToolStore";
import { Handlers } from "../handlers/Handlers";
import { MenuBar } from "../components/MenuBar";
import { EntityTree } from "./EntityTree";
import * as styles from "./EntityDetail.css";

export interface EntityDetailProps {
	className?: string;
	store: Store;
	handlers: Handlers;
}

@observer
export class EntityDetail extends React.Component<EntityDetailProps, {}> {
	render() {
		const { className, store, handlers } = this.props;
		const sceneToolStore = store.sceneToolStore;
		const ei = sceneToolStore.entityTable.get("" + sceneToolStore.selectedEntityId);
		return <div className={styles["self"] + (className ? (" " + className) : "")}>
			<MenuBar className={styles["menubar"]}>
				<span className={"icon fa fa-fw fa-terminal"} title={"Dump to console"} onClick={this._onClickDump} />
				<span className={"icon fa fa-fw fa-dollar"} title={"Assign to variable $e"} onClick={this._onClickAssign} />
				<div className={"splitter"} />
				<span className={"label"}>{ei ? (ei.constructorName + " #" + ei.id) : "(Unselected)"}</span>
			</MenuBar>
			<div className={styles["content"]}>
				{
					ei ?
						<table>
							<tbody>
								{ SceneToolStore.entityInfoKeys.map(key => <tr key={key}><td>{key}</td><td>{JSON.stringify(ei[key])}</td></tr>) }
							</tbody>
						</table> :
						null
				}
			</div>
		</div>;
	}

	private _onClickDump = () => {
		const { handlers, store } = this.props;
		handlers.dumpEntity(store.sceneToolStore.selectedEntityId);
	}

	private _onClickAssign = () => {
		const { handlers, store } = this.props;
		handlers.assignToGlobalVariable(store.sceneToolStore.selectedEntityId);
	}
}

