'use strict';

define([
    './factories',
    'lodash',
    'angular'
], function(factories, _, angular) {
    factories.factory('filterDiverseService', function() {
        var service = {orginalDiverseFields:{}, orginalDiverseValuesMap: {}};
        var orginalFilterFieldOrder;
        var diverseFields;
        // var selectedProductMap;
        var filterFieldOrder;
        var diverses;

        service.getInitDiverseValuesMap = function(filterDiverseFields, filterDiverses) {
            diverseFields = filterDiverseFields;
            diverses = filterDiverses;
            var diverseValuesMap = getDiverseFieldValuesMap();
            // initSetSelectedProductMap();
            filterFieldOrder = [];
            getCompleteFilterFieldOrder();
            if(filterFieldOrder.length > 0)
            {
                filterDiverse(0, diverseValuesMap);
            }
            service.orginalDiverseValuesMap = angular.copy(diverseValuesMap);
            service.orginalDiverseFields = angular.copy(diverseFields);
            orginalFilterFieldOrder = angular.copy(filterFieldOrder);
            return diverseValuesMap;
            // $scope.diverseValuesMap = diverseValuesMap;
        }

        service.resetFilter = function (filterDiverseFields) {
            filterFieldOrder = angular.copy(orginalFilterFieldOrder);
            diverseFields =  filterDiverseFields;
            // initSetSelectedProductMap();
            // var diverseValuesMap = getDiverseFieldValuesMap();
        };



        function getNoSelectProductProperties() {
            var propertyIds = _.map(diverseFields, "propertyId");
            return _.difference(propertyIds, filterFieldOrder);
        }

        function filterDiverse(filterIndex, diverseValuesMap) {
            var diverseFieldsLen =diverseFields.length;
            var diversesFilter = angular.copy(diverses);
            var filterLen = filterFieldOrder.length;
            var noFilterPropertyIds = getNoSelectProductProperties();
            for(var i=filterIndex; i<filterLen; i++)
            {
                diversesFilter = filterDiverseUserSelectedProcuct(i, filterIndex, diversesFilter);
               
                if(i == filterLen - 1 && i< diverseFieldsLen-2)
                {
                    angular.forEach(noFilterPropertyIds, function (pId) {
                        setPropertyValues(diverseValuesMap, pId,  diversesFilter);
                    });

                }else if(i < filterLen - 1)
                {
                    var propertyId = filterFieldOrder[i + 1];
                    setPropertyValues(diverseValuesMap, propertyId,  diversesFilter);
                }
            }
        }

        function filterDiverseUserSelectedProcuct(index, filterIndex, diversesFilter) {

            if(index == filterIndex)
            {
                for(var i=0; i<=index; i++) {
                    diversesFilter = filterDiverseBySelectedProduct(i,diversesFilter);
                }
            }else
            {
                diversesFilter = filterDiverseBySelectedProduct(index, diversesFilter);
            }
            return diversesFilter;
        }

        function filterDiverseBySelectedProduct(index, diversesFilter)
        {
            var filterPropertyId = filterFieldOrder[index];
            var field = _.find(diverseFields, {propertyId: filterPropertyId});
            var selectedProduct = field.selectedProduct;
            if(selectedProduct)
            {
                diversesFilter = _.filter(diversesFilter, function (diverse) {
                    return ifMatchDiverse(diverse.diverseProperties, selectedProduct);
                });
            }
            return diversesFilter;
        }
        function setPropertyValues(diverseValuesMap, propertyId, diversesFilter) {
            var values = getValuesMapByPropertyId(diversesFilter, propertyId);
            diverseValuesMap[propertyId] = values;
            ifClearFieldValue(propertyId, values);
        }

        function ifClearFieldValue(propertyId, values) {
            var field = _.find(diverseFields, {propertyId: propertyId});
            if(values.length == 1)
            {
                field.selectedProduct = values[0];
            }else {
                var selectedProduct = field.selectedProduct;
                if(selectedProduct && !ifMatchDiverse(values, selectedProduct))
                {
                    field.selectedProduct = null;
                }
            }
        }

        function getValuesMapByPropertyId(diverses, propertyId)
        {
            var values = [];
            diverses.forEach(function (diverse) {
                var diverseProperty = _.find(diverse.diverseProperties, {propertyId: propertyId});
                values.push(diverseProperty);
            });

            if(values.length > 1)
            {
                values = _.uniqWith(values, function (one, other) {
                    return one.unit === other.unit && one.value === other.value;
                });
            }

            return values;
        }


        service.filterDiverseByField = function(propertyId, diverseValuesMap)
        {
            insertPropertyIdToSelectOrder(propertyId);
            var selectIndex = filterFieldOrder.indexOf(propertyId);
            filterDiverse(selectIndex, diverseValuesMap);
        }

        function getDiverseFieldValuesMap() {
            var diverseValueMap = {};
            angular.forEach(diverseFields, function (diverseField) {
                diverseValueMap[diverseField.propertyId] = angular.copy(diverseField.availableDiverseValues);
            });
            return diverseValueMap;
        }

        function ifMatchDiverse(arrs, selectedProduct)
        {
            var matchObj = {};
            if(selectedProduct.unit)
            {
                matchObj = _.find(arrs,
                    {
                        'propertyId': selectedProduct.propertyId,
                        'value': selectedProduct.value,
                        'unit': selectedProduct.unit
                    });
            }else
            {
                matchObj = _.find(arrs,
                    {
                        'propertyId': selectedProduct.propertyId,
                        'value': selectedProduct.value
                    });
            }
            if(matchObj) return true;
            else return false;
        }

        function insertPropertyIdToSelectOrder(propertyId) {
            if(filterFieldOrder.indexOf(propertyId) < 0)
            {
                filterFieldOrder.push(propertyId);
            }
        }

        function getCompleteFilterFieldOrder() {
            angular.forEach(diverseFields, function (diverseField) {
                if(diverseField.selectedProduct)
                {
                    insertPropertyIdToSelectOrder(diverseField.propertyId);
                }
            });
        }
        return service;
    });


});
