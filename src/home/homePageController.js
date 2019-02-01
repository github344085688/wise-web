'use strict';

define([
    'jquery',
    'lodash',
    'src/module-config'
], function ($, _, moduleConfig) {
    var homePageController = function ($scope, $state, $interval, session, authFactory) {

        session.getUserInfo().then(function (userInfo) {
            $scope.user = userInfo;
            $scope.isDispatch = false;
            $scope.isInventoryCenter = false;

            var userRoles = _.map(userInfo.roles, 'name');
            $scope.modules = _.filter(moduleConfig, function (module) {
                return module.label && (!module.roles || _.difference(module.roles, userRoles).length < _.uniq(module.roles, userRoles).length);
            });
        });
        $scope.isReportAndLearningCenter = false;
        $scope.isAdditionalFunctions = false;

        $scope.signOut = function () {
            authFactory.signOut().then(function () {
                $state.go('login');
            });
        };

        $scope.onAdditional = function () {
            authFactory.signOut().then(function () {
                $state.go('login');
            });
        };
        $scope.onclickDispatch = function (isDispatch) {
            $scope.isDispatch = false;
            $scope.isInventoryCenter = false;
        };


        function init() {
            // $("#moreLinks01").click(function () {
            //     this.css({
            //         "bottom": "250px;"
            //     }).fadeIn()
            //     this.animate({left:'250px'});
            //     // $("#moreLinks01").animate({
            //     //     "margin-top": "-250px;"
            //     // }, 1000);
            // });
            // $("#androidMark").hover(function () {
            //     $("#androidMark").fadeOut();
            //     $("#androidLink").css({
            //         "margin-right": "-160px"
            //     }).fadeIn();
            //     $("#androidLink").animate({
            //         "margin-right": "0px"
            //     }, 1000);
            // });

            // $("#androidLink").mouseleave(function () {
            //     $("#androidLink").animate({
            //         "margin-right": "-160px"
            //     }, 1000, function () {
            //         $("#androidLink").hide();
            //         $("#androidMark").fadeIn();
            //     });
            // });
        }

        $scope.onAdditionaFunctions = function () {
            $scope.isAdditionalFunctions = !$scope.isAdditionalFunctions;
        };

        $scope.reportAndLearningCenter = function () {
            $scope.isReportAndLearningCenter = !$scope.isReportAndLearningCenter;
        };

        init();
    };

    homePageController.$inject = ['$scope', '$state', '$interval', 'session', 'authFactory'];

    return homePageController;
});