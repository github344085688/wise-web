'use strict';

define(['./directives', 'angular', 'lodash'], function (directives, angular, _) {
    directives.directive('receiptSearchForm', ['lincResourceFactory', 'userService', 'session',
        function (lincResourceFactory, userService, session) {
        return {
            restrict: "AE",
            templateUrl: 'common/directive/template/receiptSearchForm.html',
            scope: {
                isLoading: '=',
                isExporting: '=',
                searchReceipts: '&',
                exportReceipt: '&',
                hideProperties: '='
            },
            link: function ($scope, elem, attrs) {
                $scope.receipt = {};
                $scope.sorts=['Expiration date'];
                $scope._searchReceipts = function(){
                    if($scope.searchReceipts) {
                        var searchParam = getSearchParam();
                        $scope.searchReceipts({searchParam: searchParam});
                    }
                };

                $scope.keyUpSearch = function ($event) {
                    if(!$event){
                        return;
                    }
                    if ($event.keyCode === 13) {
                        $scope._searchReceipts();
                    }
                    $event.preventDefault();
                }

                function getSearchParam() {
                    var searchParam = angular.copy($scope.receipt);
                    if(searchParam.expirationDate){
                        searchParam.sortingFields=[];
                        searchParam.sortingFields.push('expirationDate');
                    }
                    if($scope.isAdvanced) {
                        delete searchParam.keyword;

                    }else {
                        if(!searchParam.keyword) {
                            searchParam = {};
                        }else {
                            searchParam = {keyword: searchParam.keyword};
                        }
                       
                    }
                    return searchParam;
                }

                $scope.getStatusList = function(name) {
                    return lincResourceFactory.getReceiptStatus(name).then(function(response) {
                        $scope.statusList = response;
                    });
                };

                $scope._exportReceipt = function () {
                    if ($scope.exportReceipt) {
                        var searchParam = getSearchParam();
                        $scope.exportReceipt({searchParam: searchParam});
                    }
                };

                $scope.getUsers = function (keyword) {
                    var param = {keyword: keyword, scenario: 'Auto Complete'};
                    var currentCf = session.getCompanyFacility();
                    if(currentCf) {
                        param.facilityId = currentCf.facilityId;
                    }
                    userService.searchUsers(param).then(function (response) {
                        $scope.users = response;
                    });
                };

                $scope.getUserName = function (user) {
                    if (!user) return "";
                    if (user.firstName && user.lastName) {
                        return user.firstName + " " + user.lastName + ' ( ' + user.username + ' ) ';
                    }
                    return user.username;
                };
            }
        };
    }])
});
