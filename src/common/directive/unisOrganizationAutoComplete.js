'use strict';

define(['./directives', 'lodash'], function(directives,_ ) {
    directives.directive('unisOrganizationAutoComplete', ['$q', '$timeout','organizationService','lincUtil', function($q,$timeout, organizationService,lincUtil) {
        return {
            restrict: "E",
            templateUrl: 'common/directive/template/unisOrganizationAutoComplete.html',
            scope: {
                ngModel: '=',
                name: '@',
                ngDisabled: '=',
                required: '@',
                onSelect:'&',
                tag: '@'

            },
            link: function($scope, element) {


                $scope.orgs = [];
                $scope.inputValue = "";
                element.find("ul").css("width", element.find("input").outerWidth());

                $scope.hideList = function(){
                    element.find("ul").hide();
                };

                $scope.showList = function(){
                    element.find("ul").show();
                };

                $scope.selectItem = function(org){
                    $scope.ngModel = org.id;
                    $scope.inputValue = org.name;
                };


                $scope.refreshOptions = function() {
                        var param = setupSearchParameter($scope.inputValue);
                        organizationService.getOrganizationByTagAndCustomerId(param).then(function(response){
                            $scope.orgs = lincUtil.extractOrganizationBasicField(response);
                        });
                };

                function setupSearchParameter(keyword){
                    var parameter = { scenario: 'Auto Complete'};
                    if($scope.tag) {
                        parameter.relationship = $scope.tag;
                        parameter.partnerName = keyword;
                    } else {
                        parameter.nameRegex = keyword;
                    }
                    return parameter;
                }


                $scope._onSelect = function(obj){
                    if($scope.onSelect) {
                        $scope.onSelect({obj: obj});
                    }
                };
            }
            
            
        };
    }]);
});
