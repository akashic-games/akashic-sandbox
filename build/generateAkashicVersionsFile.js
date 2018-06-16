var path = require("path");
var fs = require("fs");

if (process.argv.length < 3) {
	console.log("Please enter command as follows: node generateAkashicVersionsFile.js version");
	console.log("ex: node generateAkashicVersionsFile.js v2");
	throw new Error("invalid parameter");
}

// バージョン取得
var version = process.argv[2];
if (! /^v[12]$/.test(version)) {
	console.log("please specify version(v1 or v2)");
	throw new Error("invalid parameter");
}

console.log(`generate versions file about ${version}`);
console.log("get vesion of each akashic-library");
var originalPackageJson = require(path.join(__dirname, "..", "engine-src", version, "package.json"));
var libVersions = {};
["dependencies", "devDependencies", "optionalDependencies"].forEach(function(item) {
	if (originalPackageJson[item] === undefined) {
		return;
	}
	for (var libName in originalPackageJson[item]) {
		libVersions[libName] = originalPackageJson[item][libName];
	}
});
var akashicLibDir = path.resolve(__dirname + "/../engine-src/" + version + "/node_modules/@akashic");
var akashicLibs = ["akashic-engine", "game-driver", "game-storage", "pdi-browser"];
var versions = {};
akashicLibs.forEach(function(libName) {
	var packageJson = require(path.join(akashicLibDir, libName, "package.json"));
	var keyName = "@akashic/" + libName;
	if (libVersions[keyName] !== packageJson["version"]) {
		console.log(`Expected ${keyName}@${libVersions[keyName]} to be v${packageJson["version"]}`);
		throw new Error("current vesion is not expected");
	}
	versions[keyName] = packageJson["version"];
	console.log(`${keyName}:${packageJson["version"]}`);
});

fs.writeFileSync(path.join(__dirname, "..", "engine-src", version, "external", "versions.json"), JSON.stringify(versions));
console.log("saved vesion of each akashic-library");
