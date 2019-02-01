/**
 * Created by colinc on 8/21/16.
 */

var appointmentPage = {};

appointmentPage.searchCreateAppointment= function () {
    this.get=function () {
        browser.get('#/wms/appointment');
    };

    this.createAppointment = function () {
        element(by.className('btn btn-default btn-sm pull-right uib-right')).click();
        element(by.className('btn btn-default btn-sm active')).click();
        element(by.css('[ng-click="addAppointment($index)"]')).click();
        element(by.partialButtonText('Inbound')).click();
        element(by.model('currentItem.scac')).sendKeys('scac123');
        element(by.model('currentItem.contacts')).sendKeys('contact');
        element(by.model('currentItem.phone')).sendKeys('1233211234');
        element(by.model('currentItem.licensePlate')).sendKeys('license');
        element(by.model('currentItem.driverLicense')).sendKeys('driverlicense123');
        element(by.model('currentItem.driverName')).sendKeys('poor chicken eason');
        element(by.partialButtonText('Add Receipt')).click();
        element(by.name('selectAll')).click();
        element(by.partialButtonText('Confirm')).click();
        element(by.partialButtonText('Submit')).click();
        element(by.partialButtonText('OK')).click();
    }
}

module.exports=appointmentPage;