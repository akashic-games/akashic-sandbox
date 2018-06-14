var path = require("path");
var fs = require("fs");

if (process.argv.length < 4) {
	console.log("Please enter command as follows: node copyfiles.js version outputPath");
	console.log("ex: node copyfiles.js v2 engine-src/v2/");
	throw new Error("invalid parameter");
}

// バージョン取得
var version;
switch (process.argv[2]) {
	case "v1":
	case "v2":
		version = process.argv[2];
		break;
	default:
		console.log("please designate version(v1 or v2)");
		throw new Error("invalid parameter");
}
// 出力ファイルパス取得
var outputPath = path.join(__dirname, "..", process.argv[3]);
// ベースとするバージョン情報の取得
var versions = {};
if (typeof process.argv[4] !== "undefined") {
	var baseFilePath = path.join(__dirname, "..", process.argv[4]);
	fs.statSync(baseFilePath);
	if (path.extname(baseFilePath) !== ".json") {
		console.log("please specify json-file");
		throw new Error("invalid parameter");
	}
	versions = JSON.parse(fs.readFileSync(path.join(__dirname, "..", process.argv[4]), "utf8"));
}

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

fs.writeFileSync(path.join(outputPath, "versions.json"), JSON.stringify(versions));
console.log("saved vesion of each akashic-library");
