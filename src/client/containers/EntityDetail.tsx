import * as React from 'react';
import { action } from "mobx";
import { observer } from 'mobx-react';
import { Store } from "../store/Store";
import { DevtoolUiStore } from "../store/DevtoolUiStore";
import { Handlers } from "../handlers/Handlers";
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
		const devtoolUiStore = store.devtoolUiStore;
		const ei = devtoolUiStore.entityTable.get("" + devtoolUiStore.selectedEntityId);
		if (!ei)
			return <div className={styles["entity-detail"] + (className ? (" " + className) : "")} />

		return <div className={styles["entity-detail"] + (className ? (" " + className) : "")}>
			<table>
				<tbody>
					{ DevtoolUiStore.entityInfoKeys.map(key => <tr key={key}><td>{key}</td><td>{ei[key]}</td></tr>) }
				</tbody>
			</table>
		</div>;
	}
}

