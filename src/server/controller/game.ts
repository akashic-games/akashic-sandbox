import express = require("express");

var controller: express.RequestHandler = (req: express.Request, res: express.Response, _next: Function) => {
	var devMode = req.query.devmode !== "disable";
	var environment = res.locals.environment;
	var version = environment && environment["sandbox-runtime"] ? environment["sandbox-runtime"] : "1";
	// json の読み込みのため require の lint エラーを抑止
	/* eslint-disable @typescript-eslint/no-var-requires */
	var versionsJson = require("../engineFilesVersion.json");
	var pkgJson = require("../../package.json");
	/* eslint-enable */

	res.render("game", {
		title: `akashic-sandbox v${pkgJson.version}`,
		version: version,
		devMode: devMode,
		engineFilesVariable: versionsJson[`v${version}`].variable
	});
};

module.exports = controller;
