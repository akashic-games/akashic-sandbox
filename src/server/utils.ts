export function resolveEngineFilesVariable(version: string): string {
	return `engineFilesV${version.replace(/[\.-]/g, "_")}`;
}
