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

suite.export(module);