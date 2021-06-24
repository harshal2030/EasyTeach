/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing the generated config
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

firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log('Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
