import * as g from "@akashic/akashic-engine";
import * as gdr from "@akashic/game-driver";
import * as pb from "@akashic/pdi-browser";
import * as gameStorage from "@akashic/game-storage";
import { RunnerLike, RunnerParameterObject } from "../types/RunnerLike";
import { CommonTriggerLike } from "../types/CommonTriggerLike";
import { PerfRecord } from "../types/PerfRecord";
import { BoundingRectData } from "../types/BoundingRectData";
import { TimeKeeper } from "../shared/TimeKeeper";
import { calculateEntityBoundingRect } from "../shared/entityUtil";
import { consoleLogger } from "../shared/consoleLogger";
import { SandboxScriptAsset } from "./SandboxScriptAsset";
import { CommonTriggerV2 } from "./CommonTriggerV2";

export class RunnerV2 implements RunnerLike {
	containerElement: HTMLDivElement;
	onNotifyPerformance: CommonTriggerLike<PerfRecord>;
	onError: CommonTriggerLike<any>
	private _game: g.Game;
	private _driver: any;
	private _amflow: any;
	private _gameStorage: any;
	private _timeKeeper: TimeKeeper;
	private _platform: pb.Platform;
	private _param: RunnerParameterObject;
	private _realContainer: HTMLDivElement;  // pdi-browserの実装がルートコンテナの上に要素がある前提でできているので暫定

	constructor(param: RunnerParameterObject) {
		this.containerElement = document.createElement("div");
		this.onNotifyPerformance = new CommonTriggerV2<PerfRecord>();
		this.onError = new CommonTriggerV2<any>();
		this._game = null;
		this._driver = null;
		this._amflow = null;
		this._gameStorage = null;
		this._timeKeeper = null;
		this._platform = null;
		this._param = param;
		this._realContainer = document.createElement("div");
		this.containerElement.appendChild(this._realContainer);
	}

	initialize(): Promise<void> {
		const sandboxPlayer = { id: "9999", name: "sandbox-player" };
		const sandboxPlayId = "sandboxDummyPlayId";
		this._gameStorage = new gameStorage.GameStorage(window.localStorage, { gameId: this._param.nameHash });

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
			containerView: this._realContainer,
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

		driver.gameCreatedTrigger.add(game => {
			game.logger.logging.add(log => {
				const table = {
					[g.LogLevel.Debug]: "debug",
					[g.LogLevel.Info]: "info",
					[g.LogLevel.Warn]: "warn",
					[g.LogLevel.Error]: "error"
				};
				consoleLogger({ message: log.message, cause: log.cause, level: table[log.level] });
			});

			this._game = game;
			this._driver = driver;
			this._amflow = amflowClient;
		});

		const profiler = (!this._param.notifyPerformance) ? null : new gdr.SimpleProfiler({
			interval: 200,
			getValueHandler: this.onNotifyPerformance.fire.bind(this.onNotifyPerformance)
		});

		return new Promise<void>((resolve, reject) => {
			driver.initialize({
				configurationUrl: this._param.configurationUrl,
				assetBase: this._param.assetBase,
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

	setScale(scale: number): void {
		this._platform.setScale(scale, scale);
	}

	getBoundingRectData(eid: number): BoundingRectData {
		return calculateEntityBoundingRect((eid < 0) ? this._game._localDb[eid] : this._game.db[eid]);
	}
}
