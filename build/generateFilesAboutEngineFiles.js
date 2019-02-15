var path = require("path");
var fs = require("fs");
var execSync = require("child_process").execSync;

console.log("start to generate files");
var v1PackageJson = require(path.join(__dirname, "..", "engine-src", "v1", "package.json"));
var v2PackageJson = require(path.join(__dirname, "..", "engine-src", "v2", "package.json"));
var v1Version = v1PackageJson["devDependencies"]["@akashic/engine-files"];
var v2Version = v2PackageJson["devDependencies"]["@akashic/engine-files"];
var v1VariableName = `engineFilesV${v1Version.replace(/\./g, "_")}`;
var v2VariableName = `engineFilesV${v2Version.replace(/\./g, "_")}`;

console.log("start to generate variableNames.json");
var variableNames = {
	v1: v1VariableName,
	v2: v2VariableName
};
fs.writeFileSync(path.join(__dirname, "..", "src", "server", "variableNames.json"), JSON.stringify(variableNames, null, 2));
console.log("end to generate variableNames.json");

var versions = {
	v1: v1Version,
	v2: v2Version
};
Object.keys(versions).forEach(function (version) {
	console.log(`start to download engineFiles (v${versions[version]})`);
	var result =
		execSync(`curl -X GET https://api.github.com/repos/akashic-games/engine-files/releases/tags/v${versions[version]}`).toString();
	var resultJson = JSON.parse(result);
	var outFilePath = path.join(__dirname, "..", "engine-src", version, "external", resultJson["assets"][0]["name"]);
	execSync(`curl -vL -H "Accept: application/octet-stream" ${resultJson["assets"][0]["url"]} -o "${outFilePath}"`);
	console.log(`end to download engineFiles (v${versions[version]})`);
});
console.log("end to generate files");
