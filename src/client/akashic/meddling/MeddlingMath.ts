var MeddlingMath;

(function (): void {
	MeddlingMath = new Proxy(Math, {
		get: (target, prop, receiver) => {
			if (prop === "random") {
				console.warn("Math.random()が実行されました。Akashicコンテンツではこの機能に依存してゲームの実行状態が変わらないようにしてください。");
				window.dispatchEvent(new ErrorEvent("akashicWarning", {
					message: "Math.random()が実行されました。Akashicコンテンツではこの機能に依存してゲームの実行状態が変わらないようにしてください。"
				}));
			}
			return (target as any)[prop];
		}
	});
})();

(window as any).MeddlingMath = MeddlingMath;
