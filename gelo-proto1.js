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
      Meteor.call('clearPositionsData');
    }
  });

  Meteor.startup(function() {
    GoogleMaps.load();
    Meteor.setInterval(function() {
      navigator.geolocation.getCurrentPosition(function(position) {
        if (Positions.find().count() > 100) {
          console.log(Positions.find().count() + " entries have been removed.");
          Meteor.call('clearPositionsData');
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

          position = { lat: latitude, lng: longitude, timestamp: timestamp };
          console.log(position);
          Positions.insert(position);
        }
      });
    }, 2000);
  });

  // Google Maps Related
  Template.body.helpers({
    exampleMapOptions: function() {
      // Make sure the maps API has loaded
      if (GoogleMaps.loaded()) {

        // Map initialization options
        var latest = Positions.findOne({}, {sort: {timestamp: -1}});
        lat = latest.lat + (Math.random()/1000);
        lng = latest.lng + (Math.random()/1000);

        return {
          center: new google.maps.LatLng(lat, lng),
          zoom: 18
        };
      }
    }
  });

  Template.body.onCreated(function() {
    // We can use the `ready` callback to interact with the map API once the map is ready.
    GoogleMaps.ready('exampleMap', function(map) {

      // Add a marker to the map once it's ready
      console.log('map drawn');
      var marker = new google.maps.Marker({
        // position: map.options.center,
        position: new google.maps.LatLng(lat, lng),
        map: map.instance
      });

      Meteor.setInterval(function() {
        marker.setPosition({lat: lat, lng: lng});
      }, 2000);


      // GoogleMaps.exampleMap.panTo(map.options.center);
      // new google.maps.Marker({position: {lat: -34, lng: 151}, map: 'exampleMap'});
      // marker.setPosition({lat: Positions.findOne().latitude+(Math.random() / 4), lng: Positions.findOne().longitude+(Math.random() / 4)});
    });
  });


}

if (Meteor.isServer) {
  Meteor.startup(function () {
    return Meteor.methods({
      clearPositionsData: function() {
        return Positions.remove({});
      }
    });
  });
}
