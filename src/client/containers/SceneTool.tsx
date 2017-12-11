import * as React from 'react';
import { action } from "mobx";
import { observer } from 'mobx-react';
import { Store } from "../store/Store";
import { Handlers } from "../handlers/Handlers";
import { VerticalSplitPane } from "../components/VerticalSplitPane";
import { HorizontalSplitPane } from "../components/HorizontalSplitPane";
import { EntityTree } from "./EntityTree";
import { EntityDetail } from "./EntityDetail";
import * as styles from "./SceneTool.css";

export interface SceneToolProps {
	className?: string;
	store: Store;
	handlers: Handlers;
	vertical: boolean;
}

@observer
export class SceneTool extends React.Component<SceneToolProps, {}> {
	render() {
		const { className, store, handlers, vertical } = this.props;
		if (vertical) {
			return <VerticalSplitPane className={(className ? (" " + className) : "")}
			                          initialSecondSize={200}
			                          first={<EntityTree className={styles["main"]} store={store} handlers={handlers} />}
			                          second={<EntityDetail className={styles["sub"]} store={store} handlers={handlers} />} />;
		} else {
			return <HorizontalSplitPane className={(className ? (" " + className) : "")}
			                            initialSecondSize={200}
			                            first={<EntityTree className={styles["main"]} store={store} handlers={handlers} />}
			                            second={<EntityDetail className={styles["sub"]} store={store} handlers={handlers} />} />;
		}
	}
}
