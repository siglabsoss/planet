
// Very helpful debug function
// load page and then call this from the console
// WTF this isn't published but you can call this from the browser?
function logRenders () {
    _.each(Template, function (template, name) {
        var oldRender = template.rendered;
        var counter = 0;

        template.rendered = function () {
            console.log(name, "render count: ", ++counter);
            oldRender && oldRender.apply(this, arguments);
        };
    });
}


// Makes background red for every element of the dom
redRenders = function () {
    $('*').each(function(element){
        $(this).css( "background-color", "red" );
    });
}