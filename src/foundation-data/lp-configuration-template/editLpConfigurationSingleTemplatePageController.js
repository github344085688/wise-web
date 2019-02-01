'use strict';

define(['angular',
    'lodash',
    'ngSortable',
    'src/common/upload/lpConfigurationUploadController'], function (angular, _, sortable, uploadController) {

    var controller = function ($scope, $state, $stateParams, lincUtil, isAddAction, lpConfigurationTemplateService, $mdDialog,itemService) {
        var ctrl = this;
        ctrl.lpConfigurationTemplate = {fileIds: [],packageMaterials:[]};

        var lpConfigurationTemplateCtrl = {
            init: function () {
                ctrl.isAddAction = $stateParams.lpConfigurationTemplateId ? false : true;
                if (ctrl.isAddAction) {
                    $scope.submitLabel = "Save";
                } else {
                    $scope.submitLabel = "Update";
                    lpConfigurationTemplateService.getLpConfigurationSingleTemplateById($stateParams.lpConfigurationTemplateId).then(function (response) {
                        ctrl.lpConfigurationTemplate = response;
                        if(!ctrl.lpConfigurationTemplate.packageMaterials){
                            ctrl.lpConfigurationTemplate.packageMaterials=[{}];
                        }
                       
                    }, function () {
                    });
                }
            },
            add: function () {
                var v = this;
                ctrl.lpConfigurationTemplate.channel = 'MANUAL';
                lpConfigurationTemplateService.addLpConfigurationSingleTemplate(ctrl.lpConfigurationTemplate).then(function (response) {
                    $scope.loading = false;
                    if (response.error) {
                        lincUtil.errorPopup("Error:" + response.error);
                        return;
                    }
                    ctrl.lpConfigurationTemplate.id = response.id;
                    lincUtil.saveSuccessfulPopup(function () {
                        v.returnList();
                    });
                }, function (error) {
                    $scope.loading = false;
                    lincUtil.errorPopup("Error:" + error.data.error);
                });
            },
            update: function () {
                var v = this;
                lpConfigurationTemplateService.updateLpConfigurationSingleTemplate(ctrl.lpConfigurationTemplate).then(function () {
                    $scope.loading = false;
                    lincUtil.updateSuccessfulPopup(function () {
                        v.returnList();
                    }, function (error) {
                        $scope.loading = false;
                        lincUtil.errorPopup("Error:" + error.data.error);
                    });
                });
            },
            returnList: function () {
                $state.go("fd.lpConfigurationTemplate.main.singleTemplateList");
            }
        };

        lpConfigurationTemplateCtrl.init();

        ctrl.addOrUpdateTemplate = function () {
            $scope.loading = true;
            if (ctrl.isAddAction && !ctrl.lpConfigurationTemplate.id) {
                lpConfigurationTemplateCtrl.add();
            } else {
                lpConfigurationTemplateCtrl.update();
            }
        };

        ctrl.cancelEditLpConfigurationTemplate = function () {
            lpConfigurationTemplateCtrl.returnList();
        };

        ctrl.uploadFiles = function () {
            var form = {
                templateUrl: 'common/upload/template/upload.html',
                autoWrap: true,
                title: 'Upload product images',
                locals: {
                    formTitle: "Upload LP Configuration Template images",
                    fileIds: _.isUndefined(ctrl.lpConfigurationTemplate) ? null : ctrl.lpConfigurationTemplate.fileIds
                },
                controller: uploadController
            };
            $mdDialog.show(form).then(function (response) {
                savePicture(response);
            });
        };

        function savePicture(response) {
            if (_.size(response) > 0) {
                ctrl.lpConfigurationTemplate.fileIds = _.union(ctrl.lpConfigurationTemplate.fileIds, response);
            }
        }
        
        ctrl.removeFile = function (item) {
            lincUtil.deleteConfirmPopup("Are you sure to delete this img?", function() {
                _.remove(ctrl.lpConfigurationTemplate.fileIds, function (img) {
                    return img == item;
                });
            });
        }

        $scope.getFieldDragListener = {
            containment: '#template-files',
            dragMove: function(itemPosition, containment, eventObj) {
                eventObj.pageY -= 40;
            },
            accept: function(sourceItemHandleScope, destSortableScope, destItemScope) {
                return sourceItemHandleScope.sortableScope.$parent.$id === destSortableScope.$parent.$id;
            }
        };

        $scope.uomItems = {};
        ctrl.onSelectItemSpec = function (itemSpecId, index, itemLine) {
            itemLine.unitId = null;
            itemService.searchItemUnits({ itemSpecId: itemSpecId }).then(function (response) {
                $scope.uomItems[index] = response.units;
                if(response.units.length>0){
                    itemLine.unitId=response.units[0].id;
                }
                
            });
        };

        $scope.searchUom = function (itemSpecId, index) {
            if (itemSpecId) {
                itemService.searchItemUnits({ itemSpecId: itemSpecId }).then(function (response) {
                    $scope.uomItems[index] = response.units;
                });
            }
        };

        ctrl.addItemStackLine = function (index) {
            ctrl.lpConfigurationTemplate.packageMaterials.push({});
        };

        ctrl.removeItemStackLine = function (index) {
            ctrl.lpConfigurationTemplate.packageMaterials.splice(index, 1);
        };

    };
    controller.$inject = ['$scope', '$state', '$stateParams', 'lincUtil', 'isAddAction', 'lpConfigurationTemplateService', '$mdDialog','itemService'];

    return controller;
});
