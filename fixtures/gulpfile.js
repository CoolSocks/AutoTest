/**
 *  The purpose of this build is to download what is currently running on a cq instances (/content/fixtures) directory.
 *   Developer worklow --->
 *   1) Author content, components, etc, within /content/fixtures
 *   2) run 'npm install && gulp' (install dependencies, and run gulp build)
 *   [Script will download CQ package after building from CQ ]
 *   [Script will unpack the repo into fixtures--> directories]
 *   3) developer does a full maven build to ensure all tests pass
 *   4) developer writes new tests to match content from fixtures
 *   5) developer commits / pushes under ticket
 *
 **/
var gulp = require('gulp');

cfg = {
  cq: {
    baseURL: "http://admin:admin@localhost:4502"
  },
  fixtures: {
    packagePath: "/etc/packages/fixtures-1.0-SNAPSHOT.zip",
    coreResoucesPath: "../core/src/test/resources/fixtures/",
    targetFixturesPath: "src/main/content/"
  }
};

gulp.task("packagefixturestofs", function () {
  var request = require("request");
  var download = require("gulp-download");
  var unzip = require('gulp-unzip');
  var gulpIgnore = require('gulp-ignore');
  var _url = cfg.cq.baseURL + "/crx/packmgr/service/script.json" + cfg.fixtures.packagePath + "?cmd=build";
  return request.post({url: _url}, function (error, response, body) {
    console.log(body);
    if (!error) {
      download(cfg.cq.baseURL + cfg.fixtures.packagePath)
        .pipe(unzip())
        .pipe(gulpIgnore.exclude(['META-INF/**/*', 'META-INF/**/.*.*']))
        .pipe(gulp.dest(cfg.fixtures.targetFixturesPath));
    } else {
      console.log(error);
    }
  });
});


gulp.task("fixturestofs", function () {
  var download = require("gulp-download");
  download("http://admin:admin@localhost:4502/content/fixtures.infinity.json")
    .pipe(gulp.dest(cfg.fixtures.coreResoucesPath));
});
// Builds the package in CQ, and dumps the content into this repo
// Also dumps the corresponding JSON into the CORE/ fixtures json
gulp.task("default", ["packagefixturestofs", "fixturestofs"]);
