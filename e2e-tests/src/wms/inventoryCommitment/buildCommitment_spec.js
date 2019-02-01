/**
 * Created by colinc on 8/20/16.
 */
var buildCommitmentPage = require('./buildCommitment_page.js');
var buildCommit = new buildCommitmentPage.searchCommitment();

describe('build commitment page', function () {
    it('commit', function () {
        buildCommit.get();
        buildCommit.search();
    })


})