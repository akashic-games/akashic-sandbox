import * as React from 'react';
import {observer} from 'mobx-react';
import { Store } from "../store/Store";
import { Handlers } from "../handlers/Handlers";
import { DevtoolUiStore, EntityInfo } from "../store/DevtoolUiStore";
import * as styles from "./EntityTreeNode.css";

interface EntityTreeChildrenProps {
	devtoolUiStore: DevtoolUiStore;
	handlers: Handlers;
	eids: number[];
}

@observer
class EntityChildren extends React.Component<EntityTreeChildrenProps, {}> {
	render() {
		const { devtoolUiStore, handlers, eids } = this.props;
		return <div className={styles["nest"]}>
			{ eids.map(eid => <EntityTreeNode key={eid} devtoolUiStore={devtoolUiStore} handlers={handlers} eid={eid} />) }
		</div>;
	}
}

@observer
class EntityInlineInfo extends React.Component<{ entityInfo: EntityInfo }, {}> {
	shouldComponentUpdate(nextProps: { entityInfo: EntityInfo }): boolean {
		const ei = this.props.entityInfo;
		const ni = nextProps.entityInfo;
		return (ei.x !== ni.x || ei.y !== ni.y || ei.width !== ni.width || ei.height !== ni.height
			|| ei.angle !== ni.angle || ei.scaleX !== ni.scaleX || ei.scaleY !== ni.scaleY || ei.touchable !== ni.touchable);
	}

	render() {
		function format(v: number) {
			return (Math.floor(v) === v) ? v : v.toFixed(2).replace(/\.?0+$/, "");
		}
		const ei = this.props.entityInfo;
		const { id, x, y, width, height, angle, scaleX, scaleY, touchable } = ei;
		return <span className={styles["inline-info"]}>
			{ ` #${id} (${format(x)},${format(y)}) ${format(width)}x${format(height)} ${format(angle)}\u00b0` /* \u00b0 for &deg; */ }
			{ (scaleX !== 1 || scaleY !== 1)
					? <span>
							<span className={"fa fa-search-plus"} title="scale" />
							{ (scaleX === scaleY) ? ` ${format(scaleX)}%` : ` (${format(scaleX)}%,${format(scaleY)}%)` }
						</span>
					: null }
			{ touchable ? <span>&nbsp;<span className={"fa fa-hand-o-up"} title="touchable" /></span> : null }
		</span>;
	}
}

export interface EntityTreeNodeProps {
	devtoolUiStore: DevtoolUiStore;
	handlers: Handlers;
	eid: number;
}

@observer
export class EntityTreeNode extends React.Component<EntityTreeNodeProps, {}> {
	render() {
		const { devtoolUiStore, handlers, eid } = this.props;
		const ei = devtoolUiStore.entityTable.get("" + eid);
		if (!ei)
			return null;
		const hasChild = ei.childIds.length > 0;
		const open = devtoolUiStore.entityExpandTable.get("" + eid);
		return <div>
			<div className={styles["entity"]}
			     onMouseEnter={this._onMouseEnter}
			     onMouseLeave={this._onMouseLeave} >
				<span className={"fa fa-fw " + (hasChild ? (open ? "fa-angle-down" : "fa-angle-right") : "")}
				      onClick={this._onClick} />
				{ ei.constructorName }
				<EntityInlineInfo entityInfo={ei} />
			</div>
			{ (open && ei.childIds.length > 0)
				? <EntityChildren devtoolUiStore={devtoolUiStore} handlers={handlers} eids={ei.childIds} />
				: null }
		</div>;
	}

	private _onMouseEnter = (ev: React.MouseEvent<HTMLDivElement>) => {
		this.props.handlers.setActiveEntity(this.props.eid);
	}

	private _onMouseLeave = (ev: React.MouseEvent<HTMLDivElement>) => {
		this.props.handlers.setActiveEntity(null);
	}

	private _onClick = () => {
		this.props.handlers.toggleExpandEntity(this.props.eid);
	}
}
