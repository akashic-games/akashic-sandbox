import express = require("express");

var controller: express.RequestHandler = (req: express.Request, res: express.Response, next: Function) => {
	var devMode = req.query["devmode"] !== "disable";
	res.render("game", {
		title: "game",
		devMode: devMode
	});
};

module.exports = controller;
