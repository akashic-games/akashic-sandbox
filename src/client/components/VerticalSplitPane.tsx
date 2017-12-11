import * as React from "react";
import * as styles from "./VerticalSplitPane.css";

export interface VerticalSplitPaneProps {
	className?: string;
	first: React.ReactNode;
	second: React.ReactNode;
	initialSecondSize?: number;
	onSecondSizeChanged?: (r: number) => void;
}

export interface VerticalSplitPaneState {
	secondSize: number;
}

export class VerticalSplitPane extends React.Component<VerticalSplitPaneProps, VerticalSplitPaneState> {
	private _resizingPrevY: number;

	constructor(props: VerticalSplitPaneProps) {
		super(props);
		this.state = {
			secondSize: (props.initialSecondSize != null) ? props.initialSecondSize : 100,
		};
	}

	render() {
		const { first, second, className } = this.props;
		return <div className={styles["self"] + (className ? (" " + className) : "")}>
			<div className={styles["first"]} style={{ height: `calc(100% - ${this.state.secondSize}px - 2px` }}>{first}</div>
			<div className={styles["resizer"]} onMouseDown={this._onMouseDown} />
			<div className={styles["second"]} style={{ height: this.state.secondSize }}>{second}</div>
		</div>;
	}

	private _onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
		window.addEventListener("mousemove", this._onWindowMouseMove);
		window.addEventListener("mouseup", this._onWindowMouseUp);
		this._resizingPrevY = e.pageY;
		e.stopPropagation();
		e.preventDefault();
	}

	private _onWindowMouseMove = (e: MouseEvent) => {
		const diff = e.pageY - this._resizingPrevY;
		this._resizingPrevY = e.pageY;
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
