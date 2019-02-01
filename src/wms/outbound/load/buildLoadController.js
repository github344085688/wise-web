'use strict';

define([
    'angular',
    'lodash',
    './orderImportSelectController',
    './extractOrderBOLNoteController'
], function (angular, _, orderImportSelectController, extractOrderBOLNoteController) {
    var controller = function ($scope, $resource, $mdDialog, orderService, $state, $stateParams,
        loadOrderSelectService, loadsService, lincResourceFactory, addressService,
        organizationService, lincUtil) {

        $scope.pager = { pageSize: 5 };
        function fromEdit(loadId) {
            loadsService.getLoad(loadId).then(function (response) {
                $scope.load = response;
                $scope.load.orderLines = $scope.load.orders;
                buildLongHualWarningMessage();
                $scope.loadContent(1);
            });
        }

        $scope.refillLoadInfo = function () {
            loadOrderSelectService.refillLoadInfo = true;
            lincUtil.messagePopup("Tip", "Next time the load information may be refilled when add order lines.");
        };

        $scope.addOrderLine = function () {
            loadOrderSelectService.setLoad($scope.load);
            if ($scope.isNew) {
                $state.go('wms.outbound.load.add.orderSelect', { customerId: $scope.load.customerId });
            } else {
                $state.go('wms.outbound.load.edit.orderSelect', { customerId: $scope.load.customerId });
            }
        };

        $scope.extractOrderBOLNote = function () {
            var form = {
                templateUrl: 'wms/outbound/load/template/extractOrderBOLNote.html',
                locals: {
                    loadNote: $scope.load.note,
                    orders: $scope.load.orderLines
                },
                autoWrap: true,
                controller: extractOrderBOLNoteController
            };
            $mdDialog.show(form).then(function (response) {
                $scope.load.note = response;
                var param = {};
                param.note = response;
                param.id = $scope.load.id;
                $scope.loading = true;
                loadsService.updateLoadWithOrderLines(param).then(function (response) {
                    $scope.loading = false;
                    if (response.error) {
                        lincUtil.errorPopup('Save Error! ' + response.error);
                        return;
                    }
                    lincUtil.updateSuccessfulPopup(function () {
                        $state.go('wms.outbound.load.view', { loadId: $stateParams.loadId });
                    });
                }, function (error) {
                    $scope.loading = false;
                    lincUtil.processErrorResponse(error);
                });
            });
        }

        $scope.carrierCustomCtrl = {};
        $scope.customerChange = function (customer) {
            addressService.getCurrentFacilityAddress().then(function (response) {
                if (response.length > 0) {
                    var address = response[0];
                    $scope.load.shipFromId = address.id;
                    var addressInfo = "";
                    if (address.address1) {
                        addressInfo += address.address1;
                    }
                    if (address.city) {
                        addressInfo += " " + address.city;
                    }
                    if (address.state) {
                        addressInfo += " " + address.state;
                    }
                    if (address.zipCode) {
                        addressInfo += " " + address.zipCode;
                    }

                    $scope.load.shipFrom = customer.name + " - " + addressInfo;
                }
            });
            $scope.carrierCustomCtrl.manualRefreshOptions(customer.id);

            $scope.load.longHaulId = null;
            $scope.load.longHaulNo = null;
        };

        $scope.loadContent = function (currentPage) {
            $scope.orderLinesView = $scope.load.orderLines.slice((currentPage - 1) * $scope.pager.pageSize, currentPage * $scope.pager.pageSize > $scope.load.orderLines.length ? $scope.load.orderLines.length : currentPage * $scope.pager.pageSize);
        };

        $scope.clear = function (field) {
            if ("shipTo" === field) {
                $scope.load.shipToAddress = {};
                $scope.load.shipToInfo = "";
            }
        };

        function editLoad(load) {
         var orders = [];
            _.forEach(load.orderLines, function (orderLine,index) {
                var order = {};
                order.loadId = $stateParams.loadId;
                order.orderId = orderLine.id;
                order.sequence = orderLine.sequence;
                if($scope.loadParam.enableLoadSequence){
                    order.sequence = index +1;   
                }
                orders.push(order);
            });
            load.orderLines = orders;

        $scope.loading = true;
        ProNoToCheckOrderIds();
          loadsService.updateLoadWithOrderLines(load).then(function (response) {
                $scope.loading = false;
                if (response.error) {
                    lincUtil.errorPopup('Save Error! ' + response.error);
                    return;
                }
                lincUtil.updateSuccessfulPopup(function () {
                    if($scope.SupportProNos.length >0){
                        UpdateOrderBatch();
                    }else {
                        $state.go('wms.outbound.load.view', { loadId: $stateParams.loadId });
                    }


                });
            }, function (error) {
                $scope.loading = false;
                lincUtil.processErrorResponse(error);
            });
        }

        $scope.save = function (form) {
            var load = angular.copy($scope.load);
            fillAddressId(load);
            if (validateFields() && validateOrders($scope.load.customerId, $scope.load.orderLines)) {
                if (!$scope.isNew) {
                    editLoad(load);
                } else {
                    addLoad(load);
                }
            }
        };

        function fillAddressId(load) {
            if (load.shipFromInfo && load.shipFromInfo.id) {
                load.shipFromId = load.shipFromInfo.id;
            }
        }

        function validateFields() {
            if (!$scope.load.orderLines || $scope.load.orderLines.length === 0) {
                if ($scope.submitLabel !== "Update") {
                    lincUtil.messagePopup("Tip", "At least one orderLine is required");
                    return false;
                } else {
                    return true;
                }

            } else
                return true;
        }

        function addLoad(load) {
            $scope.loading = true;
            load.enableSequence = $scope.loadParam.enableLoadSequence;
            load.loadOrderIds = _.map(load.orderLines,'id');
            loadsService.createLoadWithOrderLine(load).then(function (response) {
                $scope.loading = false;
                if (response.error) {
                    lincUtil.errorPopup('Save Error! ' + response.error);
                    return;
                }
                lincUtil.saveSuccessfulPopup(function () {
                    $state.go('wms.outbound.load.list');
                });
            }, function (error) {
                $scope.loading = false;
                lincUtil.processErrorResponse(error);
            });
        }

        function validateOrders(loadCustomerId, orderLines) {
            if(orderLines && orderLines.length > 0) {
                var customerId = orderLines[0].customerId;
                var index = _.findIndex(orderLines, function (orderLine) {
                    return orderLine.customerId !== customerId;
                });
                if (index > -1) {
                    lincUtil.messagePopup("Tip", "Make sure the selected orders have the same customer");
                    return false;
                }

                if (_.findIndex(orderLines, function (o) {
                        return o.customerId !== loadCustomerId;
                    }) > -1) {
                    lincUtil.messagePopup("Tip", "Make sure the selected orders have the same customer with load");
                    return false;
                }
            }
            return true;

        }

        $scope.remove = function (id) {
            lincUtil.confirmPopup("Tip", "Are you sure to remove this record?", function () {
                _.remove($scope.load.orderLines, function (o) {
                    return o.id === id;
                });
                _.remove($scope.orderLinesView, function (o) {
                    return o.id === id;
                });
            });
        };

        function _init() {
            $scope.isNew = ($stateParams.loadId && $stateParams.loadId !== "") ? false : true;
            if (!$scope.isNew) {
                $scope.formTitle = "Update Load";
                $scope.submitLabel = "Update";
                loadOrderSelectService.refillLoadInfo = false;
                if (!loadOrderSelectService.fromSelect) {
                    fromEdit($stateParams.loadId);
                    if (!$scope.load) {
                        $scope.load = {};
                    }
                } else {
                    $scope.load = loadOrderSelectService.getLoad();
                    $scope.orderLines = angular.copy(loadOrderSelectService.getOrderLines());
                    $scope.load.orderLines = $scope.orderLines;
                    var loadMapSequences = _.compact(_.map( $scope.load.orderLines,'sequence'));
                    if($scope.load.orderLines && loadMapSequences.length ===  $scope.load.orderLines.length){
                         $scope.load.orderLines =_.sortBy( $scope.load.orderLines,'sequence');
                         $scope.loadParam.enableLoadSequence = true;
                         if($scope.load.longHaulId){
                            $scope.loadParam.enableLoadSequence = false;
                         }
                        
                    }else{
                        $scope.loadParam = {'enableLoadSequence':false};
                    }
                    $scope.loadContent(1);
                }

            } else {
                $scope.formTitle = "Build Load";
                $scope.submitLabel = "Save";
                $scope.load = loadOrderSelectService.getLoad();
                $scope.orderLines = angular.copy(loadOrderSelectService.getOrderLines());
                $scope.load.orderLines = $scope.orderLines;
                $scope.loadContent(1);

                if ($scope.isNew && !loadOrderSelectService.fromSelect) {
                    loadOrderSelectService.refillLoadInfo = true;
                    $scope.load = {};
                }
            }
            autoInputLoadInfo();

            loadOrderSelectService.setOrderLines([]);
            loadOrderSelectService.setLoad({});
            loadOrderSelectService.fromSelect = false;
            $scope.selectedLoadType = 'FTL';
        }

        function buildLongHualWarningMessage() {
            if (!$scope.load.longHaulId) {
                $scope.warningMessage = "Long Hual is empty, the orderlines will not be able to generate the sequences.";
            } else {
                if (_.filter($scope.load.orderLines, function (orderline) {
                    return !orderline.sequence
                }).length > 0) {
                    $scope.warningMessage = "Some orderlines sequence are empty, please review the selected Long Hual and selected orders";
                }
            }
        }

        _init();

        $scope.importOrders = function () {
            var param = {};
            if ($scope.load.customerId) {
                if ($scope.load.customerId){
                    param.customerId = $scope.load.customerId;
                } 
                var form = {
                    templateUrl: 'wms/outbound/load/template/orderImportSelect.html',
                    locals: {
                        param: param
                    },
                    controllerAs: 'ctrl',
                    autoWrap: true,
                    controller: orderImportSelectController
                };

                $mdDialog.show(form).then(function (response) {
                    if (response && response.orderLines.length > 0) {
                        $scope.load.orderLines = response.orderLines;
                        $scope.loadContent(1);
                    }

                    $scope.load.longHaulNo = response.longHaulNo;
                    $scope.load.longHaulId = response.longHaulId;
                });
            } else {
                lincUtil.messagePopup("Tip", "Please select a customer first!");
            }
        };

        $scope.selectLongHaul = function (longHaul) {
            if(!longHaul){
                $scope.load.longHaulNo = null;
            }else{
                $scope.load.longHaulNo = longHaul.longHaulNo;
                $scope.loadParam.enableLoadSequence = false;
            }
        };

        function autoInputLoadInfo() {
            if (loadOrderSelectService.refillLoadInfo && $scope.load.orderLines
                && $scope.load.orderLines.length > 0) {
                var orderLines = $scope.load.orderLines;
                if (orderLines.length == 1) {
                    $scope.load = _.assignIn($scope.load, angular.copy(orderLines[0]));
                    $scope.load.orderLines = orderLines;
                } else {
                    autoInputWithMultipleOrders(orderLines);
                }
                loadOrderSelectService.refillLoadInfo = false;
            }
        }

        function autoInputWithMultipleOrders(orderLines) {
            var proMap = {
                "customerId": true, "carrierId": true, "freightTerm": true,
                "shipFromId": true, "shipToAddress": true
            };
            var orderLine = orderLines[0];
            orderLines.forEach(function (order) {
                for (var prop in proMap) {
                    if (prop != "shipToAddress") {
                        if (order[prop] != orderLine[prop]) proMap[prop] = false;
                    } else {
                        if (!compareAddressIfSame(order[prop], orderLine[prop]))
                            proMap[prop] = false;
                    }
                }
            });
            for (var prop in proMap) {
                if (proMap[prop]) $scope.load[prop] = orderLine[prop];
                if (proMap[prop] && prop == "shipFromId") {
                    $scope.load.shipFrom = orderLine.shipFrom;
                }
            }
        }

        function compareAddressIfSame(address1, address2) {
            var pros = ["organizationName", "name", "address1", "city", "state", "zipCode"];
            if (address1 && address2) {
                var len = pros.length;
                for (var i = 0; i < len; i++) {
                    var prop = pros[i];
                    if (address1[prop] != address2[prop]) return false;
                }
                return true;
            } else {
                return false;
            }
        }

        $scope.getFreightTermList = function (param) {
            return lincResourceFactory.getFreightTermList(param).then(function (response) {
                $scope.freightTermList = response;
            });
        };

        $scope.getTypeList = function (search) {

            loadsService.getLoadTypes().then(function (response) {
                $scope.typeList = response;
            });
        };

        $scope.getAddressInfo = function (addressObject) {
            return addressService.generageAddressData(addressObject, null);
        };

        $scope.selectCarrier = function (val) {
            if (!val) {
                $scope.load.carrierId = null;
                $scope.load.carrierName = null;
            }
        };

        $scope.selectFreightTerm = function (val) {
            if (!val) {
                $scope.load.freightTerm = null;
            }
        };

        $scope.selectLoadTypes = function (val) {
            if (!val) {
                $scope.load.type = null;
            }
        };

        $scope.cancel = function () {
            if ($scope.submitLabel === "Update")
                $state.go('wms.outbound.load.view', { loadId: $stateParams.loadId });
            else
                $state.go('wms.outbound.load.list');
        };
        
        $scope.loadParam = {'enableLoadSequence':false};
        
        $scope.changeAheadSequence = function (index) {
            var currentOrder = angular.copy($scope.orderLinesView[index]);
            var aheadOrder = angular.copy($scope.orderLinesView[index - 1]);
            $scope.orderLinesView[index - 1] = currentOrder;
            $scope.orderLinesView[index] = aheadOrder;

        };

        $scope.changeBehindSequence = function (index) {
            var currentOrder = angular.copy($scope.orderLinesView[index]);
            var aheadOrder = angular.copy($scope.orderLinesView[index + 1]);
            $scope.orderLinesView[index + 1] = currentOrder;
            $scope.orderLinesView[index] = aheadOrder;

        };

        $scope.selectAll = false;
        $scope.checkOrderIds = [];
        $scope.SupportProNos = [];
        $scope.checkAllOrder = function () {
            var currentPageItemIds = _.map($scope.orderLinesView, 'id');
            if ($scope.selectAll) {
                $scope.checkOrderIds = [];
                $scope.selectAll = false;
            }
            else {
                $scope.checkOrderIds = currentPageItemIds;
                $scope.selectAll = true;
            }
        };
        $scope.isChecked = function (order) {
            return _.indexOf($scope.checkOrderIds, order.id) > -1;
        };

        $scope.checkLoad = function (order) {
            if (_.indexOf($scope.checkOrderIds, order.id) > -1) {
                _.remove($scope.checkOrderIds, function (orderId) {
                    return order.id == orderId;
                });
            } else {
                $scope.checkOrderIds.push(order.id);
            }
        };
        function ProNoToCheckOrderIds() {
            if ($scope.load.orderListProNo) {
                _.forEach($scope.checkOrderIds, function (checkOrderId) {
                    $scope.SupportProNos.push( {orderId: checkOrderId, proNo: $scope.load.orderListProNo});
                });
            }
        }
       function UpdateOrderBatch() {
           loadsService.UpdateOrderBatch($scope.SupportProNos).then(function (response) {
               $scope.loading = false;
               if (response.error) {
                   lincUtil.errorPopup('Save Error! ' + response.error);
                   return;
               }
               lincUtil.updateSuccessfulPopup(function () {
                   $state.go('wms.outbound.load.view', { loadId: $stateParams.loadId });
               });
           }, function (error) {
               $scope.loading = false;
               lincUtil.processErrorResponse(error);
           });
       }
    };

    controller.$inject = ['$scope', '$resource', '$mdDialog', 'orderService',
        '$state', '$stateParams', 'loadOrderSelectService', 'loadsService', 'lincResourceFactory', 'addressService',
        'organizationService', 'lincUtil'
    ];

    return controller;
});
