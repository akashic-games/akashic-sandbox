import express = require("express");
import fs = require("fs");
import path = require("path");
import sr = require("../request/ScriptRequest");


var controller: express.RequestHandler = (req: sr.ScriptRequest, res: express.Response, next: Function) => {
	var scriptPath = path.join(req.baseDir, "sandboxconfig.js");

	if (! fs.existsSync(scriptPath)) {
		res.contentType("text/javascript");
		res.send(
			createLoadingScript()
		);
	}
	try {
		var sandboxConfig = require(scriptPath);
		delete require.cache[require.resolve(scriptPath)]; // 設定ファイルの更新に追従するためアクセス毎にキャッシュを削除する
		sandboxConfig = completeConfigParams(sandboxConfig);

		res.contentType("text/javascript");
		res.send(
			createLoadingScript(sandboxConfig)
		);
	} catch (error) {
		console.log("sandbox-error", JSON.stringify(error), error);

		res.contentType("text/javascript");
		res.send(
			createLoadingScript()
		);
	}
};

module.exports = controller;

function completeConfigParams(c: SandboxConfig): SandboxConfig {
	if (!c) c = {};

	var config = {
		autoSendEvents: c.autoSendEvents ? c.autoSendEvents : "",
		events: c.events ? c.events : {},
		showMenu: c.showMenu ? c.showMenu : false
	};
	return config;
}

function createLoadingScript(content?: any): string {
	content = content ? content : {};
	return "window.sandboxDeveloperProps = {};window.sandboxDeveloperProps.sandboxConfig = " + JSON.stringify(content);
}

interface SandboxConfig {
	/** コンテンツ起動時に流すイベント名を指定する */
	autoSendEvents?: string;

	/** sandboxでリストアップされるイベント */
	events?: { [key: string]: string };

	/** ページ読み込み時にデベロッパーメニューを開く */
	showMenu?: boolean;
}
