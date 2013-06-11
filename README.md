# Arrows - graph diagram library

JavaScript library for drawing diagrams of small graphs, using [D3](http://d3js.org/) to generate SVG. 
Useful for explaining [Neo4j](http://www.neo4j.org/) graph modelling concepts in presentations and blogs.

## How do I use it?

Write HTML markup to express graph content and structure, then ask the library to render an 
SVG picture of the graph. Control geometry and styling by applying CSS to the markup.

The library you need is `graph-diagram.js`. It depends on D3, so you'll need that too.

Markup looks like this, enclosed in a `<figure>` tag:

    <figure class="graph-diagram">
      <ul class="graph-diagram-markup">
        <li class="node" data-node-id="0" data-x="0" data-y="0">
          <span class="caption">A</span>
        </li>
        <li class="node" data-node-id="1" data-x="50" data-y="0">
          <span class="caption">B</span>
        </li>
        <li class="relationship" data-from="0" data-to="1">
          <span class="type">R</span>
        </li>
      </ul>
    </figure>

See [tests.html](http://www.apcjones.com/arrows/tests.html) for examples of what you can do 
with markup and styling.

At the end of your page, or in a suitable event handler, call a bit of framework code:

    <script type="text/javascript">
      d3.selectAll( "figure.graph-diagram" )
              .call( gd.figure() );
    </script>

There's also a complete working example in [example.html](http://www.apcjones.com/arrows/example.html).

## How do I draw a graph?

What? You can't hold x/y coordinates in your head and type the markup straight in?
Don't worry, there's a graphical editor. It's in `index.html`.
This whole repository is hosted by GitHub Pages, so you'll find the editor hosted at
[http://www.apcjones.com/arrows/](http://www.apcjones.com/arrows/).

## Are there any limitations?

Yes, lots. Consider the current version experimental at best. 
There hasn't been any work on browser compatibility, 
so I'd be surprised if it works properly outside WebKit.