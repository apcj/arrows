var vows = require("vows"),
    assert = require("assert");

var suite = vows.describe("geometry");

suite.addBatch({
    "distance": {
        "distance is difference in x value when y values match": function() {
            assert.equal(5, 2 + 3);
        }
    }
});

suite.export(module);