import * as React from "react";
import * as style from "./ToggleMenuBar.css";

export interface ToggleMenuBarProps {
	className?: string;
}

export class ToggleMenuBar extends React.Component<ToggleMenuBarProps, {}> {
	constructor(props: ToggleMenuBarProps) {
		super(props);
	}

	render() {
		const className = style["bar"] + (this.props.className ? (" " + this.props.className) : "");
		return <div className={className}>
			{ this.props.children }
		</div>;
	}
}

