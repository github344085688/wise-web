'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope, $window, $resource, $mdDialog, printService, lincUtil, taskIds, session, orderService,orderIds,$q) {

        $scope.printLabelSetUp = {
            packingListTogetherWithLabel: true,
            packingListByOrder: false,
            packagingLabel: false,
            shippingLabel:false,
        };
        $scope.orderIds = _.uniq(orderIds).join(',');
        // $scope.taskIds = taskIds.join(','); 
        
        $scope.onPrintLabelChecked = function (labelOption) {
            $scope.printLabelSetUp[labelOption] = !$scope.printLabelSetUp[labelOption];
            if(!$scope.printLabelSetUp[labelOption]) return;
            if (labelOption === "packingListTogetherWithLabel") {
                $scope.printLabelSetUp.packingListByOrder = false;
                $scope.printLabelSetUp.shippingLabel = false;
            } else if (labelOption === "packingListByOrder" && $scope.printLabelSetUp.shippingLabel === false) {
                $scope.printLabelSetUp.packingListTogetherWithLabel = false;
                $scope.printLabelSetUp.packagingLabel = false;
            } else if(labelOption === "shippingLabel"){
                $scope.printLabelSetUp.packingListTogetherWithLabel = false;
            }

        };
        var PACKINGLISTLABEL="Packing List", SHIPPINGLABEL = "Shipping Label", PACKAGELISTLABEL = "Package Label",PACKAGELISTLABELWITHSHIPPINGLABEL ='Package List Label With Shipping Label';

        // var taskIds = _.sortBy(taskIds, function (taskId) {
        //     return Number(taskId.split('-')[1]);
        // });
        
        var orderIds = _.sortBy(_.uniq(orderIds));
       //new

        function getSmallParcelItemListSource(){
            var singleAndMixItems=[];
            _.forEach($scope.orderItemLinesGroupByOrderId,function(itemLines,orderId){
                var mixItem =[];
                _.forEach(itemLines,function(itemLine){
                    //设置了cartonConfig
                    var itemTotalQty = getNeedToPrintedItemTotalQty(itemLine);
                    var configBaseQty,printCount,restItemQty;
                    if(itemLine.cartonConfig){
                          //统一换算成carton中baseQty数量
                         configBaseQty =  (_.find(itemLine.itemUnits,{id:itemLine.cartonConfig.unitId})).baseQty;
                         printCount = Math.floor(itemTotalQty/(itemLine.cartonConfig.qty*configBaseQty));
                         restItemQty  = itemTotalQty- (itemLine.cartonConfig.qty*configBaseQty*printCount);
                        getItemListFromConfig(itemLine,singleAndMixItems,mixItem,printCount,restItemQty,null);
                    }else{
                        //未设置cartonConfig，设置了customer级别
                        var customerLevelConfig =$scope.orderKeyById[itemLine.orderId].customer.smallParcelPackConfig;
                        if(!itemLine.cartonConfig && customerLevelConfig &&customerLevelConfig.qty){
                           var defaultBaseQty =  (_.find(itemLine.itemUnits,'isDefaultUnit')).baseQty;
                             printCount = Math.floor(itemTotalQty/(customerLevelConfig.qty*defaultBaseQty));
                             restItemQty  = itemTotalQty- (customerLevelConfig.qty*defaultBaseQty*printCount);
                            getItemListFromConfig(itemLine,singleAndMixItems,mixItem,printCount,restItemQty,customerLevelConfig);
                        }else{
                            restItemQty = itemTotalQty;
                            getItemListFromConfig(itemLine,singleAndMixItems,mixItem,0,restItemQty,null);
                        }
                    } 
                });

                if(mixItem.length>0){
                        singleAndMixItems.push(mixItem);
                    }
              
            });
            return  singleAndMixItems;
        }

        function getItemListFromConfig(itemLine,singleAndMixItems,mixItem,printCount,restItemQty,customerLevelConfig){

              if(restItemQty > 0 ){
                var  itemBaseQty =  (_.find(itemLine.itemUnits,{id:itemLine.unitId})).baseQty;
                if(itemLine.allowMixedPackagingForSmallParcel){
              
                    mixItem.push({  
                        "orderId": itemLine.orderId,
                        "itemSpecId": itemLine.itemSpecId,
                        "unitId": itemLine.unitId,
                        "qty": restItemQty/itemBaseQty,
                        "packageWeight": itemLine.itemWeight * (restItemQty/itemBaseQty),
                        "totalInsuranceAmount": itemLine.insuranceAmountPerCurrentUnit * restItemQty/itemBaseQty
                    })
                  }else {
                    singleAndMixItems.push([{
                        "orderId": itemLine.orderId,
                        "itemSpecId": itemLine.itemSpecId,
                        "unitId": itemLine.unitId,
                        "qty": restItemQty/itemBaseQty,
                        "packageWeight": itemLine.itemWeight *  (restItemQty/itemBaseQty),
                        "totalInsuranceAmount": itemLine.insuranceAmountPerCurrentUnit * restItemQty/itemBaseQty
                    }]);
                  }
                }

              for (var i = 0; i < printCount; i++) {
                  //customer级别设置 取default Unit 里面
                  var printItem;
                  if(customerLevelConfig){
                    var defaulUnit =  (_.find(itemLine.itemUnits,'isDefaultUnit'));
                    printItem = [{
                        "orderId": itemLine.orderId,
                        "itemSpecId": itemLine.itemSpecId,
                        "unitId": defaulUnit.id,
                        "qty": customerLevelConfig.qty,
                        "packageWeight": defaulUnit.weight * customerLevelConfig.qty,
                        "totalInsuranceAmount": itemLine.insuranceAmountPerCurrentUnit * customerLevelConfig.qty
                    }]
                  }else{
                    //item carton config 级别上的
                    var  weight =  (_.find(itemLine.itemUnits,{id:itemLine.cartonConfig.unitId})).weight;
                    printItem =  [{
                        "orderId": itemLine.orderId,
                        "itemSpecId": itemLine.itemSpecId,
                        "unitId": itemLine.cartonConfig.unitId,
                        "qty": itemLine.cartonConfig.qty,
                        "packageWeight": weight * itemLine.cartonConfig.qty,
                        "totalInsuranceAmount": itemLine.insuranceAmountPerCurrentUnit * itemLine.cartonConfig.qty
                    }]
                  }
                  singleAndMixItems.push(printItem);
               }

        }

        //全部转换成基本单位的总数
        function getNeedToPrintedItemTotalQty(itemLine){

                var itemUnitsKeyBy = _.keyBy(itemLine.itemUnits,'id');
    
                var printedTrackingNoQty =  _.sumBy(itemLine.beenPrintedTrackingNos,function(item){
                    return  itemUnitsKeyBy[item.itemLineDetail.unitId].baseQty*item.qty;
                });
    
                var unprintedTrackingNoQty =  _.sumBy(itemLine.unPrintedTrackingNos,function(item){
                    return  itemUnitsKeyBy[item.itemLineDetail.unitId].baseQty*item.qty;
                });
                var itemTotalQty= (itemLine.qty*itemUnitsKeyBy[itemLine.unitId].baseQty) - printedTrackingNoQty-unprintedTrackingNoQty;
                return itemTotalQty;
         }

        function getSmallParcelTrackingNoInfos(itemList){
            var param = {};
            param.packageType = "CP";
            param.packageWeight =(_.sumBy(itemList,'packageWeight')).toFixed(2);
            var printer ;
            if ($scope.printLabelSetUp.packingListTogetherWithLabel || $scope.printLabelSetUp.packingListByOrder) {
                param.labelType = "PNG";
                param.printer = $scope.printer.pdfPrinter.printerName;
                printer =  $scope.printer.pdfPrinter;
            }
            if( $scope.printLabelSetUp.shippingLabel ){
                param.labelType = "ZPL";
                param.printer = $scope.printer.zplPrinter.printerName;
                 printer =  $scope.printer.zplPrinter;
            }
            param.itemList = itemList;
           return  printService.createSmallParcelShipment(param).then(function (data) {
                return  data.shipmentLabels[0];
            }, function (err) {
                $scope.isAllPrinted = false;
                var source = {itemLineDetails: itemList,trackingNo:false}
                var info =[{success: false, printStatus:'fail',  err: err}]
                pushLog(source,info);
            });
        }


        function getPackingList(orderId) {
            return printService.generateOrderPackingListPdf(orderId).then(function(data){
               return {printer: $scope.printer.pdfPrinter, data: data , labelType: PACKINGLISTLABEL, success:true};
            },function(err){
      
                return {success: false, printStatus:"fail",labelType: PACKINGLISTLABEL, orderId:orderId, err: err};
            });
        }

        function getPackageList(trackingNo){
            return printService.generatePackagingTicketWithZPL(trackingNo).then(function(data){
                return {printer: $scope.printer.zplPrinter, data:data, trackingNo:trackingNo,  labelType: PACKAGELISTLABEL, success:true};
             },function(err){
                
                return {success: false, printStatus:'fail',labelType: PACKAGELISTLABEL, trackingNo:trackingNo, err: err};
             });
        }

        function getShippingLabel(shipmentLabelBuffer,trackingNo){
            // var param = {
            //     trackingNos: [smallParcel.trackingNo]
            // };
            // printService.searchSmallParcelShipment(param).then(function (response) {
            //     return {printer: $scope.zplPrinter, data: response , labelType: SHIPPINGLABEL, success:true};
            // }, function (error) {
              
            // });

            return {printer: $scope.printer.zplPrinter, data: shipmentLabelBuffer ,trackingNo:trackingNo, labelType: SHIPPINGLABEL, success:true};

        }

        function getPackagingLabelWithShippingLabel(trackingNo) {
      
          return orderService.getPackingListShippingLabelTogetherByTrackingNo(trackingNo).then(function (data) {
                return {printer: $scope.printer.pdfPrinter, trackingNo:trackingNo, data: data , labelType: PACKAGELISTLABELWITHSHIPPINGLABEL, success:true};

            }, function (err) {
                 return {success: false, printStatus:false,labelType: PACKAGELISTLABELWITHSHIPPINGLABEL,trackingNo:trackingNo,err: err};
            });
        }
      

        $scope.newPrint = function(){
            $scope.isPrinting = true;
            var promisese = [];
            if($scope.printLabelSetUp.packingListTogetherWithLabel || $scope.printLabelSetUp.shippingLabel ||  $scope.printLabelSetUp.packagingLabel){
               $scope.isLoading = true;
                var singleAndMixItems=  getSmallParcelItemListSource();
                  _.forEach(singleAndMixItems,function(itemList){
                     promisese.push(getSmallParcelTrackingNoInfos(itemList));
                 });

            } 

            if($scope.printLabelSetUp.packingListByOrder && !$scope.printLabelSetUp.shippingLabel){
                printBeginToEnding(orderIds)
           
            }else{
                if(promisese.length>0){
                    $q.all(promisese).then(function (responses) {
                            $scope.isLoading = false;
                            var shipmentLabels =_.compact(responses);
                            var shipmentLabelList  =_.union($scope.unPrintShippingDetails, shipmentLabels);
                            var sortShippingLabels = getSortOrgShippingLabels(shipmentLabelList);
                            printBeginToEnding(sortShippingLabels);
                    })
                }else{
                    $scope.isLoading = false;
                    var shipmentLabelList =  $scope.unPrintShippingDetails;
                    var sortShippingLabels =  getSortOrgShippingLabels(shipmentLabelList);
                    printBeginToEnding(sortShippingLabels);
                }
              
            }
        
      
        }

        function printBeginToEnding(sortShippingLabels){
            if(sortShippingLabels.length ===0 ){
                if($scope.isAllPrinted){
                    $scope.loggers.unshift({allPrintedInfo:'All Item Has Been Printed',dateTime:new Date()})
                }
           
                $scope.isPrinting = false;
                return ;
            }
           
            var printPromises = [];
            printPromises.push(printLabelOneByOne(sortShippingLabels,0));

            $q.all(printPromises).finally(function(){
                $scope.isPrinting = false;
                _init();
            })
        }

        function getSortOrgShippingLabels(shipmentLabelList){
            //分组归类，添加itemspecIds  totalQty  ismix属性
            _.forEach(shipmentLabelList,function(shipmentLabel){
                    shipmentLabel.isMix = false;
                 if(shipmentLabel.itemLineDetails.length>1){
                    shipmentLabel.isMix = true;
                }
            })
            var  mixItemsShippingLabels =  _.filter(shipmentLabelList,{'isMix':true});
            var  singleItemsShippingLabels =  _.filter(shipmentLabelList,{'isMix':false});
            //按照itemSpecId  和 qty进行排序
            singleItemsShippingLabels = _.sortBy(singleItemsShippingLabels,['itemLineDetails[0].itemSpecId','itemLineDetails[0].qty']);
            return _.union(singleItemsShippingLabels,mixItemsShippingLabels);
        }

        function printLabelOneByOne(smallParcelsOrOrderIds,index){
            var smallParcelsOrOrderId = smallParcelsOrOrderIds[index];
            var  orgPromises = [];
            if($scope.printLabelSetUp.packingListTogetherWithLabel){
                var trackingNo = smallParcelsOrOrderId.trackingNo;
                orgPromises.push(getPackagingLabelWithShippingLabel(trackingNo));
            }
   
            if($scope.printLabelSetUp.shippingLabel){
                var shipmentLabelBuffer  = smallParcelsOrOrderId.shipmentLabel;
                var trackingNo = smallParcelsOrOrderId.trackingNo;
                orgPromises.push(getShippingLabel(shipmentLabelBuffer,trackingNo));
            }
            if($scope.printLabelSetUp.packagingLabel){
                var trackingNo  = smallParcelsOrOrderId.trackingNo;
                orgPromises.push(getPackageList(trackingNo));
            }
            if($scope.printLabelSetUp.packingListByOrder && !$scope.printLabelSetUp.shippingLabel){
                var orderId = smallParcelsOrOrderId;
                orgPromises.push(getPackingList(orderId));
            }else{
                if($scope.printLabelSetUp.packingListByOrder ){
                    var orderId  = smallParcelsOrOrderId.itemLineDetails[0].orderId;
                    orgPromises.push(getPackingList(orderId));
                }
            }

            var defer = $q.defer();
            if(orgPromises.length > 0) {
                $q.all(orgPromises).then(function (responses) {
                    if (_.every(responses, 'success')) {
                        var groupedResponses = _.groupBy(responses , function(data){
                              return data.printer.type === "PDF"
                        });
                        var printPromises = [];
                         $scope.zlog =[];//所有打印完后反馈的log
                        for (var key in groupedResponses) {
                            printPromises.push(sendDataToPrinterAndTriggerNextTrackingNoPrint(groupedResponses[key]));
                        }
                     
                        $q.all(printPromises).finally(function(){
                            pushLog(smallParcelsOrOrderId, $scope.zlog)
                            index = index + 1;
                            if (smallParcelsOrOrderIds.length > index) {
                                printLabelOneByOne(smallParcelsOrOrderIds, index).finally(function () {
                                    defer.resolve("Complete");
                                });
                            } else {
                                defer.resolve("Complete");
                            }
                        });
                    } else {
                        //三个之中只要一个失败那就是失败  
                        pushLog(smallParcelsOrOrderId,responses)
                        index = index + 1;
                        if (smallParcelsOrOrderIds.length > index) {
                            printLabelOneByOne(smallParcelsOrOrderIds, index).finally(function () {
                                defer.resolve("Complete");
                            });
                        } else {
                            defer.resolve("Complete");
                        }
                    }
                });
            } else {
                defer.resolve("Complete");
            }
            return  defer.promise;
        }

        function sendDataToPrinterAndTriggerNextTrackingNoPrint(responses) {
            return  getOneByOneExecutionPromise(responses, 0);
        }

        
        function getOneByOneExecutionPromise(printerAndDatas, index) {
            var defer = $q.defer();
            var printerAndData = printerAndDatas[index];
            getPrintPromise(printerAndData).then(function (res) {
                if (printerAndData.labelType === SHIPPINGLABEL || printerAndData.labelType === PACKAGELISTLABELWITHSHIPPINGLABEL) {
                    updateTrackingNoSmallParcelShipment(printerAndData.trackingNo);
                }
                printerAndData.printStatus = 'success';
                $scope.zlog.push(printerAndData);
            }, function (err) {
                printerAndData.printStatus = 'fail';
                printerAndData.err = err;
                $scope.zlog.push(printerAndData);
            }).finally(function () {
                index++;
                if (index < printerAndDatas.length) {
                    getOneByOneExecutionPromise(printerAndDatas, index).finally(function(){
                        defer.resolve("Complete");
                    });
                } else {
                    defer.resolve("Complete");
                }
            });
            return defer.promise;
        }

        function updateTrackingNoSmallParcelShipment(trackingNo) {
            printService.updateSmallParcelShipment(trackingNo).then(function (response) {

            }, function (error) {

            });
        }
                    
        function getPrintPromise(printerAndData) {
            if(printerAndData.printer.type === "PDF") {
                return printService.pdfPrint(printerAndData.data.fileId, printerAndData.printer.printerName);
            } else {
                if(printerAndData.labelType === SHIPPINGLABEL){
                    var decodedShippingLabel = $window.atob(printerAndData.data);
                   return  printService.PrintZplWithDatas(decodedShippingLabel,printerAndData.printer)
                }else{
                    return printService.zplPrint(printerAndData.data.id, printerAndData.printer);
                }
               
            }
        }

        $scope.loggers =[];
        function pushLog(source,labelPrintInfo){
      
              var successLabel =_.filter(labelPrintInfo,{printStatus:'success'});
             if(successLabel.length > 0 && successLabel.length === labelPrintInfo.length){
                $scope.loggers.unshift({source:source,res:labelPrintInfo,printed:'Success'});
             }else{
                $scope.loggers.unshift({source:source,res:labelPrintInfo,printed:'Fail'});
             }

        }

        $scope.transferError = function(err){
            if(err){
                return  '('+lincUtil.getProcessErrorResponseMessage(err)+')';
            }
      
        }

        $scope.printer = {}
        $scope.searchAvailablePrinters = function () {
            var param = {};
            printService.searchAvailablePrinters(param).then(function (printers) {
                $scope.ZplPrinters = _.filter(printers, function (printer) {
                    return printer.type === 'ZPL' || printer.type === 'RAW';
                });
                $scope.PdfPrinters = _.filter(printers, function (printer) {
                    return printer.type === 'PDF';
                });
                setfacilityDefaultPrint();
            });
        };

        $scope.ZplPrinterSelect = function (printer) {
            $scope.printer.zplPrinter = printer;
        };

        $scope.PdfPrinterSelect = function (printer) {
            $scope.printer.pdfPrinter = printer;
        };

        function _init() {
            $scope.isAllPrinted = true;
            $scope.searchAvailablePrinters()
             searchOrderItemLine();

        }

        function setfacilityDefaultPrint(){
            var zplPrintersKeyById = _.keyBy($scope.ZplPrinters, 'id');
            var zdfPrintersKeyById = _.keyBy($scope.PdfPrinters, 'id');
            var cf = session.getCompanyFacility();
            if (cf.facility.defaultZPLPrinter) {
                var defaultZPLPrinterId = cf.facility.defaultZPLPrinter;
                $scope.printer.zplPrinter = zplPrintersKeyById[defaultZPLPrinterId];
            }
            if (cf.facility.defaultPDFPrinter) {
                var defaultPdfPrinterId = cf.facility.defaultPDFPrinter;
                $scope.printer.pdfPrinter = zdfPrintersKeyById[defaultPdfPrinterId];
            }
        }

        function searchOrderItemLine() {
            var param = {
                orderIds: orderIds
            };
            orderService.searchOrderItemLine(param).then(function (response) {
                $scope.orderItemLinesGroupByOrderId =_.groupBy(response.orderItemLines,'orderId');
                $scope.unPrintShippingDetails = response.unPrintShippingDetails;
                $scope.orderKeyById = _.keyBy(response.orders, 'id');
                $scope.itemKeyByItemId = _.keyBy(response.orderItemLines, 'itemSpecId');
                $scope.UnitKeyByUnitId  = {};
                if(response.orderItemLines.length>0){
                    $scope.UnitKeyByUnitId = _.keyBy(_.flattenDeep(_.map(response.orderItemLines,'itemUnits')),'id');
                }
             
                $scope.loadingComplete = true;
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        _init();
        $scope.loadingComplete = false;
        $scope.cancel = function () {
            $mdDialog.hide();
        };

    };

    controller.$inject = ['$scope', '$window', '$resource', '$mdDialog', 'printService', 'lincUtil', 'taskIds', 'session', 'orderService','orderIds','$q'];

    return controller;
});