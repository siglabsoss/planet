Template.contacts.contacts = function() {
    return Contacts.find();
}

Template.contact.rendered = function() {
//    this.viewEditing = true;
//    this.vview = true;
}

Template.contact.viewEditing = function() {
    return Session.get("contactViewEditingId") === this._id;
}


//Template.contacts.events }

Template.contacts.events({
    "click i.plus-button-green": function(e) {
//        e.preventDefault();
//        console.log("new");

//        debugger;


        var defaults = {
            mode: 'inline',
            toggle: 'manual',
            showbuttons: false,
            onblur: 'ignore',
            inputclass: 'input-small',
            savenochange: false
        };
        $.extend($.fn.editable.defaults, defaults);

        $('#emailOne').editable({
            title: 'Enter value',
            success: function(response, newValue) {

                var $input = this.data('editable').input.$input;

                console.log($input.val());
                return true;
            }
        });

//        $('#users').on('click', '.edit', function(){
//            $('#emailOne').find('.editable-open').editable('hide');
//            $('#emailOne').find('.btn-primary').hide();
//            $('#emailOne').find('.edit').show();
//        $('#emailOne').editable('show');
//            $(this).hide().siblings('.btn-primary').show();
//            $(this).closest('tr').find('.editable').editable('show');
//        });


    },
    'click .save-contact-form-data': function(e) {
//        console.log(e);


//        var thing = $('#emailOne').editable('input2value');
//        console.log(thing);
//        debugger;
        $('#emailOne').editable('submit');
    },
    'click .cancel-contact-form-data': function(e) {
        Session.set("contactViewEditingId", null);
    },
    'click .edit-contact-form-data': function(e) {
        var id = $(e.target).attr('data-id');

        if( id && typeof id === "string") {
            Session.set("contactViewEditingId", id);
        }
    }
});