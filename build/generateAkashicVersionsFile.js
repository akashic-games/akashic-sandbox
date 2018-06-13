var version = "v2";
if (typeof process.argv[2] !== "undefined") {
	switch (process.argv[2]) {
		case "v1":
		case "v2":
			version = process.argv[2];
			break;
		default:
			console.log("please designate version(v1 or v2)");
			console.log("ex: node copyfiles.js v2");
			throw new Error("invalid parameter");
	}
}
var path = require("path");
var fs = require("fs");

var versions = {};
var akashicLibDir = path.resolve(__dirname + "/../engine-src/" + version + "/node_modules/@akashic");
var akashicLibs = fs.readdirSync(akashicLibDir);
console.log("generate versions file about " + version);
console.log("get vesion of each akashic-library");
akashicLibs.forEach(function(libName) {
	var packageJson = JSON.parse(fs.readFileSync(path.join(akashicLibDir, libName, "package.json"), "utf8"));
	var keyName = "@akashic/" + libName;
	versions[keyName] = packageJson["version"];
	console.log(keyName + ":" + packageJson["version"]);
});

fs.writeFileSync(path.resolve(__dirname + "/../js/" + version + "/versions.json"), JSON.stringify(versions));
console.log("saved vesion of each akashic-library");
