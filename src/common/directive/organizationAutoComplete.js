'use strict';

define(['./directives', 'lodash'], function(directives,_ ) {
    directives.directive('organizationAutoComplete', ['$q', 'organizationService',
        'organizationRelationshipService', 'lincUtil',
        function($q, organizationService, organizationRelationshipService, lincUtil) {
        return {
            restrict: "E",
            templateUrl: 'common/directive/template/organizationAutoComplete.html',
            scope: {
                ngModel: '=',
                tag: '@',
                name: '@',
                ngDisabled: '=',
                required: '=',
                onSelect:'&',
                onSelectParam: '=',
                allowClear: '@',
                customCtrl: '=',
                customerId: '=',
                isSearchAllFacilities: '@'
            },
            link: function($scope, element) {
                var isManualRefreshOptionsByCustomer = false;
                if(!$scope.allowClear) $scope.allowClear = false;
                $scope._onSelect = function(org){
                    if($scope.onSelect) {
                        $scope.onSelect({org: org, param: $scope.onSelectParam });
                    }
                };
                var watchModelInitialed = false;
                var hasClicked = false;
                $scope.orgs = [];
                
                $scope.internalController = $scope.customCtrl || {};
                $scope.internalController.manualRefreshOptions = function (customerId) {
                    $scope.ngModel = null;
                     if(customerId) {
                         $scope.customerId = customerId;
                         isManualRefreshOptionsByCustomer = true;
                         var param = {scenario: 'Auto Complete', customerId: $scope.customerId};
                         if($scope.tag) param.relationship = $scope.tag;
                         organizationService.getOrganizationByTagAndCustomerId(param).then(function(response){
                             $scope.orgs = lincUtil.extractOrganizationBasicField(response);
                             var orgsKeyByCustomerId = _.keyBy($scope.orgs,'id');
                             if(!orgsKeyByCustomerId[$scope.ngModel]) {
                                 getOrgByIdAndConcatToOrgs($scope.ngModel);
                             }
                         });
                     }
                };

                function setupSearchParameter(keyword){
                    var parameter = { scenario: 'Auto Complete', customerId: $scope.customerId, isSearchAllFacilities: $scope.isSearchAllFacilities};
                    if($scope.tag) {
                        parameter.relationship = $scope.tag;
                        parameter.partnerName = keyword;
                    } else {
                        parameter.nameRegex = keyword;
                    }
                    return parameter;
                }
                
                $scope.onClick = function () {
                    if(hasClicked || isManualRefreshOptionsByCustomer) {
                        return;
                    }
                    hasClicked = true;
                    var param = setupSearchParameter(null);
                    organizationService.getOrganizationByTagAndCustomerId(param).then(function(response){
                        var orgs = lincUtil.extractOrganizationBasicField(response);
                        if(watchModelInitialed && _.findIndex(orgs, {id: $scope.orgs[0].id})< 0) {
                            $scope.orgs = _.concat($scope.orgs, orgs)
                        }else {
                            $scope.orgs = orgs;
                        }
                    });
                };

                $scope.getOrganizations = function(keyword){
                    if (!isManualRefreshOptionsByCustomer && hasClicked == false) {
                        return;
                    }
                    var param = setupSearchParameter(keyword);
                    organizationService.getOrganizationByTagAndCustomerId(param).then(function(response){
                        $scope.orgs = lincUtil.extractOrganizationBasicField(response);
                    });
                };

                $scope.$watch("ngModel", function(val){
                    if(!watchModelInitialed && val && _.findIndex($scope.orgs, {id:val})< 0) {
                        getOrgByIdAndConcatToOrgs(val);
                        watchModelInitialed = true;
                    }
                    if(!val){
                        $scope.ngModel = null;
                    }
                });

                function getOrgByIdAndConcatToOrgs(orgId) {
                    if(!orgId) return;
                    organizationService.getOrganizationById(orgId).then(function(data){
                        var basicInfoOrgs = lincUtil.extractOrganizationBasicField([data]);
                        $scope.orgs = _.concat($scope.orgs, basicInfoOrgs);
                    });
                }
            }
        };
    }]);
});
