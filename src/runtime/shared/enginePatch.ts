import { CommonTriggerLike } from "../types/CommonTriggerLike";
import { EntityInfo } from "../types/EntityInfo";
import { SceneInfo } from "../types/SceneInfo";

// このファイルは、 `g` の一部処理をフックして devtool 側から参照できるようにするものである。
// `g` の型が異なるため、厳密には runtime/v1, runtime/v2 それぞれで抱えねばならない。
// が、現在のところほとんど処理が同じであること、またどのみち Function.prototype.apply の影響で
// 型情報はかなり失われるため、割り切って `g: any` として共通化しておく。

export interface PatchArgs {
	onNotifyEntityChange: CommonTriggerLike<EntityInfo>;
	onNotifySceneChange: CommonTriggerLike<SceneInfo>;
}

function patchRegister(g: any, onNotifyEntityChange: CommonTriggerLike<EntityInfo>): void {
	const origRegister = g.Game.prototype.register;
	g.Game.prototype.register = function (e: any): void {
		let cids = [] as number[];
		if (e.children) {
			for (let i = 0; i < e.children.length; ++i)
				cids.push(e.children[i].id);
		}
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
			childIds: cids,
			raw: e
		});
		origRegister.apply(this, arguments);
	};
}

function patchUnregister(g: any, onNotifyEntityChange: CommonTriggerLike<EntityInfo>): void {
	const origUnregister = g.Game.prototype.unregister;
	g.Game.prototype.unregister = function (e: any): void {
		onNotifyEntityChange.fire({
			infoType: "unregister",
			id: e.id,
		});
		origUnregister.apply(this, arguments);
	};
}

function patchModified(g: any, onNotifyEntityChange: CommonTriggerLike<EntityInfo>): void {
	const origModified = g.E.prototype.modified;
	g.E.prototype.modified = function () {
		let cids = [] as number[];
		if (this.children) {
			for (let i = 0; i < this.children.length; ++i)
				cids.push(this.children[i].id);
		}
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
			childIds: cids,
			raw: this
		});
		return origModified.apply(this, arguments);
	};
}

function trapSceneChange(g: any, onNotifySceneChange: CommonTriggerLike<SceneInfo>): void {
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

export function patchAkashicEngine(g: any, arg: PatchArgs): void {
	patchRegister(g, arg.onNotifyEntityChange);
	patchUnregister(g, arg.onNotifyEntityChange);
	patchModified(g, arg.onNotifyEntityChange);
	trapSceneChange(g, arg.onNotifySceneChange);
}
