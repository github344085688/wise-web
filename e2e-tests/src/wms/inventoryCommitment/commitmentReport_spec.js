/**
 * Created by colinc on 8/21/16.
 */
var commitmentPage = require('./commitmentReport_page.js');

var commitment = new commitmentPage.searchCommitment();

describe('commitment report page', function () {
    it('commitment resport search', function () {
        commitment.get();
        commitment.search();
    });
});