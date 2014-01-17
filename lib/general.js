// This is needed to interface with select2 plugin

// returns something that you put into select2
// basically adds the .text member copied from .name
convertDocumentsSelect2 = function(documents) {
    var data = [];
    documents.each(function(d){
        data.push({id: d._id, text: d.name});
    });
    return data;
};