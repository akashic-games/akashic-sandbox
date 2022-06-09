type EngineFilesVersion = "1" | "2" | "3";

export function resolveEngineFilesVariable(version: EngineFilesVersion): string {
	return `engineFilesV${version.replace(/[\.-]/g, "_")}`;
}
