/**
 * Created by colinc on 8/16/16.
 */
var uiselect = {
    fillSelect: function (model, value) {
        var el = element(by.model(model));
        var selectInput = el.element(by.css('.ui-select-search'));
        // var selectInput = el.element(by.model('newTag.text'));
        el.click();
        selectInput.sendKeys(value);
        el.element(by.css('.ui-select-choices-row-inner')).click();
    }
};
module.exports = uiselect;