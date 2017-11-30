import express = require("express");
import session = require("express-session");
// import favicon = require("serve-favicon");
import fs = require("fs");
import path = require("path");
import ECT = require("ect");
import jsRoute = require("./routes/js");
import gameRoute = require("./routes/game");
import testRoute = require("./routes/test");
import sr = require("./request/ScriptRequest");

import sandboxjsonHandler = require("./routes/sandboxjson");

interface AkashicSandbox extends express.Express {
	gameBase?: string;
	cascadeBases?: string[];
	scenario?: any;
}

interface ASSession extends Express.Session {
	cntr?: number;
	results?: any[];
}

interface AppOptions {
	gameBase?: string;
	jsBase?: string;
	cssBase?: string;
	thirdpartyBase?: string;
	cascadeBases?: string[];
}

interface ModuleEnvironment {
	"sandbox-runtime"?: string;
}

// Akashic Sandboxに必要な部分だけ定義
interface GameConfiguration {
	environment?: ModuleEnvironment;
}

function result2csv(results: any[]): string {
	var csv: string = "";
	for (var i = 0; i < results.length; i++) {
		csv += results[i].name + "," + results[i].elapse + "\n";
	}
	return csv;
}

function getContentModuleEnvironment(gameJsonPath: string): ModuleEnvironment {
	if (fs.existsSync(gameJsonPath)) {
		var configuration: GameConfiguration = JSON.parse(fs.readFileSync(gameJsonPath, "utf8"));
		return configuration.environment;
	}
	return null;
}

