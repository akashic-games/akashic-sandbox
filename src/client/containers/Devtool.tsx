import * as React from 'react';
import {observer} from 'mobx-react';
import { Store } from "../store/Store";

export interface DevtoolProps {
	store: Store;
}

@observer
export class Devtool extends React.Component<DevtoolProps, {}> {
	render() {
		return <div>
		</div>;
	}
}
