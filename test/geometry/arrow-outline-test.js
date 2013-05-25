var vows = require("vows"),
    assert = require("assert");

var suite = vows.describe("geometry");

require("../../graph-diagram.js");

suite.addBatch({
    "straight arrow": {
        "arrow from left to right": function() {
            var start = 7;
            var end = 100;
            var arrowWidth = 8;
            var arrowOutlinePath = gd.horizontalArrowOutline(start, end, arrowWidth);
            assert.equal(arrowOutlinePath.outline, "M 7 4 L 68 4 L 68 16 L 100 0 L 68 -16 L 68 -4 L 7 -4 Z");
        },
        "arrow from right to left": function ( )
        {
            var start = 100;
            var end = 7;
            var arrowWidth = 8;
            var arrowOutlinePath = gd.horizontalArrowOutline(start, end, arrowWidth);
            assert.equal(arrowOutlinePath.outline, "M 100 4 L 39 4 L 39 16 L 7 0 L 39 -16 L 39 -4 L 100 -4 Z");
        }
    },
    "curved arrow": {
        "equal sized nodes": function() {
            var startRadius = 60;
            var endRadius = 60;
            var endCentre = 300;
            var minOffset = 8;
            var arrowWidth = 8;
            var headWidth = 16;
            var headLength = 16;
            var arrowOutlinePath = gd.curvedArrowOutline(startRadius, endRadius, endCentre, minOffset, arrowWidth, headWidth, headLength);
            assert.equal(arrowOutlinePath.outline,
                "M 58.93570183156151,11.94081444547556 L 59.99921081254002,4.011820269202127 " +
                    "A 649.7293323565336 649.7293323565336 0 0 0 224.0670051738528,5.116668518902473 " +
                    "L 223.58869109461165,1.1453695322232154 L 240.43051519981097,7.1747111886171595 " +
                    "L 225.50194741157623,17.030565478940247 L 225.02363333233507,13.059266492260988 " +
                    "A 657.7293323565336 657.7293323565336 0 0 1 58.93570183156151,11.94081444547556");
        },
        "big start node": function() {
            var startRadius = 100;
            var endRadius = 60;
            var endCentre = 300;
            var minOffset = 8;
            var arrowWidth = 8;
            var headWidth = 16;
            var headLength = 16;
            var arrowOutlinePath = gd.curvedArrowOutline(startRadius, endRadius, endCentre, minOffset, arrowWidth, headWidth, headLength);
            assert.equal(arrowOutlinePath.outline,
                "M 98.90161804948521,15.312411540764543 L 99.80867450465975,7.363999838598744 " +
                    "A 504.7652782258458 504.7652782258458 0 0 0 224.14280083491312,6.138838231159152 " +
                    "L 223.61104634442384,2.1743411430224358 L 240.53254367794923,7.976317357338845 " +
                    "L 225.7380643063809,18.032329495569304 L 225.20630981589161,14.067832407432586 " +
                    "A 512.7652782258458 512.7652782258458 0 0 1 98.90161804948521,15.312411540764543");
        },
        "big end node": function() {
            var startRadius = 60;
            var endRadius = 100;
            var endCentre = 300;
            var minOffset = 8;
            var arrowWidth = 8;
            var headWidth = 16;
            var headLength = 16;
            var arrowOutlinePath = gd.curvedArrowOutline(startRadius, endRadius, endCentre, minOffset, arrowWidth, headWidth, headLength);
            assert.equal(arrowOutlinePath.outline,
                "M 58.93570183156151,11.94081444547556 L 59.99921081254002,4.011820269202127 " +
                    "A 553.4442968453301 553.4442968453301 0 0 0 184.1194818347101,6.611014274974005 " +
                    "L 183.75416125022133,2.6277315997739654 L 200.417933119999,9.133014612219005 " +
                    "L 185.21544358817636,18.560862300574126 L 184.8501230036876,14.577579625374087 " +
                    "A 561.4442968453301 561.4442968453301 0 0 1 58.93570183156151,11.94081444547556");
        }
    }
});

suite.export(module);