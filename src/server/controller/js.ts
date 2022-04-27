import fs = require("fs");
import path = require("path");
import express = require("express");
import sr = require("../request/ScriptRequest");

var controller = (req: sr.ScriptRequest, res: express.Response, next: Function): void => {
	var scriptPath = path.join(req.baseDir, req.params.scriptName);
	// TODO: pathがbaseDir以下かの検査（scriptNameに..とか入れられるとたどれちゃう）
	if (! fs.existsSync(scriptPath)) {
		var err = new Error("Not Found");
		err.status = 404;
		next(err);
		return;
	}
	var content = fs.readFileSync(scriptPath);
	res.contentType("text/javascript");
	if (req.useRawScript) {
		res.send(content);
	} else {
		res.render("script", {
			key: req.originalUrl,
			scriptContent: content,
			scriptName: req.params.scriptName
		});
	}
};

module.exports = controller;
