import express = require("express");

var controller: express.RequestHandler = (req: express.Request, res: express.Response, next: Function) => {
	var devMode = req.query["devmode"] !== "disable";
	var environment = res.locals.environment;
	var version = environment && environment["sandbox-runtime"] ? environment["sandbox-runtime"] : "1";
	res.render("game", {
		title: "game",
		version: version,
		devMode: devMode
	});
};

module.exports = controller;
