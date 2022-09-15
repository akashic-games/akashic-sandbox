import path = require("path");
import express = require("express");
import { resolveEngineFilesVariable } from "../utils";

const controller: express.RequestHandler = (req: express.Request, res: express.Response, _next: Function) => {
	const devMode = req.query.devmode !== "disable";
	const environment = res.locals.environment;
	const version = environment && environment["sandbox-runtime"] ? environment["sandbox-runtime"] : "1";
	// json の読み込みのため require の lint エラーを抑止
	/* eslint-disable @typescript-eslint/no-var-requires */
	const pkgJson = require("../../package.json");

	let engineFilesVariable: string = "";
	if (process.env.ENGINE_FILES_V3_PATH) {
		const filename = path.basename(process.env.ENGINE_FILES_V3_PATH, ".js");
		engineFilesVariable = filename.replace(/[\.-]/g, "_");
	} else {
		engineFilesVariable = resolveEngineFilesVariable(version);
	}

	res.render("game", {
		title: `akashic-sandbox v${pkgJson.version}`,
		version: version,
		devMode: devMode,
		engineFilesVariable: engineFilesVariable,
		engineFilesPath: `js/v${version}/${engineFilesVariable}.js`
	});
};

module.exports = controller;
