import * as React from 'react';
import {observer} from 'mobx-react';
import { Store } from "../store/Store";
import { Handlers } from "../handlers/Handlers";
import { DevtoolUiStore, EntityInfo } from "../store/DevtoolUiStore";
import { EntityTreeNode } from "./EntityTreeNode";
import * as styles from "./EntityTree.css";

export interface EntityTreeProps {
	className?: string;
	store: Store;
	handlers: Handlers;
}

@observer
export class EntityTree extends React.Component<EntityTreeProps, {}> {
	render() {
		const { store, handlers, className } = this.props;
		const { devtoolUiStore } = store;
		const { sceneInfo } = devtoolUiStore;
		return <div className={styles["entity-tree"] + (className ? " " + className : "")}>
			<div className={styles["entity"]}>
				{ sceneInfo.constructorName }
				{ sceneInfo.name ? <span className={styles["inline-info"]}> "{sceneInfo.name}"</span> : null }
			</div>
			{ sceneInfo.childIds.map(eid => <EntityTreeNode key={eid} devtoolUiStore={devtoolUiStore} eid={eid} handlers={handlers} />) }
		</div>;
	}
}
