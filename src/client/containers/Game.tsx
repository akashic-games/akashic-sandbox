import * as React from 'react';
import * as mobx from "mobx";
import { observer } from 'mobx-react';
import { GameStore } from "../store/GameStore";
import { Rect } from "../../runtime/types";
import * as styles from "./Game.css";

export interface GameProps {
	gameStore: GameStore;
}

@observer
export class Game extends React.Component<GameProps, {}> {
	private _elem: HTMLDivElement;

	constructor(props: GameProps) {
		super(props);
		this._elem = null;

		// Runnerの初期化タイミングとの前後関係に依存しないため、監視して待つ
		mobx.when(
			() => !!this.props.gameStore.containerElement,
			() => {
				if (this._elem)
					this._elem.appendChild(this.props.gameStore.containerElement)
			}
		);
	}

	render() {
		const { gameStore } = this.props;
		const rectData = gameStore.activeBoundingRectData;
		function rectToStyle(rect?: Rect) {
			if (!rect)
				return null;
			const w = (rect.right - rect.left);
			const h = (rect.bottom - rect.top);
			return { left: rect.left, top: rect.top, width: w, height: h, borderWidth: 1 };
		}
		return <div className={styles["game"]}>
			<div ref={this._onRef} />
			{ rectData ? <div className={styles["brect-self"]} style={rectToStyle(rectData.self)} /> : null }
			{
				(rectData && rectData.hasDiff) ?
					<div className={styles["brect-descendants"]} style={rectToStyle(rectData.descendants)} /> :
					null
			}
		</div>
	}

	private _onRef = (e: HTMLDivElement) => {
		this._elem = e;
		if (e && this.props.gameStore.containerElement) {
			this._elem.appendChild(this.props.gameStore.containerElement)
		}
	}
}
