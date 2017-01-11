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
			sandboxPlayer: sandboxPlayer
		};

		// preventDefaultを抑制するかを確認するためだけにLocalStorageの設定を読み込む
		var disablePreventDefault = false;
		if (devMode && ("localStorage" in window)) {
			var saved = JSON.parse(localStorage.getItem("akashic-sandbox-config"));
			if (saved) {
				disablePreventDefault = !!saved.disablePreventDefault;
			}
		}

		var pdiBrowser = require("@akashic/pdi-browser");
		var gdr = require("@akashic/game-driver");

		// var executionMode = gdr.ExecutionMode.Active;
		var isReplay = false;
		var amflowClient = new gdr.MemoryAmflowClient({
			playId: sandboxPlayId,
			putStorageDataSyncFunc: storage.set.bind(storage),
			getStorageDataSyncFunc: function (readKeys) {
				var svs = storage.load(readKeys);
				// StorageValue[][]からStorageData[]に変換する
				// TODO: StorageValue[][]が返ってくる必然性はない。game-storage側の仕様を変えるべき。
				return readKeys.map(function (k, i) { return { readKey: k, values: svs[i] }; });
			}
		});

		var playlogName = getParameterByName("playlog");
		var replayLastAge;
		if (playlogName) {
			var playlog = localStorage.getItem("akpl:" + sandboxGameId + "/" + playlogName);
			if (playlog) {
				var p = JSON.parse(playlog);
				amflowClient = new gdr.ReplayAmflowProxy({
					amflow: amflowClient,
					tickList: p.tickList,
					startPoints: p.startPoints
				});
				isReplay = true;
				replayLastAge = p.tickList[1]; // To
			} else {
				console.log("cannot load playlog: " + playlogName);
			}
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

		driver.gameCreatedTrigger.handle(function (game) {
			enableLogger(game);
			window.sandboxDeveloperProps.game = game;
			window.sandboxDeveloperProps.driver = driver;
			window.sandboxDeveloperProps.amflow = amflowClient;
			if (getParameterByName("bg")) {
				document.body.style.backgroundColor = "black";
				pf.getPrimarySurface()._drawable.style.backgroundColor = "white";
			}
			if (getParameterByName("fit")) {
				pf.fitToWindow();
			}
			if (devMode) {
				setupDeveloperMenu({
					isReplay: isReplay,
					replayLastAge: replayLastAge
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
				playToken: "dummyToken",
				executionMode: isReplay ? gdr.ExecutionMode.Passive : gdr.ExecutionMode.Active
			},
			loopConfiguration: {
				loopMode: isReplay ? gdr.LoopMode.Replay : gdr.LoopMode.Realtime,
				delayIgnoreThreshold: isReplay ? Number.MAX_VALUE : undefined,
				jumpTryThreshold: isReplay ? Number.MAX_VALUE : undefined
			},
			profiler: profiler
		}, function (e) {
			if (e) {
				console.log(e);
				throw e;
			}
			driver.startGame();
		});
	}
});
