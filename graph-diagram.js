gd = {};

(function() {

    gd.parameters = {
        radius: 50,
        strokeWidth: 8,
        nodeStartMargin: 15,
        nodeEndMargin: 15,
        speechBubbleMargin: 20,
        speechBubblePadding: 10
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
            var properties = new Properties();

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

            this.properties = function() {
                return properties;
            };
        };

        var Properties = function() {
            var keys = [];
            var values = {};

            this.list = function() {
                return keys.map(function (key) {
                    return { key: key, value: values[key] };
                });
            };

            this.set = function(key, value) {
                if (!values[key]) {
                    keys.push(key);
                }
                values[key] = value;
                return this;
            };

            this.clearAll = function() {
                keys = [];
                values = {};
            }
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
            relationships = relationships.filter(function (relationship) {
               return !(relationship.start === node || relationship.end == node);
            });
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
                if (nodes.hasOwnProperty(nodeId)) {
                    list.push(nodes[nodeId]);
                }
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
                nodeMarkup.select("span.graph-diagram-in-node-caption").each(function() {
                    node.label(d3.select(this).text());
                });
                nodeMarkup.select("dl.graph-diagram-properties").each(function() {
                    var elements = d3.select(this).selectAll("dt, dd");
                    var currentKey;
                    elements.each(function() {
                        if (this.nodeName.toLowerCase() === "dt") {
                            currentKey = d3.select(this).text();
                        } else if (currentKey && this.nodeName.toLowerCase() === "dd") {
                            node.properties().set(currentKey, d3.select(this).text());
                        }
                    })
                })
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

                if (node.properties().list().length > 0) {
                    var dl = li.append("dl")
                        .attr("class", "graph-diagram-properties");

                    node.properties().list().forEach(function(property) {
                        dl.append("dt")
                            .text(property.key);
                        dl.append("dd")
                            .text(property.value);
                    });
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
    };

    gd.chooseSpeechBubbleOrientation = function(focusNode, relatedNodes) {
        var orientations = [
            { key: "WEST"       , style: "horizontal", mirrorX: -1, mirrorY:  1, angle:  180 },
            { key: "NORTH-WEST" , style: "diagonal",   mirrorX: -1, mirrorY: -1, angle: -135 },
            { key: "NORTH"      , style: "vertical",   mirrorX:  1, mirrorY: -1, angle:  -90 },
            { key: "NORTH-EAST" , style: "diagonal",   mirrorX:  1, mirrorY: -1, angle:  -45 },
            { key: "EAST"       , style: "horizontal", mirrorX:  1, mirrorY:  1, angle:    0 },
            { key: "SOUTH-EAST" , style: "diagonal",   mirrorX:  1, mirrorY:  1, angle:   45 },
            { key: "SOUTH"      , style: "vertical",   mirrorX:  1, mirrorY:  1, angle:   90 },
            { key: "SOUTH-WEST" , style: "diagonal",   mirrorX: -1, mirrorY:  1, angle:  135 }
        ];

        orientations.forEach(function(orientation) {
            orientation.closest = 180;
        });

        relatedNodes.forEach(function(relatedNode) {
            orientations.forEach(function(orientation) {
                var angle = Math.abs(focusNode.angleTo( relatedNode ) - orientation.angle);
                if (angle > 180) angle = 360 - angle;
                if (angle < orientation.closest) {
                    orientation.closest = angle;
                }
            });
        });

        var maxAngle = 0;
        var bestOrientation = orientations[0];
        orientations.forEach(function(orientation) {
            if (orientation.closest > maxAngle) {
                maxAngle = orientation.closest;
                bestOrientation = orientation;
            }
        });

        return bestOrientation;
    };

    gd.speechBubblePath = function(textSize, style, margin, padding) {
        var width = textSize.width, height = textSize.height;
        var styles = {
            diagonal: [
                "M", 0, 0,
                "L", margin + padding, margin,
                "L", margin + width + padding, margin,
                "A", padding, padding, 0, 0, 1, margin + width + padding * 2, margin + padding,
                "L", margin + width + padding * 2, margin + height + padding,
                "A", padding, padding, 0, 0, 1, margin + width + padding, margin + height + padding * 2,
                "L", margin + padding, margin + height + padding * 2,
                "A", padding, padding, 0, 0, 1, margin, margin + height + padding,
                "L", margin, margin + padding,
                "Z"
            ],
            horizontal: [
                "M", 0, 0,
                "L", margin, -padding,
                "L", margin, -height / 2,
                "A", padding, padding, 0, 0, 1, margin + padding, -height / 2 - padding,
                "L", margin + width + padding, -height / 2 - padding,
                "A", padding, padding, 0, 0, 1, margin + width + padding * 2, -height / 2,
                "L", margin + width + padding * 2, height / 2,
                "A", padding, padding, 0, 0, 1, margin + width + padding, height / 2 + padding,
                "L", margin + padding, height / 2 + padding,
                "A", padding, padding, 0, 0, 1, margin, height / 2,
                "L", margin, padding,
                "Z"
            ],
            vertical: [
                "M", 0, 0,
                "L", -padding, margin,
                "L", -width / 2, margin,
                "A", padding, padding, 0, 0, 0, -width / 2 - padding, margin + padding,
                "L", -width / 2 - padding, margin + height + padding,
                "A", padding, padding, 0, 0, 0, -width / 2, margin + height + padding * 2,
                "L", width / 2, margin + height + padding * 2,
                "A", padding, padding, 0, 0, 0, width / 2 + padding, margin + height + padding,
                "L", width / 2 + padding, margin + padding,
                "A", padding, padding, 0, 0, 0, width / 2, margin,
                "L", padding, margin,
                "Z"
            ]
        };
        return styles[style].join(" ");
    };

    gd.textDimensions = function() {
        var textDimensions = {};

        textDimensions.measure = function(text) {
            var canvasSelection = d3.select("#textMeasuringCanvas").data([this]);
            canvasSelection.enter().append("canvas")
                .attr("id", "textMeasuringCanvas");

            var canvas = canvasSelection.node();
            var context = canvas.getContext("2d");
            context.font = "normal normal normal 50px/normal Gill Sans";
            return context.measureText(text).width;
        };

        return textDimensions;
    }();
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

        function hasProperties(d) {
            return d.properties().list().length > 0;
        }

        function propertyKeyValue( property ) {
            return property.key + ": " + property.value;
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
                return className + " " + d.class();
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


        var speechBubbleGroup = view.selectAll("g.speech-bubble")
            .data(d3.values(graph.nodeList()).filter(hasProperties ).map(function (node) {
                var relatedNodes = [];
                graph.relationshipList().forEach(function(relationship) {
                    if (relationship.start === node) {
                        relatedNodes.push(relationship.end);
                    }
                    if (relationship.end === node) {
                        relatedNodes.push(relationship.start);
                    }
                });
                var orientation = gd.chooseSpeechBubbleOrientation(node, relatedNodes);

                var textSize = {
                    width: d3.max(node.properties().list(), function(property) {
                        return gd.textDimensions.measure(propertyKeyValue(property));
                    }),
                    height: node.properties().list().length * 50
                };

                var mirror = "scale(" + orientation.mirrorX + "," + orientation.mirrorY + ") ";

                var diagonalRadius = gd.parameters.radius * Math.sqrt(2) / 2;
                var nodeOffsetOptions = {
                    diagonal: { attach: { x: diagonalRadius, y: diagonalRadius },
                        textCorner: {
                            x: gd.parameters.speechBubbleMargin + gd.parameters.speechBubblePadding,
                            y: gd.parameters.speechBubbleMargin + gd.parameters.speechBubblePadding
                        } },
                    horizontal: { attach: { x: gd.parameters.radius, y: 0 },
                        textCorner: {
                            x: gd.parameters.speechBubbleMargin + gd.parameters.speechBubblePadding,
                            y: -textSize.height / 2
                        } },
                    vertical: { attach: { x: 0, y: gd.parameters.radius },
                        textCorner: {
                            x: -textSize.width / 2,
                            y: gd.parameters.speechBubbleMargin + gd.parameters.speechBubblePadding
                        } }
                };
                var nodeCenterOffset = nodeOffsetOptions[orientation.style].attach;
                var textCorner = nodeOffsetOptions[orientation.style].textCorner;

                var translate = "translate(" + (node.ex() + nodeCenterOffset.x * orientation.mirrorX) + ","
                    + (node.ey() + nodeCenterOffset.y * orientation.mirrorY) + ") ";

                return {
                    properties: node.properties().list().map(function(property) {
                        return {
                            textContent: propertyKeyValue(property),
                            textOrigin: {
                                x: orientation.mirrorX * (textCorner.x)
                                    - (orientation.mirrorX == -1 ? textSize.width : 0),
                                y: orientation.mirrorY * (textCorner.y)
                                    - (orientation.mirrorY == -1 ? textSize.height : 0)
                            }
                        }
                    }),
                    groupTransform: translate,
                    outlineTransform: mirror,
                    outlinePath: gd.speechBubblePath( textSize, orientation.style,
                        gd.parameters.speechBubbleMargin, gd.parameters.speechBubblePadding )
                };
            }));

        speechBubbleGroup.exit().remove();

        speechBubbleGroup.enter().append("svg:g")
            .attr("class", "speech-bubble");

        speechBubbleGroup
            .attr("transform", function(speechBubble) { return speechBubble.groupTransform; } );

        var speechBubbleOutline = speechBubbleGroup.selectAll("path.speech-bubble-outline")
            .data(singleton);

        speechBubbleOutline.exit().remove();

        speechBubbleOutline.enter().append("svg:path")
            .attr("class", "speech-bubble-outline");

        speechBubbleOutline
            .attr("transform", function(speechBubble) { return speechBubble.outlineTransform; })
            .attr("d", function(speechBubble) { return speechBubble.outlinePath; });

        var speechBubbleContent = speechBubbleGroup.selectAll("text.speech-bubble-content")
            .data(function(speechBubble) { return speechBubble.properties; });

        speechBubbleContent.exit().remove();

        speechBubbleContent.enter().append("svg:text")
            .attr("class", "speech-bubble-content");

        speechBubbleContent
            .attr("x", function(property) { return property.textOrigin.x; })
            .attr("y", function(property, i) {
                return i * 50 + property.textOrigin.y + 25
            })
            .text(function(property) { return property.textContent; });
}
