import * as fs from "fs";
import * as path from "path";
import * as express from "express";

export interface CreateSandboxConfigRouterParamterObject {
	gameBase: string;
}

export function createSandboxConfigRouter(param: CreateSandboxConfigRouterParamterObject): express.Router {
	const router = express.Router();
	router.get("/", (req, res, next) => {
		const configPath = path.resolve(path.join(param.gameBase, "sandbox.config.js"));
		let sandboxConfig = {};
		if (fs.existsSync(configPath)) {
			try {
				sandboxConfig = require(configPath);
				delete require.cache[require.resolve(configPath)];
			} catch (error) {
				console.log(error);
			}
		}
		res.json(sandboxConfig);
	});
	return router;
}
