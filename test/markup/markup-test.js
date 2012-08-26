var vows = require("vows"),
    assert = require("assert" ),
    d3 = require("d3");

var suite = vows.describe("graph model");

require("../../graph-diagram.js");

suite.addBatch({
    "parse markup": {
        "markup with one node and no relationships": {
            topic: function() {
                var body = d3.select("body");
                var markup = body.append("ul")
                    .attr("class", "graph-diagram-markup");

                markup.append("li")
                    .attr("class", "graph-diagram-node");

                return gd.markup.parse(markup);
            },
            "one node": function(model) {
                assert.equal(1, model.nodeList().length);
            },
            "no relationships": function(model) {
                assert.equal(0, model.relationshipList().length);
            }
        }
    }
});

suite.export(module);