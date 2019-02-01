'use strict';

define(['angular'], function (angular) {
    var ctrl = function ($scope, lpConfigurationTemplateService, lincUtil) {
        var ctrl = this;
        ctrl.pageSize = 10;
        ctrl.searchInfo = {};

        var cartonConfigurationTemplate = {
            init: function () {
                this.search();
            },
            search: function () {
                ctrl.searchCompleted = false;
                lpConfigurationTemplateService.searchLpConfigurationMultipleTemplate(ctrl.searchInfo).then(function (response) {
                     ctrl.searchCompleted = true;
                     ctrl.lpConfigurationTemplates= response;
                     ctrl.loadContent(1);
                }, function (err) {
                    ctrl.searchCompleted = true;
                    lincUtil.processErrorResponse(err);
                });
            },
            remove:function (index) {
                lincUtil.deleteConfirmPopup("Are you sure to delete this record?", function () {
                    lpConfigurationTemplateService.removeLpConfigurationMultipleTemplateById(ctrl.lpConfigurationTemplateView[index].id).then(function () {
                        angular.forEach(ctrl.lpConfigurationTemplates, function(item, key) {
                            if (item.id === lpConfigurationTemplateView[index].id)
                            {
                                $scope.receipts.splice(key, 1);
                            }
                        });
                        angular.forEach($scope.lpConfigurationTemplateView, function(item1, key1) {
                            if (item1.id === lpConfigurationTemplateView[index].id)
                            {
                                $scope.receiptView.splice(key1, 1);
                            }
                        });
                    }, function () {
                        lincUtil.errorPopup("Error Found While Removing");
                    });
                });
            }
        }

        ctrl.search = function () {
            cartonConfigurationTemplate.search();
        };

        ctrl.loadContent = function (currentPage) {
            ctrl.lpConfigurationTemplateView = ctrl.lpConfigurationTemplates.slice((currentPage - 1) * ctrl.pageSize, currentPage * ctrl.pageSize > ctrl.lpConfigurationTemplates.length ? ctrl.lpConfigurationTemplates.length : currentPage * ctrl.pageSize);
        };

        ctrl.keyUpSearch = function ($event) {
            if(!$event){
                return;
            }
            if ($event.keyCode === 13) {
                cartonConfigurationTemplate.search();
            }
            $event.preventDefault();
        };

        cartonConfigurationTemplate.init();
    };
    ctrl.$inject = ['$scope', 'lpConfigurationTemplateService', 'lincUtil'];
    return ctrl;
});
