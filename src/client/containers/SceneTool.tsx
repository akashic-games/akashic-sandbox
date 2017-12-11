import * as React from 'react';
import { action } from "mobx";
import { observer } from 'mobx-react';
import { Store } from "../store/Store";
import { Handlers } from "../handlers/Handlers";
import { EntityTree } from "./EntityTree";
import { EntityDetail } from "./EntityDetail";
import * as styles from "./SceneTool.css";

export interface SceneToolProps {
	className?: string;
	store: Store;
	handlers: Handlers;
}

@observer
export class SceneTool extends React.Component<SceneToolProps, {}> {
	render() {
		const { className, store, handlers } = this.props;
		return <div className={styles["scene-tool"] + (className ? (" " + className) : "")}>
			<EntityTree className={styles["main"]} store={store} handlers={handlers} />
			<EntityDetail className={styles["sub"]} store={store} handlers={handlers} />
		</div>;
	}
}
