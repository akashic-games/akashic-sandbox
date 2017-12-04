import * as React from "react";
import * as style from "./StickyPane.css";

export interface StickyPaneProps {
	pos: "right" | "bottom";
	className?: string;
	initialWidth?: number;
	initialHeight?: number;
	minWidth?: number;
	minHeight?: number;
	onWidthChanged?: (w: number) => void;
	onHeightChanged?: (h: number) => void;
}

export interface StickyPaneState {
	width: number;
	height: number;
}

export class StickyPane extends React.Component<StickyPaneProps, StickyPaneState> {
	private _resizingPrevX: number;
	private _resizingPrevY: number;

	constructor(props: StickyPaneProps) {
		super(props);
		this.state = {
			width: props.initialWidth || Math.max(100, (this.props.minWidth || 10)),
			height: props.initialHeight || Math.max(100, (this.props.minHeight || 10))
		};
	}

	render() {
		const right = (this.props.pos === "right");
		const baseClassName = right ? style["sticky-pane-right"] : style["sticky-pane-bottom"];
		const className = baseClassName + (this.props.className ? (" " + this.props.className) : "");
		const sizeStyle = right ? { width: this.state.width } : { height: this.state.height };
		return <div className={className} style={sizeStyle}>
			<div className={style["resizer"]}
			     onMouseDown={right ? this.onMouseDownHorizontal : this.onMouseDownVertical} />
			<div className={style["content"]}>
				{ this.props.children }
			</div>
		</div>;
	}

	onMouseDownHorizontal = (e: React.MouseEvent<HTMLDivElement>) => {
		window.addEventListener("mousemove", this.onWindowMouseMoveHorizontal);
		window.addEventListener("mouseup", this.onWindowMouseUpHorizontal);
		this._resizingPrevX = e.pageX;
		e.stopPropagation();
		e.preventDefault();
	}

	onWindowMouseMoveHorizontal = (e: MouseEvent) => {
		const diff = e.pageX - this._resizingPrevX;
		this._resizingPrevX = e.pageX;
		this.setState({ width: Math.max(this.state.width - diff, (this.props.minWidth || 10)) });
		e.stopPropagation();
		e.preventDefault();
	}

	onWindowMouseUpHorizontal = (e: MouseEvent) => {
		window.removeEventListener("mousemove", this.onWindowMouseMoveHorizontal);
		window.removeEventListener("mouseup", this.onWindowMouseUpHorizontal);
		e.stopPropagation();
		e.preventDefault();
		if (this.props.onWidthChanged)
			this.props.onWidthChanged(this.state.width);
	}

	onMouseDownVertical = (e: React.MouseEvent<HTMLDivElement>) => {
		window.addEventListener("mousemove", this.onWindowMouseMoveVertical);
		window.addEventListener("mouseup", this.onWindowMouseUpVertical);
		this._resizingPrevY = e.pageY;
		e.stopPropagation();
		e.preventDefault();
	}

	onWindowMouseMoveVertical = (e: MouseEvent) => {
		const diff = e.pageY - this._resizingPrevY;
		this._resizingPrevY = e.pageY;
		this.setState({ height: Math.max(this.state.height - diff, (this.props.minHeight || 10)) });
		e.stopPropagation();
		e.preventDefault();
	}

	onWindowMouseUpVertical = (e: MouseEvent) => {
		window.removeEventListener("mousemove", this.onWindowMouseMoveVertical);
		window.removeEventListener("mouseup", this.onWindowMouseUpVertical);
		e.stopPropagation();
		e.preventDefault();
		if (this.props.onHeightChanged)
			this.props.onHeightChanged(this.state.height);
	}
}
