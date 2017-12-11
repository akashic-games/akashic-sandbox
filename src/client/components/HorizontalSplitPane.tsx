import * as React from "react";
import * as styles from "./HorizontalSplitPane.css";

export interface HorizontalSplitPaneProps {
	className?: string;
	first: React.ReactNode;
	second: React.ReactNode;
	initialSecondSize?: number;
	onSecondSizeChanged?: (r: number) => void;
}

export interface HorizontalSplitPaneState {
	secondSize: number;
}

export class HorizontalSplitPane extends React.Component<HorizontalSplitPaneProps, HorizontalSplitPaneState> {
	private _resizingPrevX: number;

	constructor(props: HorizontalSplitPaneProps) {
		super(props);
		this.state = {
			secondSize: (props.initialSecondSize != null) ? props.initialSecondSize : 100,
		};
	}

	render() {
		const { first, second, className } = this.props;
		return <div className={styles["self"] + (className ? (" " + className) : "")}>
			<div className={styles["first"]} style={{ width: `calc(100% - ${this.state.secondSize}px - 2px` }}>{first}</div>
			<div className={styles["resizer"]} onMouseDown={this._onMouseDown} />
			<div className={styles["second"]} style={{ width: this.state.secondSize }}>{second}</div>
		</div>;
	}

	private _onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
		window.addEventListener("mousemove", this._onWindowMouseMove);
		window.addEventListener("mouseup", this._onWindowMouseUp);
		this._resizingPrevX = e.pageX;
		e.stopPropagation();
		e.preventDefault();
	}

	private _onWindowMouseMove = (e: MouseEvent) => {
		const diff = e.pageX - this._resizingPrevX;
		this._resizingPrevX = e.pageX;
		this.setState({ secondSize: this.state.secondSize - diff });
		e.stopPropagation();
		e.preventDefault();
	}

	private _onWindowMouseUp = (e: MouseEvent) => {
		window.removeEventListener("mousemove", this._onWindowMouseMove);
		window.removeEventListener("mouseup", this._onWindowMouseUp);
		e.stopPropagation();
		e.preventDefault();
		if (this.props.onSecondSizeChanged)
			this.props.onSecondSizeChanged(this.state.secondSize);
	}
}

