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
    "delete node": {
        "deleting a node removes it from the node list": function() {
            var model = gd.model();
            var newNode = model.createNode();
            assert.includes(model.nodeList(), newNode);
            model.deleteNode(newNode);
            assert.equal(model.nodeList().length, 0);
            assert.isEmpty(model.nodeList())
        }
    },
    "related pairs": {
        "relationships grouped by the pairs of nodes they connect": function ()
        {
            var model = gd.model();
            var node1 = model.createNode();
            var node2 = model.createNode();
            var node3 = model.createNode();
            var relationship1 = model.createRelationship( node1, node2 );
            var relationship2 = model.createRelationship( node2, node1 );
            var relationship3 = model.createRelationship( node1, node3 );
            assert.equal( relationship2, model.groupedRelationshipList()[0][0] );
            assert.equal( relationship1, model.groupedRelationshipList()[0][1] );
            assert.equal( relationship3, model.groupedRelationshipList()[1][0] );
        }
    },
    "node position": {
        "nodes store x and y coordinates": function() {
            var model = gd.model();
            var node = model.createNode();
            assert.isUndefined(node.x());
            assert.isUndefined(node.y());
            node.x(12).y(34);
            assert.equal(node.x(), 12);
            assert.equal(node.y(), 34);
        }
    },
    "internal scale": {
        "exposed via ex and ey properties": function() {
            var model = gd.model();
            var node = model.createNode().x(12).y(34);
            assert.equal(node.ex(), 12);
            assert.equal(node.ey(), 34);
            model.internalScale(2);
            assert.equal(node.ex(), 24);
            assert.equal(node.ey(), 68);
        },
        "used in drag position update": function() {
            var model = gd.model().internalScale(2);
            var node = model.createNode().x(0).y(0);
            assert.equal(node.ex(), 0);
            assert.equal(node.ey(), 0);
            assert.equal(node.x(), 0);
            assert.equal(node.y(), 0);
            node.drag(24, 68);
            assert.equal(node.x(), 12);
            assert.equal(node.y(), 34);
            assert.equal(node.ex(), 24);
            assert.equal(node.ey(), 68);
        },
        "used in distance calculation": function() {
            var model = gd.model();
            var node1 = model.createNode().x(0).y(0);
            var node2 = model.createNode().x(0).y(10);
            assert.equal(node1.distanceTo(node2), 10);
            model.internalScale(2);
            assert.equal(node1.distanceTo(node2), 20);
        }
    }
});

suite.export(module);