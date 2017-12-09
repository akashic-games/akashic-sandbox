import * as React from 'react';
import {observer} from 'mobx-react';
import { Store } from "../store/Store";
import { DevtoolUiStore, EntityInfo } from "../store/DevtoolUiStore";
import * as styles from "./EntityTree.css";

export interface EntityTreeProps {
	className?: string;
	store: Store;
}

@observer
class EntityChildren extends React.Component<{ devUiStore: DevtoolUiStore; ids: number[] }, {}> {
	render() {
		const { devUiStore, ids } = this.props;
		return <div className={styles["nest"]}>
			{ ids.map(id => <EntityTreeNode key={id} devUiStore={devUiStore} id={id} />) }
		</div>;
	}
}

const EntityInlineInfo = observer((props: { entityInfo: EntityInfo }) => {
	const ei = props.entityInfo;
	return <span className={styles["inline-info"]}>
		{ ` #${ei.id}` } {/*
		{ (ei.x !== 0 || ei.y !== 0 || ei.width !== 0 || ei.height !== 0) ? ` (${ei.x},${ei.y})` : null }
		{ (ei.width !== 0 || ei.height !== 0) ? ` ${ei.width}x${ei.height}` : null }
		{ (ei.angle !== 0) ? ` ${ei.angle}&deg;` : null }
		{ (ei.scaleX !== 1 || ei.scaleY !== 1)
				? <span>
						<span className={"fa fa-search-plus"} />
						{ (ei.scaleX === ei.scaleY) ? ` ${ei.scaleX}%` : ` (${ei.scaleX}%,${ei.scaleY}%)` }
					</span>
				: null }
		{ ei.touchable ? <span>&nbsp;<span className={"fa fa-hand-o-up"} /></span> : null } */}
	</span>;
});

@observer
class EntityTreeNode extends React.Component<{ devUiStore: DevtoolUiStore; id: number }, {}> {
	render() {
		const { devUiStore, id } = this.props;
		const ei = devUiStore.entityTable.get("" + id);
		if (!ei)
			return null;
		const hasChild = ei.childIds.length > 0;
		const open = true;
		return <div>
			<div className={styles["entity"]}>
				<span className={"fa fa-fw " + (hasChild ? (open ? "fa-angle-down" : "fa-angle-right") : "")} />
				{ ei.constructorName }
				<EntityInlineInfo entityInfo={ei} />
			</div>
			{ (open && ei.childIds.length > 0) ? <EntityChildren devUiStore={this.props.devUiStore} ids={ei.childIds} /> : null }
		</div>;
	}
}

@observer
export class EntityTree extends React.Component<EntityTreeProps, {}> {
	render() {
		const store = this.props.store.devtoolUiStore;
		return <div className={styles["entity-tree"] + (this.props.className || "")}>
			<div className={styles["entity"]}>
				{ store.sceneInfo.constructorName }
				{ store.sceneInfo.name ? <span className={styles["inline-info"]}>{store.sceneInfo.name}</span> : null }
			</div>
			{ store.sceneInfo.childIds.map(id => <EntityTreeNode key={id} devUiStore={store} id={id} />) }
		</div>;
	}
}
