import * as React from "react";
import * as styles from "./CommandBar.css";

export interface CommandBarProps {
	className?: string;
}

export interface CommandBarState {
}

export class CommandBar extends React.Component<CommandBarProps, CommandBarState> {

	constructor(props: CommandBarProps) {
		super(props);
	}

	render() {
		return <div className={styles["commandbar"]}>
			<span className={styles["icon"] + " fa fa-fw fa-expand"}></span>
			<div className={styles["splitter"]}></div>
			<span className={styles["icon"] + " fa fa-fw fa-camera"}></span>
			<div className={styles["splitter"]}></div>
			<span className={styles["icon"] + " fa xfa-fw fa-fast-backward"}></span>
			<span className={styles["icon"] + " fa xfa-fw fa-play"}></span>
			<span className={styles["icon"] + " " + styles["disabled"] + " fa xfa-fw fa-step-forward"}></span>
			<div className={styles["splitter"]}></div>
			<div className={styles["texticon"]}>REPLAY</div>
		</div>
	}
}
