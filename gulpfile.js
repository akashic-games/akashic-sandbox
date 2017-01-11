var gulp = require("gulp");
var del = require("del");
var fs = require("fs");
var path = require("path");
var tslint = require("gulp-tslint");
var expect = require("gulp-expect-file");
var browserify = require("browserify");
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");
var source = require('vinyl-source-stream');
var gutil = require('gulp-util');
var shell = require("gulp-shell");
var jasmine = require("gulp-jasmine");
var Reporter = require("jasmine-terminal-reporter");

gulp.task("clean", function (cb) {
	del(["lib"], cb);
});

gulp.task("browserify", function () {
	return browserify()
		.require("./node_modules/@akashic/akashic-engine/lib/main.node.js", {expose: "@akashic/akashic-engine"})
		.bundle()
		.pipe(source("akashic-engine.js"))
		.on("error", gutil.log)
		.pipe(gulp.dest("js"));
});

gulp.task("copy", function () {
	var files = [
		"node_modules/@akashic/game-driver/build/game-driver.js",
		"node_modules/@akashic/game-storage/build/game-storage.js",
		"node_modules/@akashic/pdi-browser/build/pdi-browser.js"
	];
	return gulp.src(files)
		.pipe(uglify({
			mangle: false,
			preserveComments: "license",
			output: {
				beautify: true
			}
		}))
		.pipe(rename({extname: ".strip.js"}))
		.pipe(gulp.dest("./js/"));
});

gulp.task("build", ["clean"], shell.task("npm run build", {cwd: __dirname}));
gulp.task("test", ["build"], function (cb) {
	gulp.src("./spec/**/*[sS]pec.js")
		.pipe(jasmine({
			reporter: [
				new Reporter({isVerbose: true, includeStackTrace: true})
			]
		}))
		.on("error", cb)
		.on("end", cb);
});

gulp.task("lint", function () {
	return gulp.src("src/**/*.ts")
		.pipe(tslint())
		.pipe(tslint.report());
});

gulp.task("default", ["browserify"]);
