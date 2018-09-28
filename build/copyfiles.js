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
};

var files = [
	"node_modules/@akashic/game-driver/build/game-driver.js",
	"node_modules/@akashic/pdi-browser/build/pdi-browser.js"
];

files.forEach(filepath => {
	const inputPath = path.resolve(__dirname + "/../engine-src/" + version, filepath);
	const outputPath = path.resolve(__dirname + "/../engine-src/" + version + "/external/", path.basename(filepath, ".js") + ".strip.js");
	fs.writeFileSync(outputPath, minify(inputPath).code);
});

var files_common = [
	"node_modules/@akashic/game-storage/build/game-storage.js"
];

files_common.forEach(filepath => {
	const inputPath = path.resolve(__dirname + "/../engine-src/" + version, filepath);
	const outputPath = path.resolve(__dirname + "/../engine-src/common/external/", path.basename(filepath, ".js") + ".strip.js");
	fs.writeFileSync(outputPath, minify(inputPath).code);
});
