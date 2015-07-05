Positions = new Mongo.Collection('positions');

if (Meteor.isClient) {
  Session.setDefault('latitude', "Loading...");
  Session.setDefault('longitude', "Loading...");
  Session.setDefault('timestamp', "Loading...");

  Template.position.helpers({
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

  Template.position.events({
    'click .clear': function(){
      console.log(Positions.find().count() + " entries have been removed.");
      Meteor.call('clearAllData');
    }
  });

  Meteor.startup(function() {
    GoogleMaps.load();
    Meteor.setInterval(function() {
      navigator.geolocation.getCurrentPosition(function(position) {
        if (Positions.find().count() > 100) {
          console.log(Positions.find().count() + " entries have been removed.");
          Meteor.call('clearAllData');
        }
        else {
          console.log(Positions.find().count() + " entries are in mongodb.");

          var latitude = position.coords.latitude;
          var longitude = position.coords.longitude;
          var timestamp = position.timestamp;
          var date = new Date(timestamp);

          Session.set('latitude', latitude);
          Session.set('longitude', longitude);
          Session.set('timestamp', date);

          position = { latitude: latitude, longitude: longitude, timestamp: timestamp };
          console.log(position);
          Positions.insert(position);
        }

      });
    }, 2000);
  });

  // Google Maps Related
  Template.body.helpers({

    exampleMapOptions: function() {
      var tot = Positions.find().count();
      var lat = Positions.findOne().latitude;
      var lon = Positions.findOne().longitude;

      // Make sure the maps API has loaded
      if (GoogleMaps.loaded()) {
        // Map initialization options
        return {
          center: new google.maps.LatLng(lat, lon),
          // center: new google.maps.LatLng(-37.8136, 144.9631),
          zoom: 18
        };
      }
    }
  });

  Template.body.onCreated(function() {
    // We can use the `ready` callback to interact with the map API once the map is ready.
    GoogleMaps.ready('exampleMap', function(map) {
      // Add a marker to the map once it's ready
      var marker = new google.maps.Marker({
        position: map.options.center,
        map: map.instance
      });
    });
  });


}

if (Meteor.isServer) {
  Meteor.startup(function () {
    return Meteor.methods({
      clearAllData: function() {
        return Positions.remove({});
      }
    });
  });
}
