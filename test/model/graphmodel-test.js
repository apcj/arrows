var vows = require("vows"),
    assert = require("assert");

var suite = vows.describe("graph model");

require("../../graph-diagram.js");

suite.addBatch({
    "create node": {
        "creating a node adds it to the node list": function() {
            var model = gd.model();
            var newNode = model.createNode();
            assert.includes(model.nodeList(), newNode);
        },
        "new nodes get a new id": function() {
            var model = gd.model();
            var node1 = model.createNode();
            var node2 = model.createNode();
            assert.notEqual(node1.id, node2.id);
        }
    },
    "create relationship": {
        "creating a relationship adds it to the relationship list": function() {
            var model = gd.model();
            var node1 = model.createNode();
            var node2 = model.createNode();
            var newRelationship = model.createRelationship(node1, node2);
            assert.equal(node1, newRelationship.start);
            assert.equal(node2, newRelationship.end);
            assert.includes(model.relationshipList(), newRelationship);
        }
    },
    "node position": {
        "nodes store x and y coordinates": function() {
            var model = gd.model();
            var node = model.createNode();
            assert.isUndefined(node.x());
            assert.isUndefined(node.y());
            node.x(12).y(34);
            assert.equal(12, node.x());
            assert.equal(34, node.y());
        }
    }
});

suite.export(module);