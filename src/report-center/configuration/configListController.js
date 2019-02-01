
'use strict';

define([
    'angular',
    'lodash'
], function(angular, _) {
    var controller = function($scope, $http, reportService, session, lincUtil) {
        $scope.reportStatus = ["ENABLE", "DISABLE", "PENDING"];
        $scope.reportSendStatus = ["Success", "Failed"];
        $scope.reportTypes = [
            "Inbound_schedule",
            "Inbound_finished",
            "Inbound_all",
            "Outbound_schedule",
            "Outbound_finished",
            "Outbound_all",
            "Inventory",
            "Inventory_balance",
            "Inventory_summary",
            "Other_report"
        ];
        $scope.reportTypeMap = {
            "Inbound_schedule":"INBOUND_SCHEDULE",
            "Inbound_finished":"INBOUND_FINISHED",
            "Inbound_all":"INBOUND_ALL",
            "Outbound_schedule":"OUTBOUND_SCHEDULE",
            "Outbound_finished":"OUTBOUND_FINISHED",
            "Outbound_all":"OUTBOUND_ALL",
            "Inventory":"INVENTORY",
            "Inventory_balance":"INVENTORY_BALANCE",
            "Inventory_summary":"INVENTORY_SUMMARY",
            "Other_report":"OTHER_REPORT"
        };
        $scope.scheduleTypes = [
            "Every 20 Minutes",
            "Every 30 Minutes",
            "Hourly Report",
            "Daily Report",
            "Weekly Report",
            "Monthly Report",
            "Bimonthly Report"
        ];
        $scope.reportLevel = ["Customer Level", "Facility Level"];
        $scope.reportMedia = ["Email", "FTP"];
        $scope.activatedFacilities = [];

        $scope.columns = [
            "Report Level",
            "Customer",
            "Facility",
            "Report Type",
            "Schedule Type",
            "Report Title",
            "Email To",
            "Send",
            "Status",
            "Created By",
            "Created When",
            "Last Execute Time"
        ];

        $scope.pageSize = 10;
        $scope.totalCount = 0;
        var configuration = [];
        $scope.searchConfigurations = function () {
            $scope.isLoading = true;
            $scope.totalCount = 0;
            reportService.searchReportConfiguration($scope.search).then(function (data) {
                $scope.isLoading = false;
                configuration = data;
                var facilities = session.getAssignedCompanyFacilities();
                _.forEach(configuration, function (conf) {
                    var facilityRes = _.find(facilities, function (facility) {
                        return facility.facilityId === conf.facilityId;
                    });
                    conf.facility = facilityRes ? facilityRes.facility.name : "";
                })
                $scope.loadContent(1);

            },function(error) {
                $scope.isLoading = false;
                lincUtil.errorPopup(error);
            });
        };
        $scope.searchConfigurations();

        $scope.keyUpSearch = function ($event) {
            if(!$event){
                return;
            }
            if ($event.keyCode === 13) {
                $scope.searchConfigurations();
            }
            $event.preventDefault();
        };

        $scope.loadContent = function (currentPage) {
            $scope.totalCount = configuration.length;
            $scope.configurationView = configuration.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > configuration.length ? configuration.length : currentPage * $scope.pageSize);
        };

        $scope.enable = function (id) {
            reportService.enableReportConfiguration(id).then(function () {
                _.forEach(configuration, function (conf) {
                    if (conf.id === id) {
                        conf.status = "ENABLE";
                    }
                })
                _.forEach($scope.configurationView, function (conf) {
                    if (conf.id === id) {
                        conf.status = "ENABLE";
                    }
                })
                apply();

            },function(error) {
                $scope.isLoading = false;
                lincUtil.errorPopup(error);
            });
        }

        $scope.disabled = function (id) {
            reportService.disabledReportConfiguration(id).then(function () {
                _.forEach(configuration, function (conf) {
                    if (conf.id === id) {
                        conf.status = "DISABLE";
                    }
                })
                _.forEach($scope.configurationView, function (conf) {
                    if (conf.id === id) {
                        conf.status = "DISABLE";
                    }
                })
                apply();

            },function(error) {
                $scope.isLoading = false;
                lincUtil.errorPopup(error);
            });
        }

        $scope.delete = function (id) {
            lincUtil.deleteConfirmPopup('Would you like to remove this configuration?', function() {
                reportService.deleteReportConfiguration(id).then(function () {
                    configuration = _.filter(configuration, function (conf) {
                        return conf.id !== id;
                    })
                    $scope.configurationView = _.filter($scope.configurationView, function (conf) {
                        return conf.id !== id;
                    })
                    apply();

                }, function (error) {
                    $scope.isLoading = false;
                    lincUtil.errorPopup(error);
                });
            });
        }

        $scope.reSendingList = [];
        $scope.reSending = function(conf) {
            return _.includes($scope.reSendingList, conf.id);
        }

        $scope.reSend = function (conf) {
            if ($scope.reSending(conf)) return;

            var facilities = session.getAssignedCompanyFacilities();
            var facilityRes = _.find(facilities, function (facility) {
                return facility.facilityId === conf.facilityId;
            });
            var facilityAccessUrl = facilityRes.facility.accessUrl;
            $scope.reSendingList.push(conf.id);
            reportService.reSendReport({
                confId: conf.id,
                customerId: conf.customerId,
                reportType: $scope.reportTypeMap[conf.reportType],
                facilityAccessUrl: facilityAccessUrl
            }).then(function () {
                _.remove($scope.reSendingList, function (sendId){
                    return sendId === conf.id;
                });
                lincUtil.messagePopup("Message", "Resend complete!");

            },function(error) {
                _.remove($scope.reSendingList, function (sendId){
                    return sendId === conf.id;
                });
                lincUtil.errorPopup(error);
            });
        };

        $scope.downloadingList = [];
        $scope.downloading = function(conf) {
            return _.includes($scope.downloadingList, conf.id);
        }

        $scope.download = function (conf) {
            if ($scope.downloading(conf)) return;

            var facilities = session.getAssignedCompanyFacilities();
            var facilityRes = _.find(facilities, function (facility) {
                return facility.facilityId === conf.facilityId;
            });
            var facilityAccessUrl = facilityRes.facility.accessUrl;

            var param = {
                confId: conf.id,
                customerId: conf.customerId,
                reportType: $scope.reportTypeMap[conf.reportType],
                facilityAccessUrl: facilityAccessUrl
            };

            $scope.downloadingList.push(conf.id);
            var fileName = conf.customerName + " " + conf.reportType + ".xlsx";
            if (!conf.customerId) {
                fileName = conf.facility + " " + conf.reportType + ".zip";
            }

            $http.post("/report-center/report/download", param, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                _.remove($scope.downloadingList, function (sendId){
                    return sendId === conf.id;
                });
                if (res.data.byteLength === 0) {
                    lincUtil.errorPopup("Export failed!");
                    return;
                }
                lincUtil.exportFile(res, fileName);

            }, function (error) {
                _.remove($scope.downloadingList, function (sendId){
                    return sendId === conf.id;
                });
                lincUtil.errorPopup(error);
            });
        };

        function apply() {
            if (!$scope.$$phase) {
                try {
                    $scope.$apply();
                } catch (e) { }
            }
        }

        function init() {
            var facilities = session.getAssignedCompanyFacilities();
            _.forEach(facilities, function (facility) {
                $scope.activatedFacilities.push({
                    id: facility.facilityId,
                    name: facility.facility.name
                });
            })
        }
        init();
    };

    controller.$inject = ['$scope', '$http', 'reportService', 'session', 'lincUtil'];
    return controller;
});