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
        "east is zero degrees": function() {
            var model = gd.model();
            var node1 = model.createNode().x(0).y(0);
            var node2 = model.createNode().x(10).y(0);
            assert.equal(node1.angleTo(node2), 0);
        },
        "north is 90 degrees": function() {
            var model = gd.model();
            var node1 = model.createNode().x(0).y(0);
            var node2 = model.createNode().x(0).y(10);
            assert.equal(node1.angleTo(node2), 90);
        },
        "south-east is 45 degrees": function() {
            var model = gd.model();
            var node1 = model.createNode().x(0).y(0);
            var node2 = model.createNode().x(10).y(10);
            assert.equal(node1.angleTo(node2), 45);
        },
        "south-west is 135 degrees": function() {
            var model = gd.model();
            var node1 = model.createNode().x(0).y(0);
            var node2 = model.createNode().x(-10).y(10);
            assert.equal(node1.angleTo(node2), 135);
        }
    },
    "relative node position": {
        "node with smaller x coordinate is on the left": function()  {
            var model = gd.model();
            var node1 = model.createNode().x(0).y(0);
            var node2 = model.createNode().x(10).y(0);
            assert.isTrue(node1.isLeftOf(node2));
            assert.isFalse(node2.isLeftOf(node1));
        }
    },
    "midway point": {
        "find point that is midway to another node": function()  {
            var model = gd.model();
            var node1 = model.createNode().x(0).y(0);
            var node2 = model.createNode().x(10).y(10);
            var midway = node1.midwayTo(node2);
            assert.equal(midway.x, 5);
            assert.equal(midway.y, 5);
        }
    }
});

suite.export(module);