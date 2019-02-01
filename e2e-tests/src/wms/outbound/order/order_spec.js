var organization = require('./organization_page.js');


describe('Organiation', function() {

    it('Organization add function work as designed', function() {
        let organizationAddPage = new organization.AddPage();
        organizationAddPage.get();
        organizationAddPage.addOrganizaitonBasicInfo();
        let savePopup = element(by.css('.md-dialog-content-body'));
        expect(savePopup.isPresent()).toBe(true);
        expect(savePopup.getText()).toContain('uccessful');
    });


    it('Organization default search and search by name works as designed', function() {
        let organizationSearchPage = new organization.SearchPage();
        organizationSearchPage.get();
        expect(organizationSearchPage.getOrganzationListLength()).toBeGreaterThan(0);

        let searchOrgs = organizationSearchPage.searchOrganzationByName('E2EOrg_add');
        expect(searchOrgs.count()).toBeGreaterThan(0);
    });


    it('Organization edit function work as designed', function() {
        let organizationSearchPage = new organization.SearchPage();
        let searchOrgs = organizationSearchPage.searchOrganzationByName('E2EOrg_add');
        expect(searchOrgs.count()).toBeGreaterThan(0);
        let link = searchOrgs.get(0).element(by.partialLinkText('Edit')).getAttribute('href');
        expect(link).toContain('organization/edit');
        link.then(function(url){
            let orgId = url.substr(url.lastIndexOf('/') + 1);
            expect(orgId).toContain('ORG');

            let organizationEditPage = new organization.EidtPage(orgId);
            organizationEditPage.get();
            organizationEditPage.editOrganizaitonBasicInfo();

            let updatePopup = element(by.css('.md-dialog-content-body'));
            expect(updatePopup.isPresent()).toBe(true);
            expect(updatePopup.getText()).toContain('uccessful');

            organizationEditPage.get();
            expect(element(by.name('orgName')).getAttribute('value')).toEqual('E2EOrg_edit');

        })
    });


    it('Organization remove function work as designed', function() {
        let organizationRemovePage = new organization.RemovePage();
        organizationRemovePage.removeOrganizationByName('E2EOrg_edit');
        browser.waitForAngular();
        let organizationSearchPage = new organization.SearchPage();
        let searchOrgs = organizationSearchPage.searchOrganzationByName('E2EOrg_edit');
        expect(searchOrgs.count()).toEqual(0);


    });
});