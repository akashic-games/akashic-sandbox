import { CommonTriggerLike } from "../types/CommonTriggerLike";
import { EntityRegisterInfo, EntityModifiedInfo, EntityChangeInfo } from "../types/EntityChangeInfo";
import { ContentChangeInfo } from "../types/ContentChangeInfo";
import { EngineWatcherLike } from "../types/EngineWatcherLike";

// このファイルは、 `g` の一部処理をフックして devtool 側から参照できるようにするものである。
// `g` の型が異なるため、厳密には runtime/v1, runtime/v2 それぞれで抱えねばならない。
// が、現在のところほとんど処理が同じであること、またどのみち Function.prototype.apply の影響で
// 型情報はかなり失われるため、割り切って `g: any` として共通化しておく。

function listIds<T extends { id: number }>(xs?: T[]): number[] {
	if (!xs)
		return [];
	let ret = [] as number[];
	for (let i = 0; i < xs.length; ++i)
		ret.push(xs[i].id);
	return ret;
}

interface DiffData {
	type: "modified" | "register";
	value: any;
}

export class EngineWatcher implements EngineWatcherLike {
	onNotifyContentChange: CommonTriggerLike<ContentChangeInfo>;
	private _g: any;
	private _buffer: DiffData[];
	private _scene: any;
	private _unregistered: { [id: number]: boolean };
	private _unregisteredList: number[];
	private _running: boolean;
	private _origGameRender: (cam?: any) => void;
	private _origGameRegister: (e: any) => void;
	private _origGameUnregister: (e: any) => void;
	private _origSceneModified: () => void;
	private _origEModified: (isBubbling?: boolean) => void;

	constructor (g: any, trigger: CommonTriggerLike<ContentChangeInfo>) {
		this.onNotifyContentChange = trigger;
		this._g = g;
		this._buffer = [];
		this._scene = null;
		this._unregistered = {};
		this._unregisteredList = [];
		this._running = false;
		this._origGameRender = null;
		this._origGameRegister = null;
		this._origGameUnregister = null;
		this._origSceneModified = null;
		this._origEModified = null;
		this._patch(g);
	}

	start(): void {
		this._running = true;
	}

	stop(): void {
		this._running = false;
	}

	private _patch(g: any): void {
		const self = this;

		this._origGameRender = g.Game.prototype.render;
		g.Game.prototype.render = function () {
			self._flushBuffer();
			return self._origGameRender.apply(this, arguments);
		};

		this._origGameRegister = g.Game.prototype.register;
		g.Game.prototype.register = function (e: any) {
			self._origGameRegister.apply(this, arguments);
			self._buffer.push({ type: "register", value: e });
		};

		this._origGameUnregister = g.Game.prototype.unregister;
		g.Game.prototype.unregister = function (e: any) {
			self._unregistered[e.id] = true;
			self._unregisteredList.push(e.id);
			self._origGameUnregister.apply(this, arguments);
		};

		Object.defineProperty(g.Game.prototype, "_sceneChanged", {
			set: function (t: any) {
				if (this._asb_sceneChanged === t)
					return;
				if (this._asb_sceneChanged)
					this._asb_sceneChanged.fire = (this._asb_sceneChanged as any).__asb_origFire;  // 上書き前に元処理を復元
				this._asb_sceneChanged = t;
				const origFire = (t as any).__asb_origFire = t.fire;
				t.fire = function (v: any) {
					self._scene = v;
					origFire.apply(this, arguments);
				};
			},
			get: function () {
				return this._asb_sceneChanged;
			}
		});

		this._origSceneModified = g.Scene.prototype.modified;
		g.Scene.prototype.modified = function () {
			self._scene = this;
			return self._origSceneModified.apply(this, arguments);
		};

		this._origEModified = g.E.prototype.modified;
		g.E.prototype.modified = function (isBubbling?: boolean) {
			if (!isBubbling && !(this.state & 4))  // Ugh! 4 is for Modified
				self._buffer.push({ type: "modified", value: this });
			return self._origEModified.apply(this, arguments);
		};
	}

	private _flushBuffer(): void {
		if (!this._running || !this._scene) {
			this._buffer = [];
			this._unregistered = {};
			this._unregisteredList = [];
			return;
		}

		const table: { [key: number]: boolean } = {};
		const registered: { [key: number]: boolean } = {};
		const result: EntityChangeInfo[] = [];
		for (let i = 0; i < this._buffer.length; ++i) {
			const data = this._buffer[i];
			const e = data.value;
			if (data.type === "register")
				registered[e.id] = true;
			if (this._unregistered.hasOwnProperty(e.id) || table.hasOwnProperty(e.id)) {
				// 重複回避: このfulshでこのあとunregisterされるものと、このループ内で既に処理したものは無視
				continue;
			}
			table[e.id] = true;
			result.push({
				infoType: data.type,
				constructorName: e.constructor.name,
				local: e.local,
				id: e.id,
				x: e.x,
				y: e.y,
				width: e.width,
				height: e.height,
				angle: e.angle,
				scaleX: e.scaleX,
				scaleY: e.scaleY,
				visible: e.visible(),
				touchable: e.touchable,
				childIds: listIds(e.children),
				raw: e
			} as (EntityRegisterInfo | EntityModifiedInfo));
		}
		for (let i = 0; i < this._unregisteredList.length; ++i) {
			const id = this._unregisteredList[i];
			if (registered[id]) {
				// このfulsh内でregisterされてすぐunregisterされたものはスキップ(register側を上でスキップしているので)
				continue;
			}
			result.push({ infoType: "unregister", id: id });
		}

		this._buffer = [];
		this._unregistered = {};
		this._unregisteredList = [];
		this.onNotifyContentChange.fire({
			scene: {
				constructorName: this._scene.constructor.name,
				name: this._scene.name || "",
				childIds: listIds(this._scene.children),
				raw: this._scene
			},
			entity: result
		});
	}
}
