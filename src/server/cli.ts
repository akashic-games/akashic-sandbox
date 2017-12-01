import * as commander from "commander";
import {run} from "./index";

const pkgver = require("../package.json").version;
commander
	.version(pkgver)
	.usage("[options] <game path>")
	.option("--cascade <path>", "path to contents to cascade", (val, acc) => acc.concat(val), [])
	.option("-p, --port <port>", "number of listen port. default 3000", parseInt)
	.parse(process.argv);

run({
	gameBase: commander.args[0],
	port: commander.port,
	cascadeBases: commander.cascade
});
