/**
 * Created by Giroux on 2017/7/5.
 */

'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope, lincUtil) {
        $scope.fieldMapping = {};

        $scope.fieldMappingSelect = function (mapping, field) {
            var isDuplicate = false;
            _.forEach($scope.fieldMapping, function (val, key) {
                if (mapping === val && field !== key) {
                    isDuplicate = true;
                    return true;
                }
            });
            if (isDuplicate) {
                $scope.fieldMapping[field] = null;
            }
        };

        function isFiledMapped(item) {
            var isMapping = false;
            _.forEach($scope.fieldMapping, function (val, key) {
                if (val === item) {
                    isMapping = true;
                    return true;
                }
            });
            return isMapping;
        }

        $scope.getUnMapped = function () {
            var fields = [];
            _.forEach($scope.importUploadFields, function (field) {
                if (!isFiledMapped(field)) {
                    fields.push(field);
                }
            })
            return fields;
        };

        function isMapped() {
            var mapped = false;
            _.forEach($scope.fieldMapping, function (val, key) {
                if (val) {
                    mapped = true;
                    return true;
                }
            });
            if (!mapped) {
                var mesg = "Please set mapping file first!";
                lincUtil.errorPopup(mesg);
                throw new Error(mesg);
            }
        }

        function dataFormat(item) {
            var data = {};
            _.forEach($scope.fieldMapping, function (val, key) {
                if (item[val]) {
                    data[key] = item[val].trim();
                }
            });

            return data;
        }

        $scope.getData = function() {
            isMapped();

            var data = [];
            _.forEach($scope.importUploadData, function (item) {
                data.push(dataFormat(item));
            });

            return data;
        };

        $scope.getMappedValue = function (item, field) {
            var data = "";
            _.forEach($scope.fieldMapping, function (val, key) {
                if (key === field) {
                    data = item[val];
                    return;
                }
            });
            return data;
        };
    };

    return controller;
});