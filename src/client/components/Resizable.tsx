import * as React from "react";
import * as styles from "./Resizable.css";

export interface ResizableProps {
	pos: "right" | "bottom";
	className?: string;
	innerClassName?: string;
	initialWidth?: number;
	initialHeight?: number;
	minWidth?: number;
	minHeight?: number;
	onWidthChanged?: (w: number) => void;
	onHeightChanged?: (h: number) => void;
}

export interface ResizableState {
	width: number;
	height: number;
}

export class Resizable extends React.Component<ResizableProps, ResizableState> {
	private _resizingPrevX: number;
	private _resizingPrevY: number;

	constructor(props: ResizableProps) {
		super(props);
		this.state = {
			width: props.initialWidth || Math.max(400, (this.props.minWidth || 10)),
			height: props.initialHeight || Math.max(400, (this.props.minHeight || 10))
		};
	}

	render() {
		const { pos, className, innerClassName } = this.props;
		const right = (pos === "right");
		const baseClassName = right ? styles["self-right"] : styles["self-bottom"];
		const realClassName = baseClassName + (className ? (" " + className) : "");
		const realInnerClassName = styles["content"] + (innerClassName ? (" " + innerClassName) : "");
		const sizeStyle = right ? { width: this.state.width } : { height: this.state.height };
		return <div className={realClassName} style={sizeStyle}>
			<div className={realInnerClassName}>
				{ this.props.children }
			</div>
			<div className={styles["resizer"]}
			     onMouseDown={right ? this.onMouseDownHorizontal : this.onMouseDownVertical} />
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
