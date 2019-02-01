/**
 * Created by f on 2018/11/14.
 */
'use strict';

define([
    './factories',
    'angular'
], function (factories, angular) {

    factories.factory('bolTemplateService', function ($resource) {


        var CODAmountandFeeTerms = "<div>" +
            "<span style='font-weight:bold; padding-left:2px; margin-bottom:10px;'>COD Amount:</span>" +
            "$" +
            "<span style='display:inline-block; width:30%; height: 12px; border-bottom: 1px solid #222; '>{{codAmountAndFeeTerms.codAmount}}</span>" +
            "</div>" +
            "<div style='font-weight:bold; margin-top:2px; margin-left: 10%;'>Fee Terms:&nbsp;Collect:" +
            "<div style='{{interpolates.codCollect}} display:inline-block; width:12px;height:12px; background:#FFF;border:2px solid #000;font-weight: bold;font-size:10px;text-align:center;'>" +
            "X" +
            "</div>" +
            "&nbsp;Prepaid:" +
            "<div style='{{interpolates.codPrepaid}} display:inline-block; width:12px;height:12px; background:#FFF;border:2px solid #000;font-weight: bold;font-size:10px;text-align:center;'>" +
            "X" +
            "</div>" +
            "</div>" +
            "<div style='font-weight:bold;text-align:center;margin-top:2px;'>" +
            "<div style='float: left;margin-left:20%;'>" +
            "<label for='customer'>Customer check acceptable:</label>" +
            "</div>" +
            "<div style='{{interpolates.codAcceptable}}float: left;width:12px;height:12px;background:#FFF;border:2px solid #000;font-weight: bold;font-size:10px;'>" +
            "X" +
            "</div>" +
            " </div>";


        var bolDynamicFieldA1 = "<div style='margin-left:5px;margin-right:5px;margin-bottom:3px;'>" +
            "{{bolDynamicFieldA1.content}}" +
            "<br/>" +
            "<span style='display:inline-block; width:20%; height: 12px; border-bottom: 1px solid #222;text-align:center;'>" +
            "{{bolDynamicFieldA1.leftInputTemplate}}" +
            "</span>" +
            "per" +
            "<span style='display:inline-block; width:20%; height: 12px; border-bottom: 1px solid #222;text-align:center; '>" +
            "{{bolDynamicFieldA1.rightInputTemplate}}" +
            "</span> " +
            "</div>";

        var bolDynamicFieldA2 = "<div style='margin-left:5px;margin-right:5px;margin-bottom:3px;'>Where" +
            "{{bolDynamicFieldA2.content}}" +
            "<div style='display: block ; text-align: center'>" +
            "<span style='display:inline-block; width:30%; height: 12px; border-bottom: 1px solid #222; '>{{bolDynamicFieldA1.signatureInputTemplate}}</span>" +
            "</div>" +
            "<div style='display: block ; text-align: center'>" +
            "Consignee signature Print Name" +
            "</div>";

        var bolDynamicFieldB1 = "<div style='margin-left:5px;margin-right:5px;'>" +
            "{{bolDynamicFieldB1.content}}" +
            "</div>";


        var bolDynamicFieldB2 = "<div style='margin-left:5px;margin-right:5px;font-family:Arial;font-size: 10px;'>" +
            '{{bolDynamicFieldB2.content}}' +
            "<br>" +
            " <span style='display:inline-block; width:30%; height: 12px; border-bottom: 1px solid #222; '>{{bolDynamicFieldB2.signatureInputTemplate}}</span>" +
            " <span style='font-weight:bold;font-size:12px;'>Shipper</span>" +
            " <br>" +
            "<span style='font-weight:bold;font-size:12px;'>Signature</span>" +
            "</div>";

        var leftBolFreightCounted = "<div style='text-decoration:underline;font-family:Arial;font-size:12px;margin-top:5px;'>Freight Counted:</div>" +
            "<div style='margin-top:5px;margin-left:5px;text-align:left;font-family:Arial;font-size:12px;'>" +
            "<div style='{{interpolates.leftShipper}}float: left;width:12px;height:12px;background:#FFF;border:2px solid #000;font-weight: bold;font-size:10px;'>" +
            "X" +
            "</div>" +
            "By Shipper" +
            "</div>" +
            "<div style='margin-top:5px;margin-left:5px;text-align:left;font-family:Arial;font-size:12px;'>" +
            "<div style='{{interpolates.leftContain}}; float: left;width:12px;height:12px;background:#FFF;border:2px solid #000;font-weight: bold;font-size:10px;'>" +
            "X" +
            "</div>" +
            "<p>By Driver/pallets </p>said to contain" +
            "</div>" +
            "<div style='margin-top:5px;margin-left:5px;text-align:left;font-family:Arial;font-size:12px;'>" +
            "<div  style='{{interpolates.leftPieces}};float: left;width:12px;height:12px;background:#FFF;border:2px solid #000;font-weight: bold;font-size:10px;text-align:center;'>" +
            "X" +
            "</div>" +
            "By Driver/Pieces" +
            "</div>";

        var rightBolFreightCounted = "<div style='text-decoration:underline;font-family:Arial;font-size:12px;margin-top:5px;'>Freight Counted:</div>" +
            "<div style='margin-top:5px;margin-left:5px;text-align:left;font-family:Arial;font-size:12px;'>" +
            "<div style=' {{interpolates.rightContain}}; float: left;width:12px;height:12px;background:#FFF;border:2px solid #000;font-weight: bold;font-size:10px;'>" +
            "X" +
            "</div>" +
            "<p>By Driver/pallets </p>said to contain" +
            "</div>" +
            "<div style='margin-top:5px;margin-left:5px;text-align:left;font-family:Arial;font-size:12px;'>" +
            "<div  style='  {{interpolates.rightPieces}}; float: left;width:12px;height:12px;background:#FFF;border:2px solid #000;font-weight: bold;font-size:10px;text-align:center;'>" +
            "X" +
            "</div>" +
            "By Driver/Pieces" +
            "</div>" +
            "<div style='display: block ; height: 30px;  text-align: center'>" +
            "NO SHIPPER LOADER COUNT" +
            "</div>";


        var bolOtherOptions = "<div style='text-decoration:underline;font-family:Arial;font-size:12px;margin-top:5px;'>Other Options:</div>" +
            "<div style='margin-top:5px;margin-left:5px;text-align:left;font-family:Arial;font-size:12px;'>" +
            "<div  style=' {{interpolates.displayDriverLicenseNo}}; float: left;width:12px;height:12px;background:#FFF;border:2px solid #000;font-weight: bold;font-size:10px;'>" +
            "X" +
            "</div>" +
            "<p>Dispaly Driver </p>License NO" +
            "</div>" +
            "<div style='margin-top:5px;margin-left:5px;text-align:left;font-family:Arial;font-size:12px;'>" +
            "<div style='{{interpolates.orderTotalPalletsFirst}}; float: left;width:12px;height:12px;background:#FFF;border:2px solid #000;font-weight: bold;font-size:10px;text-align:center;'>" +
            "X" +
            "</div>" +
            "Order Total Pallets 1st" +
            "</div>";


        var service = {};

        service.templateCODAmountandFeeTerms = function () {
            return CODAmountandFeeTerms;
        };

        service.templateBolDynamicFieldA1 = function () {
            return bolDynamicFieldA1;
        };

        service.templateBolDynamicFieldA2 = function () {
            return bolDynamicFieldA2;
        };

        service.templateBolDynamicFieldB1 = function () {
            return bolDynamicFieldB1;
        };

        service.templateBolDynamicFieldB2 = function () {
            return bolDynamicFieldB2;
        };

        service.templateleftBolFreightCounted = function () {
            return leftBolFreightCounted;
        };


        service.templaterightBolFreightCounted = function () {
            return rightBolFreightCounted;
        };

        service.templatebolOtherOptions = function () {
            return bolOtherOptions;
        };


        return service;
    });
});
