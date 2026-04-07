// Firebase Cloud Messaging Service Worker
// Handles background and closed-app push notifications

importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js",
);

try {
  firebase.initializeApp({
    apiKey: "AIzaSyACeYwNljzgrk8WAywxKSHoj_juuk2rPbg",
    authDomain: "insti-flow.firebaseapp.com",
    projectId: "insti-flow",
    storageBucket: "insti-flow.firebasestorage.app",
    messagingSenderId: "439140382247",
    appId: "1:439140382247:web:08bdb56afb68e0a9014002",
  });

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log("[firebase-messaging-sw.js] Background message received:", payload);

    const title = payload.notification?.title || "InstiFlow";
    const body = payload.notification?.body || "";

    self.registration.showNotification(title, {
      body: body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: payload.collapseKey || "instiflow-notif",
      data: payload.data || {},
    });
  });
} catch (err) {
  console.error("[firebase-messaging-sw.js] Initialization failed:", err);
}

// Handle scheduled notifications posted by NotificationManager
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SCHEDULE_NOTIFICATIONS") {
    const notifications = event.data.notifications || [];
    const now = Date.now();

    for (const notif of notifications) {
      const fireAt = new Date(notif.scheduledAt).getTime();
      const delay = fireAt - now;

      if (delay > 0 && delay < 7 * 24 * 60 * 60 * 1000) {
        setTimeout(() => {
          self.registration.showNotification(notif.title, {
            body: notif.body,
            icon: "/icons/icon-192.png",
            tag: notif.tag || "instiflow-scheduled",
          });
        }, delay);
      }
    }
  }
});
