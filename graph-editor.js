(function()
{
    var graphModel;
    if (localStorage.getItem("graph-diagram-markup")) {
        graphModel = parseMarkup( localStorage.getItem( "graph-diagram-markup" ) );
    } else {
        graphModel = gd.model();
        graphModel.createNode().x( 50 ).y( 140 );
    }

    var svg = d3.select("#canvas")
        .append("svg:svg")
        .attr("class", "graphdiagram");

    var diagram = gd.diagram()
        .scaling(gd.scaling.centerOrScaleDiagramToFitSvg)
        .nodeBehaviour(function ( newNodes )
        {
            newNodes
                .call( d3.behavior.drag().on( "drag", drag ).on( "dragend", dragEnd ) )
                .on( "dblclick", editNode );

        } ).relationshipBehaviour( function ( newRelationships )
        {
            newRelationships
                .on( "dblclick", editRelationship );
        } );

    function draw()
    {
        svg
            .data([graphModel])
            .call(diagram);
    }

    function save( markup )
    {
        localStorage.setItem( "graph-diagram-markup", markup );
    }

    var newNode = null;
    var newRelationship = null;

    function findClosestOverlappingNode( node )
    {
        var closestNode = null;
        var closestDistance = Number.MAX_VALUE;

        var allNodes = graphModel.nodeList();

        for ( var i = 0; i < allNodes.length; i++ )
        {
            var candidateNode = allNodes[i];
            if ( candidateNode !== node )
            {
                var candidateDistance = node.distanceTo( candidateNode ) * graphModel.internalScale();
                if ( candidateDistance < 50 && candidateDistance < closestDistance )
                {
                    closestNode = candidateNode;
                    closestDistance = candidateDistance;
                }
            }
        }
        return closestNode;
    }

    function drag()
    {
        var shiftKey = window.event.shiftKey;
        var dragTarget = d3.select( this );
        var node = dragTarget[0][0].__data__;
        if ( !newNode && shiftKey )
        {
            newNode = graphModel.createNode().x( node.x() ).y( node.y() );
            newRelationship = graphModel.createRelationship( node, newNode );
        }
        if ( newNode )
        {
            var connectionNode = findClosestOverlappingNode( newNode );
            if ( connectionNode )
            {
                newRelationship.end = connectionNode
            } else
            {
                newRelationship.end = newNode;
            }
            node = newNode;
        }
        node.drag(d3.event.dx, d3.event.dy);
        draw();
    }

    function dragEnd()
    {
        if ( newNode && newRelationship && newRelationship.end !== newNode )
        {
            graphModel.deleteNode( newNode );
        }
        newNode = null;
        save( formatMarkup() );
        draw();
    }

    function editNode()
    {
        appendModalBackdrop();
        d3.select( ".modal.pop-up-editor.node" ).classed( "hide", false );

        var node = this.__data__;

        var editor = d3.select(".pop-up-editor.node");

        editor.select("path")
            .attr("d", gd.speechBubblePath({ width: 500, height: 200}, "diagonal",
            gd.parameters.speechBubbleMargin, gd.parameters.speechBubblePadding));

        var captionField = editor.select("#node_caption");
        captionField.node().value = node.label() || "";
        captionField.node().select();

        var propertiesField = editor.select(".properties-field");
        propertiesField.node().value = node.properties().list().reduce(function(previous, property) {
            return previous + property.key + ": " + property.value + "\n";
        }, "");

        function saveChange()
        {
            node.label( captionField.node().value );
            node.properties().clearAll();
            propertiesField.node().value.split("\n").forEach(function(line) {
                var tokens = line.split(/: */);
                if (tokens.length === 2) {
                    var key = tokens[0].trim();
                    var value = tokens[1].trim();
                    if (key.length > 0 && value.length > 0) {
                        node.properties().set(key, value);
                    }
                }
            });
            save( formatMarkup() );
            draw();
            cancelModal();
        }

        function deleteNode()
        {
            graphModel.deleteNode(node);
            save( formatMarkup() );
            draw();
            cancelModal();
        }

        editor.select("#edit_node_save").on("click", saveChange);
        editor.select("#edit_node_delete").on("click", deleteNode);
    }

    function editRelationship()
    {
        var relationship = this.__data__;
        var midwayPoint = relationship.start.midwayTo( relationship.end );
        var field = svg.append( "svg:foreignObject" )
            .attr( "x", midwayPoint.x - 50 )
            .attr( "y", midwayPoint.y - 50 )
            .attr( "height", 100 )
            .attr( "width", 120 )
            .append( "xhtml:body" )
            .append( "input" )
            .attr( "class", "editor-field" )
            .style( "width", 100 + "px" );

        field.node().value = relationship.label() || "";
        field.node().select();
        field.on( "keypress", function ()
        {
            var e = d3.event;
            if ( e.which == 10 || e.which == 13 )
            {
                relationship.label( field.node().value );
                field.remove();
                save( formatMarkup() );
                draw();
            }
        } )
    }

    function formatMarkup()
    {
        var container = d3.select( "body" ).append( "div" );
        gd.markup.format( graphModel, container );
        var markup = container.node().innerHTML;
        markup = markup
            .replace( /<li/g, "\n  <li" )
            .replace( /<span/g, "\n    <span" )
            .replace( /<\/span><\/li/g, "</span>\n  </li" )
            .replace( /<\/ul/, "\n</ul" );
        container.remove();
        return markup;
    }

    function cancelModal()
    {
        d3.selectAll( ".modal" ).classed( "hide", true );
        d3.selectAll( ".modal-backdrop" ).remove();
    }

    d3.selectAll( ".btn.cancel" ).on( "click", cancelModal );

    function appendModalBackdrop()
    {
        d3.select( "body" ).append( "div" )
            .attr( "class", "modal-backdrop" )
            .on( "click", cancelModal );
    }

    var exportMarkup = function ()
    {
        appendModalBackdrop();
        d3.select( ".modal.export-markup" ).classed( "hide", false );

        var markup = formatMarkup();
        d3.select( "textarea.code" )
            .attr( "rows", markup.split( "\n" ).length * 2 )
            .node().value = markup;
    };

    function parseMarkup( markup )
    {
        var container = d3.select( "body" ).append( "div" );
        container.node().innerHTML = markup;
        var model = gd.markup.parse( container.select("ul.graph-diagram-markup") );
        container.remove();
        return model;
    }

    var useMarkupFromMarkupEditor = function ()
    {
        var markup = d3.select( "textarea.code" ).node().value;
        graphModel = parseMarkup( markup );
        save( markup );
        draw();
        cancelModal();
    };

    d3.select( "#save_markup" ).on( "click", useMarkupFromMarkupEditor );

    var exportSvg = function ()
    {
        d3.xhr( "graph-diagram-inverted.css", function ( d )
        {
            var css = d.responseText;
            var rawSvg = document.getElementById( "canvas" ).innerHTML;
            var styleTag = "<style type=\"text/css\"><![CDATA[" + css + "]]></style>";
            var svgStartTag = "<svg xmlns=\"http://www.w3.org/2000/svg\"";
            var modifiedSvg = rawSvg.replace( /<svg( [^>]*>)/, svgStartTag + "$1" + styleTag );
            window.open( "data:image/svg+xml;base64," + btoa( modifiedSvg ) );
        } );
    };

    function changeInternalScale() {
        graphModel.internalScale(d3.select("#internalScale").node().value);
        draw();
    }
    d3.select("#internalScale").node().value = graphModel.internalScale();

    d3.select(window).on("resize", draw);
    d3.select("#internalScale" ).on("change", changeInternalScale);
    d3.select( "#exportMarkupButton" ).on( "click", exportMarkup );
    d3.select( "#exportSvgButton" ).on( "click", exportSvg );
    d3.selectAll( ".modal-dialog" ).on( "click", function ()
    {
        d3.event.stopPropagation();
    } );

    draw();
})();
