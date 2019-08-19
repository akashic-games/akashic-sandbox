var MeddlingDate = new Proxy(Date, {
	get: (target, prop, receiver) => {
		if (prop === "now") {
			console.warn("Date.now()が実行されました。Akashicコンテンツではこの機能に依存してゲームの実行状態が変わらないようにしてください。");
		}
		return (target as any)[prop];
	}
});

(window as any).MeddlingDate = MeddlingDate;
