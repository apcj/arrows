(function()
{
    var graphModel;
    if (!localStorage.getItem("graph-diagram-markup")) {
        graphModel = gd.model();
        graphModel.createNode().x( 50 ).y( 140 );
        save( formatMarkup() );
    }
    graphModel = parseMarkup( localStorage.getItem( "graph-diagram-markup" ) );

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
        var node = this.__data__.model;
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

    d3.select( "#add_node_button" ).on( "click", function ()
    {
        graphModel.createNode().x( 0 ).y( 0 );
        save( formatMarkup() );
        draw();
    } );

    function onControlEnter(saveChange)
    {
        return function()
        {
            if ( d3.event.ctrlKey && d3.event.keyCode === 13 )
            {
                saveChange();
            }
        }
    }

    function editNode()
    {
        var editor = d3.select(".pop-up-editor.node");
        appendModalBackdrop();
        editor.classed( "hide", false );

        var node = this.__data__.model;

        var captionField = editor.select("#node_caption");
        captionField.node().value = node.caption() || "";
        captionField.node().select();

        var propertiesField = editor.select("#node_properties");
        propertiesField.node().value = node.properties().list().reduce(function(previous, property) {
            return previous + property.key + ": " + property.value + "\n";
        }, "");

        function saveChange()
        {
            node.caption( captionField.node().value );
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
            gd.updateTextDerivedDimensions( graphModel );
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

        captionField.on("keypress", onControlEnter(saveChange) );
        propertiesField.on("keypress", onControlEnter(saveChange) );

        editor.select("#edit_node_save").on("click", saveChange);
        editor.select("#edit_node_delete").on("click", deleteNode);
    }

    function editRelationship()
    {
        var editor = d3.select(".pop-up-editor.relationship");
        appendModalBackdrop();
        editor.classed( "hide", false );

        var relationship = this.__data__.model;

        var relationshipTypeField = editor.select("#relationship_type");
        relationshipTypeField.node().value = relationship.relationshipType() || "";
        relationshipTypeField.node().select();

        var propertiesField = editor.select("#relationship_properties");
        propertiesField.node().value = relationship.properties().list().reduce(function(previous, property) {
            return previous + property.key + ": " + property.value + "\n";
        }, "");

        function saveChange()
        {
            relationship.relationshipType( relationshipTypeField.node().value );
            relationship.properties().clearAll();
            propertiesField.node().value.split("\n").forEach(function(line) {
                var tokens = line.split(/: */);
                if (tokens.length === 2) {
                    var key = tokens[0].trim();
                    var value = tokens[1].trim();
                    if (key.length > 0 && value.length > 0) {
                        relationship.properties().set(key, value);
                    }
                }
            });
            save( formatMarkup() );
            gd.updateTextDerivedDimensions( graphModel );
            draw();
            cancelModal();
        }

        function reverseRelationship()
        {
            relationship.reverse();
            save( formatMarkup() );
            draw();
            cancelModal();
        }

        function deleteRelationship()
        {
            graphModel.deleteRelationship(relationship);
            save( formatMarkup() );
            draw();
            cancelModal();
        }

        relationshipTypeField.on("keypress", onControlEnter(saveChange) );
        propertiesField.on("keypress", onControlEnter(saveChange) );

        editor.select("#edit_relationship_save").on("click", saveChange);
        editor.select("#edit_relationship_reverse").on("click", reverseRelationship);
        editor.select("#edit_relationship_delete").on("click", deleteRelationship);
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
    d3.selectAll( ".modal" ).on( "keyup", function() { if ( d3.event.keyCode === 27 ) cancelModal(); } );

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
        gd.updateTextDerivedDimensions( model );
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
        var rawSvg = new XMLSerializer().serializeToString(d3.select("#canvas svg" ).node());
        var svgStartTag = "<svg xmlns=\"http://www.w3.org/2000/svg\"";
        var modifiedSvg = rawSvg.replace( /<svg( [^>]*>)/, svgStartTag + "$1" ).replace(/&nbsp;/g, "\u00A0");
        console.log(modifiedSvg);
        window.open( "data:image/svg+xml;base64," + btoa( modifiedSvg ) );
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
