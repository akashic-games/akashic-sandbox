import * as g from "@akashic/akashic-engine";
import * as gdr from "@akashic/game-driver";
import * as pb from "@akashic/pdi-browser";
import { RunnerLike, RunnerParameterObject } from "../common/RunnerLike";
import { PerfRecord } from "../common/PerfRecord";
import { TimeKeeper } from "../common/TimeKeeper";
import { calcReplayLastTime } from "../common/replayUtil";
import { consoleLogger } from "../common/consoleLogger";
import { SandboxScriptAsset } from "./SandboxScriptAsset";

export class RunnerV2 implements RunnerLike {
	containerElement: HTMLDivElement;
	private _game: g.Game;
	private _driver: any;
	private _amflow: any;
	private _gameStorage: any;
	private _timeKeeper: TimeKeeper;
	private _platform: pb.Platform;
	private _param: RunnerParameterObject;

	constructor(param: RunnerParameterObject) {
		this.containerElement = document.createElement("div");
		this._game = null;
		this._driver = null;
		this._amflow = null;
		this._gameStorage = null;
		this._timeKeeper = null;
		this._platform = null;
		this._param = param;
	}

	initialize(): Promise<void> {
		const sandboxPlayer = { id: "9999", name: "sandbox-player" };
		const sandboxPlayId = "sandboxDummyPlayId";
		this._gameStorage = new gameStorage.GameStorage(window.localStorage, { gameId: nameHash });

		var amflowClient = new gdr.MemoryAmflowClient({
			playId: sandboxPlayId,
			putStorageDataSyncFunc: this._gameStorage.set.bind(this._gameStorage),
			getStorageDataSyncFunc: function (readKeys) {
				var svs = this._gameStorage.load(readKeys);
				// StorageValue[][]からStorageData[]に変換する
				// TODO: StorageValue[][]が返ってくる必然性はない。game-storage側の仕様を変えるべき。
				return readKeys.map(function (k, i) { return { readKey: k, values: svs[i] }; });
			},
			tickList: null,
			startPoints: null
		});

		const pf = new pb.Platform({
			amflow: amflowClient,
			containerView: this.containerElement,
			audioPlugins: [pb.WebAudioPlugin, pb.HTMLAudioPlugin],
			disablePreventDefault: this._param.disablePreventDefaultOnScreen
		});

		pf._resourceFactory.createScriptAsset = function(id, assetPath) {
			return new SandboxScriptAsset(id, assetPath);
		};

		const driver = new gdr.GameDriver({
			platform: pf,
			player: sandboxPlayer,
			errorHandler: function (e) { console.log("ERRORHANDLER:", e); }
		});

		this._platform = pf;
		this._timeKeeper = new TimeKeeper();

		driver.gameCreatedTrigger.add(function (game) {
			game.logger.logged.add(log => {
				const table = {
					[g.LogLevel.Debug]: "debug",
					[g.LogLevel.Info]: "info",
					[g.LogLevel.Warn]: "warn",
					[g.LogLevel.Error]: "error"
				};
				consoleLogger({ ...log, level: table[log.level] });
			});

			this._game = game;
			this._driver = driver;
			this._amflow = amflowClient;
		});

		const profiler = (!this._param.onNotifyPerformance) ? null : new gdr.SimpleProfiler({
			interval: 200,
			getValueHandler: this._param.onNotifyPerformance
		});

		return Promise<void>((resolve, reject) => {
			driver.initialize({
				configurationUrl: "/configuration/",
				assetBase: "/game/",
				driverConfiguration: {
					playId: sandboxPlayId,
					playToken: gdr.MemoryAmflowClient.TOKEN_ACTIVE,
					executionMode: gdr.ExecutionMode.Active
				},
				loopConfiguration: {
					loopMode: gdr.LoopMode.Realtime
				},
				profiler: profiler
			}, (e: any) => {
				if (e)
					return void reject(e);
				resolve();
			});
		});
	}

	start(): void {
		// this._timeKeeper.start();
		this._driver.startGame();
	}
}
