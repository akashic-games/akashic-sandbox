import fs = require("fs");
import path = require("path");
import express = require("express");
import sr = require("../request/ScriptRequest");


var controller: express.RequestHandler = (req: sr.ScriptRequest, res: express.Response, next: Function) => {
	var scriptPath = path.resolve(path.join(req.baseDir, "sandbox.config.js"));

	if (! fs.existsSync(scriptPath)) {
		res.contentType("text/javascript");
		res.send(createLoadingScript({}));
		return;
	}
	var sandboxConfig = {};
	try {
		sandboxConfig = require(scriptPath);
		delete require.cache[require.resolve(scriptPath)]; // 設定ファイルの更新に追従するためアクセス毎にキャッシュを削除する
		sandboxConfig = completeConfigParams(sandboxConfig);
	} catch (error) {
		console.log(error);
	}
	res.contentType("text/javascript");
	res.send(createLoadingScript(sandboxConfig));
};

module.exports = controller;

function completeConfigParams(c: SandboxConfig): SandboxConfig {
	var config = {
		autoSendEventName: c.autoSendEventName ? c.autoSendEventName : "",
		events: c.events ? c.events : {},
		showMenu: !!c.showMenu,
		warn: c.warn ? c.warn : {}
	};
	return config;
}

function createLoadingScript(content: any): string {
	return `window.sandboxDeveloperProps = window.sandboxDeveloperProps || {};
window.sandboxDeveloperProps.sandboxConfig = ${JSON.stringify(content)};
`;
}

interface SandboxConfig {
	/** コンテンツ起動時に流すイベント名を指定する */
	autoSendEventName?: string;

	/** sandboxでリストアップされるイベント */
	events?: { [key: string]: any };

	/** ページ読み込み時にデベロッパーメニューを開く */
	showMenu?: boolean;

	/** 各種警告表示設定 */
	warn?: {
		/** ES6以降でサポートされるオブジェクトが使われている場合警告を出すかどうか */
		es6?: boolean;
	};
}
