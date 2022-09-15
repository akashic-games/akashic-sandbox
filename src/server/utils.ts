import path = require("path");

export function resolveEngineFilesVariable(version: string): string {
	let engineFilesVariable: string = "";
	if (version === "3" && process.env.ENGINE_FILES_V3_PATH) {
		const filename = path.basename(process.env.ENGINE_FILES_V3_PATH, ".js");
		engineFilesVariable = filename.replace(/[\.-]/g, "_");
	} else {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const engineFilesPkgJson = require(`aev${version}/package.json`);
		engineFilesVariable = `engineFilesV${engineFilesPkgJson.version.replace(/[\.-]/g, "_")}`;
	}
	return engineFilesVariable;
}

export function resolveEngineFilesPath(version: string): string {
	let engineFilesPath: string = "";
	if (version === "3" && process.env.ENGINE_FILES_V3_PATH) {
		engineFilesPath = path.resolve(process.cwd(), process.env.ENGINE_FILES_V3_PATH);
	} else {
		const engineFilesName = resolveEngineFilesVariable(version);
		const libName = `aev${version}`;
		engineFilesPath = path.join(path.dirname(require.resolve(libName)), `dist/raw/debug/full/${engineFilesName}.js`);
	}
	return engineFilesPath;
}
