'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope, $resource, $mdDialog, printService) {
        $scope.printer = {}

        $scope.ZplPrinterSelect = function (printer) {
            $scope.printer.zplPrinters = printer;

        };

        $scope.PdfPrinterSelect = function (printer) {
            $scope.printer.pdfPrinters = printer;

        };

        $scope.save = function () {
            $mdDialog.hide($scope.printer);
        }
        $scope.cancel = function () {
            $mdDialog.cancel();
        };
    };

    controller.$inject = ['$scope', '$resource', '$mdDialog', 'printService'];

    return controller;
});