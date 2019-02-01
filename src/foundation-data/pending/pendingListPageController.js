'use strict';

define([], function () {
    var ctrl = function ($scope, $state, pendingService, itemService, lincUtil) {
        var ctrl = this;
        ctrl.pageSize = 10;
        $scope.searchInfo = {};

        pendingService.getPending({}).then(function (data) {
            ctrl.pending = data;
            ctrl.searchPendingCompleted = true;
            ctrl.pendingView = ctrl.pending.slice(0, ctrl.pageSize > ctrl.pending.length ? ctrl.pending.length : ctrl.pageSize);
        }, function () {
        });

        ctrl.loadContent = function (currentPage) {
            ctrl.pendingView = ctrl.pending.slice((currentPage - 1) * ctrl.pageSize,
                currentPage * ctrl.pageSize > ctrl.pending.length ? ctrl.pending.length : currentPage * ctrl.pageSize);
        };

        ctrl.handle = function (index) {
            pendingService.remove(ctrl.pendingView[index].id).then(function () {
                if (ctrl.pendingView[index].dataType == 'Product') {
                    $state.go('fd.item.itemspec.edit', {itemSpecId: ctrl.pendingView[index].dataId});
                } else if (ctrl.pendingView[index].dataType == 'Item') {
                    $state.go('fd.item.itemspec.edit', {itemSpecId: ctrl.pendingView[index].dataId});
                } else if (ctrl.pendingView[index].dataType == 'ItemPicture') {
                    $state.go('fd.item.itemspec.edit', {itemSpecId: ctrl.pendingView[index].dataId});
                } else if (ctrl.pendingView[index].dataType == 'LP') {
                    $state.go('fd.item.itemspec.edit', {itemSpecId: ctrl.pendingView[index].dataId});
                } else if (ctrl.pendingView[index].dataType == 'Address') {
                    $state.go('fd.address.edit', {addressId: ctrl.pendingView[index].dataId});
                } else if (ctrl.pendingView[index].dataType == 'Organization') {
                    $state.go('fd.organization.edit', {organizationId: ctrl.pendingView[index].dataId});
                } else if (ctrl.pendingView[index].dataType == 'ItemLpConfiguration') {
                    itemService.getLPConfig(ctrl.pendingView[index].dataId).then(function(lpConfig){
                        $state.go('fd.item.itemspec.edit', {lpConfigId:ctrl.pendingView[index].dataId,itemSpecId: lpConfig.itemSpecId, activeTab: "lpConfig"});
                    }, function(err){
                       lincUtil.processErrorResponse(err);
                    });
                } else if (ctrl.pendingView[index].dataType == 'LpConfigSingleTemplate') {
                    $state.go('fd.lpConfigurationTemplate.main.singleTemplateEdit', {lpConfigurationTemplateId: ctrl.pendingView[index].dataId, activeTab: "singleTemplateEdit"});
                }

            }, function () {
                lincUtil.messagePopup("Error Found");
            });
        };
    };
    ctrl.$inject = ['$scope', '$state', 'pendingService', 'itemService', 'lincUtil'];
    return ctrl;
});
