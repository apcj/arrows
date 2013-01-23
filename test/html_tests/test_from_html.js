function compareSvg( expected, actual, report )
{
    if ( expected.tagName != actual.tagName )
    {
        report( expected, actual, "different tag" );
        return;
    }
    if ( expected.childElementCount != actual.childElementCount )
    {
        report( expected, actual, "different number of children" )
        return;
    }

    for ( var i = 0; i < expected.attributes.length; i++ )
    {
        var expectedAttribute = expected.attributes[i];
        var name = expectedAttribute.name;
        var actualAttribute = actual.attributes[name];
        if (actualAttribute == null) {
            report(expected, actual, "missing attribute " + name );
            result = false;
        } else {
            var expectedAttributeValue = expectedAttribute.value;
            var actualAttributeValue = actualAttribute.value;
            if ( expectedAttributeValue != actualAttributeValue )
            {
                report(expected, actual,
                    "Expected " + name + "=\"" + expectedAttributeValue + "\" but got " + name + "=\"" + actualAttributeValue );
            }
        }
    }

    function onlyElements( nodes )
    {
        var elements = [];
        for ( var i = 0; i < nodes.length; i++ )
        {
            var node = nodes[i];
            if ( node.nodeType === 1 )
            {
                elements.push( node );
            }
        }
        return elements;
    }

    var expectedChildElements = onlyElements( expected.childNodes );
    var actualChildElements = onlyElements( actual.childNodes );

    if (expectedChildElements.length === 0) {
        if (expected.textContent != actual.textContent) {
            report(expected, actual,
                "Expected text content \"" + expected.textContent + "\" but got \"" + actual.textContent + "\"");
        }
    } else {
        for ( var i = 0; i < expectedChildElements.length; i++ )
        {
            compareSvg( expectedChildElements[i], actualChildElements[i], report );
        }
    }
}

var diagram = gd.diagram();

var allPass = true;
d3.selectAll( ".example" ).each( function ()
{
    var exampleRow = d3.select( this );

    exampleRow.insert( "td", "td" )
        .append( "pre" ).append( "code" )
        .attr( "class", "pretty-markup" )
        .text( function ( d )
        {
            var markup = exampleRow.select( "td.markup" );
            return markup.node().innerHTML.replace(/^      /gm,"").replace(/^\s*\n/g,"").replace(/\n\s*$/,"");
        } );

    var view = exampleRow.append( "td" ).attr( "class", "actual-diagram" ).append( "svg:svg" );

    view
        .data(gd.markup.parseAll( exampleRow.select( "ul.graph-diagram-markup" ) ))
        .call(diagram);

    var errorContainer = exampleRow.selectAll( "td.errors" ).data( [ {} ] );
    errorContainer.enter().append( "td" ).attr( "class", "errors" );

    var resultCell = exampleRow.selectAll( "td.result" ).data( [ {} ] );
    resultCell.enter().append( "td" ).attr( "class", "result" ).append( "i" ).attr( "class", "icon-white" );

    var pass = true;

    compareSvg( exampleRow.select( "td.expected-diagram svg" ).node(), exampleRow.select( "td.actual-diagram svg" ).node(),
        function ( expected, actual, message )
        {
            pass = false;
            errorContainer.append( "li" ).text( message );
        } );

    exampleRow.classed(pass ? "pass" : "fail", true);

    allPass = allPass && pass;
});

d3.selectAll( ".example.pass .result i" ).classed( "icon-ok", true );
d3.selectAll( ".example.fail .result i" ).classed( "icon-remove", true );

d3.select( ".overall-result.pass" ).classed( "hide", !allPass );
d3.select( ".overall-result.fail" ).classed( "hide", allPass );

d3.select( ".examples.table" ).classed( "all-pass", allPass );

