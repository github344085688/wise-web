'use strict';

define([], function () {
    var controller = function ($scope, $state,$transition$) {
        var ctrl = this;

        ctrl.changeTab = function (tab) {
            $scope.activetab = tab;
            if (tab === 'singleTemplateList') {
                $state.go("fd.lpConfigurationTemplate.main.singleTemplateList");
            } else if (tab === 'singleTemplateAdd') {
                $state.go("fd.lpConfigurationTemplate.main.singleTemplateAdd");
            } else if (tab === 'singleTemplateEdit') {
                $state.go("fd.lpConfigurationTemplate.main.singleTemplateEdit");
            } else if (tab === 'multipleTemplateList') {
                $state.go("fd.lpConfigurationTemplate.main.multipleTemplateList");
            } else if (tab === 'multipleTemplateAdd') {
                $state.go("fd.lpConfigurationTemplate.main.multipleTemplateAdd");
            } else if (tab === 'multipleTemplateEdit') {
                $state.go("fd.lpConfigurationTemplate.main.multipleTemplateEdit");
            }
        };

        function init() {
            if($transition$.params().activeTab) {
                ctrl.changeTab($transition$.params().activeTab);
            } else {
                ctrl.changeTab("singleTemplateList");
            }

        }
        init();
    };
    controller.$inject = ['$scope', '$state','$transition$'];
    return controller;
});
