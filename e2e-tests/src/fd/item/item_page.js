var uiselect = require('../../util/uiselect.js');

var item = {};

item.AddPage = function() {

    this.get = function() {
        browser.get('#/fd/item/itemspec');
        element(by.partialButtonText('Create a new one')).click();
    };

    this.addItemBasicInfo = function() {

        uiselect.fillSelect(element(by.model('item.groupId')),'HDTV');
		uiselect.fillSelect(element(by.name('customer')),'CVIZIO');
    	uiselect.fillSelect(element(by.model('item.titleIds')),'TVIZIO');
    	uiselect.fillSelect(element(by.model('item.supplierIds')),'SVIZIO');
    	uiselect.fillSelect(element(by.model('item.brandId')),'BVIZIO');
    	element(by.name('name')).sendKeys('test_name');
    	element(by.name('desc')).sendKeys('test_desc');
    	element(by.model('item.hasSerialNumber')).click();
    	element(by.model('item.bundle')).click();
		element(by.partialButtonText('Add')).click();
		uiselect.fillSelect(element.all(by.model('p.itemPropertyId')).get(1),'Color');
		element(by.partialButtonText('Save')).click();
		element(by.partialButtonText('OK')).click();
		browser.pause();

    };
};

module.exports = item;