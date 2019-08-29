var MeddlingDate;

(function (): void {
	// ieではProxy未対応なので差し替えない
	var agent = window.navigator.userAgent;
	if ((agent.indexOf("msie 9.") !== -1) || (agent.indexOf("trident/7") !== -1)) {
		MeddlingDate = Date;
	} else {
		MeddlingDate = new Proxy(Date, {
			get: (target, prop, receiver) => {
				if (prop === "now") {
					console.warn("Date.now()が実行されました。Akashicコンテンツではこの機能に依存してゲームの実行状態が変わらないようにしてください。");
					window.dispatchEvent(new ErrorEvent("akashicWarning", {
						error: {
							message: "Date.now()が実行されました。Akashicコンテンツではこの機能に依存してゲームの実行状態が変わらないようにしてください。",
							referenceUrl: "https://akashic-games.github.io/guide/common-pitfalls.html#%E7%8F%BE%E5%9C%A8%E6%99%82%E5%88%BB%E3%82%92%E4%BD%BF%E3%81%A3%E3%81%A6%E3%81%97%E3%81%BE%E3%81%86"
						}
					}));
				}
				return (target as any)[prop];
			}
		});
	}
})();

(window as any).MeddlingDate = MeddlingDate;
