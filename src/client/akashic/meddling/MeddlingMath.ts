// window 配下のObjectとなるため、命名規則のlintエラーを抑止
// eslint-disable-next-line @typescript-eslint/naming-convention
let MeddlingMath;

(function (): void {
	MeddlingMath = new Proxy(Math, {
		get: (target, prop, _receiver) => {
			if (prop === "random") {
				console.warn("Math.random()が実行されました。g.game.localRandom を使用してください。");
				window.dispatchEvent(new ErrorEvent("akashicWarning", {
					error: {
						message: "Math.random()が実行されました。g.game.localRandom を使用してください。",
						referenceUrl: "https://akashic-games.github.io/guide/common-pitfalls.html"
							+ "#Math.random()%E3%82%92%E4%BD%BF%E3%81%A3%E3%81%A6%E3%81%97%E3%81%BE%E3%81%86"
					}
				}));
			}
			return (target as any)[prop];
		}
	});
})();

(window as any).MeddlingMath = MeddlingMath;
