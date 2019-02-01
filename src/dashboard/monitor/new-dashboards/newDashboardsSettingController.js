'use strict';
define([
    'lodash',
    'angular'
], function (_, angular) {
    var newDashboardsSettingController = function ($scope, session, lincUtil, monitorService, $state) {

        $scope.tables = [{
                name: "Driver Waiting Pool",
                dbName: 'Driver Waiting Pool',
                active: false
            }, {
                name: "Dock Door Status",
                dbName: 'Dock Door Status',
                active: false
            }, {
                name: "Labor Assignment",
                dbName: 'Labor Assignment',
                active: false
            }, {
                name: "Equipment in Yard",
                dbName: 'Equipment in Yard',
                active: false
            },  {
                name: "Empty Container in Yard",
                dbName: 'Empty Container in Yard',
                active: false
            },{
                dbName: 'In Progress Loading',
                name: "In Progress: Loading",
                active: false
            }, {
                dbName: 'In Progress Offloading',
                name: "In Progress: Offloading",
                active: false
            },
            {
                dbName: 'Tasks In Progress',
                name: "Tasks In Progress",
                active: false
            },
            {
                dbName: 'Unassigned Tasks',
                name: "Unassigned Tasks",
                active: false
            }
        ];
        $scope.newDashboardsSetting = {};
        $scope.onRectangleSelectStatus = function (showtableCount) {
            $scope.newDashboardsSetting.showtableCount = showtableCount;
            $scope.newDashboardsSetting.detailInfo = null;
            $scope.newDashboardsSetting.tables = null;
            _.forEach($scope.tables, function (table) {
                table.active = false;
            });

        };

        $scope.onSelectOption = function (showtableCount, table, event) {
            event.stopPropagation();
            table.active = !table.active;
            var selectTable = _.filter($scope.tables, {
                active: true
            });
            if (selectTable.length > showtableCount) {
                table.active = false;
                return;
            };
            if (selectTable.length === 0) {
                $scope.newDashboardsSetting.detailInfo = null;

            } else {
                $scope.newDashboardsSetting.detailInfo = selectTable.length + " Selected";
                $scope.newDashboardsSetting.tables = _.map(selectTable, 'dbName');
            }

        };

        $scope.onClickSelect = function (event) {
            event.stopPropagation();
            var selectTable = _.filter($scope.tables, {
                active: true
            });
            if (selectTable && selectTable.length > 0) {

                $scope.newDashboardsSetting.detailInfo = selectTable.length + " Selected";
                $scope.newDashboardsSetting.tables = _.map(selectTable, 'dbName');
            }
            angular.element(event.target).parent().parent().parent().find('div.select-contain').css('display', 'none');
            angular.element(event.target).parent().parent().parent().find('img.shape-config').css('transform', 'rotate(0deg)');
        };

        $scope.onClickInput = function (event) {
            event.stopPropagation();
            if (angular.element(event.target).parent().find('div.select-contain').css('display') === "block") {
                angular.element(event.target).parent().find('div.select-contain').css('display', 'none');
                angular.element(event.target).parent().find('img.shape-config').css('transform', 'rotate(0deg)');
            } else {
                angular.element(event.target).parent().find('div.select-contain').css('display', 'block');
                angular.element(event.target).parent().find('img.shape-config').css('transform', 'rotate(180deg)');
            }
        };

        $scope.onMouseOverOnShape = function (event) {
            event.stopPropagation();
            angular.element(event.target).parent().find('div.select-contain').css('display', 'block');
            angular.element(event.target).parent().find('img.shape-config').css('transform', 'rotate(180deg)');
        };

        $scope.onMouseLeaveShape = function (event) {
            event.stopPropagation();
            angular.element(event.target).parent().parent().parent().find('div.select-contain').css('display', 'none');
            angular.element(event.target).parent().parent().parent().find('img.shape-config').css('transform', 'rotate(0deg)');
        };


        $scope.selectConfiguration = function () {
            var dashboardConfig = {};
            dashboardConfig.userId = userId;
            dashboardConfig.tableQty = $scope.newDashboardsSetting.showtableCount;
            dashboardConfig.reportNames = $scope.newDashboardsSetting.tables
            if (!templateId) {
                createNewDashboardTemplate(dashboardConfig)
            } else {
                updateNewDashboardTemplate(dashboardConfig);
            }
        };
        var userId, templateId;

        function createNewDashboardTemplate(dashboardConfig) {
            monitorService.createNewDashboardTemplate(dashboardConfig).then(function (res) {
                $state.go('dashboard.monitor.newDashboards');
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        function updateNewDashboardTemplate(dashboardConfig) {
            monitorService.updateNewDashboardTemplate(templateId, dashboardConfig).then(function (res) {

                $state.go('dashboard.monitor.newDashboards');

            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        function searchDashboardTemplate() {
            monitorService.searchDashboardTemplate({
                userIds: [userId]
            }).then(function (response) {
                if (response && response.length > 0) {
                    var res = response[0];
                    templateId = res.id;
                    $scope.newDashboardsSetting.showtableCount = res.tableQty;
                    $scope.newDashboardsSetting.detailInfo = res.reportNames.length + ' Selected';
                    _.forEach(res.reportNames, function (name) {
                        _.forEach($scope.tables, function (table) {
                            if (table.dbName === name) {
                                table.active = true;
                            }
                        })
                    })
                }

            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        document.onclick = function () {
            angular.element(document.querySelector('div.select-contain')).css('display', 'none');
            angular.element(document.querySelector('img.shape-config')).css('transform', 'rotate(0deg)');
        }


        function init() {
            userId = session.getUserId();
            searchDashboardTemplate();
        }
        init();
    };

    newDashboardsSettingController.$inject = ['$scope', 'session', 'lincUtil', 'monitorService', '$state'];
    return newDashboardsSettingController;

});