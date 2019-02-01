'use strict';

define(['./directives', 'lodash'], function(directives,_ ) {
    directives.directive('multipleOrganizationRelationshipAutoComplete', ['$q',
        'organizationService','lincUtil', function($q,organizationService,lincUtil) {
        return {
            restrict: "E",
            templateUrl: 'common/directive/template/multipleOrganizationAutoComplete.html',
            scope: {
                ngModel: '=',
                tag: '@',
                name: '@',
                required: '@',
                onSelect: '&',
                onRemove: '&',
                customerId: '='
            },
            link: function($scope) {
                $scope._onSelect = function(org){
                    if($scope.onSelect) {
                        $scope.onSelect({org: org});
                    }
                };
                $scope._onRemove = function(org){
                    if($scope.onRemove) {
                        $scope.onRemove({org: org});
                    }
                };
                var init = true;
                $scope.orgs = [];

                function initialOrganizationWithModel(param){
                    if($scope.tag) param.relationship = $scope.tag;
                    organizationService.getOrganizations({ids:$scope.ngModel}).then(function(data){
                        $scope.orgs = lincUtil.extractOrganizationBasicField(data);
                        organizationService.getOrganizationByTagAndCustomerId(param).then(function(data1){
                            $scope.orgs = _.unionBy(lincUtil.extractOrganizationBasicField(data1), data, 'id');
                        });
                    });
                }

                $scope.getOrganizations = function(keyword){
                    var param = {scenario: 'Auto Complete'};
                    if($scope.tag) param.relationship = $scope.tag;
                    if(keyword && keyword !== ""){
                        param.partnerName = keyword
                    }
                    addCustomerIdToSearchParam(param);
                    if(init){
                         if($scope.ngModel && $scope.ngModel.length > 0) {
                             initialOrganizationWithModel(param);
                         } else {
                             organizationService.getOrganizationByTagAndCustomerId(param).then(function(response){
                                 $scope.orgs = lincUtil.extractOrganizationBasicField(response);
                             });
                         }
                         init = false;
                     } else {
                         organizationService.getOrganizationByTagAndCustomerId(param).then(function(response){
                             if($scope.ngModel){
                                 $scope.orgs = _.differenceWith(lincUtil.extractOrganizationBasicField(response), $scope.ngModel, function(value, other){ return value.id === other;});
                             } else  {
                                 $scope.orgs = lincUtil.extractOrganizationBasicField(response);
                             }

                         });
                     }
                 };

                $scope.$watch("ngModel", function(val){
                    var param = {scenario: 'Auto Complete'};
                    if($scope.tag) param.relationship = $scope.tag;
                        if(init) {
                            if(val && val.length > 0) {
                                initialOrganizationWithModel();
                            } else {
                                organizationService.getOrganizationByTag(param).then(function(response){
                                    $scope.orgs = lincUtil.extractOrganizationBasicField(response);
                                });
                            }
                            init = false;
                        } else {
                            if(val && val.length > 0) {
                                organizationService.getOrganizations({ids:val}).then(function(data){
                                    $scope.orgs = _.unionBy($scope.orgs, lincUtil.extractOrganizationBasicField(data), 'id');
                                });
                            } else {
                                organizationService.getOrganizationByTag(param).then(function(response){
                                    $scope.orgs = lincUtil.extractOrganizationBasicField(response);
                                });
                            }
                        }
                });

                function addCustomerIdToSearchParam(param) {
                    if($scope.customerId) {
                        param.customerId = $scope.customerId;
                    }
                }
            }
        };
    }]);
});
