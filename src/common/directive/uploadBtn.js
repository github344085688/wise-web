/**
 * Created by Jerry on 2018/1/30.
 */

'use strict';

define(['jquery', 'lodash', './directives', 'src/common/upload/commomfileUploadController'], function ($, _, directives, commomfileUploadCtrl) {
    directives.directive('uploadBtn', ["$document", "$mdDialog",
        function ($document, $mdDialog) {

            return {
                restrict: "EA",
                templateUrl: 'common/directive/template/uploadBtn.html',

                scope: {
                    ngModel: '=',
                    stepId: '=',
                    loadId: '=',
                    orderId: '=',
                    type: '@',
                    app: '@',
                    module: '@',
                    service: '@',
                    savePicture: '&'
                },
                link: function ($scope, element) {

                    $scope.uploadFiles = function () {
                        var form = {
                            templateUrl: 'common/upload/template/upload.html',
                            autoWrap: true,
                            title: 'Upload  images',
                            locals: {
                                formTitle: "Upload images",
                                app: $scope.app ? $scope.app : 'wms',
                                module: $scope.module,
                                service: $scope.service ? $scope.service : 'takephoto'
                            },
                            controller: commomfileUploadCtrl
                        };

                        $mdDialog.show(form).then(function (fileIds) {
                            if (fileIds && fileIds.length > 0) {
                                var fileIds;
                                if ($scope.ngModel) {
                                    $scope.ngModel = fileIds = _.union($scope.ngModel, fileIds);
                                } else {
                                    fileIds = fileIds;
                                }
                                var param = { fileIds: fileIds, type: $scope.type, stepId: $scope.stepId, loadId: $scope.loadId, orderId: $scope.orderId }
                                $scope.savePicture({ param: param })
                            }
                        });
                    };

                }
            };
        }]);
});
