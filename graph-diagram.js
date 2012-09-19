gd = {};

(function() {

    gd.parameters = {
        radius: 50,
        strokeWidth: 8,
        nodeStartMargin: 15,
        nodeEndMargin: 15
    };

    gd.model = function() {

        var nodes = {},
            relationships = [],
            highestId = 0,
            internalScale = 1,
            externalScale = 1;

        var model = {};

        var Node = function() {
            var position = {};
            var label;
            var classes = [];

            this.class = function(classesString) {
                if (arguments.length == 1) {
                    classes = classesString.split(" ").filter(function(className) {
                        return className.length > 0 && className != "graph-diagram-node";
                    });
                    return this;
                }
                return ["graph-diagram-node"].concat(classes);
            };

            this.x = function(x) {
                if (arguments.length == 1) {
                    position.x = Number(x);
                    return this;
                }
                return position.x;
            };

            this.y = function(y) {
                if (arguments.length == 1) {
                    position.y = Number(y);
                    return this;
                }
                return position.y;
            };

            this.ex = function() {
                return position.x * internalScale;
            };

            this.ey = function() {
                return position.y * internalScale;
            };

            this.distanceTo = function(node) {
                var dx = node.x() - this.x();
                var dy = node.y() - this.y();
                return Math.sqrt(dx * dx + dy * dy) * internalScale;
            };

            this.drag = function(dx, dy) {
                position.x += dx / internalScale;
                position.y += dy / internalScale;
            };

            this.midwayTo = function(node) {
                var dx = node.x() - this.x();
                var dy = node.y() - this.y();
                return {
                    x: this.x() + dx / 2,
                    y: this.y() + dy / 2
                };
            };

            this.angleTo = function(node) {
                var dx = node.x() - this.x();
                var dy = node.y() - this.y();
                return Math.atan2(dy, dx) * 180 / Math.PI
            };

            this.isLeftOf = function(node) {
                return this.x() < node.x();
            };

            this.label = function(labelText) {
                if (arguments.length == 1) {
                    label = labelText;
                    return this;
                }
                return label;
            };
        };

        var Relationship = function(start, end) {
            var label;
            var classes = [];

            this.class = function(classesString) {
                if (arguments.length == 1) {
                    classes = classesString.split(" ").filter(function(className) {
                        return className.length > 0 && className != "graph-diagram-relationship";
                    });
                    return this;
                }
                return ["graph-diagram-relationship"].concat(classes);
            };

            this.label = function(labelText) {
                if (arguments.length == 1) {
                    label = labelText;
                    return this;
                }
                return label;
            };

            this.start = start;
            this.end = end;
        };

        function generateNodeId() {
            while (nodes[highestId]) {
                highestId++;
            }
            return highestId;
        }

        model.createNode = function(optionalNodeId) {
            var nodeId = optionalNodeId || generateNodeId();
            var node = new Node();
            node.id = nodeId;
            nodes[nodeId] = node;
            return node;
        };

        model.deleteNode = function(node) {
            delete nodes[node.id];
        };

        model.createRelationship = function(start, end) {
            var relationship = new Relationship(start, end);
            relationships.push(relationship);
            return relationship;
        };

        model.nodeList = function() {
            var list = [];
            for (var nodeId in nodes) {
                list.push(nodes[nodeId]);
            }
            return list;
        };

        model.lookupNode = function(nodeId) {
            return nodes[nodeId];
        };

        model.relationshipList = function() {
            return relationships;
        };

        model.internalScale = function(newScale) {
            if (arguments.length == 1) {
                internalScale = parseFloat(newScale);
                return this;
            }
            return internalScale;
        };

        model.externalScale = function(newScale) {
            if (arguments.length == 1) {
                externalScale = parseFloat(newScale);
                return this;
            }
            return externalScale;
        };

        return model;
    };

    gd.scaling = function() {

        var scaling = {};

        function smallestContainingBox(graph) {
            var cxList = graph.nodeList().map(function(d) { return d.ex(); });
            var cyList = graph.nodeList().map(function(d) { return d.ey(); });

            var bounds = {
                xMin:Math.min.apply(Math, cxList) - gd.parameters.radius - gd.parameters.strokeWidth,
                xMax:Math.max.apply(Math, cxList) + gd.parameters.radius + gd.parameters.strokeWidth,
                yMin:Math.min.apply(Math, cyList) - gd.parameters.radius - gd.parameters.strokeWidth,
                yMax:Math.max.apply(Math, cyList) + gd.parameters.radius + gd.parameters.strokeWidth
            };
            return { x: bounds.xMin, y: bounds.yMin,
                width: (bounds.xMax - bounds.xMin), height: (bounds.yMax - bounds.yMin) }
        }

        scaling.centeredOrScaledViewBox = function(viewDimensions, diagramExtent) {
            var xScale = diagramExtent.width / viewDimensions.width;
            var yScale = diagramExtent.height / viewDimensions.height;
            var scaleFactor = xScale < 1 && yScale < 1 ? 1 : (xScale > yScale ? xScale : yScale);

            return {
                x: ((diagramExtent.width - viewDimensions.width * scaleFactor) / 2) + diagramExtent.x,
                y: ((diagramExtent.height - viewDimensions.height * scaleFactor) / 2) + diagramExtent.y,
                width: viewDimensions.width * scaleFactor,
                height: viewDimensions.height * scaleFactor
            };
        };

        scaling.centerOrScaleDiagramToFitSvg = function(graph, view) {
            var svgElement = view.node();
            var viewDimensions = {
                width: svgElement.clientWidth,
                height: svgElement.clientHeight
            };
            var diagramExtent = smallestContainingBox( graph );
            var box = scaling.centeredOrScaledViewBox( viewDimensions, diagramExtent );

            view
                .attr("viewBox", [box.x, box.y, box.width, box.height].join( " " ));
        };

        scaling.sizeSvgToFitDiagram = function(graph, view) {
            var box = smallestContainingBox( graph );

            view
                .attr("viewBox", [box.x, box.y, box.width, box.height].join( " " ))
                .attr("width", box.width * graph.externalScale())
                .attr("height", box.height * graph.externalScale());
        };

        return scaling;
    }();

    gd.markup = function() {

        var markup = {};

        markup.parse = function(selection) {
            var model = gd.model();

            if (selection.attr("data-internal-scale")) {
                model.internalScale(selection.attr("data-internal-scale"));
            }
            if (selection.attr("data-external-scale")) {
                model.externalScale(selection.attr("data-external-scale"));
            }

            selection.selectAll(".graph-diagram-node").each(function () {
                var nodeMarkup = d3.select(this);
                var id = nodeMarkup.attr("data-node-id");
                var node = model.createNode(id);
                node.class(nodeMarkup.attr("class") || "");
                node.x(nodeMarkup.attr("data-x"));
                node.y(nodeMarkup.attr("data-y"));
                nodeMarkup.select("span.graph-diagram-in-node-caption" ).each(function() {
                    node.label(d3.select(this).text());
                });
            });

            selection.selectAll(".graph-diagram-relationship").each(function () {
                var relationshipMarkup = d3.select(this);
                var fromId = relationshipMarkup.attr("data-from");
                var toId = relationshipMarkup.attr("data-to");
                var relationship = model.createRelationship(model.lookupNode(fromId), model.lookupNode(toId));
                relationship.class(relationshipMarkup.attr("class") || "");
                relationshipMarkup.select("span.graph-diagram-relationship-type" ).each(function() {
                    relationship.label(d3.select(this).text());
                });
            });

            return model;
        };

        markup.format = function(model, container) {
            var ul = container.append("ul")
                .attr("class", "graph-diagram-markup")
                .attr("data-internal-scale", model.internalScale())
                .attr("data-external-scale", model.externalScale());

            model.nodeList().forEach(function(node) {
                var li = ul.append("li")
                    .attr("class", node.class().join(" "))
                    .attr("data-node-id", node.id)
                    .attr("data-x", node.x())
                    .attr("data-y", node.y());

                if (node.label()) {
                    li.append("span")
                        .attr("class", "graph-diagram-in-node-caption")
                        .text(node.label());
                }
            });

            model.relationshipList().forEach(function(relationship) {
                var li = ul.append("li")
                    .attr("class", relationship.class().join(" "))
                    .attr("data-from", relationship.start.id)
                    .attr("data-to", relationship.end.id);

                if (relationship.label()) {
                    li.append("span")
                        .attr("class", "graph-diagram-relationship-type")
                        .text(relationship.label());
                }
            });
        };

        return markup;
    }();

    gd.horizontalArrowOutline = function(start, end) {
        var shaftRadius = 4;
        var headRadius = 15;
        var headLength = 30;
        var shoulder = start < end ? end - headLength : end + headLength;
        return ["M", start, shaftRadius,
            "L", shoulder, shaftRadius,
            "L", shoulder, headRadius,
            "L", end, 0,
            "L", shoulder, -headRadius,
            "L", shoulder, -shaftRadius,
            "L", start, -shaftRadius,
            "Z"].join(" ");
    }
})();

