// import * as fs from "fs";
import * as path from "path";
import * as express from "express";
import * as ECT from "ect";
import { createGameRouter } from "./game/createGameRouter";
// import { readReuestedRuntimeVersion } from "./util";

export interface CreateAppParameterObject {
	gameBase?: string;
	cascadeBases?: string[];
}

export function createApp(param: CreateAppParameterObject): express.Express {
	const gameBase = param.gameBase || ".";
	// const gameJsonPath = path.join(gameBase, "game.json");
	// const runtimeVersion = readReuestedRuntimeVersion(gameJsonPath);
	const app = express();
	const isDev = (app.get("env") === "development");
	const ect = ECT({ watch: isDev, root: path.join(__dirname, "..", "views"), ext: ".ect" });

	app.set("views", path.join(__dirname, "..", "views"));
	app.engine("ect", ect.render);
	app.set("view engine", "ect");

	app.use((req, res, next) => {
		res.header("Access-Control-Allow-Origin", "*");
		next();
	});

	app.use("/game/", createGameRouter({ gameBase }));

	app.use((req, res, next) => res.sendStatus(404));
	app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
		console.error(err);
		res.sendStatus(500);
	});
	return app;
}
