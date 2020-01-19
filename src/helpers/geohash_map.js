
import firebase from '../firebase/firebase';
var geohash = require('./geohash.js');


// Calculate the upper and lower boundary geohashes for
// a given latitude, longitude, and distance in miles
export const getGeohashRange = (
    latitude,
    longitude,
    distance, // miles
  ) => {
    const lat = 0.0144927536231884; // degrees latitude per mile
    const lon = 0.0181818181818182; // degrees longitude per mile
  
    const lowerLat = latitude - lat * distance;
    const lowerLon = longitude - lon * distance;
  
    const greaterLat = latitude + lat * distance;
    const greaterLon = longitude + lon * distance;
  
    const lower = geohash.encode(lowerLat, lowerLon);
    const upper = geohash.encode(greaterLat, greaterLon);
  
    return {
      lower,
      upper
    };
  };

  export const saveBikerPosition =(userUid, data) => {
      const {  latitude, longitude} = data;
      const ghash =  geohash.encode(latitude, longitude);

      // Add a new document in collection "cities"
      firebase.firestore().collection("bikers").doc(userUid).set({
           latitude, longitude, ghash, userUid
        })
        .then(function() {
            //console.log("Document successfully written!");
        })
        .catch(function(error) {
            //console.error("Error writing document: ", error);
        });
  }
