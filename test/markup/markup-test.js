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
        "scales": {
            topic: function(markup) {
                markup.attr("data-internal-scale", 2.3);
                markup.attr("data-external-scale", 4.5);
                return gd.markup.parse(markup);
            },
            "internal scale": function(model) {
                assert.strictEqual(model.internalScale(), 2.3);
            },
            "external scale": function(model) {
                assert.strictEqual(model.externalScale(), 4.5);
            }
        },
        "markup with one node and no relationships": {
            topic: function(markup) {
                var li = markup.append("li")
                    .attr("class", "node diagram-specific-class")
                    .attr("data-node-id", "node_A")
                    .attr("data-x", "12")
                    .attr("data-y", "34");

                li.append("span")
                    .attr("class", "caption")
                    .text("A");

                var dl = li.append("dl")
                    .attr("class", "properties");

                dl.append("dt")
                    .text("name");

                dl.append("dd")
                    .text("Alistair");

                dl.append("dt")
                    .text("location");

                dl.append("dd")
                    .text("London");

                return gd.markup.parse(markup);
            },
            "one node": function(model) {
                assert.equal(model.nodeList().length, 1);
            },
            "with node id": function(model) {
                assert.equal(model.nodeList()[0].id, "node_A");
            },
            "with class": function(model) {
                assert.deepEqual(model.nodeList()[0].class(), ["node", "diagram-specific-class"]);
            },
            "with coordinates": function(model) {
                var node = model.nodeList()[0];
                assert.isNumber(node.x());
                assert.equal(node.x(), 12);
                assert.isNumber(node.y());
                assert.equal(node.y(), 34);
            },
            "with caption": function(model) {
                var node = model.nodeList()[0];
                assert.equal(node.caption(), "A");
            },
            "with properties": function(model) {
                var node = model.nodeList()[0];
                assert.equal(node.properties().list().length, 2);
                assert.equal(node.properties().list()[0].key, "name");
                assert.equal(node.properties().list()[0].value, "Alistair");
                assert.equal(node.properties().list()[1].key, "location");
                assert.equal(node.properties().list()[1].value, "London");
            },
            "no relationships": function(model) {
                assert.equal(model.relationshipList().length, 0);
            }
        },
        "markup with two nodes and one relationship": {
            topic: function(markup) {
                markup
                    .append("li")
                    .attr("class", "node")
                    .attr("data-node-id", "node_A")
                    .attr("data-x", "12")
                    .attr("data-y", "34");

                markup
                    .append("li")
                    .attr("class", "node")
                    .attr("data-node-id", "node_B")
                    .attr("data-x", "56")
                    .attr("data-y", "78");

                var li = markup
                    .append("li")
                    .attr("class", "relationship diagram-specific-class")
                    .attr("data-from", "node_A")
                    .attr("data-to", "node_B");

                li
                    .append("span")
                    .attr("class", "type")
                    .text("RELATED_TO");

                var dl = li.append("dl")
                    .attr("class", "properties");

                dl.append("dt")
                    .text("name");

                dl.append("dd")
                    .text("Alistair");

                dl.append("dt")
                    .text("location");

                dl.append("dd")
                    .text("London");

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
            },
            "with class": function(model) {
                assert.deepEqual(model.relationshipList()[0].class(), ["relationship", "diagram-specific-class"]);
            },
            "with relationship type": function(model) {
                assert.equal(model.relationshipList()[0].relationshipType(), "RELATED_TO");
            },
            "with properties": function(model) {
                var relationship = model.relationshipList()[0];
                assert.equal(relationship.properties().list().length, 2);
                assert.equal(relationship.properties().list()[0].key, "name");
                assert.equal(relationship.properties().list()[0].value, "Alistair");
                assert.equal(relationship.properties().list()[1].key, "location");
                assert.equal(relationship.properties().list()[1].value, "London");
            }
        }
    },
    "format markup": {
        "empty model": {
            topic: function() {
                var markup = d3.select("body").append("div");
                var model = gd.model();
                gd.markup.format(model, markup);
                var ul = markup.select("ul.graph-diagram-markup");
                return markup;
            },
            "empty ul": function(markup) {
                var ul = markup.select("ul.graph-diagram-markup");
                assert.equal(ul[0].length, 1);
                assert.equal(ul.selectAll("li")[0].length, 0);
            }
        },
        "scales": {
            topic: function() {
                var model = gd.model();
                model.internalScale(2.3);
                model.externalScale(4.5);

                var markup = d3.select("body").append("div");
                gd.markup.format(model, markup);
                return markup.select("ul.graph-diagram-markup");
            },
            "internal scale": function(ul) {
                assert.equal(ul.attr("data-internal-scale"), 2.3);
            },
            "external scale": function(ul) {
                assert.equal(ul.attr("data-external-scale"), 4.5);
            }
        },
        "one node": {
            topic: function() {
                var model = gd.model();
                model.createNode("node_A").x(12).y(34).caption("A" ).class("diagram-specific-class")
                    .properties().set("name", "Alistair").set("location", "London");

                var markup = d3.select("body").append("div");
                gd.markup.format(model, markup);
                return markup.select("ul.graph-diagram-markup")
                    .selectAll("li.node");
            },
            "one node li": function(nodes) {
                assert.equal(nodes[0].length, 1);
            },
            "with node id attribute": function(nodes) {
                assert.equal(nodes.attr("data-node-id"), "node_A");
            },
            "with class": function(nodes) {
                assert.equal(nodes.attr("class"), "node diagram-specific-class")
            },
            "with coordinates attributes": function(nodes) {
                assert.equal(nodes.attr("data-x"), "12");
                assert.equal(nodes.attr("data-y"), "34");
            },
            "with caption": function(nodes) {
                assert.equal(nodes.select("span.caption").text(), "A");
            },
            "with properties": function(nodes) {
                var list = nodes.select("dl.properties");
                assert.equal(list.select("dt:nth-child(1)").text(), "name");
                assert.equal(list.select("dd:nth-child(2)").text(), "Alistair");
                assert.equal(list.select("dt:nth-child(3)").text(), "location");
                assert.equal(list.select("dd:nth-child(4)").text(), "London");
            }
        },
        "two nodes and one relationship": {
            topic: function() {
                var model = gd.model();
                var nodeA = model.createNode("node_A");
                var nodeB = model.createNode("node_B");
                model.createRelationship(nodeA, nodeB).relationshipType("RELATED TO" ).class("diagram-specific-class")
                    .properties().set("name", "Alistair").set("location", "London");

                var markup = d3.select("body").append("div");
                gd.markup.format(model, markup);
                return markup.select("ul.graph-diagram-markup")
                    .selectAll("li.relationship");
            },
            "one relationship li": function(relationships) {
                assert.equal(relationships[0].length, 1);
            },
            "from A": function(relationships) {
                assert.equal(relationships.attr("data-from"), "node_A");
            },
            "to B": function(relationships) {
                assert.equal(relationships.attr("data-to"), "node_B");
            },
            "with class": function(relationships) {
                assert.equal(relationships.attr("class"), "relationship diagram-specific-class");
            },
            "with relationship type": function(relationships) {
                assert.equal(relationships.select("span.type" ).text(),
                    "RELATED TO");
            },
            "with properties": function(nodes) {
                var list = nodes.select("dl.properties");
                assert.equal(list.select("dt:nth-child(1)").text(), "name");
                assert.equal(list.select("dd:nth-child(2)").text(), "Alistair");
                assert.equal(list.select("dt:nth-child(3)").text(), "location");
                assert.equal(list.select("dd:nth-child(4)").text(), "London");
            }
        }
    }
});

suite.export(module);