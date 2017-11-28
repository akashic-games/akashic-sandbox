import * as React from 'react';
import {action} from "mobx";
import {observer} from 'mobx-react';
import styled from "styled-components";
import { Store } from "../store/Store";  // should be interface?
import { Game } from "./Game";

export interface RootProps {
	store: Store;
}

const RootElem = styled.div`
  width: 100%;
  height: 100%;
  background: url(${require("./pseudo-transparent-bg.png")}) silver;
`;

@observer
export class Root extends React.Component<RootProps, {}> {
	render() {
		return <RootElem onClick={this.onClick}>
			<Game store={this.props.store} />
			{ this.props.store.message }
		</RootElem>;
	}

	@action
	onClick = () => {
		console.log("click");
		this.props.store.message += "!";
	}
}
