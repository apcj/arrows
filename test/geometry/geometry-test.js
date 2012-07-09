var vows = require("vows"),
    assert = require("assert");

var suite = vows.describe("geometry");

require("../../graph-diagram.js");

suite.addBatch({
    "inter-node distance": {
        "distance is difference in x value when y values match": function() {
            var model = gd.model();
            var node1 = model.createNode().x(3).y(42);
            var node2 = model.createNode().x(8).y(42);
            assert.equal(node1.distanceTo(node2), 5);
        },
        "distance is difference in y value when x values match": function() {
            var model = gd.model();
            var node1 = model.createNode().x(42).y(3);
            var node2 = model.createNode().x(42).y(8);
            assert.equal(node1.distanceTo(node2), 5);
        },
        "uses pythagoras": function() {
            var model = gd.model();
            var node1 = model.createNode().x(3).y(0);
            var node2 = model.createNode().x(0).y(4);
            assert.equal(node1.distanceTo(node2), 5);
        }
    },
    "inter-node angle": {
        "distance is difference in x value when y values match": function() {
            var model = gd.model();
            var node1 = model.createNode().x(3).y(42);
            var node2 = model.createNode().x(8).y(42);
            assert.equal(node1.angleTo(node2), 0);
        },
        "distance is difference in y value when x values match": function() {
            var model = gd.model();
            var node1 = model.createNode().x(42).y(3);
            var node2 = model.createNode().x(42).y(8);
            assert.equal(node1.angleTo(node2), 90);
        },
        "uses pythagoras": function() {
            var model = gd.model();
            var node1 = model.createNode().x(5).y(0);
            var node2 = model.createNode().x(0).y(5);
            assert.equal(node1.angleTo(node2), 135);
        }
    }
});

suite.export(module);