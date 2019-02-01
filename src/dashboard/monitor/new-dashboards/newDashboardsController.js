'use strict';
define([
    'lodash',
    'angular'
], function (_, angular) {
    var newDashboardsController = function ($scope, session, $interval, lincUtil, monitorService, $http, $state, taskService) {

        var initTables = [
        {
            name: "Driver Waiting Pool",
            active: false
        }, {
            name: "Dock Door Status",
            active: false
        }, {
            name: "Labor Assignment",
            active: false
        }, {
            name: "Equipment in Yard",
            active: false
        }, {
            name: "Empty Container in Yard",
            active: false
        },{
            name: "In Progress: Loading",
            active: false
        }, {
            name: "In Progress: Offloading",
            active: false
        }, {
            name: "Tasks In Progress",
            active: false
        }, {
            name: "Unassigned Tasks",
            active: false
        }];
        $scope.tablesOne = angular.copy(initTables);
        $scope.tablesTwo = angular.copy(initTables);
        $scope.tablesThree = angular.copy(initTables);
        $scope.tablesFour = angular.copy(initTables);
        $scope.newDashboardsLayouts = {
            tableOne: {
                'paging': {
                    limit: 8,
                    pageNo: 0,
                },
                isPause: false,
                serialNumber: 1
            },
            tableTwo: {
                'paging': {
                    limit: 8,
                    pageNo: 0,
                },
                isPause: false,
                serialNumber: 2
            },
            tableThree: {
                'paging': {
                    limit: 8,
                    pageNo: 0
                },
                isPause: false,
                serialNumber: 3
            },
            tableFour: {
                'paging': {
                    limit: 8,
                    pageNo: 0
                },
                isPause: false,
                serialNumber: 4
            },
        };
        var timeInterval;
        $scope.assignTaskId = '';
        $scope.assignment = {};
        $scope.showAssigntables = {
            tableOne:false,
            tableTwo:false,
            tableThree:false,
            tableFour:false
        };
        $scope.AssignLoading = false;
        function _init() {
            searchDashboardTemplate(function () {
                $scope.currentFacilityAndCompany = session.getCompanyFacility();
                getDateTime();
                _.forEach($scope.newDashboardsLayouts, function (layout, key) {
                    setDashboardPaging($scope.newDashboardsLayouts[key]);
                });
                excuteAllDashboardAfterTime();
                timeInterval = $interval(function () {
                    getDateTime();
                }, 1000);
            });

        }

        function excuteAllDashboardAfterTime() {
            tableOneIntervalStart();
            tableTwoIntervalStart();
            tableThreeIntervalStart();
            tableFourIntervalStart();
        }

        function tableOneIntervalStart() {
            $scope.newDashboardsLayouts['tableOne'].interval = $interval(function () {
                clearSelectedEquipment('tableOne');
                setDashboardPaging($scope.newDashboardsLayouts['tableOne']);
            }, 10000);
        }

        function tableTwoIntervalStart() {
            $scope.newDashboardsLayouts['tableTwo'].interval = $interval(function () {
                clearSelectedEquipment('tableTwo');
                setDashboardPaging($scope.newDashboardsLayouts['tableTwo']);
            }, 10000);

        }

        function tableThreeIntervalStart() {
            $scope.newDashboardsLayouts['tableThree'].interval = $interval(function () {
                clearSelectedEquipment('tableThree');
                setDashboardPaging($scope.newDashboardsLayouts['tableThree']);
            }, 10000);

        }

        function tableFourIntervalStart() {
            $scope.newDashboardsLayouts['tableFour'].interval = $interval(function () {
                clearSelectedEquipment('tableFour');
                setDashboardPaging($scope.newDashboardsLayouts['tableFour']);
            }, 10000);
        }

        function setDashboardPaging(newDashboardsLayout, callback) {

            if (newDashboardsLayout.paging.pageNo === newDashboardsLayout.paging.totalPage && newDashboardsLayout.paging.pageNo) {
                newDashboardsLayout.paging.pageNo = 1;
            } else {
                newDashboardsLayout.paging.pageNo += 1;
            }
            searchAccordingTableName(newDashboardsLayout, callback);
        }

        function searchAccordingTableName(newDashboardsLayout, callback) {
            switch (newDashboardsLayout.tableName) {
                case 'Driver Waiting Pool':
                    searchDriverWaitingPool(newDashboardsLayout, callback);
                    break;
                case 'Dock Door Status':
                    searchDockStatus(newDashboardsLayout, callback);
                    break;
                case 'Labor Assignment':
                    searchLaborAssignment(newDashboardsLayout, callback);
                    break;
                case 'Equipment in Yard':
                    searchEquipmentInYard(newDashboardsLayout, callback);
                    break;
                case 'Empty Container in Yard':
                    searchEmptyContainerInYard(newDashboardsLayout, callback);
                    break;
                case 'In Progress: Loading':
                    searchInProgressLoading(newDashboardsLayout, callback);
                    break;
                case 'In Progress: Offloading':
                    searchInProgressOffloading(newDashboardsLayout, callback);
                    break;
                case 'Tasks In Progress':
                    searchTaskInProgress(newDashboardsLayout, callback);
                    break;
                case 'Unassigned Tasks':
                    searchTaskUnassigned(newDashboardsLayout, callback);
                    break;
                default:
                    $interval.cancel(newDashboardsLayout.interval);
                    break;
            }
        }

        function getDateTime() {
            var currentDateandTime = lincUtil.getCurrentDateAndTime();
            $scope.currentTime = currentDateandTime.currentTime;
            $scope.currentHMS = currentDateandTime.currentHMS;
        }

        function searchInProgressLoading(dashBoardLayout, callback) {
            var params = {};
            params.paging = dashBoardLayout.paging;
            monitorService.searchInProgressLoading(params).then(function (res) {
                fillDashBoardLayoutFromResponse(dashBoardLayout, res, callback)
            }, function (err) {

            })
        }

        function searchDriverWaitingPool(dashBoardLayout, callback) {
            var params = {};
            params.paging = dashBoardLayout.paging;
            monitorService.searchDriverWaitingPool(params).then(function (res) {
                fillDashBoardLayoutFromResponse(dashBoardLayout, res, callback)
            }, function (err) {

            })
        }

        function searchDockStatus(dashBoardLayout, callback) {
            var params = {};
            params.paging = dashBoardLayout.paging;
            monitorService.searchDockStatus(params).then(function (res) {
                fillDashBoardLayoutFromResponse(dashBoardLayout, res, callback)
            }, function (err) {

            })
        }

        function searchLaborAssignment(dashBoardLayout, callback) {
            var params = {};
            params.paging = dashBoardLayout.paging;
            params.statuses = ['NEW', 'IN_PROGRESS', 'ON_HOLD', "EXCEPTION"];
            params.excludeTaskTypes = ['CONFIGURATION_CHANGE'];
            monitorService.searchLaborAssignment(params).then(function (res) {
                fillDashBoardLayoutFromResponse(dashBoardLayout, res, callback)
            }, function (err) {

            })
        }
        

        function searchEquipmentInYard(dashBoardLayout, callback) {
            var params = {};
            params.paging = dashBoardLayout.paging;
            monitorService.searchEquipmentInYard(params).then(function (res) {
                fillDashBoardLayoutFromResponse(dashBoardLayout, res, callback)
            }, function (err) {

            })
        }

        function searchEmptyContainerInYard(dashBoardLayout, callback) {
            var params = {};
            params.paging = dashBoardLayout.paging;
            monitorService.searchEmptyContainerInYard(params).then(function (res) {
                fillDashBoardLayoutFromResponse(dashBoardLayout, res, callback)
            }, function (err) {

            })
        }

        function searchTaskUnassigned(dashBoardLayout, callback) {
            var params = {};
            params.paging = dashBoardLayout.paging;
            params.statuses = ['NEW', 'IN_PROGRESS', 'EXCEPTION'];
            params.excludeTaskTypes = ['CONFIGURATION_CHANGE', 'QC'];
            monitorService.searchTaskUnassigned(params).then(function (res) {
                fillDashBoardLayoutFromResponse(dashBoardLayout, res, callback)

            }, function (err) {

            })
        }

        function searchTaskInProgress(dashBoardLayout, callback) {
            var params = {};
            params.paging = dashBoardLayout.paging;
            monitorService.searchTaskInProgress(params).then(function (res) {
                fillDashBoardLayoutFromResponse(dashBoardLayout, res, callback)

            }, function (err) {

            })
        }

        function searchInProgressOffloading(dashBoardLayout, callback) {
            var params = {};
            params.paging = dashBoardLayout.paging;
            var params = dashBoardLayout;
            monitorService.searchInProgressOffloading(params).then(function (res) {
                fillDashBoardLayoutFromResponse(dashBoardLayout, res, callback)
            }, function (err) {


            })
        }

        function fillDashBoardLayoutFromResponse(dashBoardLayout, res, callback) {
            dashBoardLayout.progressDatas = res.results;
            dashBoardLayout.paging.totalPage = res.paging.totalPage;
            if (res && res.results && res.paging.totalPage) {
                dashBoardLayout.paging.pageNoFromdb = res.paging.pageNo;
            } else {
                dashBoardLayout.paging.pageNoFromdb = 0;
            }
            if (callback) {
                callback();
            }
        }

        function startDashboardInterval(layoutName) {
            if (layoutName === 'tableOne') {
                tableOneIntervalStart();
            } else if (layoutName === 'tableTwo') {
                tableTwoIntervalStart();
            } else if (layoutName === 'tableThree') {
                tableThreeIntervalStart();
            } else if (layoutName === 'tableFour') {
                tableFourIntervalStart();
            }
        }

        $scope.pauseOrResumeDashboard = function (layoutName) {
            $scope.newDashboardsLayouts[layoutName].isPause = !$scope.newDashboardsLayouts[layoutName].isPause;
            if ($scope.newDashboardsLayouts[layoutName].isPause) {
                $interval.cancel($scope.newDashboardsLayouts[layoutName].interval);
            } else {
                setDashboardPaging($scope.newDashboardsLayouts[layoutName], function () {
                    startDashboardInterval(layoutName);
                });
            }
        };

        $scope.prePage = function (layoutName) {
            var dashBoardLayout = $scope.newDashboardsLayouts[layoutName];
            if (!dashBoardLayout.interval) return;
            dashBoardLayout.isPause = true;
            $interval.cancel(dashBoardLayout.interval);
            if (dashBoardLayout.paging.pageNo === 1) {
                dashBoardLayout.paging.pageNo = dashBoardLayout.paging.totalPage;
            } else {
                dashBoardLayout.paging.pageNo -= 1;
            }
            searchAccordingTableName(dashBoardLayout, function () {
                if (!dashBoardLayout.interval.$$intervalId) {
                    startDashboardInterval(layoutName);
                };

            });
        };

        $scope.nextPage = function (layoutName) {
            var dashBoardLayout = $scope.newDashboardsLayouts[layoutName];
            dashBoardLayout.isPause = true;
            if (!dashBoardLayout.interval) return;
            $interval.cancel(dashBoardLayout.interval);
            setDashboardPaging(dashBoardLayout, function () {
                if (!dashBoardLayout.interval.$$intervalId) {
                    startDashboardInterval(layoutName);
                };

            });
        };

        $scope.onSelectOption = function (layoutName, tables, table, event) {
            var dashBoardLayout = $scope.newDashboardsLayouts[layoutName];
            event.stopPropagation();
            if (table.active) return;
            dashBoardLayout.tableName = table.name;
            _.forEach(tables, function (table) {
                table.active = false;
            });
            table.active = !table.active;
            dashBoardLayout.isPause = false;
            initPaging(dashBoardLayout);
            $interval.cancel(dashBoardLayout.interval);
            setDashboardPaging(dashBoardLayout, function () {
                startDashboardInterval(layoutName);
            });

            if (table.active) {
                angular.element(document).find('div.select-contain').css('display', 'none');
                angular.element(document).find('img.shape').css('transform', 'rotate(0deg)');
            }

        };

        $scope.shortHeadOrLongHead = function (layoutName) {

            var dashBoardLayout = $scope.newDashboardsLayouts[layoutName];
            var head = [];
            if (!dashBoardLayout.progressDatas) return;
            if (layoutName === "tableOne" || layoutName === "tableTwo") {
                if ($scope.tableQty < 3) {
                    head = dashBoardLayout.progressDatas.head;
                } else {
                    head = dashBoardLayout.progressDatas.shortHead;
                }
            } else if (layoutName === "tableThree") {
                if ($scope.tableQty === 3) {
                    head = dashBoardLayout.progressDatas.head;
                } else if ($scope.tableQty > 3) {
                    head = dashBoardLayout.progressDatas.shortHead;
                }
            } else if (layoutName === "tableFour") {
                head = dashBoardLayout.progressDatas.shortHead;
            }
            return head;
        }

        $scope.onClickInput = function (event) {
            event.stopPropagation();
            if (angular.element(event.target).parent().find('div.select-contain').css('display') === "block") {
                angular.element(event.target).parent().find('div.select-contain').css('display', 'none');
                angular.element(event.target).parent().find('img.shape').css('transform', 'rotate(0deg)');
            } else {
                angular.element(event.target).parent().find('div.select-contain').css('display', 'block');
                angular.element(event.target).parent().find('img.shape').css('transform', 'rotate(180deg)');
            }
        };

        $scope.onMouseOverOnShape = function (event) {
            event.stopPropagation();
            angular.element(event.target).parent().find('div.select-contain').css('display', 'block');
            angular.element(event.target).parent().find('img.shape').css('transform', 'rotate(180deg)');
        };

        $scope.onMouseLeaveShape = function (event) {
            event.stopPropagation();
            angular.element(event.target).parent().parent().parent().find('div.select-contain').css('display', 'none');
            angular.element(event.target).parent().parent().parent().find('img.shape').css('transform', 'rotate(0deg)');
        };

        $scope.highColor = function (head, value) {
            if (head === 'Priority' && value === 'HIGH') {
                return true;
            }
            if (head === 'Order Type' && value != 'DS') {
                return true;
            }
            if (head === 'Load Status' && value === 'Waiting') {
                return true;
            }
            if (head === 'Time Left') {
                if (value.indexOf('hr') < 0) {
                    var minNum = Number(value.replace('min', ''));
                    if (minNum <= 30) {
                        return true;
                    }

                }
            }
            return false;
        };

        $scope.bgImgColor = function (progress) {

            var rot = Math.ceil(Number(progress.replace('%', '')) * 3.6);
            var color = "#15223d";
            if (rot > 180) {
                color = '#f5a623';
            }

            return "linear-gradient(to right, transparent 50%, " + color + " 0)";
        };


        $scope.rotate = function (progress) {
            var rot = Math.floor(Number(progress.replace('%', '')) * 3.6);
            if (rot > 180) {
                rot = (rot - 180) + 'deg';
            } else {
                rot += 'deg'
            }

            return "rotate(" + rot + ")";
        };

        $scope.formatSeconds = function (value) {
            return lincUtil.formatTimestampDuration(value);
        };

        document.onclick = function () {
            angular.element(document).find('div.select-contain').css('display', 'none');
            angular.element(document).find('img.shape').css('transform', 'rotate(0deg)');
        };

        var selectEquipments = [];
        $scope.isChecked = function (equipment) {
            var isChecked = false;
            _.forEach(selectEquipments, function (item) {
                if (item['Entry ID'] === equipment['Entry ID'] && item['Equipment Type'] === equipment['Equipment Type'] &&item['Equipment#'] === equipment['Equipment#'] ) {
                    isChecked = true;
                    return;
                }
            });
            return isChecked;

        };

        $scope.checkEquipment = function ($event, equipment) {
            $event.stopPropagation();
            if ($scope.isChecked(equipment)) {
                _.remove(selectEquipments, function (item) {
                    return (item['Entry ID'] === equipment['Entry ID'] && item['Equipment Type'] === equipment['Equipment Type'] &&item['Equipment#'] === equipment['Equipment#']);
                });
            } else {
                selectEquipments.push(equipment);
            }
        };
        
        $scope.toggleAll = function ($event,equipments) {
            if (!equipments) return;
            $event.stopPropagation();
            if ($scope.selectAllIsChecked(equipments)) {
                selectEquipments = [];
            } else {
                selectEquipments = angular.copy(equipments);
            }

        };

        $scope.selectAllIsChecked = function (equipments) {
            if (!equipments) return;
            if (!selectEquipments || selectEquipments.length == 0) return false;
            if (selectEquipments.length === equipments.length) {
                return true;
            } else {
                return false;
            }
        };

        $scope.batchCheckout = function(layoutName,loadingName){
            if(selectEquipments.length === 0){
                lincUtil.messagePopup('Please select at least one!');
                return;
            }
            $scope[loadingName] = true;
            var params =[];
            _.forEach(selectEquipments,function(equipment){
                params.push({equipmentNo: equipment['Equipment#'],type: equipment['Equipment Type']});
            });
            $scope.newDashboardsLayouts[layoutName].isPause = true;
            startOrStopIntervalBaseOnIsPause(layoutName);
            monitorService.batchCheckoutEquipmentInYard(params).then(function(){
                $scope[loadingName] = false;
                selectEquipments = [];
                lincUtil.messagePopup("Message",'Batch Checkout Success!',function(){
                    $scope.newDashboardsLayouts[layoutName].isPause = false;
                    startOrStopIntervalBaseOnIsPause(layoutName);
                });
                
            },function(error){
                lincUtil.processErrorResponse(error);  
                $scope[loadingName] = false;
                $scope.newDashboardsLayouts[layoutName].isPause = false;
                startOrStopIntervalBaseOnIsPause(layoutName);
            });
        }

        function clearSelectedEquipment(tableName){
            if($scope.newDashboardsLayouts[tableName].tableName === 'Equipment in Yard'){
                selectEquipments = [];
            }
        }


        $scope.exportTableOne = function (tableName) {
            $scope.isTableOneLoading = true;
            var url = getDownLoadUrl(tableName);;
            exportExcel(url, tableName, 'isTableOneLoading');
        };

        $scope.exportTableTwo = function (tableName) {
            $scope.isTableTwoLoading = true;
            var url = getDownLoadUrl(tableName);;
            exportExcel(url, tableName, 'isTableTwoLoading');
        };

        $scope.exportTableThree = function (tableName) {
            $scope.isTableThreeLoading = true;
            var url = getDownLoadUrl(tableName);;
            exportExcel(url, tableName, 'isTableThreeLoading');
        };

        $scope.exportTableFour = function (tableName) {
            $scope.isTableFourLoading = true;
            var url = getDownLoadUrl(tableName);;
            exportExcel(url, tableName, 'isTableFourLoading');
        };

        $scope.popupAssignDialog= function (taskId,layoutName) {
            $scope.assignTaskId=taskId;
            $scope.newDashboardsLayouts[layoutName].isPause = true;
            $scope.showAssigntables[layoutName]=true;
            startOrStopIntervalBaseOnIsPause(layoutName);
        };

       $scope.assigningTask = function (layoutName) {
           $scope.AssignLoading=true;
           if(! $scope.assignment.assigneeUserId){
               lincUtil.messagePopup('No Assignee User !');
               $scope.AssignLoading=false;
               return;
           }
           taskService.assignTask( $scope.assignTaskId, $scope.assignment).then(function (res) {
               $scope.AssignLoading=false;
               $scope.showAssigntables[layoutName]=false;
               $scope.newDashboardsLayouts[layoutName].isPause = false;
               $scope.assignTaskId = '';
               $scope.assignment.assigneeUserId=null;
               startOrStopIntervalBaseOnIsPause(layoutName);

           }, function (error) {
               $scope.showAssigntables[layoutName]=false;
               $scope.AssignLoading=false;
               $scope.newDashboardsLayouts[layoutName].isPause = false;
               $scope.assignment.assigneeUserId=null;
               startOrStopIntervalBaseOnIsPause(layoutName);
               lincUtil.processErrorResponse(error);
           });
        };

       function startOrStopIntervalBaseOnIsPause(layoutName) {
           if ($scope.newDashboardsLayouts[layoutName].isPause) {
               $interval.cancel($scope.newDashboardsLayouts[layoutName].interval);
           } else {
               setDashboardPaging($scope.newDashboardsLayouts[layoutName], function () {
                   startDashboardInterval(layoutName);
               });
           }
       }

        $scope.cancel= function (layoutName) {
            $scope.showAssigntables[layoutName]=false;
            $scope.newDashboardsLayouts[layoutName].isPause = false;
            if ($scope.newDashboardsLayouts[layoutName].isPause) {
                $interval.cancel($scope.newDashboardsLayouts[layoutName].interval);
            } else {
                setDashboardPaging($scope.newDashboardsLayouts[layoutName], function () {
                    startDashboardInterval(layoutName);
                });
            }
        }

        function getDownLoadUrl(tableName) {
            var url;
            switch (tableName) {
                case 'Driver Waiting Pool':
                    url = "/report-center/dashboard/driver-waiting-pool/download";
                    break;
                case 'Dock Door Status':
                    url = "/report-center/dashboard/dock-door-status/download";
                    break;
                case 'Labor Assignment':
                    url = "/report-center/dashboard/labor-assignment/download";
                    break;
                case 'Equipment in Yard':
                    url = "/report-center/dashboard/equipment-in-yard/download";
                    break;
                case 'Empty Container in Yard':
                    url = "/report-center/dashboard/empty-container-in-yard/download";
                    break;
                case 'In Progress: Loading':
                    url = "/report-center/dashboard/in-progress-loading/download";
                    break;
                case 'In Progress: Offloading':
                    url = "/report-center/dashboard/in-progress-offloading/download";
                    break;
                case 'Tasks In Progress':
                    url = "/report-center/dashboard/task/in-progress/download";
                    break;
                case 'Unassigned Tasks':
                    url = "/report-center/dashboard/task/unassigned/download";
                    break;
            }
            return url;
        }

        function exportExcel(url, tableName, loading) {
            var fileRename = tableName + ".xlsx";
            var param = null;
            if (tableName === 'Unassigned Tasks') {
                param = {
                    statuses: ["NEW", "IN_PROGRESS", "EXCEPTION"],
                    excludeTaskTypes: ['CONFIGURATION_CHANGE', 'QC']
                }
            }
            if (tableName === 'Labor Assignment') {
                param = {
                    statuses: ["NEW", "IN_PROGRESS", "ON_HOLD", "EXCEPTION"],
                    excludeTaskTypes: ['CONFIGURATION_CHANGE']
                }
            }
     
            $http.post(url, param, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                $scope[loading] = false;
                $scope.exporting = false;
                if (res.data.byteLength == 0) {
                    lincUtil.errorPopup("Export failed!");
                    return;
                }
                lincUtil.exportFile(res, fileRename);

            }, function (error) {
                lincUtil.errorPopup("No data!");
                $scope[loading] = false;
            });
        }

        function initPaging(dashboardsLayout) {
            dashboardsLayout.paging.pageNo = 0;
            dashboardsLayout.paging.totalPage = 0;
        }

        function searchDashboardTemplate(callback) {
            var userId = session.getUserId();
            monitorService.searchDashboardTemplate({
                userIds: [userId]
            }).then(function (response) {
                if (response && response.length > 0) {
                    var res = response[0];
                    if (!res.reportNames || res.reportNames.length === 0) {
                        $state.go('dashboard.monitor.newDashboardsSetting');
                    } else {
                        _.forEach(res.reportNames, function (name, index) {
                            _.forEach($scope.newDashboardsLayouts, function (layout, key) {
                                if ($scope.newDashboardsLayouts[key].serialNumber === index + 1) {
                                    if (res.tableQty === 1) {
                                        $scope.newDashboardsLayouts[key].paging.limit = 19;
                                    }
                                    if (name === 'In Progress Loading') {
                                        $scope.newDashboardsLayouts[key].tableName = 'In Progress: Loading';
                                    } else if (name === 'In Progress Offloading') {
                                        $scope.newDashboardsLayouts[key].tableName = 'In Progress: Offloading';
                                    } else {
                                        $scope.newDashboardsLayouts[key].tableName = name;
                                    }

                                }
                            });
                        });
                        $scope.tableQty = res.tableQty;
                        callback();
                    }

                } else {
                    $state.go('dashboard.monitor.newDashboardsSetting');
                }

            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        $scope.changeToCofig = function () {
            $state.go('dashboard.monitor.newDashboardsSetting');
        };

        $scope.setMargin =function(tableQty,layout){
            var tableName = $scope.newDashboardsLayouts[layout].tableName;
            if( tableQty>2 && tableName === 'Equipment in Yard'){
                if( tableQty<4 && layout==='tableThree'){
                    return '40px';
                }
                return '0px';
            }else{
                return '40px';
            }
        }

        _init();

        $scope.$on(
            "$destroy",
            function (event) {
                _.forEach($scope.newDashboardsLayouts, function (layout, key) {
                    $interval.cancel(layout.interval);
                });
                $interval.cancel(timeInterval);
            }
        );

    }

    newDashboardsController.$inject = ['$scope', 'session', '$interval', 'lincUtil', 'monitorService', '$http', '$state','taskService'];
    return newDashboardsController;

});