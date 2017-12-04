import * as React from 'react';
import * as mobx from "mobx";
import { observer } from 'mobx-react';
import { Store } from "../store/Store";  // should be interface?
import * as styles from "./Game.css";

export interface GameProps {
	store: Store;
}

@observer
export class Game extends React.Component<GameProps, {}> {
	private _elem: HTMLDivElement;

	constructor(props: GameProps) {
		super(props);
		this._elem = null;

		mobx.when(
			() => !!this.props.store.gameStore.containerElement,
			() => {
				if (this._elem)
					this._elem.appendChild(this.props.store.gameStore.containerElement)
			}
		);
	}

	render() {
		return <div className={styles["game"]} ref={this._onRef}/>;
	}

	private _onRef = (e: HTMLDivElement) => {
		this._elem = e;
		if (e && this.props.store.gameStore.containerElement) {
			this._elem.appendChild(this.props.store.gameStore.containerElement)
		}
	}
}
