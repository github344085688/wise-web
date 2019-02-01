'use strict';

define(['lodash'], function(_) {
    var commitmentFieldConfController = function($scope, lincUtil, organizationService, commitmentFieldConfService) {

        $scope.customers = [];
        $scope.orderedFields = [];

        $scope.fieldList = [];


        function init() {
            $scope.freightTermList = ['Collect', 'Prepaid', 'Third Party'];
            $scope.defaultFields = ["Freight Term", "MABD", "Ship To"];
            getShipToList();
            $scope.config = {};
            $scope.config.orderedFields = [];
            $scope.config.freightTerms = $scope.freightTermList;
            $scope.config.shipTos = $scope.shipToList;
            $scope.config.mabd = "asc";

        }
        init();

        var getFieldConfig = function(customerId) {
            if (!customerId) {
                return;
            }
            commitmentFieldConfService.getConfigByCustomerId(customerId).then(function(response) {
                $scope.config = response;
                if (!$scope.config.id) {
                    $scope.config.id = customerId;
                }
                if ($scope.config.orderedFields) {
                    $scope.config.defaultFields = _.xor($scope.defaultFields, $scope.config.orderedFields);
                } else {
                    $scope.config.defaultFields = _.xor($scope.defaultFields, []);
                    //add new config
                    $scope.config.orderedFields = [];
                    $scope.config.freightTerms = $scope.freightTermList;
                    $scope.config.shipTos = $scope.shipToList;
                    $scope.config.mabd = "asc";
                }
            }, function() {
                $scope.config.defaultFields = _.xor($scope.defaultFields, []);
                //add new config
                $scope.config.orderedFields = [];
                $scope.config.freightTerms = $scope.freightTermList;
                $scope.config.shipTos = $scope.shipToList;
                $scope.config.mabd = "asc";
            });
        };

        function getShipToList() {
            //From Api
            $scope.shipToList = ['BestBuy', 'Wallmart', 'Target'];
        }

        $scope.getFieldDragListener = {
            containment: '#field-priority-container',
            dragMove: function(itemPosition, containment, eventObj) {
                eventObj.pageY -= 40;
            },
            accept: function(sourceItemHandleScope, destSortableScope, destItemScope) {
                return sourceItemHandleScope.sortableScope.$parent.$id === destSortableScope.$parent.$id;
            }
        };

        $scope.getFieldValueDragListener = function(index) {
            return {
                containment: '#field-value-priority-container-' + index,
                dragMove: function(itemPosition, containment, eventObj) {
                    eventObj.pageY -= 40;
                },
                accept: function(sourceItemHandleScope, destSortableScope, destItemScope) {
                    return sourceItemHandleScope.sortableScope.$parent.$id === destSortableScope.$parent.$id;
                }
            };
        };

        $scope.saveConfiguration = function() {
            $scope.loading = true;
            commitmentFieldConfService.saveConfiguration($scope.config).then(function(response) {
                $scope.loading = false;
                if (response.error) {
                    lincUtil.errorPopup("Error:" + response.error);
                    return;
                }
                lincUtil.saveSuccessfulPopup();
            }, function(error) {
                $scope.loading = false;
                lincUtil.errorPopup("Error:" + error.data.error);
            });
        };

        $scope.$watch('config.id', getFieldConfig);

        $scope.orderedFieldHas = function(field) {
            return _.indexOf($scope.config.orderedFields, field) >= 0;
        };

        $scope.hasOrderedFields = function() {
            if (!$scope.config.orderedFields) return false;
            return $scope.config.orderedFields.length > 0;
        };

    };

    commitmentFieldConfController.$inject = ['$scope', 'lincUtil', 'organizationService', 'commitmentFieldConfService'];

    return commitmentFieldConfController;
});
