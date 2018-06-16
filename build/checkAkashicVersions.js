var path = require("path");
var fs = require("fs");
["v1", "v2"].forEach(function(version) {
	console.log(version + ": start to check akashic-library-version");
	var originalPackageJson = require(path.join(__dirname, "..", "engine-src", version, "package.json"));
	var versions = {};
	["dependencies", "devDependencies", "optionalDependencies"].forEach(function(item) {
		if (originalPackageJson[item] === undefined) {
			return;
		}
		for (var libName in originalPackageJson[item]) {
			versions[libName] = originalPackageJson[item][libName];
		}
	});
	var copiedVersionsJson = require(path.join(__dirname, "..", "engine-src", version, "external", "versions.json"));
	for (var libName in copiedVersionsJson) {
		if (copiedVersionsJson[libName] !== versions[libName]) {
			console.log(`Expected ${libName}@${versions[libName]} to be v${copiedVersionsJson[libName]}`);
			process.exit(1);
		} else {
			console.log(`OK: ${libName}@${versions[libName]}`);
		}
	}
	console.log(`${version}: end to check akashic-library-version`);
});
console.log("complete to check akashic-library-version");
