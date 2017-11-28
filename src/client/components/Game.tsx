import * as React from 'react';
import {action} from "mobx";
import {observer} from 'mobx-react';
import styled from "styled-components";
import { Store } from "../store/Store";  // should be interface?

export interface GameProps {
	store: Store;
}

const GameElem = styled.div`
  width: 500px;
  height: 400px;
	background: black;
`;

@observer
export class Game extends React.Component<GameProps, {}> {
	render() {
		return <GameElem />;
	}
}
