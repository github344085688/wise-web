'use strict';

define(['angular',
    'lodash',
    'ngSortable',
    'src/common/upload/lpConfigurationUploadController'], function (angular, _, sortable, uploadController) {

        var controller = function ($scope, $state, $stateParams, lincUtil, isAddAction,
            lpConfigurationTemplateService, $mdDialog, itemService) {
            var ctrl = this;
            ctrl.lpConfigurationTemplate = {fileIds: []};

            var cartonConfigurationTemplateCtrl = {
                init: function () {
                    ctrl.isAddAction = $stateParams.lpConfigurationTemplateId ? false : true;
                    if (ctrl.isAddAction) {
                        $scope.submitLabel = "Save";
                        ctrl.cartonConfigurationTemplate = { packageTypeItemLines: [{}], itemSpecLines: [{}] };
                    } else {
                        $scope.submitLabel = "Update";
                        lpConfigurationTemplateService.getLpConfigurationMultipleTemplateById($stateParams.lpConfigurationTemplateId).then(function (response) {
                            ctrl.cartonConfigurationTemplate = response;
                            if (!ctrl.cartonConfigurationTemplate.packageTypeItemLines || ctrl.cartonConfigurationTemplate.packageTypeItemLines.length === 0) {
                                ctrl.cartonConfigurationTemplate.packageTypeItemLines = [{}];
                            }
                        }, function () {
                        });
                    }
                },
                add: function () {
                    var v = this;
                    lpConfigurationTemplateService.addLpConfigurationMultipleTemplate(ctrl.cartonConfigurationTemplate).then(function (response) {
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
                    lpConfigurationTemplateService.updateLpConfigurationMultipleTemplate(ctrl.cartonConfigurationTemplate).then(function () {
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
                    $state.go("fd.lpConfigurationTemplate.main.multipleTemplateList");
                }
            };

            cartonConfigurationTemplateCtrl.init();

            ctrl.addOrUpdateTemplate = function () {
                if (ctrl.isAddAction && !ctrl.cartonConfigurationTemplate.id) {
                    cartonConfigurationTemplateCtrl.add();
                } else {
                    cartonConfigurationTemplateCtrl.update();
                }
            };

            ctrl.cancelEditCartonConfigurationTemplate = function () {
                cartonConfigurationTemplateCtrl.returnList();
            };

            ctrl.uploadFiles = function () {
                var form = {
                    templateUrl: 'common/upload/template/upload.html',
                    autoWrap: true,
                    title: 'Upload product images',
                    locals: {
                        formTitle: "Upload LP Configuration Template images",
                        fileIds: _.isUndefined(ctrl.cartonConfigurationTemplate) ? null : ctrl.cartonConfigurationTemplate.fileIds
                    },
                    controller: uploadController
                };
                $mdDialog.show(form).then(function (response) {
                    savePicture(response);
                });
            };

            function savePicture(response) {
                if (_.size(response) > 0) {
                    ctrl.cartonConfigurationTemplate.fileIds = _.union(ctrl.cartonConfigurationTemplate.fileIds, response);
                }
            }

            ctrl.removeFile = function (item) {
                lincUtil.deleteConfirmPopup("Are you sure to delete this img?", function () {
                    _.remove(ctrl.cartonConfigurationTemplate.fileIds, function (img) {
                        return img == item;
                    });
                });
            }

            $scope.getFieldDragListener = {
                containment: '#template-files',
                dragMove: function (itemPosition, containment, eventObj) {
                    eventObj.pageY -= 40;
                },
                accept: function (sourceItemHandleScope, destSortableScope, destItemScope) {
                    return sourceItemHandleScope.sortableScope.$parent.$id === destSortableScope.$parent.$id;
                }
            };

            /*Carton Info.*/
            ctrl.addStackLine = function (index) {
                ctrl.cartonConfigurationTemplate.packageTypeItemLines.push({});
            };

            ctrl.removeStackLine = function (index) {
                ctrl.cartonConfigurationTemplate.packageTypeItemLines.splice(index, 1);
            };

            ctrl.addItemStackLine = function (index) {
                ctrl.cartonConfigurationTemplate.itemSpecLines.push({});
            }
            ctrl.removeItemStackLine = function (index) {
                ctrl.cartonConfigurationTemplate.itemSpecLines.splice(index, 1);
            };
            ctrl.lpOnSelectPackageType = function () {
                ctrl.lpItemOnSelect(itemSpec.id, undefined);
            };

            ctrl.lpItemOnSelect = function (itemSpecId, productId) {
                if (itemSpecId) {
                    selectItemSpec(itemSpecId, productId, function (diverseFields) {
                        $scope.lpDiverseFields = diverseFields;
                        $scope.lpShowfieldsOther = [];
                        addOtherToDiverseFieldOptions($scope.lpDiverseFields, $scope.lpShowfieldsOther);
                    });
                }
            };

            $scope.uomItems = {};
            ctrl.onSelectItemSpec = function (itemSpecId, index, itemLine) {
                itemLine.unitId = null;
                itemService.searchItemUnits({ itemSpecId: itemSpecId }).then(function (response) {
                    $scope.uomItems[index] = response.units;
                });
            }

            $scope.searchUom = function (itemSpecId, index) {
                if (itemSpecId) {
                    itemService.searchItemUnits({ itemSpecId: itemSpecId }).then(function (response) {
                        $scope.uomItems[index] = response.units;
                    });
                }
            }
        };
        controller.$inject = ['$scope', '$state', '$stateParams', 'lincUtil', 'isAddAction', 'lpConfigurationTemplateService', '$mdDialog', 'itemService'];

        return controller;
    });
