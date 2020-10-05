const { src, dest, series, parallel } = require('gulp');
const gulpClean = require('gulp-clean');
const less = require('gulp-less');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const watch = require('gulp-watch');
const path = require('path');

function clean() {
    return src("dest/", {read: false}).pipe(gulpClean());
}

function buildHtml() {
    return src("src/*.html").pipe(dest("dest/"));
}

function buildJson() {
    return src("src/*.json").pipe(dest("dest/"));
}

function buildIcon() {
    return src("src/icons/*").pipe(dest("dest/icons/"));
}

function buildLocales() {
    return src("src/_locales/**/*").pipe(dest("dest/_locales/"));
}

function buildLess() {
    return src("src/less/*.less").pipe(less()).pipe(dest("dest/css"));
}

function buildLibJs() {
    return src("src/js/libs/*.js")
        .pipe(uglify())
        .pipe(rename({ extname: '.min.js' }))
        .pipe(dest("dest/js/libs/"));
}

function buildVendorJs() {
    return src(["node_modules/xterm/lib/*", "node_modules/xterm/css/xterm.css"])
        .pipe(dest("dest/vendor/xterm"));
}

function buildCmdJs() {
    return src(["src/js/cmds/commands/**/*.js", "src/js/cmds/config.js", "src/js/cmds/*.js"])
        .pipe(concat('cmd.js'))
        .pipe(dest("dest/js/"));
}

function buildBackgroundJs() {
    return src("src/js/background/*.js")
        .pipe(concat('background.js'))
        .pipe(dest("dest/js/"));
}

function buildCommonJs() {
    return src("src/js/*.js")
        .pipe(dest("dest/js/"));
}

function buildContentJs() {
    return src("src/js/content/*.js")
        .pipe(dest("dest/js/content/"));
}

function buildApiJs() {
    return src("src/js/api/*.js")
        .pipe(concat('browser_api.js'))
        .pipe(dest("dest/js/"));
}

function taskWatch() {
    watch('./src/**/*.html', buildHtml);
    watch('./src/*.json', buildJson);
    watch('./src/icons/*', buildIcon);
    watch('./src/_locales/**/*', buildLocales);
    watch('./src/less/*.less', buildLess);
    watch('./src/js/libs/*.js', buildLibJs);
    watch('./src/js/background/*.js', buildBackgroundJs);
    watch('./src/js/cmds/**/*.js', buildCmdJs);
    watch('./src/js/*.js', buildCommonJs);
    watch('./src/js/content/*.js', buildContentJs);
    watch('./src/js/api/*.js', buildApiJs);
}

// buildVendorJs
exports.default = series(clean, parallel(buildHtml, buildJson, buildIcon, buildLocales, buildLess, 
    buildBackgroundJs, buildLibJs, buildCmdJs, buildCommonJs, buildContentJs, buildApiJs), taskWatch)