module.exports = function (options: AppOptions = {}): AkashicSandbox {
	var appBase = path.join(__dirname, "..");
	var gameBase = options.gameBase ? options.gameBase : process.cwd();
	var cascadeBases = options.cascadeBases || [];
	var jsBase = options.jsBase ? options.jsBase : path.join(appBase, "js");
	var cssBase = options.cssBase ? options.cssBase : path.join(appBase, "css");
	var thridpartyBase = options.thirdpartyBase ? options.thirdpartyBase : path.join(appBase, "thirdparty");

	var app: AkashicSandbox = express();
	var isDev = app.get("env") === "development";

	var gameJsonPath = path.join(gameBase, "game.json");
	var environment = getContentModuleEnvironment(gameJsonPath);
	var version = environment && environment["sandbox-runtime"] ? environment["sandbox-runtime"] : "1";

	if (version !== "1" && version !== "2") {
		// sandbox-runtime の値が "1", "2" 以外の場合エラーとする
		throw new Error("sandbox-runtime value is invalid. Please set the environment. sandbox-runtime value of game.json to 1 or 2.");
	}

	// see https://github.com/expressjs/session#secret
	app.use(session({
		resave: false,
		saveUninitialized: false,
		secret: "to eat or no  to eat"
	}));

	app.use((req, res, next) => {
		res.header("Access-Control-Allow-Origin", "*");
		res.locals.environment = environment;
		res.locals.events = ["dog","horse","bird", "human"];
		next();
	});

	app.gameBase = gameBase;
	app.cascadeBases = cascadeBases;

	// TODO: change to middleware
	app.use("/game/*.js$", (req: sr.ScriptRequest, res: express.Response, next: Function) => {
		req.baseDir = app.gameBase;
		next();
	});
	app.use("/raw_game/*.js$", (req: sr.ScriptRequest, res: express.Response, next: Function) => {
		req.baseDir = app.gameBase;
		req.useRawScript = true;
		next();
	});
	app.use("/cascade/:index/*.js$", (req: sr.ScriptRequest, res: express.Response, next: Function) => {
		req.baseDir = app.cascadeBases[Number(req.params.index)];
		next();
	});
	app.use("/raw_cascade/:index/*.js$", (req: sr.ScriptRequest, res: express.Response, next: Function) => {
		req.baseDir = app.cascadeBases[Number(req.params.index)];
		req.useRawScript = true;
		next();
	});

	app.set("views", path.join(__dirname, "..", "views"));
	app.engine("ect", ECT({watch: isDev, root: path.join(__dirname, "..", "views"), ext: ".ect"}).render);
	app.set("view engine", "ect");

	app.use("^\/$", (req: express.Request, res: express.Response, next: Function) => {
		res.redirect("/game/");
	});
	app.use("^\/game$", (req: express.Request, res: express.Response, next: Function) => {
		res.redirect("/game/");
	});
	// /js/ /css/ /thirdparty/ を静的ファイルとして参照できるようにする
	app.use("/js/", express.static(jsBase));
	app.use("/css/", express.static(cssBase));
	app.use("/thirdparty/", express.static(thridpartyBase));

	app.use("/sandboxjson/", (req: sr.ScriptRequest, res: express.Response, next: Function) => {
		req.baseDir = app.gameBase;
		next();
	});
	app.use("/sandboxjson/", <express.RequestHandler>sandboxjsonHandler);

	// /game/ は sandbox をブラウザで開く場合に利用、/raw_game/ は /engine のエンジン設定ファイルを使う場合に利用
	app.use("/game", <express.RequestHandler>jsRoute);
	app.use("/game", <express.RequestHandler>gameRoute);
	app.use("/game/", express.static(app.gameBase));
	app.use("/raw_game", <express.RequestHandler>jsRoute);
	app.use("/raw_game/", express.static(app.gameBase));
	app.use("/cascade/:index", <express.RequestHandler>jsRoute);
	app.use("/raw_cascade/:index", <express.RequestHandler>jsRoute);
	for (var i = 0; i < app.cascadeBases.length; ++i) {
		app.use("/cascade/" + i + "/", express.static(app.cascadeBases[i]));
		app.use("/raw_cascade/" + i + "/", express.static(app.cascadeBases[i]));
	}

	app.use("/configuration/", (req: express.Request, res: express.Response, next: Function) => {
		var prefix = req.query.raw ? "/raw_" : "/";
		if (app.cascadeBases.length === 0) {
			res.redirect(prefix + "game/game.json");
			return;
		}
		var defs = [prefix + "game/game.json"];
		for (var i = 0; i < app.cascadeBases.length; ++i)
			defs.push(prefix + "cascade/" + i + "/game.json");
		res.json({ definitions: defs });
	});

	app.use("/basepath/", (req: express.Request, res: express.Response, next: Function) => {
		res.send(app.gameBase);
	});

	app.use("/engine", (req: express.Request, res: express.Response, next: Function) => {
		var host = req.protocol + "://" + req.get("host");
		res.type("application/json");
		var externals = req.query.externals ? req.query.externals : ["audio", "xhr", "websocket"];
		externals = Array.isArray(externals) ? externals : [externals];
		res.render("engine", {
			host: host,
			version: version,
			externals: JSON.stringify(externals)
		});
	});

	app.use("^\/test$", (req: express.Request, res: express.Response, next: Function) => {
		res.redirect("/test/");
	});
	app.use("/test/*.js$", (req: sr.ScriptRequest, res: express.Response, next: Function) => {
		var ssn: ASSession = req.session;
		req.baseDir = app.scenario.benchmarks[ssn.cntr].target;
		next();
	});
	app.use("/start/", (req: express.Request, res: express.Response, next: Function) => {
		var scenarioJSONString = fs.readFileSync(app.settings.scenarioPath).toString();
		app.scenario = JSON.parse(scenarioJSONString);
		var ssn: ASSession = req.session;
		ssn.cntr = 0;
		ssn.results = [];
		res.redirect("/test/");
	});
	app.use("/next/", (req: express.Request, res: express.Response, next: Function) => {
		var ssn: ASSession = req.session;

		var elapse: number = Number(req.query.elapse);
		ssn.results.push(
			{
				"name": app.scenario.benchmarks[ssn.cntr].name,
				"elapse": elapse
			}
		);

		ssn.cntr++;
		if (ssn.cntr < app.scenario.benchmarks.length) {
			res.redirect("/test/");
		} else {
			res.redirect("/finish/");
		}
	});
	app.use("/finish/", (req: express.Request, res: express.Response, next: Function) => {
		var ssn: ASSession = req.session;
		console.log("you arrived at 'finish'");

		res.render("finish", {
				"resultjson": JSON.stringify(ssn.results),
				"resultcsv": result2csv(ssn.results),
				"title": "finish"
			}
		);
	});
	app.use("/test", <express.RequestHandler>jsRoute);
	app.use("/test", (req: express.Request, res: express.Response, next: express.NextFunction) => {
		var ssn: ASSession = req.session;
		res.locals.maxAge = app.scenario.benchmarks[ssn.cntr].maxAge;
		res.locals.renderPerFrame = app.scenario.benchmarks[ssn.cntr].renderPerFrame;
		res.locals.renderPerFrame = (res.locals.renderPerFrame === undefined) ? "undefined" : res.locals.renderPerFrame;
		res.locals.loopCount = app.scenario.benchmarks[ssn.cntr].loopCount;
		res.locals.loopCount = (res.locals.loopCount === undefined) ? "undefined" : res.locals.loopCount;
		(<express.RequestHandler>testRoute)(req, res, next);
	});
	app.use("/test/", (req: express.Request, res: express.Response, next: express.NextFunction) => {
		var ssn: ASSession = req.session;
		express.static(app.scenario.benchmarks[ssn.cntr].target)(req, res, next);
	});

	app.use((req: express.Request, res: express.Response, next: Function) => {
		var err = new Error("Not Found");
		err.status = 404;
		next(err);
	});

	var errorHandler: express.ErrorRequestHandler;
	if (isDev) {
		errorHandler = (err: any, req: express.Request, res: express.Response, next: Function): any => {
			res.status(err.status || 500);
			res.render("error", {
				title: "error",
				message: err.message,
				error: err
			});
		};
	} else {
		errorHandler = (err: any, req: express.Request, res: express.Response, next: Function): any => {
			res.status(err.status || 500);
			res.render("error", {
				title: "error",
				message: err.message,
				error: {}
			});
		};
	}

	app.use(errorHandler);

	return app;
};
