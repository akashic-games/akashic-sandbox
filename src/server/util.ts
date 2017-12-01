import * as fs from "fs";

interface ModuleEnvironment {
	"sandbox-runtime"?: string;
}

interface GameConfiguration {
	environment?: ModuleEnvironment;
}

export function readReuestedRuntimeVersion(gameJsonPath: string): string {
	const conf: GameConfiguration = JSON.parse(fs.readFileSync(gameJsonPath, "utf8"));
	if (!conf.environment)
		return "1";
	let ver = conf.environment["sandbox-runtime"];
	if (!ver)
		return "1";
	if (typeof ver !== "string") {
		console.warn("environment[\"sandbox-runtime\"] in game.json should be a string value.");
		ver = (ver as any).toString();
	}
	if (ver !== "1" && ver !== "2")
		throw new Error("Invalid runtime version: environment[\"sandbox-runtime\"] in game.json must be \"1\" or \"2\", currently.");
	return ver;
}
