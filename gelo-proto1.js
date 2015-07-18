Positions = new Mongo.Collection('positions');
polling = true;

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
    },

    'click .startStop': function(){
      if (polling) {
        polling = false;
      }
      else if (!polling) {
        polling = true;
      }
      console.log(polling);
    }

  });

  Meteor.startup(function() {
    GoogleMaps.load();
    Meteor.setInterval(function() {
      if (polling) {
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
      };
    }, 2000);
  });

  // Google Maps Related
  Template.body.helpers({
    exampleMapOptions: function() {
      // Make sure the maps API has loaded
      if (GoogleMaps.loaded()) {

        // Map initialization options
        var latest = Positions.findOne({}, {sort: {timestamp: -1}});

        // Wrap in 'if' statement to reduce errors when 'clear' happens
        if (Positions.find().count() > 0) {
          lat = latest.lat; // + (Math.random()/1000)
          lng = latest.lng; // + (Math.random()/1000)
        }

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
        position: new google.maps.LatLng(lat, lng),
        map: map.instance
      });

      Meteor.setInterval(function() {
        marker.setPosition({lat: lat, lng: lng});
      }, 2000);
    });
  });

  // Facebook Login Related
  ServiceConfiguration.configurations.insert({
    service: 'facebook',
    appId: 'YOUR-APP-ID',
    secret: 'YOUR-APP-SECRET'
  });

  Template.login.events({
    'click #facebook-login': function(event) {
      Meteor.loginWithFacebook({}, function(err){
        if (err) {
          throw new Meteor.Error("Facebook login failed");
        }
      });
    },

    'click #logout': function(event) {
      Meteor.logout(function(err){
        if (err) {
          throw new Meteor.Error("Logout failed");
        }
      })
    }
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

