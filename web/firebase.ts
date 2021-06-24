import firebase from 'firebase/app';
import 'firebase/messaging';

var firebaseConfig = {
  apiKey: 'AIzaSyCWRnVr-gC2LxOahqr6fhG7o6xnT88FiEU',
  authDomain: 'easy-3e6d3.firebaseapp.com',
  databaseURL: 'https://easy-3e6d3.firebaseio.com',
  projectId: 'easy-3e6d3',
  storageBucket: 'easy-3e6d3.appspot.com',
  messagingSenderId: '665109037312',
  appId: '1:665109037312:web:4c9003d8519d062129f3e5',
  measurementId: 'G-YRE1WJVVP8',
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export const messaging = firebase.messaging();

export const getToken = () => {
  return new Promise(async (resolve: (token: string) => void, reject) => {
    try {
      const token = await messaging.getToken({
        vapidKey:
          'BHJcvK2dWoKZ-xIhrbkNxhe2lutxGeAelg9HE5och0F1TZXYElHKldMgctFykr7v5mIShz9Zvf6dCqm7tg9mcGg',
      });

      if (token) {
        resolve(token);
      } else {
        reject(null);
      }
    } catch (e) {
      console.log(e);
      reject(null);
    }
  });
};
