'use strict';

define(['./directives', 'lodash'], function(directives,_ ) {
    directives.directive('invoiceCustomerComplete', ['$q', 'userService', function($q, userService) {
        return {
            restrict: "E",
            templateUrl: 'common/directive/template/invoiceCustomerComplete.html',
            scope: {
                ngModel: '=',
                name: '@',
                wisecompanys: '@',
                tmscompanys : '@'
            },
            link: function($scope) {
                $scope._onSelect = function(group){
                    if($scope.onSelect) {
                        $scope.onSelect({group: group});
                    }
                };
                $scope._onRemove = function(group){
                    if($scope.onRemove) {
                        $scope.onRemove({group: group});
                    }
                };

                $scope.invoiceCustomers = [];

                $scope.searchItemGroup = function(){
                };

                $scope.$watch("tmscompanys", function(val){
                    var param = { "api": "/api/Vendor/GetVendorByParameters",
                        "data": {
                            "Category":"Customer",
                            "CompanyIDs":JSON.parse($scope.tmscompanys)
                        }
                    }
                    if( param.data.CompanyIDs.length > 0){
                        searchInvoiceCustomer(param);
                    }

                });
                function searchInvoiceCustomer (param) {
                    userService.searchInvoiceCustomer(param).then(function(response){
                       var Result =  _.uniqWith(response.Result, _.isEqual);
                        $scope.invoiceCustomers = Result;
                        if($scope.ngModel && $scope.ngModel.length > 0) {
                            $scope.invoiceCustomers = _.differenceWith(Result, $scope.ngModel, function(value, other){
                                return value.AccountID === other;
                            });
                            $scope.invoiceCustomers = Result;
                        }else {
                            $scope.invoiceCustomers = Result;
                        }
                    });
                }

            }
        };
    }]);
});

