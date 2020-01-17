var version = "v2";
if (typeof process.argv[2] !== "undefined") {
	switch (process.argv[2]) {
		case "v1":
		case "v2":
		case "v3":
			version = process.argv[2];
			break;
		default:
			console.log("please designate version(v1, v2, or v3)");
			console.log("ex: node copyfiles.js v2");
			return;
	}
}

var saveLicense = require('uglify-save-license');
var UglifyJS = require('uglify-js');
var path = require("path");
var fs = require("fs");

function minify(filepath) {
	return UglifyJS.minify(filepath, {
		mangle: false,
		output: {
			beautify: true,
			comments: saveLicense
		},
		compress: {
			sequences: false
		}
	});
}

var files_common = [
	"node_modules/@akashic/game-storage/build/game-storage.js"
];

files_common.forEach(filepath => {
	const inputPath = path.resolve(__dirname + "/../engine-src/" + version, filepath);
	const outputPath = path.resolve(__dirname + "/../engine-src/common/external/", path.basename(filepath, ".js") + ".strip.js");
	fs.writeFileSync(outputPath, minify(inputPath).code);
});
