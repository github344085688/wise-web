'use strict';

define(['angular'], function (angular) {
    var ctrl = function ($scope, lpConfigurationTemplateService, lincUtil) {
        var ctrl = this;
        ctrl.pageSize = 10;
        ctrl.searchInfo = {};
        $scope.$parent.activetab = "singleTemplateList";

        var lpConfigurationTemplate = {
            init: function () {
                this.search();
            },
            search: function () {
                ctrl.isLoading = true;
                lpConfigurationTemplateService.searchLpConfigurationSingleTemplate(ctrl.searchInfo).then(function (data) {
                    ctrl.isLoading = false;
                    ctrl.lpSingleTemplates = data;
                    ctrl.loadContent(1);
                }, function () {
                    ctrl.isLoading = false;
                });
            },
            remove:function (index) {
                lincUtil.deleteConfirmPopup("Are you sure to delete this record?", function () {
                    lpConfigurationTemplateService.removeLpConfigurationSingleTemplateById(ctrl.lpSingleTemplateView[index].id).then(function () {
                        angular.forEach(ctrl.lpSingleTemplates, function(item, key) {
                            if (item.id === lpSingleTemplateView[index].id)
                            {
                                $scope.receipts.splice(key, 1);
                            }
                        });
                        angular.forEach($scope.lpSingleTemplateView, function(item1, key1) {
                            if (item1.id === lpSingleTemplateView[index].id)
                            {
                                $scope.receiptView.splice(key1, 1);
                            }
                        });
                    }, function () {
                        lincUtil.errorPopup("Error Found While Removing");
                    });
                });
            }
        };

        ctrl.search = function () {
            lpConfigurationTemplate.search();
        };

        ctrl.keyUpSearch = function ($event) {
            if(!$event){
                return;
            }
            if ($event.keyCode === 13) {
                lpConfigurationTemplate.search();
            }
            $event.preventDefault();
        };

        ctrl.loadContent = function (currentPage) {
            ctrl.lpSingleTemplateView = ctrl.lpSingleTemplates.slice((currentPage - 1) * ctrl.pageSize, currentPage * ctrl.pageSize > ctrl.lpSingleTemplates.length ? ctrl.lpSingleTemplates.length : currentPage * ctrl.pageSize);
        };

        lpConfigurationTemplate.init();
    };
    ctrl.$inject = ['$scope', 'lpConfigurationTemplateService', 'lincUtil'];
    return ctrl;
});
