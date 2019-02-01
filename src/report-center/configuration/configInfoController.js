
'use strict';

define([
    'angular',
    'lodash'
], function(angular, _) {
    var controller = function($scope, $state, $stateParams, isAddAction, session, reportService, customerService, lincUtil) {
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
        $scope.scheduleTypes = [
            "Every 20 Minutes",
            "Every 30 Minutes",
            "Hourly Report",
            "Daily Report",
            "Weekly Report",
            "Monthly Report",
            "Bimonthly Report"
        ];
        $scope.weekDays = ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"];
        $scope.timeSpans = [
            "All",
            "Last Day",
            "Last Two Days",
            "Last Three Days",
            "Last Week",
            "Last Half Month",
            "Last Month",
            "Last Three Month",
            "Last Half Year",
            "Last Year"
        ];
        $scope.reportLevel = ["Customer Level", "Facility Level"];
        $scope.reportMedia = ["Email", "FTP"];
        $scope.configuration = {reportLevel: "Customer Level", reportMedia: "Email"};

        $scope.isShowSchedule = function(key) {
            if (key === "WeekDay") {
                return $scope.configuration.scheduleType === "Weekly Report";
            }
            if (key === "Day") {
                return $scope.configuration.scheduleType === "Monthly Report";
            }
            if (key === "Hour") {
                return !_.includes(["Every 20 Minutes","Every 30 Minutes","Hourly Report"], $scope.configuration.scheduleType)
            }
            if (key === "Minute") {
                return !_.includes(["Every 20 Minutes","Every 30 Minutes"], $scope.configuration.scheduleType)
            }
            if (key === "DailyReport") {
                return $scope.configuration.scheduleType === "Daily Report";
            }
            return false;
        };

        $scope.activatedFacilities = [];
        $scope.customerChange = function (org) {
            getCustomer(org.id);
        };

        $scope.mediaChange = function(media) {
            if (media === "FTP") {
                $scope.configuration.ftpPort = $scope.configuration.ftpPort || 21;
            }
        };

        $scope.levelChange = function (level) {
            $scope.activatedFacilities = [];
            $scope.configuration.customerId = null;
            $scope.configuration.facilityId = null;
            if (level === "Facility Level") {
                var facilities = session.getAssignedCompanyFacilities();
                _.forEach(facilities, function (facility) {
                    $scope.activatedFacilities.push({
                        id: facility.facilityId,
                        name: facility.facility.name
                    });
                })
            }
        };

        function getCustomer(orgId) {
            if (!orgId) return;
            $scope.activatedFacilities = [];
            customerService.getCustomerByOrgId(orgId).then(function (customer) {
                var facilities = session.getAssignedCompanyFacilities();
                _.forEach(customer.activatedFacilityIds, function (id) {
                    var facilityRes = _.find(facilities, function (facility) {
                        return facility.facilityId === id;
                    });
                    if (!facilityRes) return;
                    $scope.activatedFacilities.push({
                        id: facilityRes.facilityId,
                        name: facilityRes.facility.name
                    });
                })
                if ($scope.activatedFacilities.length === 1) {
                    $scope.configuration.facilityId = $scope.activatedFacilities[0].id;
                }
                if (isAddAction) {
                    if (!$scope.configuration.consigneeTo) {
                        $scope.configuration.consigneeTo = customer.customerEmails.join(",");
                    }
                }

            }, function(error) {
                $scope.loading = false;
                lincUtil.errorPopup(error);
            });
        }

        function validate() {
            if ($scope.configuration.reportLevel === "Customer Level" && !$scope.configuration.customerId) {
                lincUtil.errorPopup("Please select a customer!");
                throw new Error("Please select a customer!");
            }
            if (!$scope.configuration.facilityId) {
                lincUtil.errorPopup("Please select a facility!");
                throw new Error("Please select a facility!");
            }
            if (!$scope.configuration.reportType) {
                lincUtil.errorPopup("Please select a report type!");
                throw new Error("Please select a report type!");
            }
            if (!$scope.configuration.scheduleType) {
                lincUtil.errorPopup("Please select a schedule type!");
                throw new Error("Please select a schedule type!");
            }

            if ($scope.configuration.reportMedia === "Email") {
                if (!$scope.configuration.consigneeTo) {
                    lincUtil.errorPopup("EmailTo must not be empty!");
                    throw new Error("EmailTo must not be empty!");
                }
            } else if ($scope.configuration.reportMedia === "FTP") {
                if (!$scope.configuration.ftpHost) {
                    lincUtil.errorPopup("Please type ftpHost!");
                    throw new Error("FtpHost must not be empty!");
                }
                if (!$scope.configuration.ftpPort) {
                    lincUtil.errorPopup("FtpPort must not be empty!");
                    throw new Error("FtpPort must not be empty!");
                }
                if (!$scope.configuration.ftpUser) {
                    lincUtil.errorPopup("FtpUser must not be empty!");
                    throw new Error("FtpUser must not be empty!");
                }
                if (!$scope.configuration.ftpPassword) {
                    lincUtil.errorPopup("FtpPassword must not be empty!");
                    throw new Error("FtpPassword must not be empty!");
                }
                if (!$scope.configuration.ftpFilePath) {
                    lincUtil.errorPopup("FtpFilePath must not be empty!");
                    throw new Error("FtpFilePath must not be empty!");
                }
            }
        }

        $scope.save = function () {
            validate();
            $scope.loading = true;
            if (!$stateParams.id) {
                reportService.addReportConfiguration($scope.configuration).then(function () {
                    $state.go("rc.configuration.list");
                }, function(error) {
                    $scope.loading = false;
                    lincUtil.errorPopup(error);
                });
            } else {
                reportService.updateReportConfiguration($scope.configuration).then(function () {
                    $state.go("rc.configuration.list");
                }, function(error) {
                    $scope.loading = false;
                    lincUtil.errorPopup(error);
                });
            }
        };

        $scope.cancel = function () {
            $state.go("rc.configuration.list");
        };

        function init() {
            $scope.isAddAction = isAddAction;
            if(!isAddAction) {
                reportService.getReportConfigurationById($stateParams.id).then(function(response) {
                    $scope.levelChange(response.reportLevel);
                    $scope.configuration = response;
                    getCustomer(response.customerId);

                }, function(error) {
                    lincUtil.errorPopup(error);
                });

                $scope.submitLabel = "Update";
                $scope.title = "Update Report Configuration";
            } else {
                $scope.title = "Add Report Configuration";
                $scope.submitLabel = "Save";
                $scope.carrier = {};
            }
        }
        init();
    }

    controller.$inject = ['$scope', '$state', '$stateParams', 'isAddAction', 'session', 'reportService', 'customerService', 'lincUtil'];
    return controller;
});