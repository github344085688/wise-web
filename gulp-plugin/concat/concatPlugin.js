'use strict';

var through = require('through2');
var path = require('path');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var File = gutil.File;
var Concat = require('concat-with-sourcemaps');
var _ = require('lodash');

// file can be a vinyl file object or a string
// when a string it will construct a new one
module.exports = function(opt) {
    // if (!file) {
    //     throw new PluginError('gulp-concat', 'Missing file option for gulp-concat');
    // }
    opt = opt || {};
    // to preserve existing |undefined| behaviour and to introduce |newLine: ""| for binaries
    if (typeof opt.newLine !== 'string') {
        opt.newLine = gutil.linefeed;
    }
    var isUsingSourceMaps = false;
    var latestFile;
    var latestMod;
    var files = [];
    var fileContentLength = 0;



    function bufferContents(file, enc, cb) {
        // ignore empty files
        if (file.isNull()) {
            cb();
            return;
        }
        // we don't do streams (yet)
        if (file.isStream()) {
            this.emit('error', new PluginError('gulp-concat',  'Streaming not supported'));
            cb();
            return;
        }
        // enable sourcemap support for concat
        // if a sourcemap initialized file comes in
        if (file.sourceMap && isUsingSourceMaps === false) {
            isUsingSourceMaps = true;
        }
        // set latest file if not already set,
        // or if the current file was modified more recently.
        if (!latestMod || file.stat && file.stat.mtime > latestMod) {
            latestFile = file;
            latestMod = file.stat && file.stat.mtime;
        }
        files.push(file);
        fileContentLength = fileContentLength + file.contents.length;
        cb();
    }

    function findTheMinFileSizeGroup(fileGroups){
        return _.minBy(fileGroups, function(files){
           return _.sumBy(files,function(file){ return file.contents.length});
        });
    }

    function endStream(cb) {
        if (!latestFile) {
            cb();
            return;
        }
        if(!opt.fileNum) {
            opt.fileNum = 1;
        }

        files = _.sortBy(files, function(file){
            return -1 * file.contents.length;
        });

        var fileGroups = [];
        for(var i=0; i<opt.fileNum; i++){
            fileGroups.push([]);
        }

        for(var i = 0; i < files.length; i++){
            findTheMinFileSizeGroup(fileGroups).push(files[i]);
        }

        for(var i = 0; i < fileGroups.length;i++){
            var concat = new Concat(isUsingSourceMaps, "index_" + i + ".js", opt.newLine);
            for(var j=  0;j < fileGroups[i].length; j++){
                var file = fileGroups[i][j];
                concat.add(file.relative, file.contents, file.sourceMap);
            }

            var joinedFile = latestFile.clone({contents: false});
            joinedFile.path = path.join(latestFile.base, "index_" + i + ".js");
            joinedFile.contents = concat.content;
            if (concat.sourceMapping) {
                joinedFile.sourceMap = JSON.parse(concat.sourceMap);
            }
            this.push(joinedFile);
        }
        cb();
    }
    return through.obj(bufferContents, endStream);
};