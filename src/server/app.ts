import * as path from "path";
import * as express from "express";
import * as ECT from "ect";
import { readReuestedRuntimeVersion } from "./util";
import { createGameRouter } from "./middleware/game";
import { createConfigurationRouter } from "./middleware/configuration";
import { createEngineConfRouter } from "./middleware/engine";
import { createSandboxConfigRouter } from "./middleware/sandboxconfig";

export interface CreateAppParameterObject {
	gameBase?: string;
	cascadeBases?: string[];
}

export function createApp(param: CreateAppParameterObject): express.Express {
	const gameBase = param.gameBase || ".";
	const cascadeBases = param.cascadeBases || [];
	const gameJsonPath = path.join(gameBase, "game.json");
	const runtimeVersion = readReuestedRuntimeVersion(gameJsonPath);
	const app = express();
	const isDev = (app.get("env") === "development");
	const appRoot = path.join(__dirname, "..");

	const ect = ECT({ watch: isDev, root: path.join(appRoot, "views"), ext: ".ect" });
	app.set("views", path.join(appRoot, "views"));
	app.engine("ect", ect.render);
	app.set("view engine", "ect");

	app.use((req, res, next) => {
		res.header("Access-Control-Allow-Origin", "*");
		next();
	});

	app.use("^\/?$", (req, res, next) => res.redirect("/game/"));
	app.use("^\/game?$", (req, res, next) => res.redirect("/game/"));
	// app.use("/basepath/", (req, res, next) => {
	// 	res.send(app.gameBase);
	// });

	app.use("/dist/", express.static(path.join(appRoot, "dist")));
	app.use(/\/game\/$/, (req, res, next) => {
		res.sendFile(path.join(appRoot, "static", (runtimeVersion === "1") ? "game1x.html" : "game2x.html"));
	});
	app.use("/game/", createGameRouter({ gameBase }));
	app.use("/raw_game/", express.static(gameBase));
	cascadeBases.forEach((base, i) => {
		app.use("/cascade/" + i, createGameRouter({ gameBase: base }));
		app.use("/raw_cascade/" + i, express.static(base));
	});
	app.use("/configuration/", createConfigurationRouter({ cascadeLength: cascadeBases.length }));
	app.use("/sandboxconfig/", createSandboxConfigRouter({ gameBase }));
	app.use("/engine", createEngineConfRouter({ runtimeVersion }));
	app.use((req, res, next) => res.sendStatus(404));
	app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
		console.error(err);
		res.sendStatus(500);
	});
	return app;
}
