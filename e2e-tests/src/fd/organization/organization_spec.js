var organization = require('./organization_page.js');


describe('Organiation', function() {

    it('Organization add function work as designed', function() {
        var organizationAddPage = new organization.AddPage();
        organizationAddPage.get();
        organizationAddPage.addOrganizaitonBasicInfo();
        var savePopup = element(by.css('.md-dialog-content-body'));
        expect(savePopup.isPresent()).toBe(true);
        expect(savePopup.getText()).toContain('uccessful');
    });


    it('Organization default search and search by name works as designed', function() {
        var organizationSearchPage = new organization.SearchPage();
        organizationSearchPage.get();
        expect(organizationSearchPage.getOrganzationListLength()).toBeGreaterThan(0);

        var searchOrgs = organizationSearchPage.searchOrganzationByName('E2EOrg_add');
        expect(searchOrgs.count()).toBeGreaterThan(0);
    });


    it('Organization edit function work as designed', function() {
        var organizationSearchPage = new organization.SearchPage();
        var searchOrgs = organizationSearchPage.searchOrganzationByName('E2EOrg_add');
        expect(searchOrgs.count()).toBeGreaterThan(0);
        var link = searchOrgs.get(0).element(by.partialLinkText('Edit')).getAttribute('href');
        expect(link).toContain('organization/edit');
        link.then(function(url){
            var orgId = url.substr(url.lastIndexOf('/') + 1);
            expect(orgId).toContain('ORG');

            var organizationEditPage = new organization.EidtPage(orgId);
            organizationEditPage.get();
            organizationEditPage.editOrganizaitonBasicInfo();

            var updatePopup = element(by.css('.md-dialog-content-body'));
            expect(updatePopup.isPresent()).toBe(true);
            expect(updatePopup.getText()).toContain('uccessful');

            organizationEditPage.get();
            expect(element(by.name('orgName')).getAttribute('value')).toEqual('E2EOrg_edit');

        })
    });


    it('Organization remove function work as designed', function() {
        var organizationRemovePage = new organization.RemovePage();
        organizationRemovePage.removeOrganizationByName('E2EOrg_edit');
        browser.waitForAngular();
        var organizationSearchPage = new organization.SearchPage();
        var searchOrgs = organizationSearchPage.searchOrganzationByName('E2EOrg_edit');
        expect(searchOrgs.count()).toEqual(0);


    });
});