function bind(graph, view, nodeBehaviour, relationshipBehaviour) {
        nodeBehaviour = nodeBehaviour || function() {};
        relationshipBehaviour = relationshipBehaviour || function() {};

        function cx(d) {
            return d.ex();
        }
        function cy(d) {
            return d.ey();
        }

        function label(d) {
            return d.label();
        }

        function nodeClasses(d) {
            return d.class().join(" ") + " " + "graph-diagram-node-id-" + d.id;
        }

        var nodes = view.selectAll("circle.graph-diagram-node")
            .data(d3.values(graph.nodeList()));

        nodes.exit().remove();

        nodes.enter().append("svg:circle")
            .attr("class", nodeClasses)
            .attr("r", gd.parameters.radius)
            .call(nodeBehaviour);

        nodes
            .attr("cx", cx)
            .attr("cy", cy);

        function horizontalArrow(d) {
            var length = d.start.distanceTo(d.end);
            var side = d.end.isLeftOf(d.start) ? -1 : 1;
            return gd.horizontalArrowOutline(
                side * (gd.parameters.radius + gd.parameters.nodeStartMargin),
                side * (length - (gd.parameters.radius + gd.parameters.nodeEndMargin)));
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
            return "translate(" + d.start.ex() + "," + d.start.ey() + ") rotate(" + angle + ")";
        }

        function relationshipClasses(d) {
            return d.class().join(" ");
        }

        var relationshipGroup = view.selectAll("g.graph-diagram-relationship")
            .data(graph.relationshipList());

        relationshipGroup.exit().remove();

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
            .attr("class", relationshipClasses)
            .call(relationshipBehaviour);

        relationshipPath
            .attr("d", horizontalArrow);

        function relationshipWithLabel(d) {
            return [d].filter(label);
        }

        var relationshipLabel = relationshipGroup.selectAll("text.graph-diagram-relationship-label")
            .data(relationshipWithLabel);

        relationshipLabel.exit().remove();

        relationshipLabel.enter().append("svg:text")
            .attr("class", "graph-diagram-relationship-label")
            .call(relationshipBehaviour);

        relationshipLabel
            .attr("x", midwayBetweenStartAndEnd)
            .attr("y", 0 )
            .text(label);

        function renderBoundVariables(className) {
            function boundVariableClasses(d) {
                return className + " " + d.class;
            }

            var boundVariables = view.selectAll("text." + className)
                .data(d3.values(graph.nodeList()).filter(label));

            boundVariables.exit().remove();

            boundVariables.enter().append("svg:text")
                .attr("class", boundVariableClasses)
                .call(nodeBehaviour);

            boundVariables
                .attr("x", cx)
                .attr("y", cy)
                .text(label);
        }

        renderBoundVariables("graph-diagram-bound-variable-shadow");
        renderBoundVariables("graph-diagram-bound-variable");
}
