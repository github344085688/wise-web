/**
 * Created by colinc on 8/15/16.
 */
var itemProperty = require('./itemProperty_page.js');

describe('item property page', function () {

    it('search the item Group by name HDTV should be work as expected', function () {
        var itemSearch = new itemProperty.SearchGroup();
        itemSearch.get();
        var result = itemSearch.searchGroupByName('addNewGroupForTest');
        expect(result.count()).toBeGreaterThan(0);
    });

    it('search the item property by name Color should be work as expected', function () {
        var itemPropertySearch = new itemProperty.SearchProperty();
        itemPropertySearch.get();
        var result = itemPropertySearch.searchPropertyByName('Color');
        expect(result.count()).toBeGreaterThan(0);
    });

    it('add and delete a new item group', function () {
        var addGroup = new itemProperty.addGroup();
        addGroup.get();
        addGroup.addGroupInfo();
        browser.waitForAngular();
        var itemSearch = new itemProperty.SearchGroup();
        var result = itemSearch.searchGroupByName('addNewGroupForTest');
        expect(result.count()).toBeGreaterThan(0);
        element(by.linkText('Disable')).click();
        element(by.partialButtonText('Yes')).click();
        addGroup.get();
        result=itemSearch.searchGroupByName('addNewGroupForTest');
        expect(result.count()).toBe(0);
    });

    it('add and delete a new item property',function () {
        var addNewProperty = new itemProperty.addProperty();
        addNewProperty.get();
        addNewProperty.addPropertyInfo();
        var itemPropertySearch = new itemProperty.SearchProperty();
        var result = itemPropertySearch.searchPropertyByName('newPropertyForTest');
        expect(result.count()).toBeGreaterThan(0);
        element(by.linkText('Disable')).click();
        element(by.partialButtonText('Yes')).click();
        itemPropertySearch.get();
        result = itemPropertySearch.searchPropertyByName('newPropertyForTest');
        browser.pause();
        expect(result.count()).toBe(0);
    })
});
