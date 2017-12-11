import * as React from "react";
import * as style from "./MenuBar.css";

export interface MenuBarProps {
	className?: string;
}

export class MenuBar extends React.Component<MenuBarProps, {}> {
	constructor(props: MenuBarProps) {
		super(props);
	}

	render() {
		const className = style["bar"] + (this.props.className ? (" " + this.props.className) : "");
		return <div className={className}>
			{ this.props.children }
		</div>;
	}
}

