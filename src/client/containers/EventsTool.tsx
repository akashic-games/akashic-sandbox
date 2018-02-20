import * as React from 'react';
import { action } from "mobx";
import { observer } from 'mobx-react';
import { Store } from "../store/Store";
import { Handlers } from "../handlers/Handlers";
import * as styles from "./EventsTool.css";

export interface EventsToolProps {
	className?: string;
	store: Store;
	handlers: Handlers;
	vertical: boolean;
}

@observer
export class EventsTool extends React.Component<EventsToolProps, {}> {
	render() {
		const { className, store, handlers, vertical } = this.props;
		const eventsTable = store.eventsToolStore.registeredEventsTable;
		const editorContent = store.eventsToolStore.eventEditorContent;
		return <div className={styles["self"]}>
			{ /*
			<div className={styles["bar"]}>
				<label><input type="checkbox" checked={false} /> Auto send on startup </label>
			</div>
			*/ }
			<textarea placeholder="An array of events to send (e.g. [[32, 0, null, []], ...])" value={editorContent} onChange={this._onChangeEventEditor} />
			<div className={`${styles["bar"]} ${styles["right-aligned"]}`}>
				<button onClick={this._onClickSendEditorContent}><i className="fa fa-external-link"></i> Send Events</button>
			</div>

			<div style={{overflowY: "scroll"}}>
				<table className={styles["event-list"]}>
					<tbody>
						{
							Object.keys(eventsTable).map(k => {
								const pevsText = JSON.stringify(eventsTable[k]);
								return <tr key={k}>
									<td>
										{ k }
										<span style={{float: "right"}} className={styles["hover-only"]}>
											<button className={styles["icon-button"]} onClick={() => this._onClickSend(k)}>Send</button>
											<button className={styles["icon-button"]} onClick={() => this._onClickEdit(k)}>Edit</button>
										</span>
									</td>
									<td> { (pevsText.length > 32) ? (pevsText.slice(0, 29) + "...") : pevsText } </td>
								</tr>;
							})
						}
					</tbody>
				</table>
			</div>
		</div>;
	}

	_onClickSend = (name: string) => {
		const pevs = this.props.store.eventsToolStore.registeredEventsTable[name];
		this.props.handlers.sendEvents(pevs);
	}

	_onClickEdit = (name: string) => {
		const pevs = this.props.store.eventsToolStore.registeredEventsTable[name];
		this.props.handlers.setEventEditorContent(JSON.stringify(pevs));
	}

	_onClickSendEditorContent = (ev: React.MouseEvent<HTMLButtonElement>) => {
		const pevs = JSON.parse(this.props.store.eventsToolStore.eventEditorContent);
		this.props.handlers.sendEvents(pevs);
	}

	_onChangeEventEditor = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
		this.props.handlers.setEventEditorContent(ev.target.value);
	}
}
