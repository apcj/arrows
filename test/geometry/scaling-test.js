var vows = require("vows"),
    assert = require("assert");

var suite = vows.describe("scaling");

require("../../graph-diagram.js");

suite.addBatch({
    "small diagram entirely fits inside view": {
        topic: function() {
            var view = { width: 1000, height: 500 };
            var diagram = { width: 500, height: 250, x: 33, y: 66 };
            return gd.scaling.viewBox(view, diagram);
        },
        "keep at natural scale": function(viewBox) {
            assert.equal(viewBox.width, 1000);
            assert.equal(viewBox.height, 500);
        },
        "locate in center of view": function(viewBox) {
            assert.equal(viewBox.x, -217);
            assert.equal(viewBox.y, -59);
        }
    }
});

suite.export(module);