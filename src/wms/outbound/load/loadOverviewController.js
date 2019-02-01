'use strict';

define([
    'angular',
    'lodash',
    'moment'
], function (angular, _, moment) {

    var controller = function ($scope, $state, $stateParams,
        $resource, loadsService, entryService, addressService, lincUtil,fileService) {
        var load = {};
        init();
        function init() {
            $scope.retailers = ['AAFE', 'AMAZON', 'TARGET', 'BESTBUY'];
            if ($stateParams && $stateParams.loadId) {
                loadsService.getLoad($stateParams.loadId).then(function (response) {
                    $scope.load = response;
                    $scope.load.orderLines = $scope.load.orders;
                    if($scope.load.customerCollectLongHaulWhenCommit) {
                        buildLongHualWarningMessage();
                    }
                });
                getLoadPhoto($stateParams.loadId);
            }
            $scope.activeTab = 'info';
        }

        function buildLongHualWarningMessage() {
            if (!$scope.load.longHaulId) {
                $scope.warningMessage = "Long Haul is empty, the orderlines will not be able to generate the sequences.";
            } else {
                if (_.filter($scope.load.orderLines, function (orderline) {
                        return !orderline.sequence;
                    }).length > 0) {
                    $scope.warningMessage = "Some orderlines sequence are empty, please review the selected Long Haul and selected orders.";
                }
            }
        }

        function isTransloadLoad() {
            return _.every($scope.load.orderLines ,'isTransload');
        }

        function doesLoadHasTrailers() {
            if($scope.load.trailers && $scope.load.trailers.length>0 ){
                var areTrailersValid =_.every( $scope.load.trailers , function(trailer){
                        return ! trailer.toLowerCase().startsWith('load');
                    });
                if(!areTrailersValid){
                    return false;
                }
                return true;
            }
            return false;
        }

        $scope.print = function (loadId) {
            if(isTransloadLoad() && !doesLoadHasTrailers()){
                lincUtil.errorPopup("Error: Trailer# is required for printing MBOL, please double check.");
                return;
            }
            $scope.isOrderLoading=true;
            lincUtil.setPropetyToFalseAfterSeconds($scope, "isOrderLoading");
            if (loadId) {
                var url = $state.href('bolPrint', { loadId: loadId });
                window.open(url);
            }

        };
       

        $scope.printMasterBOL = function (loadId) {
            if(isTransloadLoad() && !doesLoadHasTrailers()){
                lincUtil.errorPopup("Error: Trailer# is required for printing MBOL, please double check.");
                return;
            }
            $scope.isMasterLoading=true;
            lincUtil.setPropetyToFalseAfterSeconds($scope, "isMasterLoading");
            if (loadId) {
                var url = $state.href('mbolPrint', { loadId: loadId });
                window.open(url);
            }
        };

        $scope.printOrderBol = function (loadId, orderId) {
            if(isTransloadLoad() && !doesLoadHasTrailers()){
                lincUtil.errorPopup("Error: Trailer# is required for printing MBOL, please double check.");
                return;
            }
            if (loadId) {
                if ($scope.load.status != "Loaded" && $scope.load.status != "Shipped") {
                    lincUtil.messagePopup("Tip", "BOL information may not be complete!", function () {
                        var url = $state.href('orderBolPrint', { loadId: loadId, orderId: orderId });
                        window.open(url);
                    });
                } else {
                    var url = $state.href('orderBolPrint', { loadId: loadId, orderId: orderId });
                    window.open(url);
                }
            }
        };

        $scope.printPackingListPrint = function (loadId, orderId) {
            if (loadId) {
                var url = $state.href('loadPackingListPrint', { loadId: loadId, orderId: orderId });
                window.open(url);

            }
        };

        $scope.printShipToBol = function (loadId) {
            if(isTransloadLoad() && !doesLoadHasTrailers()){
                lincUtil.errorPopup("Error: Trailer# is required for printing MBOL, please double check.");
                return;
            }
            $scope.isShipLoading=true;
            lincUtil.setPropetyToFalseAfterSeconds($scope, "isShipLoading");
            if (loadId) {
                var url = $state.href('loadByShipToBolPrint', { loadId: loadId });
                window.open(url);

            }
        };

        $scope.printMasterLoadingTicket = function(loadId) {
            $scope.isMLTLoading = true;
            lincUtil.setPropetyToFalseAfterSeconds($scope, "isMLTLoading");
            if (loadId) {
                var url = $state.href('materLoadingTicketPrint', { loadId: loadId });
                window.open(url);
            }
        };

        $scope.printUCCLabel = function (orderId, shipTo) {
            var shipToOrg = getShipToOrganization(shipTo);
            if (orderId) {
                var url = $state.href('uccLabelPrint', { orderId: orderId, retailer: _.toUpper(shipToOrg) });
                window.open(url);
            }
        };

        function getShipToOrganization(shipTo) {
            if (shipTo && _.trim(shipTo).length > 0) {
                return _.split(shipTo, "\n")[0];
            }
            return "";
        }


        $scope.isValidUCC = function (shipTo) {
            var shipToOrg = getShipToOrganization(shipTo);
            return _.indexOf($scope.retailers, _.toUpper(shipToOrg)) > -1;
        };

        $scope.editLoad = function (loadId) {
            $state.go('wms.outbound.load.edit', { 'loadId': loadId });
        };

        $scope.loadOrderFile = function (order) {
            loadsService.getFileIdByShippingAddress($scope.load.id, order.id).then(function (response) {
                if (response && response.length > 0) loadFile(response[0]);
            }, function (err) {
                lincUtil.processErrorResponse(err);
            });

        };

        function getLoadPhoto(loadId) {
            entryService.getEntryPhotos({ tags: [loadId] }).then(function (response) {
                $scope.photos = [];
                _.forEach(response, function (photo) {
                    $scope.photos.push({
                        id: photo.id,
                        photoType: photo.fileScenario,
                        url: "/file-app/file-download/" + photo.fileId,
                        createTime: photo.createdWhen
                    });
                });
                $scope.loadPhotos = _.groupBy($scope.photos, "photoType");
            });
        }

        $scope.formatTime = function (time) {
            if (time) {
                return moment(time).format("YYYY-MM-DD HH:mm:ss");
            } else return "";
        };

        function loadFile(fileId) {
            var a = document.createElement('a');
          
            a.href =   fileService.buildItemDownloadUrl(fileId);
            a.download = fileId.toString() + ".pdf";
            a.target = '_blank';
            a.click();
        }

        $scope.changeTab = function (tab) {
            $scope.activeTab = tab;
        };

        $scope.getAddressInfo = function (addressObject) {
            return addressService.generageAddressData(addressObject, null);
        }
    };

    controller.$inject = ['$scope', '$state', '$stateParams',
        '$resource', 'loadsService', 'entryService', 'addressService', 'lincUtil', 'fileService'];
    return controller;
});
