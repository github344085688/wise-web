'use strict';

define([
    './factories',
    'lodash',
    'moment'
], function(factories, _, moment) {
    factories.factory('transloadTaskService', function($resource, $q, lincUtil) {
        var resourceConfig = {
            'update': {
                method: 'PUT'
            },
            'search': {
                method: 'POST',
                isArray: true
            }
        };

        var service = {};

        service.searchTransloadTaskDetailByPaging =  function(param){
            return $resource("/bam/transload/task/search-by-paging", null, {'search': {
                method: 'POST'
            }}).search(param).$promise;
        };

        service.searchTransloadTaskDetail =  function(param){
            return $resource("/bam/transload/task/search", null, resourceConfig).search(param).$promise;
        };

        service.getTaskById = function(taskId) {
            return $resource("/bam/transload/task/:taskId").get({taskId: taskId}).$promise;
        };

        service.reopenStep = function (taskId, stepId) {
            return $resource("/wms-app/transload/transload-task/:taskId/step/:stepId/reopen", {taskId: taskId, stepId: stepId}, resourceConfig).update().$promise;
        };

        service.createTask=  function(param){
            return $resource("/wms-app/transload/transload-task").save(param).$promise;
        };

        service.deleteSteps =  function(transloadTaskId, param){
            return $resource("/wms-app/transload/transload-task/:id/step/delete", {id: transloadTaskId}, resourceConfig).update(param).$promise;
        };

        service.searchTransloadTask =  function(param){
            return $resource("/wms-app/transload/transload-task/search", null, resourceConfig).search(param).$promise;
        };

        service.getTaskByEntryId = function (entryId) {
            return $resource("/bam/wms-app/window-checkin/transload-task/:entryId", {entryId: entryId}).get().$promise;
        };

        service.getTransloadReceivingMonitor =  function(taskId,receiptId){
            return $resource("/bam/transload/:taskId/receiving/:receiptId").get({taskId:taskId,receiptId:receiptId}).$promise;
        };

        service.getTransloadShippingMonitor =  function(taskId,loadId){
            return $resource("/bam/transload/:taskId/shipping/:loadId").get({taskId:taskId,loadId:loadId}).$promise;
        };

        service.registerFirebase = function(searchInfo) {
            return $resource("/push-app/register",{}, resourceConfig).search(searchInfo).$promise;
        };

        service.searchStepTimer = function (searchParam) {
            return $resource("/wms-app/transload/transload-task/step/timer/search",{}, resourceConfig).search(searchParam).$promise;
        };

        service.startStep = function (taskId, stepId) {
            return $resource("/wms-app/transload/transload-task/:taskId/step/:stepId/start", {taskId: taskId, stepId: stepId}, resourceConfig).update().$promise;
        };


        service.stepReceiveAll = function (taskId, stepId) {
            return $resource("/wms-app/transload/transload-task/:taskId/receiving-step/:stepId/receive-carton/receive-all", {taskId: taskId, stepId: stepId}, resourceConfig).update().$promise;
        };

        service.stepShipAll = function (taskId, stepId) {
            return $resource("/wms-app/transload/transload-task/:taskId/shipping-step/:stepId/load-carton/load-all", {taskId: taskId, stepId: stepId}, resourceConfig).update().$promise;
        };
        service.stepUnReceiveAll = function (taskId, stepId) {
            return $resource("/wms-app/transload/transload-task/:taskId/receiving-step/:stepId/receive-carton/un-receive-all", {taskId: taskId, stepId: stepId}, resourceConfig).update().$promise;
        };

        service.stepUnShipAll = function (taskId, stepId) {
            return $resource("/wms-app/transload/transload-task/:taskId/shipping-step/:stepId/load-carton/un-load-all", {taskId: taskId, stepId: stepId}, resourceConfig).update().$promise;
        };


        service.completeStep = function (taskId, stepId, stepName) {

            return $resource(stepName === 'Offload' ? "/wms-app/transload/transload-task/:taskId/step/offload-step/:stepId/close-without-photo" : "/wms-app/transload/transload-task/:taskId/step/:stepId/close" , {taskId: taskId, stepId: stepId}, resourceConfig).update().$promise;
        };

        service.updateTransloadOffload= function(taskId,offload) {
            return $resource("/wms-app/transload/transload-task/:taskId/step/offload-step/:stepId",{taskId: taskId, stepId: offload.id}, resourceConfig).update(offload).$promise;
        };


        service.forceCloseStep = function (taskId, stepId,taskForceClose) {
            return $resource("/wms-app/transload/transload-task/:taskId/step/:stepId/force-close" , {taskId: taskId, stepId: stepId}, resourceConfig).update(taskForceClose).$promise;
        };

        service.cancelTask = function (taskId) {
            return $resource("/wms-app/transload/transload-task/:taskId/cancel", {taskId: taskId}, resourceConfig).update().$promise;
        };

        
        service.closeTask = function (taskId) {
            return $resource("/wms-app/transload/transload-task/:taskId/close", {taskId: taskId}, resourceConfig).update().$promise;
        };
             
        service.convertInventoryToGeneric = function (taskId) {
            return $resource("/wms-app/transload/transload-task/:taskId/convert-inventory-to-generic", {taskId: taskId}, resourceConfig).update().$promise;
        };


        service.forceCloseTask = function (taskId,taskForceClose) {
            return $resource("/wms-app/transload/transload-task/:taskId/force-close", {taskId: taskId}, resourceConfig).update(taskForceClose).$promise;
        };

        service.lazyCloseStep = function (taskId, stepId) {
            return $resource("/wms-app/transload/transload-task/:taskId/shipping-step/:stepId/lazy-close", {taskId: taskId, stepId: stepId}, resourceConfig).update().$promise;
        };

        service.stepCreateNewLoad = function (loadId) {
            return $resource("/wms-app/transload/transload-task/shipping-step/:loadId", {loadId: loadId}, {'post': {
                method: 'POST'
            }}).post().$promise;
        };

        service.getPhotoStep = function(taskId,stepId) {
            return $resource("/wms-app/transload/transload-task/:taskId/step/photo-step/:stepId").get({taskId: taskId,stepId:stepId}).$promise;
        };  

        service.updateStepPhoto = function (taskId, stepId,transloadPhotoStepUpdate) {
            return $resource("/wms-app/transload/transload-task/:taskId/step/photo-step/:stepId", {taskId: taskId, stepId: stepId}, resourceConfig).update(transloadPhotoStepUpdate).$promise;
        };

        service.getDurationTimestamp = function(timePoints){
            var timePointList = _.sortBy(timePoints, 'time');
            var startTime;
            var endTime;
            var durationTime = 0;
            var len = timePointList.length;

            _.forEach(timePointList, function (item) {
                if (item.timeType === 'Pause') {
                    durationTime = durationTime + (moment(item.time) - startTime);
                }
                if (item.timeType === 'Resume') {
                    startTime = moment(item.time);
                }
                if(item.timeType === 'Start') {
                    startTime = moment(item.time);
                }
                if(item.timeType === 'End') {
                    endTime = moment(item.time);
                }
            });

            var lastTime = timePointList[len - 1];
            if(lastTime.timeType === 'End') {
                durationTime = durationTime + (endTime - startTime);
            }else if(lastTime.timeType === 'Resume' || lastTime.timeType === 'Start') {
                durationTime = durationTime + (moment() - startTime);
            }
            return durationTime;
        };

        service.searchShippingStep =  function(param){
            return $resource("/wms-app/transload/transload-task/shipping-step/search", null, {'search': {
                method: 'POST',isArray:true
            }}).search(param).$promise;
        };
        
        service.closeTransLoadShippingStep = function(loadIds,object, field) {
            service.searchTransloadTask({loadIds:loadIds}).then(function (response) {
                if(response && response.length>0){
                    var taskIds =_.uniq(_.map(response,'id'));
                    _.forEach(taskIds,function(taskId){
                        searchShippingStepMatchCarton(taskId,object, field,function(res){
                        if(res.isMatch){
                            closeTaskWithCartonMatched(taskId,object, field);
                        }else{
                            lincUtil.confirmPopup('Tip', 'Would you like to create new load?', function () {
                                searchShippingStepAndClose(loadIds,object, field,function(){
                                    createNewLoad(loadIds,object, field);
                                });
                            },function(){
                                forceCloseTaskWithCartonNoMatched(taskId);
                            });
                        }
                        });
                    });
                }else{
                    object[field] = false;
                    lincUtil.messagePopup("Can not find any transload shipping step related with loads.");
                }
            }, function(error) {
                object[field] = false;
                lincUtil.processErrorResponse(error);
            });
        };

        function searchShippingStepAndClose(loadIds,object, field,callback){
            service.searchShippingStep({loadIds:loadIds}).then(function(response){
                var  $promise =[];  
                _.forEach(response,function(res){
                    $promise.push(service.completeStep(res.taskId, res.id, 'Shipping Step'))
                });
                $q.all($promise).then(function(res){
                     callback();
                },function(error){
                    object[field] = false;
                    lincUtil.processErrorResponse(error);
                });
            },function(error){
                 object[field] = false;
                lincUtil.processErrorResponse(error);
            })
        }

        function createNewLoad(loadIds,object, field,){
            var  $promise =[];
            _.forEach(loadIds,function(loadId){
                $promise.push(service.stepCreateNewLoad(loadId))
            });
            $q.all($promise).then(function(res){
                object[field] = false;
                lincUtil.messagePopup('Create New Load Success !');
            },function(error){
                object[field] = false;
                lincUtil.processErrorResponse(error);
            });
        }

        function closeTaskWithCartonMatched(taskId,object, field,){
            service.closeTaskWithCartonMatched(taskId).then(function(res){
                object[field] = false;
                lincUtil.messagePopup('Close Transload Shipping Step Success !');
            },function(error){
                object[field] = false;
                lincUtil.processErrorResponse(error);
            });
        }

        function forceCloseTaskWithCartonNoMatched(taskId,object, field,){
            service.forceCloseTaskWithCartonNoMatched(taskId).then(function(res){
                object[field] = false;
                lincUtil.messagePopup('Force close Transload Shipping Step Success !');
            },function(error){
                object[field] = false;
                lincUtil.processErrorResponse(error);
            });
        }

        function searchShippingStepMatchCarton(taskId,object, field,callback){
            service.searchShippingStepMatchCarton(taskId).then(function(res){
                 callback(res);
            },function(error){
                   object[field] = false;
                lincUtil.processErrorResponse(error);
            });
        }

        service.forceCloseTaskWithCartonNoMatched =  function(taskId){
            return $resource("/wms-app/transload/transload-task/:taskId/shipping-step/force-close-task-all-related", {taskId:taskId},{'excute': { method: 'POST'}}).excute().$promise;
        };

        service.closeTaskWithCartonMatched =  function(taskId){
            return $resource("/wms-app/transload/transload-task/:taskId/shipping-step/close-task-all-related", {taskId:taskId},{'excute': { method: 'POST'}}).excute().$promise;
        };
        
        service.searchShippingStepMatchCarton =  function(taskId){
            return $resource("/wms-app/transload/transload-task/:taskId/shipping-step/match-carton", {taskId:taskId},{'search': {method: 'POST'}}).search().$promise;
        };

        service.searchLoadIdsWithUnrelatedStep = function (taskId) {
            return $resource("/wms-app/transload/transload-task/:taskId/search-load-ids/with-unrelated-step", {taskId:taskId}, resourceConfig).search().$promise;
        };

        
        return service;
    });
});
