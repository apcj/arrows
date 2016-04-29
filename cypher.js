function cypher(model) {
    function props(element) {
        var props = {};
        element.properties().list().forEach(function (property) {
            props[property.key] = property.value;
        });
        return props;
    }

    function isIdentifier(name) {
        return /^[_a-zA-Z]\w*$/.test(name);
    }

    function quote(name) {
        return isIdentifier(name) ? name : "`" + name + "`";
    }

    function render(props) {
        var res = "";
        for (var key in props) {
            if (res.length > 0) res += ",";
            if (props.hasOwnProperty(key)) {
                res += quote(key) + ":";
                var value = props[key];
                res += typeof value == "string" && value[0] != "'" && value[0] != '"' ? "'" + value + "'" : value;
            }
        }
        return res.length == 0 ? "" : "{" + res + "}";
    }

    var statements = [];
    model.nodeList().forEach(function (node) {
        statements.push("(" + quote(node.id) +" :" + quote(node.caption() || "Node") + " " + render(props(node)) + ") ");
    });
    model.relationshipList().forEach(function (rel) {
        statements.push("(" + quote(rel.start.id) +
            ")-[:`" + quote(rel.relationshipType()||"RELATED_TO") +
            // " " + TODO render(props(rel)) +
            "`]->("+ quote(rel.end.id) +")"
        );
    });
    if (statements.length==0) return "";
    return "CREATE \n  " + statements.join(",\n  ");
};
if (typeof exports != "undefined") exports.cypher=cypher
gd.cypher=function(model) {return cypher(model || this.model());}
