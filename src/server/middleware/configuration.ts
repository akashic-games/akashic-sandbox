import * as express from "express";

export interface CreateConfigurationRouterParamterObject {
	cascadeLength: number;
}

export function createConfigurationRouter(param: CreateConfigurationRouterParamterObject): express.Router {
	const router = express.Router();
	if (param.cascadeLength === 0) {
		router.get("/", (req, res, next) => {
			res.redirect(`/${req.query.raw ? "raw_" : ""}game/game.json`);
		});
	} else {
		const makeDefs = (prefix: string) => {
			const defs = [`${prefix}game/game.json`];
			for (let i = 0; i < param.cascadeLength; ++i)
				defs.push(`${prefix}cascade/${i}/game.json`);
			return defs;
		}
		const conf = { definitions: makeDefs("/") };
		const rawConf = { definitions: makeDefs("/raw_") };
		router.get("/", (req, res, next) => {
			res.json(req.query.raw ? rawConf : conf);
		});
	}
	return router;
}
