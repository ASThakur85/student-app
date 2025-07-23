// firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/12.0.0/firebase-app-compact.js");
importScripts("https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging-compact.js");

// Initialize Firebase inside the service worker
firebase.initializeApp({
  apiKey: "AIzaSyCi7usXox721fWVLvSMBwOLf9OnQkIofAI",
  authDomain: "student-app-c6abf.firebaseapp.com",
  projectId: "student-app-c6abf",
  storageBucket: "student-app-c6abf.firebasestorage.app",
  messagingSenderId: "896987976968",
  appId: "1:896987976968:web:b9ab97e1ae698aff0688bd",
  measurementId: "G-BKHGSWQ3CN"
});

// Initialize Firebase Cloud Messaging
const messaging = firebase.messaging();

// Handle background push messages
messaging.onBackgroundMessage(payload => {
  console.log("[firebase-messaging-sw.js] Received background message:", payload);

  const { title, body } = payload.notification;

  self.registration.showNotification(title, {
    body: body,
    icon: "/icon.png",
    actions: [{ action: "open", title: "Open App" }]
  });
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url === "/" && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow("/");
      }
    })
  );
});