gd = {};

(function() {

    gd.model = function() {

        var nodes = {},
            relationships = [],
            nodeIdGenerator = 0,
            internalScale = 1,
            externalScale = 1;

        var model = {};

        var Node = function() {
            var position = {};

            this.x = function(x) {
                if (arguments.length == 1) {
                    position.x = x;
                    return this;
                }
                return position.x;
            };

            this.y = function(y) {
                if (arguments.length == 1) {
                    position.y = y;
                    return this;
                }
                return position.y;
            };

            this.distanceTo = function(node) {
                var dx = node.x() - this.x();
                var dy = node.y() - this.y();
                return Math.sqrt(dx * dx + dy * dy);
            }

            this.midwayTo = function(node) {
                var dx = node.x() - this.x();
                var dy = node.y() - this.y();
                return {
                    x: this.x() + dx / 2,
                    y: this.y() + dy / 2
                };
            }

            this.angleTo = function(node) {
                var dx = node.x() - this.x();
                var dy = node.y() - this.y();
                return Math.atan2(dy, dx) * 180 / Math.PI
            }

            this.isLeftOf = function(node) {
                return this.x() < node.x();
            }
        };

        model.createNode = function() {
            var nodeId = nodeIdGenerator++;
            var node = new Node();
            node.id = nodeId;
            nodes[nodeId] = node;
            return node;
        }

        model.deleteNode = function(node) {
            delete nodes[node.id];
        }

        model.createRelationship = function(start, end) {
            var relationship = {
                label: "KNOWS",
                start: start,
                end: end
            };
            relationships.push(relationship);
            return relationship;
        }

        model.nodeList = function() {
            var list = [];
            for (var nodeId in nodes) {
                list.push(nodes[nodeId]);
            }
            return list;
        }

        model.relationshipList = function() {
            return relationships;
        }

        model.internalScale = function() {
            return internalScale;
        }

        model.externalScale = function() {
            return externalScale;
        }

        return model;
    }
})();

function bind(graph, view) {
        var radius = 50;
        var strokeWidth = 8;
        var nodeStartMargin = 20;
        var nodeEndMargin = 40;

        function cx(d) {
            return d.x() * graph.internalScale();
        }
        function cy(d) {
            return d.y() * graph.internalScale();
        }

        function smallestContainingBox(graph) {
            var cxList = graph.nodeList().map(cx);
            var cyList = graph.nodeList().map(cy);

            var bounds = {
                xMin:Math.min.apply(Math, cxList) - radius - strokeWidth,
                xMax:Math.max.apply(Math, cxList) + radius + strokeWidth,
                yMin:Math.min.apply(Math, cyList) - radius - strokeWidth,
                yMax:Math.max.apply(Math, cyList) + radius + strokeWidth
            };
            return { x: bounds.xMin, y: bounds.yMin, width: (bounds.xMax - bounds.xMin), height: (bounds.yMax - bounds.yMin) }
        }

        function viewBox(graph) {
            var box = smallestContainingBox(graph);
            return [box.x, box.y, box.width, box.height].join(" ");
        }

        function width(graph) {
            return smallestContainingBox(graph).width * graph.externalScale();
        }

        function height(graph) {
            return smallestContainingBox(graph).height * graph.externalScale();
        }

        function label(d) {
            return d.label;
        }

        view
            .attr("class", "graphdiagram");

        var definitions = view.selectAll("defs")
            .data([{}])
            .enter().append("svg:defs");

        var marker = definitions.selectAll("marker")
            .data(["normal", "highlight", "lowlight"])
            .enter().append("svg:marker")
            .attr("id", function(d) { return "graph-diagram-arrowhead-" + d; } )
            .attr("viewBox", "0 0 10 10")
            .attr("refX", "5")
            .attr("refY", "5")
            .attr("markerUnits", "strokeWidth")
            .attr("markerWidth", "6")
            .attr("markerHeight", "9")
            .attr("orient", "auto")
            .append("svg:path")
            .attr("class", function(d) { return "graph-diagram-arrowhead-" + d; })
            .attr("d", "M 0 0 L 10 5 L 0 10 z");

        function nodeClasses(d) {
            return "graph-diagram-node graph-diagram-node-id-" + d.id + " " + d.class;
        }

        var nodes = view.selectAll("circle.graph-diagram-node")
            .data(d3.values(graph.nodeList()));

        nodes.exit().remove();

        nodes.enter().append("svg:circle")
            .attr("class", nodeClasses)
            .attr("r", radius);

        nodes
            .attr("cx", cx)
            .attr("cy", cy);

        function boundVariableClasses(d) {
            return "graph-diagram-bound-variable " + d.class;
        }

        var boundVariables = view.selectAll("text.graph-diagram-bound-variable")
            .data(d3.values(graph.nodeList()).filter(label));

        boundVariables.exit().remove();

        boundVariables.enter().append("svg:text")
            .attr("class", boundVariableClasses);

        boundVariables
            .attr("x", cx)
            .attr("y", cy)
            .text(label);

        function horizontalArrow(d) {
            var length = d.start.distanceTo(d.end);
            var side = d.end.isLeftOf(d.start) ? -1 : 1;
            return ["M", side * (radius + nodeStartMargin), 0,
                "L", side * (length - (radius + nodeEndMargin)), 0 ].join(" ");
        }

        function midwayBetweenStartAndEnd(d) {
            var length = d.start.distanceTo(d.end);
            var side = d.end.isLeftOf(d.start) ? -1 : 1;
            return side * length / 2;
        }

        function translateToStartNodeCenterAndRotateToRelationshipAngle(d) {
            var angle = d.start.angleTo(d.end);
            if (d.end.isLeftOf(d.start)) {
                angle += 180;
            }
            var startX = d.start.x() * graph.internalScale();
            var startY = d.start.y() * graph.internalScale();
            return "translate(" + startX + "," + startY + ") rotate(" + angle + ")";
        }

        function relationshipClasses(d) {
            return "graph-diagram-relationship " + d.class;
        }

        var relationshipGroup = view.selectAll("g.graph-diagram-relationship")
            .data(graph.relationshipList());

        relationshipGroup.enter().append("svg:g")
            .attr("class", relationshipClasses);

        relationshipGroup
            .attr("transform", translateToStartNodeCenterAndRotateToRelationshipAngle);

        function singleton(d) {
            return [d];
        }

        var relationshipPath = relationshipGroup.selectAll("path.graph-diagram-relationship")
            .data(singleton);

        relationshipPath.enter().append("svg:path")
            .attr("class", relationshipClasses);

        relationshipPath
            .attr("d", horizontalArrow);

        function relationshipWithLabel(d) {
            return [d].filter(label);
        }

        var relationshipLabel = relationshipGroup.selectAll("text.graph-diagram-relationship-label")
            .data(relationshipWithLabel);

        relationshipLabel.enter().append("svg:text")
            .attr("class", "graph-diagram-relationship-label");

        relationshipLabel
            .attr("x", midwayBetweenStartAndEnd)
            .attr("y", 0 )
            .text(label);
    }
