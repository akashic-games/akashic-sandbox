window.addEventListener("load", function() {
	var devMode = !(window.location.search.indexOf("devmode=disable") >= 0);

	// copy from http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
	// fps=xを抽出するための適当なコード
	function getParameterByName(name) {
		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
			results = regex.exec(location.search);
		return results === null ? undefined : decodeURIComponent(results[1].replace(/\+/g, " "));
	}

	function getGamePath(callback) {
		// ゲームのパスからgameIdを生成する
		var xhr = new XMLHttpRequest();
		xhr.open("get", "/basepath/", true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
				callback(xhr.responseText);
			}
		};
		xhr.send();
	}

	getGamePath(start);

	function fitToWindow(center) {
		var pf = window.sandboxDeveloperProps.driver._platform;
		if (!pf.containerController) return;
		var parentView = document.getElementById("container").parentElement;
		parentView.style.margin = "0px";
		parentView.style.padding = "0px";
		parentView.style.overflow = "hidden";
		var viewportSize = {
			width: window.innerWidth || document.documentElement.clientWidth,
			height: window.innerHeight || document.documentElement.clientHeight
		};
		fitToSize(viewportSize, center);
	}

	function revertViewSize() {
		var pf = window.sandboxDeveloperProps.driver._platform;
		var parentView = document.getElementById("container").parentElement;
		parentView.style.margin = window.sandboxDeveloperProps.utils.defaultStyle.margin;
		parentView.style.padding = window.sandboxDeveloperProps.utils.defaultStyle.padding;
		parentView.style.overflow = window.sandboxDeveloperProps.utils.defaultStyle.overflow;
		fitToSize(window.sandboxDeveloperProps.utils.defaultSize);
	}

	function fitToSize(viewportSize, center) {
		var pf = window.sandboxDeveloperProps.driver._platform;
		var game = window.sandboxDeveloperProps.game;
		var gameScale = Math.min(
			viewportSize.width / game.width,
			viewportSize.height / game.height
		);
		var gameSize = {
			width: Math.floor(game.width * gameScale),
			height: Math.floor(game.height * gameScale)
		};
		pf.containerController.changeScale(gameScale, gameScale);
		var gameOffset = {
			x: !!center ? Math.floor((viewportSize.width - gameSize.width) / 2) : 0,
			y: !!center ? Math.floor((viewportSize.height - gameSize.height) / 2) : 0
		};
		pf.containerController.inputHandlerLayer.setOffset(gameOffset);
	}

	function start(gamePath) {
		// TODO WebGL有効化
		// // webgl=1でRendererを問答無用でWebGLのみにする
		// if (getParameterByName("webgl")) {
		// 	conf.renderers = ["webgl"];
		// }

		// 本来であればgameIdはBIGINTとして扱われるので数値だけども、とりあえずmd5を使う
		var sandboxGameId = md5(gamePath);
		var sandboxPlayer = { id: "9999", name: "sandbox-player" };
		var sandboxPlayId = "sandboxDummyPlayId";

		window.sandboxDeveloperProps = {
			game: null,
			driver: null,
			amflow: null,
			gameId: sandboxGameId,
			path: gamePath,
			sandboxPlayer: sandboxPlayer,
			sandboxConfig: window.sandboxDeveloperProps.sandboxConfig,
			utils: {
				fitToWindow: fitToWindow,
				revertViewSize: revertViewSize,
				defaultSize: {
					width: null,
					height: null
				},
				defaultStyle: {
					margin: null,
					padding: null,
					overflow: null
				}
			}
		};

		// preventDefaultを抑制するかを確認するためだけにLocalStorageの設定を読み込む
		var disablePreventDefault = false;
		if (devMode && ("localStorage" in window)) {
			var saved = JSON.parse(localStorage.getItem("akashic-sandbox-config"));
			if (saved) {
				disablePreventDefault = !!saved.disablePreventDefault;
			}
		}

		var pdiBrowser = engineFiles.pdiBrowser;
		var gdr = engineFiles.gameDriver;

		// var executionMode = gdr.ExecutionMode.Active;
		var playlogName = getParameterByName("playlog");

		var playlog;
		if (playlogName) {
			var playlogStr = localStorage.getItem("akpl:" + sandboxGameId + "/" + playlogName);
			if (playlogStr) {
				playlog = JSON.parse(playlogStr);
			} else {
				console.log("cannot load playlog: " + playlogName);
			}
		}

		var amflowClient = new gdr.MemoryAmflowClient({
			playId: sandboxPlayId,
			tickList:  playlog ? playlog.tickList : null,
			startPoints: playlog ? playlog.startPoints : null
		});
		var isReplay = !!playlog;
		var replayDuration = null;
		if (isReplay) {
			var fps = playlog.startPoints[0].data.fps;
			var replayLastTime = null;
			var replayLastAge = playlog.tickList[1];
			var ticksWithEvents = playlog.tickList[2];
			loop: for (var i = ticksWithEvents.length - 1; i >= 0; --i) {
				var tick = ticksWithEvents[i];
				var pevs = tick[1];
				for (var j = 0; j < pevs.length; ++j) {
					if (pevs[j][0] === 2) { // TimestampEvent
						replayLastTime = (pevs[j][3] /* Timestamp */) + (replayLastAge - tick[0]) * 1000 / fps;
						break loop;
					}
				}
			}
			replayDuration = (replayLastTime == null) ? (replayLastAge * 1000 / fps) : replayLastTime;
		}

		var pf = new pdiBrowser.Platform({
			amflow: amflowClient,
			containerView: document.getElementById("container"),
			audioPlugins: [pdiBrowser.WebAudioPlugin, pdiBrowser.HTMLAudioPlugin],
			disablePreventDefault: disablePreventDefault
		});

		// TODO: カスタマイズできるようにする？
		pf._resourceFactory.createScriptAsset = function(id, assetPath) {
			return new SandboxScriptAsset(id, assetPath);
		};

		// 描画元の範囲が指定されたwidth,heightを超える値もしくは0以下が与えられた場合Safariでのみ描画されないという問題が発生するので、g.Surface#renderer()でエラーを投げる処理を差し込む
		// funcにはg.Surfaceを返す関数が渡されることを想定している
		function createMeddlingWrappedSurfaceFactory(func) {
			return function() {
				var surface = func.apply(this, arguments);
				var originalRenderer = surface.renderer;
				// drawImageメソッドの中で元のdrawImageメソッドを利用する実装のため、rendererをキャッシュしないとrenderer呼び出しの度にバリデーション処理が増えてしまう
				// 本来なら前回のrendererの内容と比較してdiffがあるかを判定する対応にすべきだが、rendererの内容は不変なので単純にrendererをキャッシュするだけの対応としている
				var rendererCache = null;
				surface.renderer = function () {
					if (rendererCache) {
						return rendererCache;
					}
					var renderer = originalRenderer.apply(this);
					var originalDrawImage = renderer.drawImage;
					renderer.drawImage = function (surface, offsetX, offsetY, width, height) {
						if (offsetX < 0 || offsetX + width > surface.width || offsetY < 0 || offsetY + height > surface.height) {
							throw new Error(`Please draw with following range. x: 0-${surface.width}, y: 0-${surface.height}.`);
						}
						if (width <= 0 || height <= 0) {
							throw new Error(`Please set width and height to value higher than 0.`);
						}
						originalDrawImage.apply(this, arguments);
					}
					rendererCache = renderer;
					return renderer;
				}
				return surface;
			};
		}
		pf.getPrimarySurface = createMeddlingWrappedSurfaceFactory(pf.getPrimarySurface);
		pf._resourceFactory.createSurface = createMeddlingWrappedSurfaceFactory(pf._resourceFactory.createSurface);

		driver = new gdr.GameDriver({
			platform: pf,
			player: sandboxPlayer,
			errorHandler: function (e) { console.log("ERRORHANDLER:", e); }
		});

		var timeKeeper = new TimeKeeper(replayDuration);

		driver.gameCreatedTrigger.handle(function (game) {
			enableLogger(game);
			window.sandboxDeveloperProps.game = game;
			window.sandboxDeveloperProps.driver = driver;
			window.sandboxDeveloperProps.amflow = amflowClient;
			window.sandboxDeveloperProps.utils.defaultSize.width = pf.containerController.surface.width;
			window.sandboxDeveloperProps.utils.defaultSize.height = pf.containerController.surface.height;

			parentElement = document.getElementById("container").parentElement;
			window.sandboxDeveloperProps.utils.defaultStyle.margin = parentElement.style.margin;
			window.sandboxDeveloperProps.utils.defaultStyle.padding = parentElement.style.padding;
			window.sandboxDeveloperProps.utils.defaultStyle.overflow = parentElement.style.overflow;

			if (getParameterByName("bg")) {
				document.body.style.backgroundColor = "black";
				pf.getPrimarySurface()._drawable.style.backgroundColor = "white";
			}
			if (getParameterByName("fit")) {
				window.sandboxDeveloperProps.utils.fitToWindow();
			}
			if (devMode) {
				setupDeveloperMenu({
					isReplay: isReplay,
					replayDuration: replayDuration,
					timeKeeper: timeKeeper
				});
			}
		});

		var profiler;
		if (devMode) {
			// todo: sandboxのリファクタリング時に getValueTrigger を与えるように修正
			profiler = new gdr.SimpleProfiler({
				interval: 200
			});
		}

		driver.initialize({
			configurationUrl: "/configuration/",
			assetBase: "/game/",
			driverConfiguration: {
				playId: sandboxPlayId,
				playToken: isReplay ? gdr.MemoryAmflowClient.TOKEN_PASSIVE : gdr.MemoryAmflowClient.TOKEN_ACTIVE,
				executionMode: isReplay ? gdr.ExecutionMode.Passive : gdr.ExecutionMode.Active
			},
			loopConfiguration: isReplay ? {
				loopMode: gdr.LoopMode.Replay,
				delayIgnoreThreshold: Number.MAX_VALUE,
				jumpTryThreshold: Number.MAX_VALUE,
				targetTimeFunc: timeKeeper.now.bind(timeKeeper)
			} : {
				loopMode: gdr.LoopMode.Realtime
			},
			profiler: profiler
		}, function (e) {
			if (e) {
				console.log(e);
				throw e;
			}
			timeKeeper.start();
			driver.startGame();
		});
	}
});
