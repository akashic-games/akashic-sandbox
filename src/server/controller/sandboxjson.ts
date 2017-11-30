import express = require("express");
import fs = require("fs");
import path = require("path");
import sr = require("../request/ScriptRequest");


var controller: express.RequestHandler = (req: sr.ScriptRequest, res: express.Response, next: Function) => {
	var scriptPath = path.join(req.baseDir, "sandbox.json");

	if (! fs.existsSync(scriptPath)) {
		res.contentType("text/javascript");
		res.send("window.events = " + "{}");
	}
	try {
		var sandboxJson = JSON.parse(fs.readFileSync(scriptPath, "utf8"));
		var events = sandboxJson.events;
		if (!events) {
			res.contentType("text/javascript");
			res.send("window.events = " + "{}");
		}
	
		var content = "window.events = " + JSON.stringify(sandboxJson.events);

		res.contentType("text/javascript");
		res.send(content);
	} catch (error) {
		console.log("error", JSON.stringify(error), error);

		res.contentType("text/javascript");
		res.send("window.events = " + "{}");
	}

};

module.exports = controller;
