import { observable, computed, action, ObservableMap } from 'mobx';
import { SandboxConfig } from "../../common/SandboxConfig";

export class EventsToolStore {
	@observable eventEditorContent: string;
	readonly registeredEventsTable: { [key: string]: any };

	constructor(sandboxConfig: SandboxConfig = {}) {
		this.eventEditorContent = "";
		this.registeredEventsTable = (sandboxConfig.events != null) ? sandboxConfig.events : {};
	}
}
