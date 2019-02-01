'use strict';

define(['angular'], function(angular) {
    var ctrl = function($scope, organizationRelationshipService, $http, lincUtil, session) {
       
        $scope.pageSize = 10;
        $scope.tagList = ["Customer", "Title", "Supplier", "Brand", "Retailer", "Tenant"];
        $scope.searchInfo = { };
        $scope.searchOrganizationCompleted = true;

        $scope.loadContent = function(currentPage) {
            var searchParam = angular.copy($scope.searchInfo);
            searchParam.paging = {pageNo: Number(currentPage), limit: Number($scope.pageSize)};
            $scope.searchOrganizationCompleted = false;
            organizationRelationshipService.relationshipSearchByPaging(searchParam).then(function (response) {
                $scope.searchOrganizationCompleted = true;
                $scope.organizations = response.organizations;
                $scope.paging = response.paging;
            },function(error) {
                $scope.searchOrganizationCompleted = true;
                if (error) {
                    lincUtil.errorPopup('Error! ' + error.data.error);
                }
            });
        };


        $scope.keyUpSearch = function ($event) {
            if(!$event){
                return;
            }
            if ($event.keyCode === 13) {
                $scope.loadContent(1);
            }
            $event.preventDefault();
        }

        $scope.search = function() {
            $scope.loadContent(1);
        };

        function _init() {
            $scope.searchInfo = {organizationId: session.getCompanyFacility().companyId};
            $scope.loadContent(1);
        }
        $scope.export = function() {
            if ($scope.exporting) return;
            $scope.exporting = true;
            $http.post("/report-center/organization/export", $scope.searchInfo, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                if (res.data.byteLength == 0) {
                    lincUtil.errorPopup("Export failed!");
                    $scope.exporting = false;
                    return;
                }
                lincUtil.exportFile(res, "organization  .xlsx");
                $scope.exporting = false;
            }, function (error) {
                lincUtil.bufferErrorPopup(error);
                $scope.exporting = false;
            });
        };

        _init();
      
    };
    ctrl.$inject = ['$scope', 'organizationRelationshipService', '$http', 'lincUtil', 'session'];
    return ctrl;
});
