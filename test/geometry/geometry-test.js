var vows = require("vows"),
    assert = require("assert");

var suite = vows.describe("geometry");

require("../../graph-diagram.js");

suite.addBatch({
    "node distance": {
        "distance is difference in x value when y values match": function() {
            var model = gd.model();
            var node1 = model.createNode().x(3).y(42);
            var node2 = model.createNode().x(8).y(42);
            assert.equal(node1.distanceTo(node2), 5);
        }
    }
});

suite.export(module);