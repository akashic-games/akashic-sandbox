import express = require("express");
import { resolveEngineFilesVariable } from "../utils";

const controller: express.RequestHandler = (req: express.Request, res: express.Response, _next: Function) => {
	const devMode = req.query.devmode !== "disable";
	const environment = res.locals.environment;
	const version = environment && environment["sandbox-runtime"] ? environment["sandbox-runtime"] : "1";
	// json の読み込みのため require の lint エラーを抑止
	/* eslint-disable @typescript-eslint/no-var-requires */
	const pkgJson = require("../../package.json");
	/* eslint-enable */
	const engineFilesVariable = resolveEngineFilesVariable(version);

	res.render("game", {
		title: `akashic-sandbox v${pkgJson.version}`,
		version: version,
		devMode: devMode,
		engineFilesVariable: engineFilesVariable,
		engineFilesPath: `v${version}/engineFiles.js`
	});
};

module.exports = controller;
