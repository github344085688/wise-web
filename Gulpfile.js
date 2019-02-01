var config = require('./config'),
    gulp = require('gulp'),
    clean = require('gulp-clean'),
    jshint = require('gulp-jshint'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    useref = require('gulp-useref'),
    gulpIf = require('gulp-if'),
    cleanCss = require('gulp-clean-css'),
    strip = require('gulp-strip-comments'),
    webserver = require('gulp-webserver'),
    rev = require('gulp-rev'),
    revReplace = require("gulp-rev-replace"),
    revdel = require('gulp-rev-delete-original'),
    amdOptimize = require('amd-optimize'),
    ngAnnotate = require('gulp-ng-annotate'),
    argv = require('yargs').argv,
    env = argv.env,
    apiHost = config.api.host,
    outputFolder = config.build.dest || 'dest',
    concatService = require('./gulp-plugin/concat/concatPlugin'),
    appendFile = require('./gulp-plugin/append/appendPlugin');

gulp.task('clean', function() {
    return gulp.src(outputFolder).pipe(clean());
});

gulp.task('jshint', function() {
    return gulp.src(['src/**/*.js', '!src/vendor/*.js'])
        .pipe(jshint({
            'scripturl': false
        }))
        .pipe(jshint.reporter('default'));
});

gulp.task('buildJs', ['clean'], function() {
    return gulp.src(['src/**/*.js', 'node_modules/**/*.js'])
        .pipe(amdOptimize('bootstrap', {
            configFile: 'src/require-config.js'
        }))
        .pipe(appendFile(gulp.src(['src/gis/**/*.js', 'src/assets/js/*.js'])))
        .pipe(ngAnnotate())
        .pipe(concatService({fileNum:4}))
        .pipe(uglify({
            mangle: true
        }))
        .pipe(gulp.dest(outputFolder));
});

gulp.task('buildCssAndMinRequirejs', ['clean'], function(){
    return gulp.src('src/index.html')
        .pipe(useref())
        .pipe(gulpIf('*.css', cleanCss()))
        .pipe(gulpIf('*.js', uglify()))
        .pipe(gulp.dest(outputFolder));
});

gulp.task('copyImage', ['clean'], function(){
    return gulp.src(['src/**/assets/img/**','src/**/assets/svg/**', 'src/favicon.ico'])
        .pipe(gulp.dest(outputFolder));
});


gulp.task('copyStaticJs', ['clean'], function(){
    return gulp.src(['src/**/assets/js/**','src/firebase-messaging-sw.js'])
        .pipe(gulp.dest(outputFolder));
});

gulp.task('copyTemplate', ['clean'], function(){
    return gulp.src(['src/**/template/**/*.html','src/4*.html','src/5*.html'])
        .pipe(gulp.dest(outputFolder));
});

gulp.task('copyFont', ['clean'], function(){
    return gulp.src(['src/assets/fonts/**',
        'node_modules/bootstrap/dist/fonts/**'
    ])
        .pipe(gulp.dest(outputFolder + "/assets/fonts"));
});

gulp.task('copyData', ['clean'], function(){
    return gulp.src('data/**').pipe(gulp.dest(outputFolder + '/data'));
});

gulp.task('copyEnvConfigurationFile', ['clean'], function(){
    return gulp.src([
        "gulp/".concat(env? env : "development").concat("/*.js"),
    ])
        .pipe(gulp.dest(outputFolder));
});

gulp.task('copy', ['buildJs', 'buildCssAndMinRequirejs'], function() {
    gulp.src([
        "gulp/".concat(env? env : "development").concat("/*.js"),
        'src/**/assets/fonts/**',
        'src/**/assets/img/**',
        'src/**/assets/js/**',
        'src/**/template/**'
    ])
        .pipe(gulp.dest(outputFolder));


    gulp.src([
        'node_modules/bootstrap/dist/fonts/**'
    ])
        .pipe(gulp.dest('dest/assets/fonts'));

    gulp.src('data/**').pipe(gulp.dest(outputFolder + '/data'));
});

gulp.task('revJsAndCss', ['buildJs', 'copyStaticJs', 'copyEnvConfigurationFile', 'buildCssAndMinRequirejs', 'copyImage','copyTemplate','copyFont'], function() {
    return gulp.src([outputFolder + "/**/*.js",
        outputFolder + "/**/*.css",
        "!" + outputFolder　+ "/require-config.js",
        "!" + outputFolder　+ "/assets/js/rtspVideoBundle.js",
        "!" + outputFolder　+ "/firebase-messaging-sw.js"])
        .pipe(rev())
        .pipe(revdel())
        .pipe(gulp.dest(outputFolder))
        .pipe(rev.manifest("rev-manifest.json", {merge:true}))
        .pipe(gulp.dest(outputFolder))
});



gulp.task("revReplaceRequireJs", ["revJsAndCss"], function(){
    var manifest = gulp.src(outputFolder + '/rev-manifest.json');
    return gulp.src(outputFolder + "/require-config.js")
        .pipe(revReplace({manifest: manifest ,
            modifyReved: function(filename) {
                if (filename.indexOf('.js') > -1) {
                    return filename.replace('.js', '');
                }
                return filename;
            }
        }))
        .pipe(gulp.dest(outputFolder));
});

gulp.task("revReplaceFiles", ["revReplaceRequireJs"], function(){
    var manifest = gulp.src(outputFolder + '/rev-manifest.json');

    gulp.src(outputFolder + "/index.html")
        .pipe(revReplace({manifest: manifest}))
        .pipe(gulp.dest(outputFolder));
});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
gulp.task('start', function() {
    return gulp.src('.')
        .pipe(webserver({
            host: 'localhost',
            port: config.port,
            open: '/src',
            proxies: [ {
                source: '/inventory-app',
                target: apiHost + '/inventory-app'
            }, {
                source: '/fd-app',
                target: apiHost + '/fd-app'
            },  {
                source: '/file-app',
                target: apiHost + '/file-app'
            },{
                source: '/print-app',
                target: apiHost + '/print-app'
            }, {
                source: '/wh-print-app',
                target: apiHost + '/wh-print-app'
            }, {
                source: '/wms-app',
                target: apiHost + '/wms-app'
             },{
            //     source: '/walnut/bam',
            //     target: 'http://localhost:9000'
            // },
            //     {
                source: '/bam',
                target: apiHost + '/bam'
            }, {
                source: '/idm-app',
                target: apiHost + '/idm-app'
            }, {
                source: '/yms-app',
                target: apiHost + '/yms-app'
            }, {
                source: '/base-app',
                target: apiHost + '/base-app'
            },{
                source: '/shared',
                target: apiHost + '/shared'
            },{
                source: '/viabaron',
                target: apiHost + '/viabaron'
            },{
                source: '/turnbull',
                target: apiHost + '/turnbull'
            },{
                source: '/walnut',
                target: apiHost + '/walnut'
            }]
        }));
});

gulp.task('default', ['clean','buildJs', 'buildCssAndMinRequirejs', 'copyImage', 'copyStaticJs', 'copyTemplate','copyFont','copyData', 'copyEnvConfigurationFile'
    ,'revJsAndCss',  'revReplaceRequireJs', 'revReplaceFiles']);