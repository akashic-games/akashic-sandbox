import * as g from "@akashic/akashic-engine";
import * as gdr from "@akashic/game-driver";
import * as pb from "@akashic/pdi-browser";
import { TimeKeeper } from "../common/TimeKeeper";
import { calcReplayLastTime } from "../common/replayUtil";
import { consoleLogger } from "../common/consoleLogger";
import { SandboxScriptAsset } from "./SandboxScriptAsset";

export interface ReplayData {
	fps: number;
	tickList: any;
	startPoints: any;
}

export interface RunnerParameterObject {
	nameHash: string;
	disablePreventDefaultOnScreen?: boolean;
	measurePerformance?: boolean;
	replayData?: ReplayData;
}

export class Runner {
	containerElement: HTMLDivElement;
	game: g.Game;
	driver: any;
	amflow: any;
	gameStorage: any;
	timerKeeper: TimeKeeper;
	private _param: RunnerParameterObject;

	constructor(param: RunnerParameterObject) {
		this.containerElement = document.createElement("div");
		this.game = null;
		this.driver = null;
		this.amflow = null;
		this.gameStorage = null;
		this.timerKeeper = null;
		this._param = param;
	}

	initialize(): Promise<void> {
		const sandboxPlayer = { id: "9999", name: "sandbox-player" };
		const sandboxPlayId = "sandboxDummyPlayId";
		const storage = new gameStorage.GameStorage(window.localStorage, { gameId: nameHash });

		var amflowClient = new gdr.MemoryAmflowClient({
			playId: sandboxPlayId,
			putStorageDataSyncFunc: storage.set.bind(storage),
			getStorageDataSyncFunc: function (readKeys) {
				var svs = storage.load(readKeys);
				// StorageValue[][]からStorageData[]に変換する
				// TODO: StorageValue[][]が返ってくる必然性はない。game-storage側の仕様を変えるべき。
				return readKeys.map(function (k, i) { return { readKey: k, values: svs[i] }; });
			},
			tickList: this._param.replayData ? this._param.replayData.tickList : null,
			startPoints: this._param.replayData ? this._param.replayData.startPoints : null
		});

		var isReplay = !!this._param.replayData;
		var replayLastTime = isReplay ? calcReplayLastTime(this._param.tickList, this._param.fps) : 0;

		var pf = new pb.Platform({
			amflow: amflowClient,
			containerView: this.containerElement,
			audioPlugins: [pb.WebAudioPlugin, pb.HTMLAudioPlugin],
			disablePreventDefault: this._param.disablePreventDefaultOnScreen
		});

		pf._resourceFactory.createScriptAsset = function(id, assetPath) {
			return new SandboxScriptAsset(id, assetPath);
		};

		driver = new gdr.GameDriver({
			platform: pf,
			player: sandboxPlayer,
			errorHandler: function (e) { console.log("ERRORHANDLER:", e); }
		});

		this.timeKeeper = new TimeKeeper(replayLastTime);

		driver.gameCreatedTrigger.add(function (game) {
			game.logger.logged.add(log => {
				const table = {
					[g.LogLevel.Debug]: "debug",
					[g.LogLevel.Info]: "info",
					[g.LogLevel.Warn]: "warn",
					[g.LogLevel.Error]: "error"
				};
				consoleLogger({ ...log, level: table[log.level]);
			});

			this.game = game;
			this.driver = driver;
			this.amflow = amflowClient;
		});

		var profiler;
		if (this._param.measurePerformance) {
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
				targetTimeFunc: this.timeKeeper.now.bind(timeKeeper)
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
}
