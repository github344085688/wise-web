'use strict';

define(['angular', 'lodash'], function(angular, _) {
    var controller = function($scope, $mdDialog, files, $http, session, lincUtil) {
        _init();
        function _init() {
            $scope.files = files;
        }

        $scope.getDownload = function (fileId) {
            var url = '/file-app/file-attachment-download/'+fileId;
            $http({
                method: 'GET',
                url:url,
                responseType: 'arraybuffer',
                headers: {Authorization: session.getUserToken()}
            }).success(function (data, status, headers) {
                headers = headers();
                var filename = headers['content-disposition'].split(";")[1].split("=")[1];
                var contentType = headers['content-type'];
         
                var linkElement = document.createElement('a');
                try {
                    var blob = new Blob([data], { type: contentType });
                    var url = window.URL.createObjectURL(blob);
         
                    linkElement.setAttribute('href', url);
                    linkElement.setAttribute("download", filename);
         
                    var clickEvent = new MouseEvent("click", {
                        "view": window,
                        "bubbles": true,
                        "cancelable": false
                    });
                    linkElement.dispatchEvent(clickEvent);
                } catch (ex) {
                    lincUtil.errorPopup("Download attachment faild.");
                }
            }).error(function (data) {
                lincUtil.errorPopup("Download attachment faild.");
            });
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

    };
    controller.$inject = ['$scope', '$mdDialog', "files", "$http", "session", "lincUtil"];
    return controller;
});