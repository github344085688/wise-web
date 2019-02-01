'use strict';

define(["lodash", "./editAutoGenerationCustomerMaterialController"], function (_, editAutoGenerationCustomerMaterialController) {
  var controller = function ($scope, $http, $mdDialog, lincUtil, customerMaterialService) {
    $scope.pageSize = 10;
    $scope.searchInfo = { status: 'Pending' };

    function searchCustomerMaterialList (searchParam, currentPage) {
      $scope.loading = true;

      var param = angular.copy(searchParam);
      param.paging = { pageNo: Number(currentPage), limit: Number($scope.pageSize) };

      customerMaterialService.searchByPagingAutoGenerationCustomerMaterial(param).then(function (data) {
        $scope.loading = false;
        $scope.paging = data.paging;
        $scope.autoGenerationMaterialList = data.results;
      }, function (error) {
        $scope.loading = false;
        lincUtil.processErrorResponse(error);
      });
    }


    $scope.keyUpSearch = function ($event) {
      if (!$event) {
        return;
      }
      if ($event.keyCode === 13) {
        $scope.search();
      }
      $event.preventDefault();
    }

    $scope.search = function () {
      searchCustomerMaterialList($scope.searchInfo, 1);
    };

    $scope.loadContent = function (currentPage) {
      searchCustomerMaterialList($scope.searchInfo, currentPage);
    };

    function _init () {
      searchCustomerMaterialList($scope.searchInfo, 1);
    }
    _init();

    $scope.approveAutoGenerationCustomerMaterial = function (id) {
      customerMaterialService.approveAutoGenerationCustomerMaterial(id).then(function () {
        lincUtil.messagePopup('Message', 'Approve Successful');
        _init();
      }, function (error) {
        lincUtil.processErrorResponse(error);
      });
    }

    $scope.createOrUpdateAutoGenerationCustomerMaterial = function (id) {
      var form = {
        templateUrl: 'wms/material-manage/template/editAutoGenerationCustomerMaterial.html',
        locals: {
          id: id
        },
        autoWrap: true,
        controller: editAutoGenerationCustomerMaterialController
      };
      $mdDialog.show(form).then(function (response) {
        _init();
      });
    }

    $scope.deleteAutoGenerationCustomerMaterial = function (id) {
      lincUtil.deleteConfirmPopup("Are you sure to delete this Auto Generation Customer Materia?", function () {
        customerMaterialService.deleteAutoGenerationCustomerMaterial(id).then(function (response) {
          lincUtil.messagePopup("Success", "Delete Successful");
          _init();
        }, function (error) {
          lincUtil.processErrorResponse(error);
        });
      });
    }



  };
  controller.$inject = ['$scope', '$http', '$mdDialog', 'lincUtil', 'customerMaterialService'];
  return controller;
});
