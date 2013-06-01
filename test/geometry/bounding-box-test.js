var vows = require("vows"),
    assert = require("assert");

var suite = vows.describe("bounding-box");

require("../../graph-diagram.js");

suite.addBatch({
    "simple node bounding box": function()
    {
        var node = {
            model: gd.model().createNode().x( 100 ).y( 100 ),
            radius: new gd.Radius(50 ).border(4)
        };
        assert.deepEqual( gd.scaling.nodeBox( node ), { x1: 46, y1: 46, x2: 154, y2: 154 } );
    },
    "convert width and height to x1 y2 x2 y2 format": {
        "positive width and height": function() {
            var rect1 = { x: 0, y: 0, width: 10, height: 10 };
            assert.deepEqual(gd.scaling.boxNormalise(rect1), { x1: 0, y1: 0, x2: 10, y2: 10 })
        },
        "negative width and height": function() {
            var rect1 = { x: 0, y: 0, width: -10, height: -10 };
            assert.deepEqual(gd.scaling.boxNormalise(rect1), { x1: -10, y1: -10, x2: 0, y2: 0 })
        }
    },
    "union of bounding boxes": {
        "horizontally aligned": function() {
            var rect1 = { x1: 0, y1: 0, x2: 10, y2: 10 };
            var rect2 = { x1: 20, y1: 0, x2: 30, y2: 10 };
            assert.deepEqual(gd.scaling.boxUnion([rect1, rect2]), { x1: 0, y1: 0, x2: 30, y2: 10 });
        },
        "vertically aligned": function() {
            var rect1 = { x1: 0, y1: 0, x2: 10, y2: 10 };
            var rect2 = { x1: 0, y1: 20, x2: 10, y2: 30 };
            assert.deepEqual(gd.scaling.boxUnion([rect1, rect2]), { x1: 0, y1: 0, x2: 10, y2: 30 });
        },
        "union of no boxes" : function() {
            assert.deepEqual(gd.scaling.boxUnion([]), { x1: 0, y1: 0, x2: 0, y2: 0 });
        }
    }
});

suite.export(module);