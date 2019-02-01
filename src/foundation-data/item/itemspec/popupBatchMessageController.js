'use strict';

define(['lodash', 'moment'], function (_, moment) {
    var waitingConfirmController = function ($scope, $state, $mdDialog, itemService, ItemSpecFieldIdMap, updateSucessIds, availablePropertiesMap, specFieldMapItemName, titleName, checkItemIds) {

        $scope.updateSucessIds = _.map(updateSucessIds, 'id');
        $scope.ItemSpecFieldIdMap = ItemSpecFieldIdMap;
        $scope.availablePropertiesMap = availablePropertiesMap;
        $scope.specFieldMapItemName = specFieldMapItemName;
        $scope.titleName = titleName;
        $scope.itemSpecInfo = [];
        if ($scope.titleName == "Add") {
            getItemProperties(checkItemIds);
        } else {
            integrateDate();
        }

        function getItemProperties(checkItemIds) {
            itemService.itemSearch({ "ids": checkItemIds }).then(function (response) {

                $scope.specFieldMapItemName = _.keyBy(response, "name");
                _.forEach($scope.specFieldMapItemName, function (value, key) {

                    var diverseFasleFields = _.filter(value.fields, function (item) {
                        return item.diverse == false;

                    });
                    var specFieldIds = _.flattenDeep(_.map(diverseFasleFields, 'id'));
                    $scope.specFieldMapItemName[key] = specFieldIds;
                });
                var itemPropertys = _.flattenDeep(_.map(response, function (item) {
                    if (item.hasOwnProperty('fields')) {
                        return item.fields
                    }
                    else {
                        return [];
                    }
                }));

                var filterFalseDiversePropertys = _.filter(itemPropertys, function (item) {
                    return item.diverse == false;
                });

                $scope.ItemSpecFieldIdMap = _.keyBy(filterFalseDiversePropertys, 'id');

                integrateDate();

            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        function integrateDate() {
            _.forEach($scope.specFieldMapItemName, function (specFieldIds, name) {
                var filedIds = [];

                _.forEach(specFieldIds, function (fieldId) {
                    if (_.indexOf($scope.updateSucessIds, fieldId) > -1) {
                        filedIds.push(fieldId);
                    }
                });

                if (filedIds.length > 0) {
                    $scope.itemSpecInfo.push({ 'name': name, 'filedIds': filedIds });
                }

            });
        }

        $scope.cancel = function () {
            $mdDialog.cancel();
        };
    };


    waitingConfirmController.$inject = ['$scope', '$state', '$mdDialog', 'itemService', 'ItemSpecFieldIdMap', 'updateSucessIds', 'availablePropertiesMap', 'specFieldMapItemName', 'titleName', 'checkItemIds'];
    return waitingConfirmController;

});
