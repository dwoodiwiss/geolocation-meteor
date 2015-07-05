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
