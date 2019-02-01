/**
 * Created by colinc on 8/20/16.
 */
var findByText = function() {
    var using = arguments[0] || document;
    var text = arguments[1];
    var matches = [];
    function addMatchingLeaves(element) {
        if (element.children.length === 0 && element.textContent.match(text)) {
            matches.push(element);
        }
        for (var i = 0; i < element.children.length; ++i) {
            addMatchingLeaves(element.children[i]);
        }
    }
    addMatchingLeaves(using);
    return matches;
};

module.exports = findByText;