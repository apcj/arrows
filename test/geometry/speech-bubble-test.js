var vows = require("vows"),
    assert = require("assert");

var suite = vows.describe("geometry");

require("../../graph-diagram.js");

suite.addBatch({
    "arrow outline": {
        "corner speech bubble": function() {
            var textSize = { width: 87, height: 42 };
            var margin = 20;
            var padding = 10;
            var speechBubblePath = gd.speechBubblePath(textSize, margin, padding);
            assert.equal(speechBubblePath, "M 0 0 L 30 20 L 117 20 A 10 10 0 0 1 127 30 L 127 72 " +
                "A 10 10 0 0 1 117 82 L 30 82 A 10 10 0 0 1 20 72 L 20 30 Z");
        }
    }
});

function bubbleOrientation(model, relatedNodes) {
    var focus = model.createNode().x(0).y(0);
    return gd.chooseSpeechBubbleOrientation(focus, relatedNodes).key;
}

suite.addBatch({
    "avoid relationships": {
        topic: function() {
            return gd.model();
        },
        "relationship to east, go west": function(model) {
            var relatedNode = model.createNode().x(10).y(0);
            assert.equal(bubbleOrientation(model, [relatedNode]), "WEST");
        },
        "relationship to west, go east": function(model) {
            var relatedNode = model.createNode().x(-10).y(0);
            assert.equal(bubbleOrientation(model, [relatedNode]), "EAST");
        },
        "relationship to north, go south": function(model) {
            var relatedNode = model.createNode().x(0).y(-10);
            assert.equal(bubbleOrientation(model, [relatedNode]), "SOUTH");
        },
        "relationship to south, go north": function(model) {
            var relatedNode = model.createNode().x(0).y(10);
            assert.equal(bubbleOrientation(model, [relatedNode]), "NORTH");
        },
        "relationship to north-east, go south-west": function(model) {
            var relatedNode = model.createNode().x(10).y(-10);
            assert.equal(bubbleOrientation(model, [relatedNode]), "SOUTH-WEST");
        },
        "relationship to south-east, go north-west": function(model) {
            var relatedNode = model.createNode().x(10).y(10);
            assert.equal(bubbleOrientation(model, [relatedNode]), "NORTH-WEST");
        },
        "relationship to north-west, go south-east": function(model) {
            var relatedNode = model.createNode().x(-10).y(-10);
            assert.equal(bubbleOrientation(model, [relatedNode]), "SOUTH-EAST");
        },
        "relationship to south-west, go north-east": function(model) {
            var relatedNode = model.createNode().x(-10).y(10);
            assert.equal(bubbleOrientation(model, [relatedNode]), "NORTH-EAST");
        }
    }
});
suite.export(module);