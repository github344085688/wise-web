'use strict';

define(['./directives', 'lodash'], function (directives, _) {
    directives.directive('printerAutoComplete', ['$q', 'session', 'printService', function ($q, session, printService) {
        return {
            restrict: "E",
            templateUrl: 'common/directive/template/printerAutoComplete.html',
            scope: {
                ngModel: '=',
                name: '@',
                ifDisabled: '=',
                required: '@',
                onSelect: '&',
                allowClear: '@',
                types:'=',
                showType: '@'
            },
            link: function ($scope) {
                if (!$scope.allowClear) $scope.allowClear = false;
                $scope._onSelect = function (printer) {
                    if ($scope.onSelect) {
                        $scope.onSelect({ printer: printer });
                    }
                };
                var init = true;
                var watchModelInitialed = false;
                $scope.printers = [];

                $scope.getPrinters = function (keyword) {
                    var facility = session.getCompanyFacility().facility;
                    if(!facility) {
                        return;
                    }
                    var param = { printerName: keyword, warehouseId: facility.name};
                    if($scope.types) {
                        param.types = $scope.types;
                    }
                    if (init) {
                        printService.searchAvailablePrinters(param).then(function (response) {
                            $scope.printers = response;
                            if(!$scope.ngModel) {
                                setDefaultFacilityPrinter(param.types, facility);
                            }
                        });
                        init = false;
                    } else {
                        printService.searchAvailablePrinters(param).then(function (response) {
                            $scope.printers = response;
                        });
                    }
                };

                $scope.$watch("ngModel", function (val) {
                    if (!watchModelInitialed && val) {
                        printService.getPrinterById(val).then(function (data) {
                            if (_.findIndex($scope.printers, { id: data.id }) === -1) {
                                $scope.printers.push(data);
                            }
                        });
                        watchModelInitialed = true;
                    }
                });
                
                function setDefaultFacilityPrinter(types, facility) {
                    if(_.indexOf(types,"PDF") > -1 ) {
                        $scope.ngModel = facility.defaultPDFPrinter;
                    }else if(_.indexOf(types,"ZPL") > -1) {
                        $scope.ngModel = facility.defaultZPLPrinter;
                    } else if(_.indexOf(types,"RAW") > -1 ) {
                        $scope.ngModel = facility.defaultZPLPrinter;
                    } 
                    var printer = _.find($scope.printers, function(printer) { return printer.id == $scope.ngModel; });
                    if(printer){
                        $scope._onSelect(printer);
                    }
                    
                }
            }
        };
    }]);
});
