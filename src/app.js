'use strict';

define([
    'lodash',
    'angular',
    'framework',
    'moment',
    'src/module-config',
    'angularCookies',
    'angularResource',
    'angularUIRouter',
    'angularMaterial',
    'angularValidation',
    'angularValidationRule',
    'angularMoment',
    'angularCalendar',
    'uiSelect',
    'ngTagsInput',
    'angularGrowl',
    'ngSortable',
    'dndLists',
    'uiBootstrap',
    'src/common/factory/loader',
    'src/common/provider/loader',
    'src/common/directive/loader',
    'src/login/login',
    'src/sso/sso',
    'src/home/home',
    'src/dashboard/main',
    'src/wms/main',
    'src/gis/main/main',
    'src/yms/main',
    'src/inventory/main',
    'src/admin/main',
    'src/user/main',
    'src/bi/main',
    'src/b2c/main',
    'src/foundation-data/main',
    'src/company-facility/main',
    'src/report-center/main',
    'src/print-pages/print',
    'src/common/upload/fileUpload',
    'src/system/main/main',
    'src/conveyor-line/main'
], function (_, angular, App, moment, moduleConfig) {

    return angular.module('linc', [
        'ngCookies',
        'ngResource',
        'ngMaterial',
        'ui.router',
        'validation',
        'validation.rule',
        'angularMoment',
        'ui.select',
        'ngTagsInput',
        'angular-growl',
        'as.sortable',
        'mwl.calendar',
        'dndLists',
        'ui.bootstrap',
        'linc.factories',
        'linc.providers',
        'linc.directives',
        'linc.login',
        'linc.sso',
        'linc.home',
        'linc.dashboard.main',
        'linc.rc.main',
        'linc.wms.main',
        'linc.gis.main',
        'linc.yms.main',
        'linc.inventory.main',
        'linc.admin.main',
        'linc.user.main',
        'linc.bi.main',
        'linc.b2c.main',
        'linc.fd.main',
        'linc.cf.main',
        'linc.print',
        'linc.fileUpload',
        'linc.system.main',
        'linc.cl.main'

    ]).
    config(['$stateProvider', '$urlRouterProvider', '$validationProvider', '$mdDateLocaleProvider', 'growlProvider', '$httpProvider', '$locationProvider',
            function ($stateProvider, $urlRouterProvider, $validationProvider, $mdDateLocaleProvider, growlProvider, $httpProvider, $locationProvider) {
                $urlRouterProvider.otherwise('/login');

                angular.forEach(moduleConfig, function (module) {
                    var stateConfig = {
                        url: '/' + (module.url ? module.url : module.name),
                        templateUrl: module.templateUrl ? module.templateUrl : 'common/template/default-main.html',
                    };

                    if (module.controller) {
                        stateConfig.controller = module.controller;
                    } else {
                        stateConfig.controller = 'DefaultMainPageController';
                        stateConfig.data = {
                            moduleName: module.name
                        };
                    }
                    $stateProvider.state(module.name, stateConfig);
                    setModuleNoPermissionsState(module);
                });

                function setModuleNoPermissionsState(module) {
                    var stateConfig1 = {
                        url: '/noPermission',
                        templateUrl: 'common/template/no-permission.html'
                    };
                    $stateProvider.state(module.name + ".noPermission", stateConfig1);
                }

                $validationProvider.setErrorHTML(function (msg) {
                    return "<label class=\"control-label has-error\">" + msg + "</label>";
                });

                $mdDateLocaleProvider.formatDate = function (date) {
                    return moment(date).format('L');
                };

                growlProvider.globalTimeToLive(5000);
                $httpProvider.interceptors.push('tokenInterceptor');


                $locationProvider.hashPrefix('');
            }
        ])
        .constant('apiHost', window.linc.config.api.host)
        .controller('DefaultMainPageController', ['$scope', '$state', 'session', function ($scope, $state, session) {
            $scope.moduleName = $state.current.data.moduleName;

            $scope.isShowMenu = function () {

                if ($scope.moduleName == "gis" || $state.current.name.indexOf("order.lineLaul") > -1) return false;
                if ($state.current.name.indexOf("transloadTask.transload") > -1 || $state.current.name.indexOf("transloadTask.shipping") > -1) return false;
                if ($state.current.name.indexOf("dashboard.monitor") > -1 && $state.current.name.indexOf("dashboard.monitor.newDashboardsSetting") === -1) return false;
                if ($state.current.name.indexOf("cl.packingStation") > -1 ||  $state.current.name.indexOf("cl.exceptionalHandling") > -1 || $state.current.name.indexOf("cl.conveyorDashboard") > -1 || $state.current.name.indexOf("cl.smallParcelStation") > -1) return false;
                var mark = session.getMenuMark();
                if (mark == "hide") return false;

                return true;
            };

            $scope.isShowHeader = function () {
                if ($state.current.name.indexOf("dashboard.monitor") > -1 && $state.current.name.indexOf("dashboard.monitor.newDashboardsSetting") === -1) return false;
                if ($state.current.name.indexOf("order.lineLaul") > -1) return false;
                if ($state.current.name.indexOf("cl.packingStation") > -1 ||  $state.current.name.indexOf("cl.exceptionalHandling") > -1 || $state.current.name.indexOf("cl.conveyorDashboard") > -1 || $state.current.name.indexOf("cl.smallParcelStation") > -1) return false;
                return true;
            };
            $scope.pageContainerStyle = {};
            if (!$scope.isShowHeader()) {
                $scope.pageContainerStyle = {
                    'margin-top': '0'
                };
            }
        }])
        .run(['$rootScope', '$state', '$stateParams', 'authFactory',
            'lincResourceFactory', 'session', 'permissionCheckService', '$transitions',
            function ($rootScope, $state, $stateParams, authFactory,
                lincResourceFactory, session, permissionCheckService, $transitions) {
                // permissionCheckService.generatePermissionsByStateName($state.get());
                $rootScope.$state = $state;
                $rootScope.$stateParams = $stateParams;

                $rootScope.$on('$viewContentLoaded', function () {
                    // initialize core components
                    App.initAjax();
                });


                function getTitleName(toState) {
                    if (!toState) {
                        return "Logistics-WISE V2.0";
                    }
                    var title = "";
                    var stateNameArr = toState.name.split(".");
                    var len = stateNameArr.length;
                    var titleName = _.upperFirst(stateNameArr[len - 2]);
                    if (toState.url.indexOf("/:") > -1) {
                        var arr = toState.url.split("/:");
                        var arr1 = arr[1].split("/");
                        if (arr1.length > 1) {
                            title = $stateParams[arr1[0]] + "-" + titleName;
                        } else {
                            title = $stateParams[arr[1]] + "-" + titleName;
                        }
                    } else if (stateNameArr[len - 1] == "list") {
                        title = titleName + " List";
                    } else if (toState.data && toState.data.title) {
                        title = toState.data.title;
                    } else {
                        title = "Logistics";
                    }
                    return title + "-WISE V2.0";
                }


                $transitions.onSuccess({}, function (trans) {
                    var toState = trans.to();
                    document.title = getTitleName(toState);
                });

                //WISE V2.0
                $transitions.onStart({}, function (trans) {
                    var toState = trans.to();
                    var $state = trans.router.stateService;
                    if (toState.name === 'login' || toState.name === 'sso' || toState.name === 'sso-landing') return;
                    if (!authFactory.isSignIn()) {
                        if (session.getSsoMark() == "sso") {
                            session.clean();
                            location.href = linc.config.ssoRedirectLink;
                            return;
                        }
                        $state.target('login');
                        return;
                    }
                    if (toState.name !== 'home') {
                        if (toState.data && !permissionCheckService.judgeIfHasPermission(toState.data.permissions,
                                session.getUserPermission())) {
                            var moduleName = toState.name.split('.')[0];
                            $state.go(moduleName + '.noPermission');
                        }
                    }
                });
            }
        ]);
});