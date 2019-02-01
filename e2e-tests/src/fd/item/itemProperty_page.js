/**
 * Created by colinc on 8/15/16.
 */
var uiselect = require('../../util/uiselect.js');
var itemProperty = {};

itemProperty.SearchGroup = function () {
    this.get=function () {
      browser.get('#/fd/item/ipg/list');
    };

    this.searchGroupByName = function (name) {
        element(by.model('groupName')).sendKeys(name);
        return element.all(by.className('portlet light bordered ng-scope'));
    };
};

itemProperty.SearchProperty = function () {
    this.get=function () {
        browser.get('#/fd/item/itemproperty/list');
    };

    this.searchPropertyByName = function (name) {
        element(by.model('itemProperty.name')).clear().sendKeys(name);
        return element(by.id('sample_1')).all(by.className('ng-scope'));

    }
};

itemProperty.addGroup= function () {
    this.get=function () {
        browser.get('#/fd/item/ipg/add');
    };

    this.addGroupInfo=function () {
        element(by.model('ctrl.itemPropertyGroup.name')).clear().sendKeys('addNewGroupForTest');
        uiselect.fillSelect(element(by.model('ctrl.itemPropertyGroup.type')),'Packaging');
        uiselect.fillSelect(element(by.model('ctrl.itemPropertyGroup.parentId')),'HDTV');
        uiselect.fillSelect(element(by.model('property.itemPropertyId')),'Color');
        element(by.partialButtonText('Add')).click();
        uiselect.fillSelect(element.all(by.model('property.itemPropertyId')).get(1),'Size');
        element(by.partialButtonText('Submit')).click();
        return element(by.partialButtonText('OK')).click();
    }
};

itemProperty.addProperty=function () {
    this.get=function () {
        browser.get('#/fd/item/itemproperty/add');
    };

    this.addPropertyInfo=function () {
        // browser.pause();
        element(by.model('ctrl.itemProperty.name')).sendKeys('newPropertyForTest');
        element(by.model('ctrl.itemProperty.type')).sendKeys('Number');
        browser.sleep(1000);
        uiselect.fillSelect(element(by.model('ctrl.itemProperty.unitType')), 'Weight');
        element(by.partialButtonText('Save')).click();
        return element(by.partialButtonText('OK')).click();
    }
}
module.exports = itemProperty;
