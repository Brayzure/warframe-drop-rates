const gulp = require('gulp');
const babel = require('gulp-babel');
const minify = require('gulp-uglify');
const sass = require('gulp-sass');
const htmlmin = require('gulp-htmlmin');
const del = require('del');
const pump = require('pump');

gulp.task("clean", () => {
    return del(["public"]);
});

gulp.task("scripts", ["clean"], (cb) => {
    pump([
        gulp.src("lib/**/*.js"),
        babel({ presets: ["env"] }),
        minify(),
        gulp.dest("public")
    ], cb);
});

gulp.task("html", ["clean"], (cb) => {
    pump([
        gulp.src("lib/**/*.html"),
        htmlmin(),
        gulp.dest("public")
    ], cb);
});

gulp.task("css", ["clean"], (cb) => {
    pump([
        gulp.src("lib/**/*.scss"),
        sass(),
        gulp.dest("public")
    ], cb);
});

gulp.task("scripts-dev", ["clean"], (cb) => {
    pump([
        gulp.src("lib/**/*.js"),
        babel({ presets: ["env"] }),
        gulp.dest("public")
    ], cb);
});

gulp.task("html-dev", ["clean"], (cb) => {
    pump([
        gulp.src("lib/**/*.html"),
        gulp.dest("public")
    ], cb);
});

gulp.task("dev", ["scripts-dev", "html-dev", "css"])

gulp.task("default", ["scripts", "html", "css"]);