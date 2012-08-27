var vows = require("vows"),
    assert = require("assert" ),
    d3 = require("d3");

var suite = vows.describe("graph model");

require("../../graph-diagram.js");

suite.addBatch({
    "parse markup": {
        topic: function() {
            var body = d3.select("body");
            return body.append( "ul" )
                .attr( "class", "graph-diagram-markup" );
        },
        "empty markup": {
            topic: function(markup) {
                return gd.markup.parse(markup);
            },
            "no nodes": function(model) {
                assert.equal(model.nodeList().length, 0);
            },
            "no relationships": function(model) {
                assert.equal(model.relationshipList().length, 0);
            }
        },
        "markup with one node and no relationships": {
            topic: function(markup) {
                markup.append("li")
                    .attr("class", "graph-diagram-node")
                    .attr("data-node-id", "node_A")
                    .attr("data-x", "12")
                    .attr("data-y", "34");

                return gd.markup.parse(markup);
            },
            "one node": function(model) {
                assert.equal(model.nodeList().length, 1);
            },
            "with node id": function(model) {
                assert.equal(model.nodeList()[0].id, "node_A");
            },
            "with coordinates": function(model) {
                var node = model.nodeList()[0];
                assert.isNumber(node.x());
                assert.equal(node.x(), 12);
                assert.isNumber(node.y());
                assert.equal(node.y(), 34);
            },
            "no relationships": function(model) {
                assert.equal(model.relationshipList().length, 0);
            }
        },
        "markup with two nodes and one relationship": {
            topic: function(markup) {
                markup.append("li")
                    .attr("class", "graph-diagram-node")
                    .attr("data-node-id", "node_A")
                    .attr("data-x", "12")
                    .attr("data-y", "34");
                markup.append("li")
                    .attr("class", "graph-diagram-node")
                    .attr("data-node-id", "node_B")
                    .attr("data-x", "56")
                    .attr("data-y", "78");
                markup.append("li")
                    .attr("class", "graph-diagram-relationship")
                    .attr("data-from", "node_A")
                    .attr("data-to", "node_B");

                return gd.markup.parse(markup);
            },
            "one relationship": function(model) {
                assert.equal(model.relationshipList().length, 1);
            },
            "from A": function(model) {
                assert.equal(model.relationshipList()[0].start.id, "node_A");
            },
            "to B": function(model) {
                assert.equal(model.relationshipList()[0].end.id, "node_B");
            }
        }
    }
});

suite.export(module);