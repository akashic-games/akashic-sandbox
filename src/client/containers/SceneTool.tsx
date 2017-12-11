import * as React from 'react';
import { action } from "mobx";
import { observer } from 'mobx-react';
import { Store } from "../store/Store";
import { Handlers } from "../handlers/Handlers";
import { Resizable } from "../components/Resizable";
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
		const styleName = vertical ? "scene-tool-vertical" : "scene-tool-horizontal";
		return <div className={styles[styleName] + (className ? (" " + className) : "")}>
			<EntityTree className={styles["main"]} store={store} handlers={handlers} />
			<Resizable className={styles["sub"]} innerClassName={styles["sub-inner"]} pos={vertical ? "bottom" : "right"}
			           initialWidth={150} initialHeight={150} minWidth={50} minHeight={40}>
				<EntityDetail store={store} handlers={handlers} />
			</Resizable>
		</div>;
	}
}
