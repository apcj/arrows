(function() {
    var graphModel = gd.model();
    graphModel.createNode().x(50).y(140);

    var svg = d3.select("#canvas")
        .append("svg:svg")
        .attr("width", 1024)
        .attr("height", 768);

    function draw()
    {
        bind(graphModel, svg.data([graphModel]));
        svg.selectAll(".graph-diagram-node")
            .call(d3.behavior.drag().on("drag", drag ).on("dragend", dragEnd))
            .on("dblclick", editNode);
        svg.selectAll(".graph-diagram-relationship-label")
            .on("dblclick", editRelationship);
    }

    draw();

    var newNode = null;
    var newRelationship = null;

    function findClosestOverlappingNode(node) {

        var closestNode = null;
        var closestDistance = Number.MAX_VALUE;

        var allNodes = graphModel.nodeList();

        for (var i = 0; i < allNodes.length; i++) {
            var candidateNode = allNodes[i];
            if (candidateNode !== node) {
                var candidateDistance = node.distanceTo(candidateNode) * graphModel.internalScale();
                if (candidateDistance < 50 && candidateDistance < closestDistance) {
                    closestNode = candidateNode;
                    closestDistance = candidateDistance;
                }
            }
        }
        return closestNode;
    }

    function drag(){
        var shiftKey = window.event.shiftKey;
        var dragTarget = d3.select(this);
        var node = dragTarget[0][0].__data__;
        if (!newNode && shiftKey) {
            newNode = graphModel.createNode().x(node.x()).y(node.y());
            newRelationship = graphModel.createRelationship(node, newNode);
        }
        if (newNode) {
            var connectionNode = findClosestOverlappingNode(newNode);
            if (connectionNode) {
                newRelationship.end = connectionNode
            } else {
                newRelationship.end = newNode;
            }
            node = newNode;
        }
        node.x(node.x() + d3.event.dx);
        node.y(node.y() + d3.event.dy);
        draw();
    }

    function dragEnd() {
        if (newNode && newRelationship && newRelationship.end !== newNode) {
            graphModel.deleteNode(newNode);
        }
        newNode = null;
        draw();
    }

    function editNode() {
        var node = this.__data__;
        var field = svg.append("svg:foreignObject")
            .attr("x", node.x() - 50)
            .attr("y", node.y() - 50)
            .attr("height", 100)
            .attr("width", 120)
            .append("xhtml:body")
            .append("input")
            .attr("class", "editor-field")
            .style("width", 100 + "px");

        field.node().value = node.label() || "";
        field.node().select();
        field.on("keypress", function() {
            var e = d3.event;
            if (e.which == 10 || e.which == 13) {
                node.label(field.node().value);
                field.remove();
                draw();
            }
        })
    }

    function editRelationship() {
        var relationship = this.__data__;
        var midwayPoint = relationship.start.midwayTo(relationship.end);
        var field = svg.append("svg:foreignObject")
            .attr("x", midwayPoint.x - 50)
            .attr("y", midwayPoint.y - 50)
            .attr("height", 100)
            .attr("width", 120)
            .append("xhtml:body")
            .append("input")
            .attr("class", "editor-field")
            .style("width", 100 + "px");

        field.node().value = relationship.label() || "";
        field.node().select();
        field.on("keypress", function() {
            var e = d3.event;
            if (e.which == 10 || e.which == 13) {
                relationship.label(field.node().value);
                field.remove();
                draw();
            }
        })
    }

    var exportMarkup = function() {
        var container = d3.select("body" ).append("div");
        gd.markup.format(graphModel, container);
        var markup = container.node().innerHTML;
        markup = markup
            .replace(/<li/g, "\n  <li")
            .replace(/<span/g, "\n    <span")
            .replace(/<\/span><\/li/g, "</span>\n  <li")
            .replace(/<\/ul/, "\n</ul");

        container.remove();
        d3.selectAll(".modal-appear")
            .style("display", "block")
            .select("pre.code")
            .text(markup);
    };

    var hideGlassPane = function() {
        d3.selectAll(".modal-appear")
            .style("display", "none");
    };

    var exportSvg = function() {
        d3.xhr("graph-diagram.css", function(d) {
            var css = d.responseText;
            var rawSvg = document.getElementById("canvas").innerHTML;
            var styleTag = "<style type=\"text/css\"><![CDATA[" + css + "]]></style>";
            var svgStartTag = "<svg xmlns=\"http://www.w3.org/2000/svg\">";
            var modifiedSvg = rawSvg.replace(/<svg [^>]*>/, svgStartTag + styleTag);
            window.open("data:image/svg+xml;base64," + btoa(modifiedSvg));
        });
    };

    d3.select("#exportMarkupButton").on("click", exportMarkup);
    d3.select("#exportSvgButton").on("click", exportSvg);
    d3.select("#modal-container").on("click", hideGlassPane);
    d3.select("#modal-dialog").on("click", function() { d3.event.stopPropagation(); });
})();
