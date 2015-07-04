Locations = new Mongo.Collection('locations');

if (Meteor.isClient) {
  Session.setDefault('latitude', "Loading");
  Session.setDefault('longitude', "Loading");

  Template.location.helpers({
    latitude: function () {
      return Session.get('latitude');
    },
    longitude: function () {
      return Session.get('longitude');
    }
  });

  Template.location.events({
    'click button': function () {
      var location = Geolocation.currentLocation();

      if (location) {
        console.log(Geolocation.currentLocation().coords.latitude);
        console.log(Geolocation.currentLocation().coords.longitude);

        var latitude = location.coords.latitude;
        var longitude = location.coords.longitude;

        Session.set('latitude', latitude);
        Session.set('longitude', longitude);
      };
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
