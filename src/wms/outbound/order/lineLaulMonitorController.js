'use strict';

define(['angular', 'jquery', 'lodash', 'moment'], function (angular, $, _, moment) {
    var documentOverviewController = function ($scope, $resource, $interval, $stateParams, longHaulService, lincUtil) {

        $scope.lineHaulWeekDays = ["MondayAM", "MondayPM", "TuesdayAM", "TuesdayPM", "WednesdayAM", "WednesdayPM", "ThursdayAM", "ThursdayPM", "FridayAM", "SundayPM"];
        $scope.weekDayLineHauls = [];
        $scope.selectedWeekDay;
        $scope.isShowLineHaulContent = false;
        $scope.isShowWeekDayContent = false;

        $(document).on('click', function (event) {
            var weekDayBar = $(".week-day-content")[0];
            var lineHaulBar = $(".line-haul-content")[0];
            if (!weekDayBar || !lineHaulBar) return;

            var contains = $.contains(weekDayBar, event.target) || $.contains(lineHaulBar, event.target);
            if (!contains) {
                $scope.isShowLineHaulContent = false;
                $scope.isShowWeekDayContent = false;
                try {
                    $scope.$applyAsync();
                } catch (e) { }
            }
        });

        function getWeekDay() {
            var weekDay = moment().format("dddd");
            var hour = moment().format("H");
            var tomorow = moment().add(1, 'days').format("dddd");
            if (weekDay === "Friday" || weekDay === "Saturday" || (weekDay === "Sunday" && hour < 12)) {
                return "SundayPM";
            }
            if (hour >= 12) {
                return tomorow + "AM";
            } else {
                return weekDay + "PM";
            }
        }

        var lineHauls;
        $scope.lineHaulMap = {};
        function searchMilkRun(param) {
            longHaulService.LongHaulSearch(param).then(function(data) {
                lineHauls = data.milkRuns;

                _.forEach(lineHauls, function (lineHaul) {
                    _.forEach(lineHaul.longHaulShipDay, function (day) {
                        if (!lineHaul.description) return;
                        var apm = lineHaul.description.indexOf("AM") > 0 ? "AM" : "PM";
                        var weekDay = day + apm;
                        if (!$scope.lineHaulMap[weekDay]) $scope.lineHaulMap[weekDay] = [];
                        $scope.lineHaulMap[weekDay].push(lineHaul);
                    });
                })
            });
        }

        function getWeekDayLineHauls() {
            if (!lineHauls) {
                setTimeout(getWeekDayLineHauls, 100);
                return;
            }
            _.forEach(lineHauls, function (lineHaul) {
                if ($scope.longHaulNo !== lineHaul.longHaulNo) return;
                _.forEach(lineHaul.longHaulShipDay, function (day) {
                    var apm = lineHaul.description.indexOf("AM") > 0 ? "AM" : "PM";
                    var weekDay = day + apm;
                    $scope.selectedWeekDay = weekDay;
                    $scope.weekDayLineHauls = $scope.lineHaulMap[weekDay];
                });
            })
        }

        function getLineHaulNo() {
            if (!lineHauls) {
                setTimeout(getLineHaulNo, 100);
                return;
            }
            var weekDay = getWeekDay();
            if ($scope.lineHaulMap[weekDay] && $scope.lineHaulMap[weekDay][0]) {
                $scope.longHaulNo = $scope.lineHaulMap[weekDay][0].longHaulNo;
            } else {
                $scope.longHaulNo = lineHauls[0].longHaulNo;
            }
            getLineHaulMonitorData($scope.longHaulNo);
        }

        $scope.showContent = function () {
            $scope.isShowWeekDayContent = true;
        };
        $scope.lineHaulMouseOut = function () {
            $scope.isShowLineHaulContent = false;
        };
        $scope.selectWeekDay = function (day) {
            $scope.selectedWeekDay = day;
            $scope.weekDayLineHauls = $scope.lineHaulMap[day];
            $scope.isShowLineHaulContent = true;
            $scope.isShowWeekDayContent = true;
        };
        $scope.selectLongHaul = function (longHaulNo) {
            $scope.longHaulNo = longHaulNo;
            $scope.isShowLineHaulContent = false;
            $scope.isShowWeekDayContent = false;
            getLineHaulMonitorData($scope.longHaulNo);
        };

        var timeInterval;
        $scope.longHaulNo;
        function _init() {
            searchMilkRun();
            $scope.isLoading = true;
            $scope.longHaulNo = $stateParams.longHaulNo;
            if (!$scope.longHaulNo) {
                getLineHaulNo();
            } else {
                getLineHaulMonitorData($scope.longHaulNo);
            }
        }

        function getLineHaulMonitorData(longHaulNo) {
            getWeekDayLineHauls();

            $scope.lineHaulMonitor = [];
            $scope.isLoading = true;
            var params = {};
            var fromDate = $stateParams.fromDate ? $stateParams.fromDate : null;
            var fromTo = $stateParams.fromTo ? $stateParams.fromTo : null;
            params.longHaulNo = longHaulNo;
            params.fromDate = fromDate;
            params.fromTo = fromTo;
            longHaulService.lineHaulMonitor(params).then(function (data) {
                $scope.lineHaulData = data;
                $scope.storeColumn = data.storeColumn ? data.storeColumn : {};
                $scope.coldCSPickColumnMap = data.coldCSPickColumn ? _.keyBy(data.coldCSPickColumn, 'shipToStore') : {};
                $scope.dryCSPickColumnMap = data.dryCSPickColumn ? _.keyBy(data.dryCSPickColumn, 'shipToStore') : {};
                $scope.coldEAPickColumnMap = data.coldEAPickColumn ? _.keyBy(data.coldEAPickColumn, 'shipToStore') : {};
                $scope.dryEAPickColumnMap = data.dryEAPickColumn ? _.keyBy(data.dryEAPickColumn, 'shipToStore') : {};
                $scope.lockEAPickColumnMap = data.lockEAPickColumn ? _.keyBy(data.lockEAPickColumn, 'shipToStore') : {};
                $scope.packColumnMap = data.packColumn ? _.keyBy(data.packColumn, 'shipToStore') : {};
                organizationData();
            }, function (error) {
                $scope.isLoading = false;
                lincUtil.processErrorResponse(error);
            });
        }

        timeInterval = $interval(function () {
            _init();
        }, 300000);

        function organizationData() {

            _.forEach($scope.storeColumn, function (storeColumn) {
                var newColumn = {};
                newColumn.store = storeColumn;
                newColumn.coldCSPick = $scope.coldCSPickColumnMap[storeColumn.shipToStore] ? setupDisplayTask($scope.coldCSPickColumnMap[storeColumn.shipToStore]) : "";
                newColumn.dryCSPick = $scope.dryCSPickColumnMap[storeColumn.shipToStore] ? setupDisplayTask($scope.dryCSPickColumnMap[storeColumn.shipToStore]) : "";
                newColumn.coldEAPick = $scope.coldEAPickColumnMap[storeColumn.shipToStore] ? setupDisplayTask($scope.coldEAPickColumnMap[storeColumn.shipToStore]) : "";
                newColumn.dryEAPick = $scope.dryEAPickColumnMap[storeColumn.shipToStore] ? setupDisplayTask($scope.dryEAPickColumnMap[storeColumn.shipToStore]) : "";
                newColumn.lockEAPick = $scope.lockEAPickColumnMap[storeColumn.shipToStore] ? setupDisplayTask($scope.lockEAPickColumnMap[storeColumn.shipToStore]) : "";
                newColumn.pack = $scope.packColumnMap[storeColumn.shipToStore] ? setupDisplayTask($scope.packColumnMap[storeColumn.shipToStore]) : "";
                $scope.lineHaulMonitor.push(newColumn);
            });
            $scope.isLoading = false;
        }

        function setupDisplayTask(taskTypeColumn) {
            taskTypeColumn.displayTasks = $scope.eAOrCSPickTitle(taskTypeColumn.taskIds, taskTypeColumn.forceCloseTaskIds  );
            taskTypeColumn.hasForceCloseTask = taskTypeColumn.forceCloseTaskIds && taskTypeColumn.forceCloseTaskIds.length > 0;
            return taskTypeColumn;
        }

        $scope.bgColorFun = function (lineHaulPick) {
            var isFinish = false;
            var per = lineHaulPick.totalPickedQty / lineHaulPick.totalQty;
            if (per >= 1)
                isFinish = true;
            return isFinish;
        };

        $scope.storeBgColor = function (lineHaul) {

            var isFinish = false;
            var coldCSPickPer = lineHaul.coldCSPick == "" ? 1 : lineHaul.coldCSPick.totalPickedQty / lineHaul.coldCSPick.totalQty;
            var dryCSPickPer = lineHaul.dryCSPick == "" ? 1 : lineHaul.dryCSPick.totalPickedQty / lineHaul.dryCSPick.totalQty;
            var coldEAPickPer = lineHaul.coldEAPick == "" ? 1 : lineHaul.coldEAPick.totalPickedQty / lineHaul.coldEAPick.totalQty;
            var dryEAPickPer = lineHaul.dryEAPick == "" ? 1 : lineHaul.dryEAPick.totalPickedQty / lineHaul.dryEAPick.totalQty;
            var lockEAPickPer = lineHaul.lockEAPick == "" ? 1 : lineHaul.lockEAPick.totalPickedQty / lineHaul.lockEAPick.totalQty;
            var pack = 0;
            if (lineHaul.pack.taskIds.length > 0 && lineHaul.pack.packDone) {
                pack = 1;
            }

            if ((coldCSPickPer == 1) && (dryCSPickPer == 1) && (coldEAPickPer == 1) && (dryEAPickPer == 1) && (lockEAPickPer == 1) &&(pack == 1))
                isFinish = true;
            return isFinish;

        };


        $scope.sliceStore = function (storeTitle) {
            if (storeTitle) {
                if (storeTitle.length > 23) {
                    return storeTitle.slice(0, 23) + "...";
                }
                else {
                    return storeTitle;
                }

            }

        };

        $scope.sliceOrderPlanned = function (storeOrderPlanned) {
            var orderPlanStr = "";
            _.forEach(storeOrderPlanned, function (o) {
                orderPlanStr += o + " ";
            });
            if (orderPlanStr.length > 35) {
                return orderPlanStr.slice(0, 35) + "...";
            }
            else {
                return orderPlanStr;
            }
        };

        $scope.sliceNotOrderPlanned = function (storeNotOrderPlanned) {
            var orderPlanStr = "";
            _.forEach(storeNotOrderPlanned, function (o) {
                orderPlanStr += o + " ";
            });
            if (orderPlanStr.length > 25) {
                return orderPlanStr.slice(0, 25) + "...";
            }
            else {
                return orderPlanStr;
            }
        };

        $scope.eAOrCSPickTitle = function (taskIds, forceCloseTaskIds) {
            var limitLength = 40;
            var displayStringLength = 0;
            var displayTasks = [];
            forceCloseTaskIds = forceCloseTaskIds || [];
            for(var i = 0; i< forceCloseTaskIds.length; i++) {
                if( displayStringLength <= limitLength ) {
                    displayTasks.push({taskId: forceCloseTaskIds[i], "isForceCloseTask": true});
                    displayStringLength += forceCloseTaskIds[i].length;
                } else {
                    break;
                }
            }

            var normalTaskIds =  _.difference(taskIds,forceCloseTaskIds);
            for(var i = 0; i < normalTaskIds.length; i++ ) {
                if( displayStringLength <= limitLength ) {
                    displayTasks.push({taskId: normalTaskIds[i], "isForceCloseTask": false});
                    displayStringLength += normalTaskIds[i].length;
                } else {
                    break;
                }
            }

            return displayTasks;
        };

        $scope.titlePer = function (per) {
            if (per == "NaN") {
                per = 0;
            }
            var perResult = Math.floor(per * 100) + '%';
            return perResult;
        };

        $scope.packDoneStatus = function (pack) {
            if(pack.taskIds.length > 0){
                if (!pack.allPackTaskGenerated) {
                    return "NotAllPackTaskGenerated";
                } else {
                    return pack.packDone ? "Done" : "InProgress";
                }

            } else {
                return "NotGenerated";
            }
        };

        $scope.widthPer = function (lineHaulPick) {
            var per = Math.floor((lineHaulPick.totalPickedQty / lineHaulPick.totalQty) * 100) + '%';
            return per;
        };

        _init();

        $scope.$on(
            "$destroy",
            function (event) {
                $interval.cancel(timeInterval);
            }
        );

    };

    documentOverviewController.$inject = ['$scope', '$interval', '$interval', '$stateParams', 'longHaulService', 'lincUtil'];
    return documentOverviewController;
});