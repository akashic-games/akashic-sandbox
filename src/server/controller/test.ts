import express = require("express");

var controller: express.RequestHandler = (req: express.Request, res: express.Response, next: Function) => {
	res.render("test", {
		title: "test"
	});
};

module.exports = controller;
