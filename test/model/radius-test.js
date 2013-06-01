var vows = require("vows"),
    assert = require("assert");

var suite = vows.describe("graph style");

require("../../graph-diagram.js");

suite.addBatch({
    "create node": {
        "default radius": function() {
            var model = gd.model();
            var node = model.createNode();
            node.style("min-width", "92px");
            node.style("border-width", gd.parameters.nodeStrokeWidth + "px");
            node.style("margin", gd.parameters.nodeStartMargin + "px");
            node.style("font-size", "20px");
            var caption = gd.wrapAndMeasureCaption( node );
            assert.equal(caption.radius.mid(), gd.parameters.radius);
            assert.equal(caption.radius.inside(), gd.parameters.radius - gd.parameters.nodeStrokeWidth / 2);
            assert.equal(caption.radius.outside(), gd.parameters.radius + gd.parameters.nodeStrokeWidth / 2);
            assert.equal(caption.radius.startRelationship(), gd.parameters.radius + gd.parameters.nodeStrokeWidth / 2 + gd.parameters.nodeStartMargin);
            assert.equal(caption.radius.endRelationship(), gd.parameters.radius + gd.parameters.nodeStrokeWidth / 2 + gd.parameters.nodeEndMargin);
        }
    }
});

suite.export(module);