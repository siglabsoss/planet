if (Meteor.isClient) {
  Template.hello.greeting = function () {
    return "Welcome to pop-planet.";
  };

  Template.hello.events({
    'click input' : function () {
      // template data, if any, is available in 'this'
      if (typeof console !== 'undefined')
        console.log("You pressed the button");
    }
  });
}


Template.layout.showFenceSetting = function() {
    // using reactive causes issues if this value changes which blows away the map :(
    return getUserSetting('map.view.showFences', {reactive:false});
}