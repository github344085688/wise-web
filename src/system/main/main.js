'use strict';
define([
    'src/system/userFeedbackController'
], function(userFeedbackCtrl) {
    angular.module('linc.system.main', [])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('system', {
                url: '/system',
                templateUrl: 'system/main/default-main.html',
            }).state('system.feedback', {
                url: '/feedback',
                templateUrl: 'system/template/userFeedback.html',
                controller: 'UserFeedbackCtrl'
            });
        }])
        .controller('UserFeedbackCtrl', userFeedbackCtrl)
});
