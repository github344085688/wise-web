/**
 * Created by Giroux on 2017/2/4.
 */

'use strict';
var through = require('through2');
var _ = require("lodash");
var mapStream = require('map-stream');

module.exports = function(opt) {
    opt = opt || {};

    function fileValidate(file, cb, list) {
        if (file.isNull()) {
            cb();
            return;
        }
        if (file.isStream()) {
            this.emit('error', new PluginError('gulp-append',  'Streaming not supported'));
            cb();
            return;
        }
        list.push(file);
        cb();
    }


    var resources = []
    opt.pipe(mapStream(function (file, cb) {
        fileValidate(file, cb, resources);
    }));


    var files = [];
    function bufferContents(file, enc, cb) {
        fileValidate(file, cb, files);
    }


    function fileFormat(file) {
        var fileName = file.history[0];

        fileName = fileName.replace(file.cwd, "");
        fileName = fileName.replace(/\\/g, "/");
        var len = fileName.indexOf(".js");
        fileName = "define('" + fileName.substring(1, len) + "',[";

        var content = file.contents.toString();
        var replaceStr = "define([";
        if (content.indexOf(replaceStr) >= 0) {
            content = content.replace(replaceStr, fileName);
        } else {
            content = "\r\n "+ fileName +"], function() {})," + content;
        }

        file.contents = new Buffer(content);
        return file;
    }

    function append(cb) {
        for (var i = 0; i < files.length; i++) {
            this.push(files[i]);
        }

        for (var i = 0; i < resources.length; i++) {
            if (_.find(files, function (file) {
                    return file.history[0] == resources[i].history[0];
                }) == null) {

                this.push(fileFormat(resources[i]));
            }
        }

        cb();
    }

    return through.obj(bufferContents, append);
};