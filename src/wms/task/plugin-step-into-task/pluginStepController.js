'use strict';

define(['angular',
    'lodash',
    './createStepController'
], function(angular, _, createStepController) {
    var controller = function($scope, lincUtil, $state,
                              $mdDialog, taskService) {
        var tasks = [];
        var allTaskStepsSubmitSuccessNum;
        var isFailure;
        var deleteSteps;
        var submitTaskIndex;
        $scope.taskSteps = [];

        $scope.save = function () {
            $scope.loading = true;
            submitTaskIndex = 0;
            if(isDirectReorderTasksSteps()) {
                directReorderTasksSteps();
            }else {
                submitTasks();
            }
        };

        function submitTasks() {
            allTaskStepsSubmitSuccessNum = [];
            angular.forEach(tasks, function (task, taskIndex) {
                submitSteps(taskIndex, waitAllTasksCompleted);
            });
        }

        function directReorderTasksSteps() {
            angular.forEach(tasks, function (task, taskIndex) {
                var stepIds = getTaskStepIds(task);
                reorderTaskSteps(taskIndex, stepIds, waitAllTasksCompleted);
            });
        }
        
        function waitAllTasksCompleted() {
            submitTaskIndex ++;
            if(submitTaskIndex == tasks.length) {
                lincUtil.saveSuccessfulPopup(function (){
                    $scope.loading = false;
                    $scope.searchTasks();
                });
            }
        }

        function isDirectReorderTasksSteps() {
            var task = tasks[0];
            var bool = true;
            if($scope.taskSteps.length == task.steps.length) {
                var findNoIdTask = _.find($scope.taskSteps, function (item) {
                    return !item.id;
                });
                if(findNoIdTask) {
                    bool = false;
                }
            }else {
                bool = false;
            }
            return bool;
        }

        function getStepIdOnTaskStepsByStepName(task, stepName) {
            var stepId;
            var findStep = _.find(task.steps, function (taskStep) {
                return taskStep.name === stepName;
            });
            if(findStep) {
                stepId = findStep.id;
            }
            return stepId;
        }

        function getTaskStepIds(task) {
            var stepIds = [];
            angular.forEach($scope.taskSteps, function (step) {
                stepIds.push(getStepIdOnTaskStepsByStepName(task, step.name));
            });
            return stepIds;
        }
        
        function submitSteps(saveTaskIndex, cbFunction) {
            var task = tasks[saveTaskIndex];
            isFailure = false;
            var taskId = task.id;
            var taskStepsSubmitNum = deleteSteps.length;
            allTaskStepsSubmitSuccessNum[saveTaskIndex] = 0;
            var taskStepIds = new Array($scope.taskSteps.length);
            angular.forEach($scope.taskSteps, function (step, index) {
                if(step.id) {
                    taskStepIds[index] = getStepIdOnTaskStepsByStepName(task, step.name);
                }else {
                    taskStepsSubmitNum ++;
                    taskService.createStep(taskId, step)
                        .then(function (resObj) {
                            taskStepIds[index] = resObj.id;
                            afterAllTaskStepsCompletedToReorderSteps(taskStepIds, taskStepsSubmitNum, saveTaskIndex, cbFunction);
                        }, function (res) {
                            submitTaskStepFail(taskId, res);
                        });
                }
            });

            angular.forEach(deleteSteps, function (deleteStep) {
                var deleteStepId = getStepIdOnTaskStepsByStepName(task, deleteStep.name);
                taskService.removeStep(task.id, deleteStepId)
                    .then(function () {
                        afterAllTaskStepsCompletedToReorderSteps(taskStepIds, taskStepsSubmitNum,
                            saveTaskIndex, cbFunction);
                    }, function (res) {
                        submitTaskStepFail(task.id, res);
                    });
                });
        }

        function afterAllTaskStepsCompletedToReorderSteps(taskStepIds, taskStepsSubmitNum,
                                       saveTaskIndex, cbFunction) {
            allTaskStepsSubmitSuccessNum[saveTaskIndex] ++;
            if( allTaskStepsSubmitSuccessNum[saveTaskIndex] == taskStepsSubmitNum)
            {
                reorderTaskSteps(saveTaskIndex, taskStepIds, function () {
                    cbFunction();
                });
            }
        }

        function reorderTaskSteps(saveTaskIndex, taskStepIds, cbFunction) {
            taskService.reorderSteps(tasks[saveTaskIndex].id, taskStepIds)
                .then(function () {
                    cbFunction();
                }, function(res) {
                    submitTaskStepFail(tasks[saveTaskIndex].id, res);
                });
        }

        function submitTaskStepFail(taskId, res) {
            if(!isFailure)
            {
                $scope.loading = false;
                lincUtil.errorPopup(taskId + '：  ' + res.data.error);
                isFailure = true;
            }
        }

        $scope.openCreateStepDialog = function (step) {
            $mdDialog.show({
                templateUrl: 'wms/task/plugin-step-into-task/template/createStep.html',
                controller: createStepController,
                locals: {
                    step: step
                },
            }).then(function (step) {
                createStepCb(step);
            });
        };
        
        function createStepCb(step) {
            if(!step.id && !step.createTimestamp)
            {
                step.createTimestamp =  new Date().getTime();
                $scope.generalSteps.unshift(step);
            }else
            {
                var index = getIndexInlines(step, $scope.generalSteps);
                $scope.generalSteps[index] = step;
            }
        }

        function getIndexInlines(obj, list)
        {
            var index;
            if(obj.id)
                index =  _.findIndex(list, { 'id': obj.id});
            else if(obj.createTimestamp)
                index =  _.findIndex(list, { 'createTimestamp': obj.createTimestamp});
            return index;
        }

        $scope.taskStepsDragListener = {

        };

        $scope.generalStepsDragListener = {
            itemMoved  : function (eventObj) {
            },
            accept: function(sourceItemScope, destScope, destItemScope ) {
                return sourceItemScope.sortableScope.$id === destScope.$id;
            }
        };
        
        $scope.removeTaskStep = function (index) {
            var step =  $scope.taskSteps[index];
            if(step.id) {
                deleteSteps.push(step);
            }
            $scope.taskSteps.splice(index, 1);
        };

        function buildSearchParam() {
            var searchObj = angular.copy($scope.search);
            angular.forEach(searchObj.taskIds, function (id, key) {
                id = _.toUpper(id);
                if(id.indexOf("TASK") < 0) {
                     id = "TASK-" + id;
                }
                searchObj.taskIds[key] = id;
            });
            return searchObj;
        }

        $scope.keyUpSearch = function ($event) {
            if(!$event){
                return;
            }
            if ($event.keyCode === 13) {
                if($scope.search&&$scope.search.taskIds.length>0){
                    $scope.searchTasks();
                }
            }
            $event.preventDefault();
        };

        $scope.searchTasks = function () {
            $scope.searchLoading = true;
            deleteSteps = [];
            $scope.taskType = null;
            var searchObj = buildSearchParam();
            taskService.searchTasks({taskIds:searchObj.taskIds}).then(
                function (response) {
                    $scope.searchLoading = false;
                    if(judgeTasksTypeIfSame(response)) {
                        $scope.tasks = tasks = response;
                        if(tasks && tasks.length>0) {
                            $scope.taskType = tasks[0].taskType;
                            initSetTaskSteps();
                        }
                    }
                }, function () {
                    $scope.searchLoading = false;
                }
            );
        };
        
        function initSetTaskSteps() {
            $scope.taskSteps = angular.copy(tasks[0].steps);
            if($scope.taskSteps) {
                if(tasks.length > 1 && !judgeNameAndOrderIsSameOfTaskSteps(tasks)) {
                    lincUtil.messagePopup("Tip", "The name and order of all task steps is not the same!")
                }
            }else {
                angular.forEach($scope.tasks, function (task) {
                    task.steps = [];
                });
                $scope.taskSteps = [];
            }
        }

        function judgeTasksTypeIfSame(tasksObj) {
            var tasksTypeIfSame = true;
           var taskType = null;
            angular.forEach(tasksObj, function (task) {
                if (!tasksTypeIfSame) return;
                if(taskType && taskType != task.taskType) {
                    tasksTypeIfSame = false;
                    lincUtil.messagePopup("Tip", "Search tasks is not same type! Please change taskIds to search.")
                }else {
                    taskType = task.taskType;
                }
            });
            return tasksTypeIfSame;
        }
        
        function judgeNameAndOrderIsSameOfTaskSteps() {
            var stepLen = tasks[0].steps.length;
            for(var i=0; i<stepLen; i++) {
                var stepName = tasks[0].steps[i].name;
                var taskLen = tasks.length;
                for(var j=0; j<taskLen; j++) {
                    if(tasks[j].steps[i].name != stepName) {
                        return false;
                    }
                }
            }
            return true;
        }

        function _init() {
            $scope.generalSteps = [];
        }

        _init();
    };

    controller.$inject = ['$scope', 'lincUtil', '$state',
        '$mdDialog',
        'taskService'];

    return controller;
});
