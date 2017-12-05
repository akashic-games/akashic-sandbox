import * as g from "@akashic/akashic-engine";
import * as ct from "../common/CommonTriggerLike";

export class CommonTriggerV1<T> implements ct.CommonTriggerLike<T> {
	private _trigger: g.Trigger<T>;

	constructor() {
		this._trigger = new g.Trigger<T>();
	}

	add(func: ct.HandlerFunction<T>, owner?: any): void {
		if (owner)
			this._trigger.handle(owner, func);
		else
			this._trigger.handle(func);
	}

	remove(func: ct.HandlerFunction<T>, owner?: any): void {
		if (owner)
			this._trigger.remove(owner, func);
		else
			this._trigger.remove(func);
	}

	removeAll(): void {
		this._trigger._reset();
	}

	fire(arg?: T): void {
		this._trigger.fire(arg);
	}
}
