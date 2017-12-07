import { CommonTriggerLike } from "../types/CommonTriggerLike";
import { EntityChangeInfo } from "../types/EntityChangeInfo";
import { SceneChangeInfo } from "../types/SceneChangeInfo";

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

function patchRegister(g: any, onNotifyEntityChange: CommonTriggerLike<EntityChangeInfo>): void {
	const origRegister = g.Game.prototype.register;
	g.Game.prototype.register = function (e: any): void {
		onNotifyEntityChange.fire({
			infoType: "register",
			constructorName: e.constructor && e.constructor.name,
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
		});
		origRegister.apply(this, arguments);
	};
}

function patchUnregister(g: any, onNotifyEntityChange: CommonTriggerLike<EntityChangeInfo>): void {
	const origUnregister = g.Game.prototype.unregister;
	g.Game.prototype.unregister = function (e: any): void {
		onNotifyEntityChange.fire({
			infoType: "unregister",
			id: e.id,
		});
		origUnregister.apply(this, arguments);
	};
}

function patchModified(g: any, onNotifyEntityChange: CommonTriggerLike<EntityChangeInfo>): void {
	const origModified = g.E.prototype.modified;
	g.E.prototype.modified = function () {
		onNotifyEntityChange.fire({
			infoType: "modified",
			local: this.local,
			id: this.id,
			x: this.x,
			y: this.y,
			width: this.width,
			height: this.height,
			angle: this.angle,
			scaleX: this.scaleX,
			scaleY: this.scaleY,
			visible: this.visible(),
			touchable: this.touchable,
			childIds: listIds(this),
			raw: this
		});
		return origModified.apply(this, arguments);
	};
}

function trapSceneChange(g: any, onNotifySceneChange: CommonTriggerLike<SceneChangeInfo>): void {
	Object.defineProperty(g.Game.prototype, "_sceneChanged", {
		set: function (t: any) {
			if (this._asb_sceneChanged === t)
				return;
			if (this._asb_sceneChanged)
				this._asb_sceneChanged.fire = (this._asb_sceneChanged as any).__asb_origFire;  // 値を上書きする前に元処理を復元
			this._asb_sceneChanged = t;
			const origFire = (t as any).__asb_origFire = t.fire;
			t.fire = function (v: any) {
				onNotifySceneChange.fire({
					constructorName: v.constructor.name || null,
					name: v.name || null,
					children: listIds(v.children),
					raw: v
				});
				origFire.apply(this, arguments);
			};
		},
		get: function () {
			return this._asb_sceneChanged;
		}
	});
}

function patchSceneModified(g: any, onNotifySceneChange: CommonTriggerLike<SceneChangeInfo>): void {
	const origModified = g.Scene.prototype.modified;
	g.Scene.prototype.modified = function () {
		onNotifySceneChange.fire({
			constructorName: this.constructor.name || null,
			name: this.name || null,
			children: listIds(this.children),
			raw: this
		});
		return origModified.apply(this, arguments);
	};
}

export interface PatchArgs {
	onNotifyEntityChange: CommonTriggerLike<EntityChangeInfo>;
	onNotifySceneChange: CommonTriggerLike<SceneChangeInfo>;
}

export function patchAkashicEngine(g: any, arg: PatchArgs): void {
	patchRegister(g, arg.onNotifyEntityChange);
	patchUnregister(g, arg.onNotifyEntityChange);
	patchModified(g, arg.onNotifyEntityChange);
	trapSceneChange(g, arg.onNotifySceneChange);
}
