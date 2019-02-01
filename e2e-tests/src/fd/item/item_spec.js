var item=require('./item_page.js');

describe('Item', function(){
	it('Item add function work as designed', function() {
        var itemAddPage = new item.AddPage();
        itemAddPage.get();
        itemAddPage.addItemBasicInfo();
    });
});