var vows = require("vows"),
    assert = require("assert");

var suite = vows.describe("graph style");

require("../../graph-diagram.js");

suite.addBatch({
    "create node": {
        "store and retrieve a specific style attribute": function() {
            var model = gd.model();
            var node = model.createNode();
            node.style("font-size", "20px");
            node.style("padding", "10px");
            assert.equal(node.style("font-size"), "20px");
            assert.equal(node.style("padding"), "10px")
        }
    }
});

suite.export(module);