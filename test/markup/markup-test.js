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
                assert.equal(0, model.relationshipList().length);
            }
        }
    }
});

suite.export(module);