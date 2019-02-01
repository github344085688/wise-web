var uiselect = require('../../../util/uiselect.js');

var organization = {};

organization.SearchPage = function() {
    this.get = function() {
        browser.get('#/fd/organization/list');
    };

    this.getOrganzationListLength = function() {
        return  element.all(by.repeater('organization in ctrl.organizationsView')).count();
    };

    this.searchOrganzationByName = function(name) {
        browser.get('#/fd/organization/list');
        element(by.model('searchInfo.name')).sendKeys(name);
        element(by.partialButtonText('Search')).click();
        return element.all(by.repeater('organization in ctrl.organizationsView'));
    }
};

organization.AddPage = function() {

    this.get = function() {
        browser.get('#/fd/organization/add');
    };

    this.addOrganizaitonBasicInfo = function() {

        element(by.name('key')).sendKeys('E2ETestOrg_add');
        element(by.name('orgName')).sendKeys('E2EOrg_add');
        element(by.name('note')).sendKeys('E2EOrg Note_add');

        element(by.partialButtonText('Add')).click().then(function(){
            element.all(by.repeater('contact in ctrl.organization.contacts')).each(function(contact, index){
                contact.element(by.name('name')).sendKeys('E2E Contact_add' + index );
                contact.element(by.name('phone')).sendKeys('23232323' +  + index);
                contact.element(by.name('email')).sendKeys('E2EXXX@gmail.com'  + index);
                uiselect.fillSelect(contact.element(by.name('type')),'SHIPPING');
            });
        });

        element.all(by.repeater('property in ctrl.roles')).each(function(element, index){
            element.click();
        });

        return element(by.partialButtonText('Save')).click();
    };

};

organization.EidtPage = function(organizationId) {

    this.get = function() {
        browser.get('#/fd/organization/edit/' + organizationId);
    };

    this.editOrganizaitonBasicInfo = function() {

        element(by.name('key')).clear().sendKeys('E2ETestKey_edit');
        element(by.name('orgName')).clear().sendKeys('E2EOrg_edit');
        element(by.name('note')).clear().sendKeys('E2EOrg Note_edit');

        element.all(by.partialButtonText('Remove')).get(1).click();

        element.all(by.repeater('contact in ctrl.organization.contacts')).each(function(contact, index){
            contact.element(by.name('name')).clear().sendKeys('E2E Contact' + index );
            contact.element(by.name('phone')).clear().sendKeys('23232323' +  + index);
            contact.element(by.name('email')).clear().sendKeys('E2EXXX@gmail.com'  + index);
            uiselect.fillSelect(contact.element(by.name('type')),'OTHER');
        });

        element.all(by.repeater('property in ctrl.roles')).each(function(element, index){
            element.click();
        });

        return element(by.partialButtonText('Save')).click();
    };

};

organization.RemovePage = function() {

    this.removeOrganizationByName = function(name) {
        browser.get('#/fd/organization/list');
        element(by.model('searchInfo.name')).sendKeys(name);
        element(by.partialButtonText('Search')).click();
        var org = element.all(by.repeater('organization in ctrl.organizationsView')).get(0);
        org.element(by.partialLinkText('Disable')).click();
        return element(by.tagName('md-dialog-actions')).element(by.partialButtonText('Yes')).click();


    };

};

module.exports = organization;

