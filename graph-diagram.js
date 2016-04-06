gd = {};

(function() {

    gd.parameters = {
        radius: 50,
        nodeStrokeWidth: 8,
        nodeStartMargin: 11,
        nodeEndMargin: 11,
        speechBubbleMargin: 20,
        speechBubblePadding: 10,
        speechBubbleStrokeWidth: 3,
        snapTolerance: 20
    };

    gd.model = function() {

        var nodes = {},
            relationships = [],
            highestId = 0,
            internalScale = 1,
            externalScale = 1;

        var model = {};

        var styleSet = function(stylePrototype) {
            var styles = {};

            if (stylePrototype)
            {
                var styleMap = stylePrototype.style();
                for ( var key in styleMap )
                {
                    if ( styleMap.hasOwnProperty( key ) )
                    {
                        styles[key] = styleMap[key];
                    }
                }
            }

            return function(cssPropertyKey, cssPropertyValue)
            {
                if (arguments.length == 2) {
                    styles[cssPropertyKey] = cssPropertyValue;
                    return this;
                }
                if (arguments.length == 1) {
                    return styles[cssPropertyKey];
                }
                return styles;
            };
        };

        var Node = function() {
            var position = {};
            var prototypePosition;
            var caption;
            var classes = [];
            var properties = new Properties(model.stylePrototype.nodeProperties);

            this.class = function(classesString) {
                if (arguments.length == 1) {
                    classes = classesString.split(" ").filter(function(className) {
                        return className.length > 0 && className != "node";
                    });
                    return this;
                }
                return ["node"].concat(classes);
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

            function snap( position, field, node )
            {
                var ideal = position[field];
                var closestNode;
                var closestDistance = Number.MAX_VALUE;
                for (var nodeId in nodes) {
                    if (nodes.hasOwnProperty(nodeId)) {
                        var candidateNode = nodes[nodeId];
                        if ( candidateNode != node )
                        {
                            var distance = Math.abs(candidateNode[field]() - ideal);
                            if (distance < closestDistance)
                            {
                                closestNode = candidateNode;
                                closestDistance = distance;
                            }
                        }
                    }
                }
                if (closestDistance < gd.parameters.snapTolerance)
                {
                    return closestNode[field]();
                }
                else
                {
                    return position[field];
                }
            }

            this.drag = function(dx, dy) {
                if (!prototypePosition)
                {
                    prototypePosition = {
                        x: position.x,
                        y: position.y
                    }
                }
                prototypePosition.x += dx / internalScale;
                prototypePosition.y += dy / internalScale;
                position.x = snap(prototypePosition, "x", this);
                position.y = snap(prototypePosition, "y", this);
            };

            this.dragEnd = function()
            {
                prototypePosition = undefined;
            };

            this.distance = function() {
                var dx = node.x() - this.x();
                var dy = node.y() - this.y();
                return Math.sqrt(dx * dx + dy * dy) * internalScale;
            };

            this.angleTo = function(node) {
                var dx = node.x() - this.x();
                var dy = node.y() - this.y();
                return Math.atan2(dy, dx) * 180 / Math.PI
            };

            this.isLeftOf = function(node) {
                return this.x() < node.x();
            };

            this.caption = function(captionText) {
                if (arguments.length == 1) {
                    caption = captionText;
                    return this;
                }
                return caption;
            };

            this.properties = function() {
                return properties;
            };

            this.style = styleSet(model.stylePrototype.node);
        };

        var Relationship = function(start, end) {
            var relationshipType;
            var classes = [];
            var properties = new Properties(model.stylePrototype.relationshipProperties);

            this.class = function(classesString) {
                if (arguments.length == 1) {
                    classes = classesString.split(" ").filter(function(className) {
                        return className.length > 0 && className != "relationship";
                    });
                    return this;
                }
                return ["relationship"].concat(classes);
            };

            this.relationshipType = function(relationshipTypeText) {
                if (arguments.length == 1) {
                    relationshipType = relationshipTypeText;
                    return this;
                }
                return relationshipType;
            };

            this.start = start;
            this.end = end;

            this.reverse = function() {
                var oldStart = this.start;
                this.start = this.end;
                this.end = oldStart;
            };

            this.properties = function() {
                return properties;
            };

            this.style = styleSet(model.stylePrototype.relationship);
        };

        var Properties = function(stylePrototype) {
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
            };

            this.style = styleSet(stylePrototype);
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

        model.deleteRelationship = function(relationship) {
            relationships.splice(relationships.indexOf(relationship), 1);
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

        model.groupedRelationshipList = function() {
            var groups = {};
            for (var i = 0; i < relationships.length; i++)
            {
                var relationship = relationships[i];
                var nodeIds = [relationship.start.id, relationship.end.id].sort();
                var group = groups[nodeIds];
                if (!group)
                {
                    group = groups[nodeIds] = [];
                }
                if (relationship.start.id < relationship.end.id)
                {
                    group.push(relationship);
                }
                else
                {
                    group.splice(0, 0, relationship);
                }
            }
            return d3.values(groups);
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

        var SimpleStyle = function() {
            this.style = styleSet();
        };

        model.stylePrototype = {
            node: new SimpleStyle(),
            nodeProperties: new SimpleStyle(),
            relationship: new SimpleStyle(),
            relationshipProperties: new SimpleStyle()
        };

        return model;
    };

    gd.layout = function(graphModel)
    {
        var layoutModel = {
            graphModel: graphModel,
            nodes: [],
            relationships: [],
            relationshipGroups: []
        };

        var nodesById = {};

        graphModel.nodeList().forEach( function ( node )
        {
            var measurement = gd.wrapAndMeasureCaption( node );

            var layoutNode = {
                class: node.class,
                x: node.ex(),
                y: node.ey(),
                radius: measurement.radius,
                captionLines: measurement.captionLines,
                captionLineHeight: measurement.captionLineHeight,
                properties: gd.nodeSpeechBubble( graphModel )( node, measurement.radius ),
                model: node
            };
            nodesById[node.id] = layoutNode;
            layoutModel.nodes.push(layoutNode);
        } );

        function horizontalArrow(relationship, start, end, offset) {
            var length = start.model.distanceTo(end.model);
            var arrowWidth = parsePixels( relationship.style( "width" ) );
            if (offset === 0)
            {
                return gd.horizontalArrowOutline(
                    start.radius.startRelationship(),
                    (length - end.radius.endRelationship()),
                    arrowWidth );
            }
            return gd.curvedArrowOutline(
                start.radius.startRelationship(),
                end.radius.endRelationship(),
                length,
                offset,
                arrowWidth,
                arrowWidth * 4,
                arrowWidth * 4
            );
        }

        graphModel.groupedRelationshipList().forEach( function( group ) {
            var nominatedStart = group[0].start;
            var offsetStep = parsePixels( group[0].style( "margin" ) );
            var relationshipGroup = [];
            for ( var i = 0; i < group.length; i++ )
            {
                var relationship = group[i];
                var offset = (relationship.start === nominatedStart ? 1 : -1) *
                    offsetStep * (i - (group.length - 1) / 2);

                var start = nodesById[relationship.start.id];
                var end = nodesById[relationship.end.id];
                var arrow = horizontalArrow( relationship, start, end, offset );

                var layoutRelationship = {
                    start: start,
                    end: end,
                    arrow: arrow,
                    properties: gd.relationshipSpeechBubble()( relationship, arrow.apex ),
                    model: relationship
                };
                relationshipGroup.push( layoutRelationship );
                layoutModel.relationships.push(layoutRelationship);
            }
            layoutModel.relationshipGroups.push(relationshipGroup);
        } );

        return layoutModel;
    };

    gd.scaling = function() {

        var scaling = {};

        scaling.nodeBox = function( node )
        {
            var margin = node.radius.outside();
            return {
                x1: node.model.ex() - margin,
                y1: node.model.ey() - margin,
                x2: node.model.ex() + margin,
                y2: node.model.ey() + margin
            };
        };

        scaling.boxNormalise = function( box )
        {
            return {
                x1: box.width > 0 ? box.x : box.x + box.width,
                y1: box.height > 0 ? box.y : box.y +box. height,
                x2: box.width < 0 ? box.x : box.x + box.width,
                y2: box.height < 0 ? box.y : box.y + box.height
            };
        };

        scaling.boxUnion = function ( boxes )
        {
            if ( boxes.length < 1 )
            {
                return { x1:0, y1:0, x2:0, y2:0 };
            }
            return boxes.reduce( function ( previous, current )
            {
                return {
                    x1:Math.min( previous.x1, current.x1 ),
                    y1:Math.min( previous.y1, current.y1 ),
                    x2:Math.max( previous.x2, current.x2 ),
                    y2:Math.max( previous.y2, current.y2 )
                };
            } );
        };

        function smallestContainingBox(layoutModel) {
            function boundingBox( entity )
            {
                return entity.properties.boundingBox;
            }

            var bounds = scaling.boxUnion( layoutModel.nodes.map( scaling.nodeBox )
                .concat( layoutModel.nodes.filter(gd.hasProperties ).map( boundingBox )
                    .map( scaling.boxNormalise ) )
                .concat( layoutModel.relationships.filter(gd.hasProperties ).map( boundingBox )
                    .map( scaling.boxNormalise ) ) );

            return { x: bounds.x1, y: bounds.y1,
                width: (bounds.x2 - bounds.x1), height: (bounds.y2 - bounds.y1) }
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

        function effectiveBox( viewBox, viewSize )
        {
            if ( viewBox.width / viewSize.width > viewBox.height / viewSize.height )
            {
                return {
                    x: viewBox.x,
                    y: viewBox.y - ((viewBox.width * viewSize.height / viewSize.width) - viewBox.height) / 2,
                    width: viewBox.width,
                    height: viewBox.width * viewSize.height / viewSize.width
                }
            }
            else
            {
                return {
                    x: viewBox.x - ((viewBox.height * viewSize.width / viewSize.height) - viewBox.width) / 2,
                    y: viewBox.y,
                    width: viewBox.height * viewSize.width / viewSize.height,
                    height: viewBox.height
                }
            }
        }

        function viewDimensions(view)
        {
            var svgElement = view.node();
            return {
                width: svgElement.clientWidth,
                height: svgElement.clientHeight
            };
        }

        scaling.centerOrScaleDiagramToFitSvg = function(layoutModel, view) {
            var box = scaling.centeredOrScaledViewBox( viewDimensions(view), smallestContainingBox( layoutModel ) );

            view
                .attr("viewBox", [box.x, box.y, box.width, box.height].join( " " ));
        };

        scaling.centerOrScaleDiagramToFitWindow = function(layoutModel, view) {
            var windowDimensions = {
                width: window.innerWidth,
                height: window.innerHeight
            };
            var box = scaling.centeredOrScaledViewBox( windowDimensions, smallestContainingBox( layoutModel ) );

            view
                .attr("width", windowDimensions.width)
                .attr("height", windowDimensions.height)
                .attr("viewBox", [box.x, box.y, box.width, box.height].join( " " ));
        };

        scaling.centerOrScaleDiagramToFitSvgSmooth = function(layoutModel, view) {
            var box = scaling.centeredOrScaledViewBox( viewDimensions(view), smallestContainingBox( layoutModel ) );

            view
                .transition()
                .attr("viewBox", [box.x, box.y, box.width, box.height].join( " " ));
        };

        function fitsInside( extent, box )
        {
            return extent.x >= box.x &&
                extent.y >= box.y &&
                extent.x + extent.width <= box.x + box.width &&
                extent.y + extent.height <= box.y + box.height;
        }

        scaling.growButDoNotShrink = function(layoutModel, view) {
            var currentViewBoxAttr = view.attr("viewBox");
            if ( currentViewBoxAttr === null )
            {
                scaling.centeredOrScaledViewBox(layoutModel, view);
            } else {
                var currentDimensions = currentViewBoxAttr.split(" " ).map(parseFloat);
                var currentBox = {
                    x: currentDimensions[0],
                    y: currentDimensions[1],
                    width: currentDimensions[2],
                    height: currentDimensions[3]
                };
                var diagramExtent = smallestContainingBox( layoutModel );

                var box;
                if ( fitsInside(diagramExtent, effectiveBox( currentBox, viewDimensions( view ) ))) {
                    box = currentBox;
                }
                else
                {
                    var idealBox = scaling.centeredOrScaledViewBox( viewDimensions(view), diagramExtent );
                    box = {
                        x: Math.min(currentBox.x, idealBox.x),
                        y: Math.min(currentBox.y, idealBox.y),
                        width: Math.max(currentBox.x + currentBox.width, idealBox.x + idealBox.width) -
                            Math.min(currentBox.x, idealBox.x),
                        height: Math.max(currentBox.y + currentBox.height, idealBox.y + idealBox.height) -
                            Math.min(currentBox.y, idealBox.y)
                    };
                }

                view
                    .attr("viewBox", [box.x, box.y, box.width, box.height].join( " " ));
            }
        };

        scaling.sizeSvgToFitDiagram = function(layoutModel, view) {
            var box = smallestContainingBox( layoutModel );

            view
                .attr("viewBox", [box.x, box.y, box.width, box.height].join( " " ))
                .attr("width", box.width * layoutModel.graphModel.externalScale())
                .attr("height", box.height * layoutModel.graphModel.externalScale());
        };

        return scaling;
    }();

    gd.markup = function() {

        var markup = {};

        markup.parseAll = function ( selection )
        {
            var models = [];
            selection.each( function ()
            {
                models.push( markup.parse( d3.select( this ) ) );
            } );
            return models;
        };

        function copyStyle( entity, computedStyle, cssPropertyKey, backupCssPropertyKey )
        {
            var propertyValue = computedStyle.getPropertyValue( cssPropertyKey );
            if ( !propertyValue )
            {
                propertyValue = computedStyle.getPropertyValue( backupCssPropertyKey );
            }
            entity.style( cssPropertyKey, propertyValue );
        }

        function copyStyles( entity, markup )
        {
            var computedStyle = window.getComputedStyle(markup.node() );
            copyStyle( entity, computedStyle, "width" );
            copyStyle( entity, computedStyle, "min-width" );
            copyStyle( entity, computedStyle, "font-family" );
            copyStyle( entity, computedStyle, "font-size" );
            copyStyle( entity, computedStyle, "margin", "margin-top" );
            copyStyle( entity, computedStyle, "padding", "padding-top" );
            copyStyle( entity, computedStyle, "color" );
            copyStyle( entity, computedStyle, "background-color" );
            copyStyle( entity, computedStyle, "border-width", "border-top-width" );
            copyStyle( entity, computedStyle, "border-style", "border-top-style" );
            copyStyle( entity, computedStyle, "border-color", "border-top-color" );
        }

        markup.parse = function(selection) {
            var model = gd.model();

            if (selection.attr("data-internal-scale")) {
                model.internalScale(selection.attr("data-internal-scale"));
            }
            if (selection.attr("data-external-scale")) {
                model.externalScale(selection.attr("data-external-scale"));
            }

            var nodePrototype = selection.append("li" ).attr("class", "node");
            var nodePropertiesPrototype = nodePrototype.append("dl" ).attr("class", "properties");
            copyStyles(model.stylePrototype.node, nodePrototype);
            copyStyles(model.stylePrototype.nodeProperties, nodePropertiesPrototype);
            nodePrototype.remove();

            var relationshipPrototype = selection.append("li" ).attr("class", "relationship");
            var relationshipPropertiesPrototype = relationshipPrototype.append("dl" ).attr("class", "properties");
            copyStyles(model.stylePrototype.relationship, relationshipPrototype);
            copyStyles(model.stylePrototype.relationshipProperties, relationshipPropertiesPrototype);
            relationshipPrototype.remove();

            function parseProperties(entity)
            {
                return function() {
                    var propertiesMarkup = d3.select( this );

                    var elements = propertiesMarkup.selectAll( "dt, dd" );
                    var currentKey;
                    elements.each( function ()
                    {
                        if ( this.nodeName.toLowerCase() === "dt" )
                        {
                            currentKey = d3.select( this ).text();
                        } else if ( currentKey && this.nodeName.toLowerCase() === "dd" )
                        {
                            entity.properties().set( currentKey, d3.select( this ).text() );
                        }
                    } );

                    copyStyles(entity.properties(), propertiesMarkup);
                }
            }

            selection.selectAll(".node").each(function () {
                var nodeMarkup = d3.select(this);
                var id = nodeMarkup.attr("data-node-id");
                var node = model.createNode(id);
                node.class(nodeMarkup.attr("class") || "");
                node.x(nodeMarkup.attr("data-x"));
                node.y(nodeMarkup.attr("data-y"));
                nodeMarkup.select("span.caption").each(function() {
                    node.caption(d3.select(this).text());
                });
                nodeMarkup.select( "dl.properties" ).each( parseProperties( node ) );

                copyStyles(node, nodeMarkup);
            });

            selection.selectAll(".relationship").each(function () {
                var relationshipMarkup = d3.select(this);
                var fromId = relationshipMarkup.attr("data-from");
                var toId = relationshipMarkup.attr("data-to");
                var relationship = model.createRelationship(model.lookupNode(fromId), model.lookupNode(toId));
                relationship.class(relationshipMarkup.attr("class") || "");
                relationshipMarkup.select("span.type" ).each(function() {
                    relationship.relationshipType(d3.select(this).text());
                });
                relationshipMarkup.select( "dl.properties" ).each( parseProperties( relationship ) );

                copyStyles(relationship, relationshipMarkup);
            });

            return model;
        };

        markup.format = function(model, container) {
            var ul = container.append("ul")
                .attr("class", "graph-diagram-markup")
                .attr("data-internal-scale", model.internalScale())
                .attr("data-external-scale", model.externalScale());

            function formatProperties( entity, li )
            {
                if ( entity.properties().list().length > 0 )
                {
                    var dl = li.append( "dl" )
                        .attr( "class", "properties" );

                    entity.properties().list().forEach( function ( property )
                    {
                        dl.append( "dt" )
                            .text( property.key );
                        dl.append( "dd" )
                            .text( property.value );
                    } );
                }
            }

            model.nodeList().forEach(function(node) {
                var li = ul.append("li")
                    .attr("class", node.class().join(" "))
                    .attr("data-node-id", node.id)
                    .attr("data-x", node.x())
                    .attr("data-y", node.y());

                if (node.caption()) {
                    li.append("span")
                        .attr("class", "caption")
                        .text(node.caption());
                }
                formatProperties( node, li );
            });

            model.relationshipList().forEach(function(relationship) {
                var li = ul.append("li")
                    .attr("class", relationship.class().join(" "))
                    .attr("data-from", relationship.start.id)
                    .attr("data-to", relationship.end.id);

                if (relationship.relationshipType()) {
                    li.append("span")
                        .attr("class", "type")
                        .text(relationship.relationshipType());
                }
                formatProperties( relationship, li );
            });
        };

        return markup;
    }();

    gd.horizontalArrowOutline = function(start, end, arrowWidth) {
        var shaftRadius = arrowWidth / 2;
        var headRadius = arrowWidth * 2;
        var headLength = headRadius * 2;
        var shoulder = start < end ? end - headLength : end + headLength;
        return {
            outline: [
                "M", start, shaftRadius,
                "L", shoulder, shaftRadius,
                "L", shoulder, headRadius,
                "L", end, 0,
                "L", shoulder, -headRadius,
                "L", shoulder, -shaftRadius,
                "L", start, -shaftRadius,
                "Z"
            ].join(" "),
            apex: {
                x: start + (shoulder - start) / 2,
                y: 0
            }
        };
    };

    gd.curvedArrowOutline = function(startRadius, endRadius, endCentre, minOffset, arrowWidth, headWidth, headLength)
    {
        var startAttach, endAttach, offsetAngle;

        function square( l )
        {
            return l * l;
        }

        var radiusRatio = startRadius / (endRadius + headLength);
        var homotheticCenter = -endCentre * radiusRatio / (1 - radiusRatio);

        function intersectWithOtherCircle(fixedPoint, radius, xCenter, polarity)
        {
            var gradient = fixedPoint.y / (fixedPoint.x - homotheticCenter);
            var hc = fixedPoint.y - gradient * fixedPoint.x;

            var A = 1 + square(gradient);
            var B = 2 * (gradient * hc - xCenter);
            var C = square(hc) + square(xCenter) - square(radius);

            var intersection = { x: (-B + polarity * Math.sqrt( square( B ) - 4 * A * C )) / (2 * A) };
            intersection.y = (intersection.x - homotheticCenter) * gradient;

            return intersection;
        }

        if(endRadius + headLength > startRadius)
        {
            offsetAngle = minOffset / startRadius;
            startAttach = {
                x: Math.cos( offsetAngle ) * (startRadius),
                y: Math.sin( offsetAngle ) * (startRadius)
            };
            endAttach = intersectWithOtherCircle( startAttach, endRadius + headLength, endCentre, -1 );
        }
        else
        {
            offsetAngle = minOffset / endRadius;
            endAttach = {
                x: endCentre - Math.cos( offsetAngle ) * (endRadius + headLength),
                y: Math.sin( offsetAngle ) * (endRadius + headLength)
            };
            startAttach = intersectWithOtherCircle( endAttach, startRadius, 0, 1 );
        }

        var
            g1 = -startAttach.x / startAttach.y,
            c1 = startAttach.y + (square( startAttach.x ) / startAttach.y),
            g2 = -(endAttach.x - endCentre) / endAttach.y,
            c2 = endAttach.y + (endAttach.x - endCentre) * endAttach.x / endAttach.y;

        var cx = ( c1 - c2 ) / (g2 - g1);
        var cy = g1 * cx + c1;

        var arcRadius = Math.sqrt(square(cx - startAttach.x) + square(cy - startAttach.y));

        function startTangent(dr)
        {
            var dx = (dr < 0 ? -1 : 1) * Math.sqrt(square(dr) / (1 + square(g1)));
            var dy = g1 * dx;
            return [
                startAttach.x + dx,
                startAttach.y + dy
            ].join(",");
        }

        function endTangent(dr)
        {
            var dx = (dr < 0 ? -1 : 1) * Math.sqrt(square(dr) / (1 + square(g2)));
            var dy = g2 * dx;
            return [
                endAttach.x + dx,
                endAttach.y + dy
            ].join(",");
        }

        function endNormal(dc)
        {
            var dx = (dc < 0 ? -1 : 1) * Math.sqrt(square(dc) / (1 + square(1 / g2)));
            var dy = dx / g2;
            return [
                endAttach.x + dx,
                endAttach.y - dy
            ].join(",");
        }

        var shaftRadius = arrowWidth / 2;
        var headRadius = headWidth / 2;

        return {
            outline: [
                "M", startTangent(-shaftRadius),
                "L", startTangent(shaftRadius),
                "A", arcRadius - shaftRadius, arcRadius - shaftRadius, 0, 0, minOffset > 0 ? 0 : 1, endTangent(-shaftRadius),
                "L", endTangent(-headRadius),
                "L", endNormal(headLength),
                "L", endTangent(headRadius),
                "L", endTangent(shaftRadius),
                "A", arcRadius + shaftRadius, arcRadius + shaftRadius, 0, 0, minOffset < 0 ? 0 : 1, startTangent(-shaftRadius)
            ].join( " " ),
            apex: {
                x: cx,
                y: cy > 0 ? cy - arcRadius : cy + arcRadius
            }
        };
    };

    gd.chooseNodeSpeechBubbleOrientation = function(focusNode, relatedNodes) {
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
                if ( angle > 180 )
                {
                    angle = 360 - angle;
                }
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

    gd.chooseRelationshipSpeechBubbleOrientation = function(relationship) {
        var orientations = {
            EAST:       { style: "horizontal", mirrorX:  1, mirrorY:  1, angle:    0 },
            SOUTH_EAST: { style: "diagonal",   mirrorX:  1, mirrorY:  1, angle:   45 },
            SOUTH     : { style: "vertical",   mirrorX:  1, mirrorY:  1, angle:   90 },
            SOUTH_WEST: { style: "diagonal",   mirrorX: -1, mirrorY:  1, angle:  135 },
            WEST:       { style: "horizontal", mirrorX: -1, mirrorY:  1, angle:  180 }
        };

        var relationshipAngle = relationship.start.angleTo(relationship.end);

        var positiveAngle = relationshipAngle > 0 ? relationshipAngle : relationshipAngle + 180;

        if ( positiveAngle > 175 || positiveAngle < 5 )
        {
            return orientations.SOUTH;
        }
        else if ( positiveAngle < 85 )
        {
            return orientations.SOUTH_WEST
        }
        else if ( positiveAngle < 90 )
        {
            return orientations.WEST;
        }
        else if ( positiveAngle === 90 )
        {
            return relationshipAngle > 0 ? orientations.WEST : orientations.EAST;
        }
        else if ( positiveAngle < 95 )
        {
            return orientations.EAST;
        }
        else
        {
            return orientations.SOUTH_EAST;
        }
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

    function parsePixels(fontSize)
    {
        return parseFloat( fontSize.slice( 0, -2 ) );
    }

    gd.Radius = function(insideRadius) {

        this.insideRadius = insideRadius;
        this.borderWidth = gd.parameters.nodeStrokeWidth;
        this.arrowMargin = gd.parameters.nodeStartMargin;

        this.inside = function(insideRadius) {
            if (arguments.length == 1)
            {
                this.insideRadius = insideRadius;
                return this;
            }
            return this.insideRadius;
        };

        this.border = function(borderWidth) {
            if (arguments.length == 1)
            {
                this.borderWidth = borderWidth;
                return this;
            }
            return this.borderWidth;
        };

        this.margin = function(arrowMargin) {
            if (arguments.length == 1)
            {
                this.arrowMargin = arrowMargin;
                return this;
            }
            return this.arrowMargin;
        };

        this.mid = function() {
            return this.insideRadius + this.borderWidth / 2;
        };

        this.outside = function() {
            return this.insideRadius + this.borderWidth;
        };

        this.startRelationship = function() {
            return this.insideRadius + this.borderWidth + this.arrowMargin;
        };

        this.endRelationship = function() {
            return this.insideRadius + this.borderWidth + this.arrowMargin;
        };
    };

    gd.wrapAndMeasureCaption = function()
    {
        return function ( node )
        {
            function measure( text )
            {
                return gd.textDimensions.measure( text, node );
            }

            var lineHeight = parsePixels( node.style( "font-size" ) );
            var insideRadius = 0;
            var captionLines = [];

            if ( node.caption() ) {
                var padding = parsePixels( node.style( "padding" ) );
                var totalWidth = measure( node.caption() );
                var idealRadius = Math.sqrt( totalWidth * lineHeight / Math.PI );
                var idealRows = idealRadius * 2 / lineHeight;
                function idealLength( row )
                {
                    var rowOffset = lineHeight * (row - idealRows) / 2;
                    return Math.sqrt( idealRadius * idealRadius - rowOffset * rowOffset) * 2;
                }
                var words = node.caption().split(" ");
                var currentLine = words.shift();
                while (words.length > 0)
                {
                    if ( measure(currentLine) > idealLength(captionLines.length) )
                    {
                        captionLines.push(currentLine);
                        currentLine = words.shift();
                    } else {
                        currentLine += " " + words.shift();
                    }
                }
                captionLines.push(currentLine);

                for ( var row = 0; row < captionLines.length; row++ )
                {
                    var width = measure( captionLines[row] ) / 2;
                    var middleRow = (captionLines.length - 1) / 2;
                    var rowOffset = lineHeight * (row > middleRow ? (row - middleRow + 0.5) : (row - middleRow - 0.5));
                    insideRadius = padding + Math.max( Math.sqrt(width * width + rowOffset * rowOffset), insideRadius);
                }
            }
            var minRadius = parsePixels( node.style("min-width")) / 2;
            if ( minRadius > insideRadius )
            {
                insideRadius = minRadius;
            }
            var radius = new gd.Radius( insideRadius );
            radius.border( parsePixels( node.style( "border-width" ) ) );
            radius.margin( parsePixels( node.style( "margin" ) ) );

            return {
                radius: radius,
                captionLines: captionLines,
                captionLineHeight: lineHeight
            };
        }
    }();

    gd.nodeSpeechBubble = function ( model )
    {
        return function ( node, radius )
        {
            var relatedNodes = [];
            model.relationshipList().forEach( function ( relationship )
            {
                if ( relationship.start === node )
                {
                    relatedNodes.push( relationship.end );
                }
                if ( relationship.end === node )
                {
                    relatedNodes.push( relationship.start );
                }
            } );
            var orientation = gd.chooseNodeSpeechBubbleOrientation( node, relatedNodes );

            var properties = node.properties();

            var propertyKeysWidth = d3.max( properties.list(), function ( property )
            {
                return gd.textDimensions.measure( property.key + ": ", properties );
            } );
            var propertyValuesWidth = d3.max( properties.list(), function ( property )
            {
                return gd.textDimensions.measure( property.value, properties );
            } );
            var textSize = {
                width:propertyKeysWidth + propertyValuesWidth,
                height:properties.list().length * parsePixels( properties.style( "font-size" ) )
            };

            var mirror = "scale(" + orientation.mirrorX + "," + orientation.mirrorY + ") ";

            var margin = parsePixels( properties.style( "margin" ) );
            var padding = parsePixels( properties.style( "padding" ) );

            var diagonalRadius = radius.mid() * Math.sqrt( 2 ) / 2;
            var nodeOffsetOptions = {
                diagonal:{ attach:{ x:diagonalRadius, y:diagonalRadius },
                    textCorner:{
                        x:margin + padding,
                        y:margin + padding
                    } },
                horizontal:{ attach:{ x:radius.mid(), y:0 },
                    textCorner:{
                        x:margin + padding,
                        y:-textSize.height / 2
                    } },
                vertical:{ attach:{ x:0, y:radius.mid() },
                    textCorner:{
                        x:-textSize.width / 2,
                        y:margin + padding
                    } }
            };
            var nodeCenterOffset = nodeOffsetOptions[orientation.style].attach;
            var textCorner = nodeOffsetOptions[orientation.style].textCorner;

            var translate = "translate(" + (node.ex() + nodeCenterOffset.x * orientation.mirrorX) + ","
                + (node.ey() + nodeCenterOffset.y * orientation.mirrorY) + ") ";

            var textOrigin = {
                x:propertyKeysWidth + orientation.mirrorX * (textCorner.x)
                    - (orientation.mirrorX == -1 ? textSize.width : 0),
                y:orientation.mirrorY * (textCorner.y)
                    - (orientation.mirrorY == -1 ? textSize.height : 0)
            };

            var boundingPadding = padding + gd.parameters.speechBubbleStrokeWidth / 2;

            var boundingBox = {
                x:node.ex() + (nodeCenterOffset.x + textCorner.x - boundingPadding) * orientation.mirrorX,
                y:node.ey() + (nodeCenterOffset.y + textCorner.y - boundingPadding) * orientation.mirrorY,
                width:orientation.mirrorX * (textSize.width + (boundingPadding * 2)),
                height:orientation.mirrorY * (textSize.height + (boundingPadding * 2))
            };

            return {
                properties:properties.list().map( function ( property )
                {
                    return {
                        keyText:property.key + ": ",
                        valueText:property.value,
                        textOrigin:textOrigin,
                        style:node.properties().style
                    }
                } ),
                style:node.properties().style,
                groupTransform:translate,
                outlineTransform:mirror,
                outlinePath:gd.speechBubblePath( textSize, orientation.style, margin, padding ),
                boundingBox:boundingBox
            };
        }
    };

    gd.relationshipSpeechBubble = function ()
    {
        return function ( relationship, apex )
        {
            var properties = relationship.properties();

            var orientation = gd.chooseRelationshipSpeechBubbleOrientation( relationship );

            var propertyKeysWidth = d3.max( properties.list(), function ( property )
            {
                return gd.textDimensions.measure( property.key + ": ", properties );
            } );
            var propertyValuesWidth = d3.max( properties.list(), function ( property )
            {
                return gd.textDimensions.measure( property.value, properties );
            } );
            var textSize = {
                width:propertyKeysWidth + propertyValuesWidth,
                height:properties.list().length * parsePixels( properties.style( "font-size" ) )
            };

            var margin = parsePixels( properties.style( "margin" ) );
            var padding = parsePixels( properties.style( "padding" ) );

            var mirror = "scale(" + orientation.mirrorX + "," + orientation.mirrorY + ") ";

            var nodeOffsetOptions = {
                diagonal:{
                    textCorner:{
                        x:margin + padding,
                        y:margin + padding
                    } },
                horizontal:{
                    textCorner:{
                        x:margin + padding,
                        y:-textSize.height / 2
                    } },
                vertical:{
                    textCorner:{
                        x:-textSize.width / 2,
                        y:margin + padding
                    } }
            };
            var textCorner = nodeOffsetOptions[orientation.style].textCorner;

            var dx = relationship.end.ex() - relationship.start.ex();
            var dy = relationship.end.ey() - relationship.start.ey();
            var h = Math.sqrt(dx * dx + dy * dy);

            var midPoint = {
                x: relationship.start.ex() + (apex.x * dx - apex.y * dy) / h,
                y: relationship.start.ey() +(apex.x * dy + apex.y * dx) / h
            };

            var translate = "translate(" + midPoint.x + "," + midPoint.y + ") ";

            var textOrigin = {
                x:propertyKeysWidth + orientation.mirrorX * (textCorner.x)
                    - (orientation.mirrorX == -1 ? textSize.width : 0),
                y:orientation.mirrorY * (textCorner.y)
                    - (orientation.mirrorY == -1 ? textSize.height : 0)
            };

            var boundingPadding = padding + gd.parameters.speechBubbleStrokeWidth / 2;

            var boundingBox = {
                x:midPoint.x + (textCorner.x - boundingPadding) * orientation.mirrorX,
                y:midPoint.y + (textCorner.y - boundingPadding) * orientation.mirrorY,
                width:orientation.mirrorX * (textSize.width + (boundingPadding * 2)),
                height:orientation.mirrorY * (textSize.height + (boundingPadding * 2))
            };

            return {
                properties:properties.list().map( function ( property )
                {
                    return {
                        keyText:property.key + ": ",
                        valueText:property.value,
                        textOrigin:textOrigin,
                        style:relationship.properties().style
                    }
                } ),
                style:relationship.properties().style,
                groupTransform:translate,
                outlineTransform:mirror,
                outlinePath:gd.speechBubblePath( textSize, orientation.style, margin, padding ),
                boundingBox:boundingBox
            };
        }
    };

    gd.textDimensions = function() {
        var textDimensions = {};

        textDimensions.measure = function ( text, styleSource ) {
            var fontSize = styleSource.style( "font-size" );
            var fontFamily = styleSource.style( "font-family" );
            var canvasSelection = d3.select("#textMeasuringCanvas").data([this]);
            canvasSelection.enter().append("canvas")
                .attr("id", "textMeasuringCanvas");

            var canvas = canvasSelection.node();
            var context = canvas.getContext("2d");
            context.font = "normal normal normal " + fontSize + "/normal " + fontFamily;
            return context.measureText(text).width;
        };

        return textDimensions;
    }();

    gd.hasProperties = function ( entity )
    {
        return entity.model.properties().list().length > 0;
    };

    gd.diagram = function()
    {
        var overlay = function(layoutModel, view) {};
        var scaling = gd.scaling.sizeSvgToFitDiagram;

        function field( fileName )
        {
            return function ( d )
            {
                return d[fileName];
            }
        }

        function singleton(d) {
            return [d];
        }

        function renderNodes( nodes, view )
        {
            function nodeClasses(d) {
                return d.model.class().join(" ") + " " + "node-id-" + d.model.id;
            }

            var circles = view.selectAll("circle.node")
                .data(nodes);

            circles.exit().remove();

            circles.enter().append("svg:circle")
                .attr("class", nodeClasses);

            circles
                .attr("r", function(node) {
                    return node.radius.mid();
                })
                .attr("fill", function(node) {
                    return node.model.style("background-color");
                })
                .attr("stroke", function(node) {
                    return node.model.style("border-color");
                })
                .attr("stroke-width", function(node) {
                    return node.model.style("border-width");
                })
                .attr("cx", field("x"))
                .attr("cy", field("y"));

            function captionClasses(d) {
                return "caption " + d.node.model.class();
            }

            var captionGroups = view.selectAll("g.caption")
                .data(nodes.filter(function(node) { return node.model.caption(); }));

            captionGroups.exit().remove();

            captionGroups.enter().append("g")
                .attr("class", "caption");

            var captions = captionGroups.selectAll("text.caption")
                .data( function ( node )
                {
                    return node.captionLines.map( function ( line )
                    {
                        return { node: node, caption: line }
                    } );
                } );

            captions.exit().remove();

            captions.enter().append("svg:text")
                .attr("class", captionClasses)
                .attr("text-anchor", "middle")
                .attr("alignment-baseline", "central");

            captions
                .attr("x", function ( line ) { return line.node.model.ex(); })
                .attr("y", function ( line, i ) { return line.node.model.ey() + (i - (line.node.captionLines.length - 1) / 2) * line.node.captionLineHeight; })
                .attr( "fill", function ( line ) { return line.node.model.style( "color" ); } )
                .attr( "font-size", function ( line ) { return line.node.model.style( "font-size" ); } )
                .attr( "font-family", function ( line ) { return line.node.model.style( "font-family" ); } )
                .text(function(d) { return d.caption; });
        }

        function renderRelationships( relationshipGroups, view )
        {
            function translateToStartNodeCenterAndRotateToRelationshipAngle(r) {
                var angle = r.start.model.angleTo(r.end.model);
                return "translate(" + r.start.model.ex() + "," + r.start.model.ey() + ") rotate(" + angle + ")";
            }

            function rotateIfRightToLeft(r) {
                return r.end.model.isLeftOf( r.start.model ) ? "rotate(180)" : null;
            }

            function side(r) {
                return r.end.model.isLeftOf(r.start.model) ? -1 : 1;
            }

            function relationshipClasses(d) {
                var r = d.model;
                return r.class().join(" ");
            }

            var relatedNodesGroup = view.selectAll("g.related-pair")
                .data(relationshipGroups);

            relatedNodesGroup.exit().remove();

            relatedNodesGroup.enter().append("svg:g")
                .attr("class", "related-pair");

            var relationshipGroup = relatedNodesGroup.selectAll( "g.relationship" )
                .data( function(d) { return d; } );

            relationshipGroup.exit().remove();

            relationshipGroup.enter().append("svg:g")
                .attr("class", relationshipClasses);

            relationshipGroup
                .attr("transform", translateToStartNodeCenterAndRotateToRelationshipAngle);

            var relationshipPath = relationshipGroup.selectAll("path.relationship")
                .data(singleton);

            relationshipPath.enter().append("svg:path")
                .attr("class", relationshipClasses);

            relationshipPath
                .attr( "d", function(d) { return d.arrow.outline; } )
                .attr( "fill", function(node) {
                    return node.model.style("background-color");
                })
                .attr("stroke", function(node) {
                    return node.model.style("border-color");
                })
                .attr("stroke-width", function(node) {
                    return node.model.style("border-width");
                });

            function relationshipWithRelationshipType(d) {
                return [d].filter(function(d) { return d.model.relationshipType(); });
            }

            var relationshipType = relationshipGroup.selectAll("text.type")
                .data(relationshipWithRelationshipType);

            relationshipType.exit().remove();

            relationshipType.enter().append("svg:text")
                .attr("class", "type")
                .attr("text-anchor", "middle")
                .attr("baseline-shift", "30%")
                .attr("alignment-baseline", "alphabetic");

            relationshipType
                .attr("transform", rotateIfRightToLeft)
                .attr("x", function(d) { return side( d ) * d.arrow.apex.x; } )
                .attr("y", function(d) { return side( d ) * d.arrow.apex.y; } )
                .attr( "font-size", function ( d ) { return d.model.style( "font-size" ); } )
                .attr( "font-family", function ( d ) { return d.model.style( "font-family" ); } )
                .text( function ( d ) { return d.model.relationshipType(); } );
        }

        function renderProperties( entities, descriminator, view )
        {
            var speechBubbleGroup = view.selectAll( "g.speech-bubble." + descriminator + "-speech-bubble" )
                .data( entities.filter( gd.hasProperties ).map( function(entity) { return entity.properties; } ) );

            speechBubbleGroup.exit().remove();

            speechBubbleGroup.enter().append( "svg:g" )
                .attr( "class", "speech-bubble " + descriminator + "-speech-bubble" );

            speechBubbleGroup
                .attr( "transform", function ( speechBubble )
                {
                    return speechBubble.groupTransform;
                } );

            var speechBubbleOutline = speechBubbleGroup.selectAll( "path.speech-bubble-outline" )
                .data( singleton );

            speechBubbleOutline.exit().remove();

            speechBubbleOutline.enter().append( "svg:path" )
                .attr( "class", "speech-bubble-outline" );

            speechBubbleOutline
                .attr( "transform", function ( speechBubble )
                {
                    return speechBubble.outlineTransform;
                } )
                .attr( "d", function ( speechBubble )
                {
                    return speechBubble.outlinePath;
                } )
                .attr( "fill", function ( speechBubble )
                {
                    return speechBubble.style( "background-color" );
                } )
                .attr( "stroke", function ( speechBubble )
                {
                    return speechBubble.style( "border-color" );
                } )
                .attr( "stroke-width", function ( speechBubble )
                {
                    return speechBubble.style( "border-width" );
                } );

            var propertyKeys = speechBubbleGroup.selectAll( "text.speech-bubble-content.property-key" )
                .data( function ( speechBubble )
                {
                    return speechBubble.properties;
                } );

            propertyKeys.exit().remove();

            propertyKeys.enter().append( "svg:text" )
                .attr( "class", "speech-bubble-content property-key" );

            propertyKeys
                .attr( "x", function ( property )
                {
                    return property.textOrigin.x;
                } )
                .attr( "y", function ( property, i )
                {
                    return (i + 0.5) * parsePixels( property.style( "font-size" ) ) + property.textOrigin.y
                } )
                .attr( "alignment-baseline", "central" )
                .attr( "text-anchor", "end" )
                .attr( "font-size", function ( property ) { return property.style( "font-size" ); } )
                .attr( "font-family", function ( property ) { return property.style( "font-family" ); } )
                .attr( "xml:space", "preserve" )
                .text( function ( property )
                {
                    return property.keyText;
                } );

            var propertyValues = speechBubbleGroup.selectAll( "text.speech-bubble-content.property-value" )
                .data( function ( speechBubble )
                {
                    return speechBubble.properties;
                } );

            propertyValues.exit().remove();

            propertyValues.enter().append( "svg:text" )
                .attr( "class", "speech-bubble-content property-value" );

            propertyValues
                .attr( "x", function ( property )
                {
                    return property.textOrigin.x;
                } )
                .attr( "y", function ( property, i )
                {
                    return (i + 0.5) * parsePixels( property.style( "font-size" ) ) + property.textOrigin.y
                } )
                .attr( "alignment-baseline", "central" )
                .attr( "font-size", function ( property ) { return property.style( "font-size" ); } )
                .attr( "font-family", function ( property ) { return property.style( "font-family" ); } )
                .text( function ( property )
                {
                    return property.valueText;
                } );
        }

        var diagram = function ( selection )
        {
            selection.each( function ( model )
            {
                var view = d3.select( this );

                var layoutModel = gd.layout( model );

                function layer(name)
                {
                    var layer = view.selectAll( "g.layer." + name ).data( [name] );

                    layer.enter().append("g")
                        .attr("class", "layer " + name);

                    return layer;
                }

                renderRelationships( layoutModel.relationshipGroups, layer("relationships") );
                renderNodes( layoutModel.nodes, layer("nodes") );

                renderProperties( layoutModel.nodes, "node", layer("properties") );
                renderProperties( layoutModel.relationships, "relationship", layer("properties") );

                overlay( layoutModel, layer("overlay") );

                scaling( layoutModel, view );
            } );
        };

        diagram.overlay = function(behaviour) {
            overlay = behaviour;
            return diagram;
        };

        diagram.scaling = function(scalingFunction) {
            scaling = scalingFunction;
            return this;
        };

        return diagram;
    };

    gd.figure = function ()
    {
        var diagram = gd.diagram();

        var figure = function ( selection )
        {
            selection.each( function ()
            {
                var figure = d3.select( this );
                var markup = figure.select( "ul.graph-diagram-markup" );
                var model = gd.markup.parse( markup );
                figure.selectAll( "svg" )
                    .data( [model] )
                    .enter()
                    .append( "svg" )
                    .call( diagram );
            } );
        };

        figure.scaling = function(scalingFunction)
        {
            diagram.scaling(scalingFunction);
            return figure;
        };

        return figure;
    };
})();
