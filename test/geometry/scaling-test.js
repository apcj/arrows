var vows = require("vows"),
    assert = require("assert");

var suite = vows.describe("scaling");

require("../../graph-diagram.js");

suite.addBatch({
    "small diagram entirely fits inside view": {
        topic: function() {
            var view = { width: 1000, height: 500 };
            var diagram = { width: 500, height: 250, x: 33, y: 66 };
            return gd.scaling.viewBox(view, diagram);
        },
        "keep at natural scale": function(viewBox) {
            assert.equal(viewBox.width, 1000);
            assert.equal(viewBox.height, 500);
        },
        "locate in center of view": function(viewBox) {
            assert.equal(viewBox.x, -217);
            assert.equal(viewBox.y, -59);
        }
    },
    "diagram too wide to fit inside view": {
        topic: function() {
            var view = { width: 1000, height: 500 };
            var diagram = { width: 2000, height: 500, x: 33, y: 66 };
            return gd.scaling.viewBox(view, diagram);
        },
        "scaled down to fit": function(viewBox) {
            assert.equal(viewBox.width, 2000);
            assert.equal(viewBox.height, 1000);
        },
        "flushed left": function(viewBox) {
            assert.equal(viewBox.x, 33);
        },
        "centered vertically": function(viewBox) {
            assert.equal(viewBox.y, -184);
        }
    },
    "diagram too tall to fit inside view": {
        topic: function() {
            var view = { width: 1000, height: 500 };
            var diagram = { width: 500, height: 1000, x: 33, y: 66 };
            return gd.scaling.viewBox(view, diagram);
        },
        "scaled down to fit": function(viewBox) {
            assert.equal(viewBox.width, 2000);
            assert.equal(viewBox.height, 1000);
        },
        "flushed top": function(viewBox) {
            assert.equal(viewBox.y, 66);
        },
        "centered horizontally": function(viewBox) {
            assert.equal(viewBox.x, -717);
        }
    },
    "wide diagram too tall and too wide to fit inside view": {
        topic: function() {
            var view = { width: 1000, height: 500 };
            var diagram = { width: 4000, height: 1000, x: 33, y: 66 };
            return gd.scaling.viewBox(view, diagram);
        },
        "scaled down to fit": function(viewBox) {
            assert.equal(viewBox.width, 4000);
            assert.equal(viewBox.height, 2000);
        },
        "flushed left": function(viewBox) {
            assert.equal(viewBox.x, 33);
        },
        "centered vertically": function(viewBox) {
            assert.equal(viewBox.y, -434);
        }
    },
    "tall diagram too tall and too wide to fit inside view": {
        topic: function() {
            var view = { width: 1000, height: 500 };
            var diagram = { width: 2000, height: 4000, x: 33, y: 66 };
            return gd.scaling.viewBox(view, diagram);
        },
        "scaled down to fit": function(viewBox) {
            assert.equal(viewBox.width, 8000);
            assert.equal(viewBox.height, 4000);
        },
        "flushed top": function(viewBox) {
            assert.equal(viewBox.y, 66);
        },
        "centered horizontally": function(viewBox) {
            assert.equal(viewBox.x, -2967);
        }
    }
});

suite.export(module);