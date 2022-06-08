import express = require("express");

const controller: express.RequestHandler = (req: express.Request, res: express.Response, _next: Function) => {
	const devMode = req.query.devmode !== "disable";
	const environment = res.locals.environment;
	const version = environment && environment["sandbox-runtime"] ? environment["sandbox-runtime"] : "1";
	// json の読み込みのため require の lint エラーを抑止
	/* eslint-disable @typescript-eslint/no-var-requires */
	const pkgJson = require("../../package.json");
	const engineFilesPkgJson = require(`../../node_modules/aev${version}/package.json`);
	/* eslint-enable */
	const engineFilesVariable = `engineFilesV${engineFilesPkgJson.version.replace(/[\.-]/g, "_") }`;

	res.render("game", {
		title: `akashic-sandbox v${pkgJson.version}`,
		version: version,
		devMode: devMode,
		engineFilesVariable: engineFilesVariable
	});
};

module.exports = controller;
