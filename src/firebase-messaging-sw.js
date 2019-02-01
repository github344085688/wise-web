importScripts('https://www.gstatic.com/firebasejs/4.3.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.3.0/firebase-messaging.js');
var config = {
    messagingSenderId: "2509753206"
};
firebase.initializeApp(config);
var messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function (payload) {
    const notificationTitle = 'Message';
    var dataJson = JSON.parse(JSON.stringify(payload)).data.message;
    var dataObj = JSON.parse(dataJson);
    var windowMsg = "";
    if (dataObj.status === "Failed") {
        windowMsg = "Error : " + dataObj.message;
    } else if (dataObj.scanType === "Receiving") {
        windowMsg = "Action : " + dataObj.scanType + ",  " + 'carton No : ' + dataObj.cartonNo + ",  " + 'Target Dock Name : ' + dataObj.targetDockName;
    }
    else if (dataObj.scanType === "Shipping") {
        windowMsg = "Action : " + dataObj.scanType + ",  " + 'carton No : ' + dataObj.cartonNo + " " +dataObj.scanAction;
    } else {
        windowMsg = payload;
    }

    const notificationOptions = {
        body: windowMsg,
        icon: 'assets/img/bell.png'
    };
    return self.registration.showNotification(notificationTitle,
        notificationOptions);
});