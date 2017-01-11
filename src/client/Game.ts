import g = require("@akashic/akashic-engine");

// same as browser-engine
// TODO: use browser-engine.d.ts
interface GameConfiguration extends g.GameConfiguration {
	operationPlugins?: g.OperationPluginInfo[];
	renderers?: string[];
}

class Game extends g.Game {
	pluginInfos: g.OperationPluginInfo[];
	loopCount: number;

	private _beforeTickTrigger: g.Trigger<any>;
	private _afterTickTrigger: g.Trigger<any>;

	constructor(gameConfiguration: GameConfiguration, resourceFactory: g.ResourceFactory,
	            assetBase?: string, selfId?: string, serverUri?: string) {
		super(gameConfiguration, resourceFactory, assetBase, selfId);

		this.pluginInfos = gameConfiguration.operationPlugins || [];

		this._beforeTickTrigger = new g.Trigger();
		this._afterTickTrigger = new g.Trigger();
		this.loopCount = 100;
	}

	loop(maxAge: number, loopCount: number, transaction: () => void, callback: () => void): void {
		var _loop = () => {
			for (var i = 0; i < loopCount; i++) {
				if (this.scene().local) {
					transaction.call(this);
					requestAnimationFrame(_loop);
					return;
				}
				if (this.age >= maxAge) {
					callback();
					return;
				}
				transaction.call(this);
			}
			setTimeout(_loop, 0);
		};
		_loop();
	}

	start(playID?: string, token?: string): void {
		// BrowserGameから呼ばれるので一応設定しておく空IF
	}

	startCheck(maxAge: number, renderPerFrame: number, callback: () => void): void {
		this.random.push(new g.XorshiftRandomGenerator(new Date().getTime()));
		this._loadAndStart();
		var cnt = this.loopCount;
		var run = () => {
			this.loop(maxAge, cnt, this.tick, callback);
		};
		var runWithRender = () => {
			this.loop(maxAge, cnt, () => {
				this.tick();
				this._afterTickTrigger.fire();
			}, callback);
		};
		var runWithRenderPerFrame = () => {
			this.loop(maxAge, cnt, () => {
				this.tick();
				if (renderPerFrame % this.age === 0)
					this._afterTickTrigger.fire();
			}, callback);
		};

		var render = () => {
			if (this.modified && this.scenes.length) {
				this.render();
			}
		};
		this._afterTickTrigger.handle(this, render);

		if (renderPerFrame > 1) {
			runWithRenderPerFrame();
		} else if (renderPerFrame === 1) {
			runWithRender();
		} else if (! renderPerFrame) {
			run();
		} else {
			throw new Error("invalid render per frame");
		}
	}
}
