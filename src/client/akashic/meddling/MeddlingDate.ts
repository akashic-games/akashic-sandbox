
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
						message: "Date.now()が実行されました。Akashicコンテンツではこの機能に依存してゲームの実行状態が変わらないようにしてください。"
					}));
				}
				return (target as any)[prop];
			}
		});
	}
})();

(window as any).MeddlingDate = MeddlingDate;
