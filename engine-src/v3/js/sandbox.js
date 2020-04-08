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
		// var parentView = pf.containerView.parentElement;
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
			x: !!center ? Math.floor((viewportSize.width - gameSize.width) / 2) : 0 ,
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
		var storage = new gameStorage.GameStorage(window.localStorage, { gameId: sandboxGameId });

		window.sandboxDeveloperProps = {
			game: null,
			driver: null,
			amflow: null,
			gameStorage: storage,
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
			putStorageDataSyncFunc: storage.set.bind(storage),
			getStorageDataSyncFunc: function (readKeys) {
				var svs = storage.load(readKeys);
				// StorageValue[][]からStorageData[]に変換する
				// TODO: StorageValue[][]が返ってくる必然性はない。game-storage側の仕様を変えるべき。
				return readKeys.map(function (k, i) { return { readKey: k, values: svs[i] }; });
			},
			tickList:  playlog ? playlog.tickList : null,
			startPoints: playlog ? playlog.startPoints : null
		});
		var isReplay = !!playlog;
		var replayStartTime = null;
		var replayDuration = null;
		if (isReplay) {
			var fps = playlog.startPoints[0].data.fps;
			var replayLastTime = null;
			var replayLastAge = playlog.tickList[1];
			var ticksWithEvents = playlog.tickList[2];
			replayStartTime = playlog.startPoints[0].timestamp;
			loop: for (var i = ticksWithEvents.length - 1; i >= 0; --i) {
				var tick = ticksWithEvents[i];
				var pevs = tick[1] || [];
				for (var j = 0; j < pevs.length; ++j) {
					if (pevs[j][0] === 2) { // TimestampEvent
						var timestamp = (pevs[j][3] /* Timestamp */);
						// Timestamp の時刻がゲームの開始時刻より小さかった場合は相対時刻とみなす
						replayLastTime = (timestamp < replayStartTime ? timestamp + replayStartTime : timestamp) + (replayLastAge - tick[0]) * 1000 / fps;
						break loop;
					}
				}
			}
			replayDuration = (replayLastTime == null) ? (replayLastAge * 1000 / fps) : (replayLastTime - replayStartTime);
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

		driver = new gdr.GameDriver({
			platform: pf,
			player: sandboxPlayer,
			errorHandler: function (e) { console.log("ERRORHANDLER:", e); }
		});

		var timeKeeper = new TimeKeeper(replayDuration);

		driver.gameCreatedTrigger.add(function (game) {
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
				targetTimeFunc: timeKeeper.now.bind(timeKeeper),
				originDate: replayStartTime,
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
