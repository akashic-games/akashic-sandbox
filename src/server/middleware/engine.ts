import * as express from "express";

export interface CreateEngineConfRouterParameterObject {
	runtimeVersion: string;
}

export function createEngineConfRouter(param: CreateEngineConfRouterParameterObject): express.Router {
	// TODO: param.runtimeVersion が固定値になっている。game.json の変更を監視するのが理想 (現実装では再起動が必要)
	const router = express.Router();
	router.get("/", (req, res, next) => {
		const host = req.protocol + "://" + req.get("host");
		const qe = req.query.externals;
		const externals = qe ? (Array.isArray(qe) ? qe : [qe]) : ["audio", "xhr", "websocket"];
		res.json({
			engine_configuration_version: "1.0",
			engine_urls: [
				`${host}/js/v${param.runtimeVersion}/akashic-engine.js`,
				`${host}/js/v${param.runtimeVersion}/pdi-browser.strip.js`,
				`${host}/js/v${param.runtimeVersion}/game-driver.strip.js`
			],
			content_url: `${host}/configuration/?raw=1`,
			asset_base_url: `${host}/raw_game/`,
			external: externals
		});
	});
	return router;
}
