Locations = new Mongo.Collection('locations');

if (Meteor.isClient) {
  Session.setDefault('latitude', "Loading...");
  Session.setDefault('longitude', "Loading...");
  Session.setDefault('timestamp', "Loading...");

  Template.location.helpers({
    latitude: function () {
      return Session.get('latitude');
    },
    longitude: function () {
      return Session.get('longitude');
    },
    timestamp: function () {
      return Session.get('timestamp');
    }
  });

  Meteor.startup(function() {
    Meteor.setInterval(function() {
      navigator.geolocation.getCurrentPosition(function(position) {
        console.log(position);

        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;
        var timestamp = position.timestamp;
        var date = new Date(timestamp);

        Session.set('latitude', latitude);
        Session.set('longitude', longitude);
        Session.set('timestamp', date);

      });
    }, 2000);
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
