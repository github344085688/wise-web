'use strict';

define([
    'angular',
    'src/foundation-data/sop/sopListPageController',
    'src/foundation-data/sop/editSopPageController'
], function(angular, sopListCtrl, editSopCtrl, sopService) {

    angular.module('linc.fd.sop', [])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('fd.sop.list', {
                url: '/list',
                templateUrl: 'foundation-data/sop/template/list.html',
                controller: 'SopListCtrl',
                controllerAs: "ctrl"
            }).state('fd.sop.add', {
                url: '/add',
                templateUrl: 'foundation-data/sop/template/edit.html',
                controller: 'EditSopCtrl',
                controllerAs: "ctrl",
                resolve: {
                    'isAddAction': function(){
                        return true;
                    }
                }
            }).state('fd.sop.edit', {
                url: '/edit/:sopId',
                templateUrl: 'foundation-data/sop/template/edit.html',
                controller: 'EditSopCtrl',
                controllerAs: "ctrl",
                resolve: {
                    'isAddAction' : function(){
                        return false;
                    }
                }
            });
        }])
        .controller("SopListCtrl", sopListCtrl)
        .controller("EditSopCtrl", editSopCtrl);

});
