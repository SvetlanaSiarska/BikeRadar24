import * as firebase from 'firebase';
//import firestore from 'firebase/firestore'
import firebaseConfig from './firebaseConfig';

//const settings = {timestampsInSnapshots: true};

console.log('firebase initializeApp-user')
firebase.initializeApp(firebaseConfig);

//firebase.firestore().settings(settings);

export default firebase;