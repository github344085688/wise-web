'use strict';

define(['./directives', 'timePicker'], function (directives, timePicker) {
    directives.directive('ltDateTime', ['moment', function (moment) {
        return {
            restrict: "AE",
            templateUrl: 'common/directive/template/ltDateTime.html',
            scope: {
                value: '=',
                dateFormat: '@',
                minuteStep: '@',
                minView: '@',
                placeholder: '@',
                disabled: "=ngDisabled",
                pickerPosition: '@',
                smallView : "@",
                required: '@',
                isSetStartData: '@'
            },
            link: function(scope, element) {
                element.find("div").datetimepicker({
                    autoclose: true,
                    minuteStep: parseInt(scope.minuteStep) || 1,
                    minView:  parseInt(scope.minView) || 0,
                    format:  scope.dateFormat || "yyyy-mm-dd hh:ii:ss",
                    startDate: scope.isSetStartData ? new Date() : '',
                    pickerPosition: scope.pickerPosition || "bottom-left"
                }).on('changeDate', function(ev){
                    scope.value = moment(element.find("input").val()).format("YYYY-MM-DDTHH:mm:ss");
                    scope.$apply();
                });
                scope.$watch("value", function (data) {
                    if (data) {
                        element.find("div").datetimepicker('setValue');
                        scope.inputValue = data;
                    } else {
                        scope.inputValue = "";
                    }
                });
                scope.$watch("inputValue", function (data) {
                    if (!data) {
                        scope.value = null;
                    }
                });
            }
        };
    }]);
});
