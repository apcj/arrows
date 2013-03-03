var vows = require("vows"),
    assert = require("assert");

var suite = vows.describe("graph style");

require("../../graph-diagram.js");

suite.addBatch({
    "create node": {
        "default radius": function() {
            var model = gd.model();
            var node = model.createNode();
            assert.equal(node.radius.mid(), gd.parameters.radius);
            assert.equal(node.radius.inside(), gd.parameters.radius - gd.parameters.nodeStrokeWidth / 2);
            assert.equal(node.radius.outside(), gd.parameters.radius + gd.parameters.nodeStrokeWidth / 2);
            assert.equal(node.radius.startRelationship(), gd.parameters.radius + gd.parameters.nodeStrokeWidth / 2 + gd.parameters.nodeStartMargin);
            assert.equal(node.radius.endRelationship(), gd.parameters.radius + gd.parameters.nodeStrokeWidth / 2 + gd.parameters.nodeEndMargin);
        }
    }
});

suite.export(module);