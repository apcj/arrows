var vows = require("vows"),
    assert = require("assert");

var suite = vows.describe("geometry");

require("../../graph-diagram.js");

suite.addBatch({
    "arrow outline": {
        "arrow from left to right": function() {
            var start = 7;
            var end = 100;
            var arrowOutlinePath = gd.horizontalArrowOutline(start, end, 8);
            assert.equal(arrowOutlinePath, "M 7 4 L 68 4 L 68 16 L 100 0 L 68 -16 L 68 -4 L 7 -4 Z");
        },
        "arrow from right to left": function() {
            var start = 100;
            var end = 7;
            var arrowOutlinePath = gd.horizontalArrowOutline(start, end, 8);
            assert.equal(arrowOutlinePath, "M 100 4 L 39 4 L 39 16 L 7 0 L 39 -16 L 39 -4 L 100 -4 Z");
        }
    }
});

suite.export(module);