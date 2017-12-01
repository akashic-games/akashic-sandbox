import * as fs from "fs";
import * as path from "path";
import * as http from "http";
import { createApp } from "./app";

function normalizePort(port: string): number | string {
	var ret = parseInt(port, 10);
	if (isNaN(ret)) // named pipe
		return port;
	if (ret >= 0) // port number
		return ret;
	throw new Error("Invalid port: " + port);
}

export interface RunParameterObject {
	gameBase?: string;
	port?: string;
	cascadeBases?: string[];
}

export function run(param: RunParameterObject) {
	const gameBase = param.gameBase || ".";
	const port = normalizePort(param.port || process.env.PORT || "3000");
	const cascadeBases = param.cascadeBases || [];
	const gameJsonPath = path.join(gameBase, "game.json");

	if (!fs.existsSync(gameJsonPath))
		throw new Error("Cannot load " + gameJsonPath);

	const app = createApp({ gameBase, cascadeBases });
	const server = http.createServer(app);
	server.on("error", (error: any) => {
		if (error.syscall !== 'listen')
			throw error;
		const bind = (typeof port === 'string') ? ('Pipe ' + port) : ('Port ' + port);
		switch (error.code) {
			case 'EACCES':
				console.error(bind + ' requires elevated privileges');
				process.exit(1);
				break;
			case 'EADDRINUSE':
				console.error(bind + ' is already in use');
				process.exit(1);
				break;
			default:
				throw error;
		}
	});

	server.listen(port);
	console.log("akashic-sandbox listen port: " + port);
	console.log("hosting game: " + gameJsonPath);
	console.log("please access to http://localhost:%d/game/ by Web browser (or use -O option)", port);
}
