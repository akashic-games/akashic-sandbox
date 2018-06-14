var path = require("path");
var fs = require("fs");
var targetVersions = ["v1", "v2"];
var engineSrcDirPath = path.resolve(__dirname + "/../engine-src");
var jsDirPath = path.resolve(__dirname + "/../js");
targetVersions.forEach(function(version) {
	console.log(version + ": start to check akashic-library-version");
	var inputPackageJson = JSON.parse(fs.readFileSync(path.join(engineSrcDirPath, version, "package.json"), "utf8"));
	var outputVersionsJson = JSON.parse(fs.readFileSync(path.join(jsDirPath, version, "versions.json"), "utf8"));
	["dependencies", "devDependencies", "optionalDependencies"].forEach(function(item) {
		if (inputPackageJson[item] === undefined) {
			return;
		}
		for (var libName in inputPackageJson[item]) {
			if (libName.match(/^@akashic/) === null) {
				continue;
			}
			if (inputPackageJson[item][libName] !== outputVersionsJson[libName]) {
				console.log(
					"version of "
					+ libName
					+ " expect "
					+ inputPackageJson[item][libName]
					+ ", but current version is "
					+ outputVersionsJson[libName]
				);
				throw new Error("current version is not expected");
			} else {
				console.log("OK: " + libName + "@" + inputPackageJson[item][libName]);
			}
		}
	});
	console.log(version + ": end to check akashic-library-version");
});
console.log("complete to check akashic-library-version");
