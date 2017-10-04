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
		}
	});
};

var files = [
	"node_modules/@akashic/game-driver/build/game-driver.js",
	"node_modules/@akashic/pdi-browser/build/pdi-browser.js"
];

files.forEach(filepath => {
	const outputPath = path.resolve("./js/v2", path.basename(filepath, ".js") + ".strip.js");
	fs.writeFileSync(outputPath, minify(filepath).code);
});

var files_common = [
	"node_modules/@akashic/game-storage/build/game-storage.js",
];

files_common.forEach(filepath => {
	const outputPath = path.resolve("./js", path.basename(filepath, ".js") + ".strip.js");
	fs.writeFileSync(outputPath, minify(filepath).code);
});
