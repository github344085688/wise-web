
'use strict';

define([
    'angular', 
    'lodash', 
    'angularFileUpload',
    'src/common/upload/uploadController'
], function (angular, _, AngularFileUpload, uploadController) {

    angular.module('linc.fileUpload', ['angularFileUpload'])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('itemPicture', {
                url: '/item/:formTitle',
                templateUrl: 'common/upload/template/upload.html',
                controller: 'UploadController'
            });
        }])
        .controller('UploadController', uploadController);        
           
});       