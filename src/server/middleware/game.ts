import * as fs from "fs";
import * as path from "path";
import * as express from "express";

export interface CreateGameRouterParamterObject {
	gameBase: string;
}

export function createGameRouter(param: CreateGameRouterParamterObject): express.Router {
	const router = express.Router();
	router.get("/:scriptName(*.js$)", (req, res, next) => {
		const scriptPath = path.join(param.gameBase, req.params.scriptName);
		if (!req.query.id) {
			res.status(400).send("Bad Request: the `id` query parameter required");
			return;
		}
		if (/^\.\.\//.test(path.relative(param.gameBase, scriptPath))) {
			res.sendStatus(403);
			return;
		}
		if (!fs.existsSync(scriptPath)) {
			res.sendStatus(404);
			return;
		}
		const content = fs.readFileSync(scriptPath);
		res.contentType("text/javascript");
		res.render("script", {
			id: req.query.id,
			scriptContent: content,
			scriptName: req.params.scriptName
		});
	});
	router.use("/", express.static(param.gameBase));
	return router;
}
