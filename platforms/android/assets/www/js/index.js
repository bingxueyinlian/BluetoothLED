/* jshint quotmark: false, unused: vars, browser: true */
/* global cordova, console, $, bluetoothSerial, _, refreshButton, deviceList,disconnectButton, connectionScreen, controlScreen, messageDiv */
'use strict';

var app = {
    initialize: function() {
        this.bind();
    },
    bind: function() {
        document.addEventListener('deviceready', this.deviceready, false);
        //colorScreen.hidden = true;

        //the following code move to deviceready
        new OperationList();
        // slider changes
        // $('.topcoat-range').on('change', 0, app.onSliderChange); //drag the slider
        // $('.reduce_slider').on('click', -1, app.onSliderChange); //click button to reduce the slider
        // $('.add_slider').on('click', 1, app.onSliderChange); //click button to add the slider
    },
    deviceready: function() {
        // wire buttons to functions
        deviceList.ontouchstart = app.connect; // assume not scrolling
        refreshButton.ontouchstart = app.list;
        disconnectButton.ontouchstart = app.disconnect;

        $('.topcoat-range').on('change', 0, app.onSliderChange); //drag the slider
        $('.reduce_slider').on('click', -1, app.onSliderChange); //click button to reduce the slider
        $('.add_slider').on('click', 1, app.onSliderChange); //click button to add the slider
        
        app.list();
    },
    list: function(event) {
        deviceList.firstChild.innerHTML = "Discovering...";
        app.setStatus("Looking for Bluetooth Devices...");

        bluetoothSerial.list(app.ondevicelist, app.generateFailureFunction("List Failed"));
    },
    connect: function(e) {
        app.setStatus("Connecting...");
        var device = e.target.getAttribute('deviceId');
        console.log("Requesting connection to " + device);
        bluetoothSerial.connect(device, app.onconnect, app.ondisconnect);
    },
    disconnect: function(event) {
        app.setStatus("Disconnecting...");
        bluetoothSerial.disconnect(app.ondisconnect);
    },
    onconnect: function() {
        connectionScreen.hidden = true;
        colorScreen.hidden = false;
        app.setStatus("Connected.");
    },
    ondisconnect: function() {
        connectionScreen.hidden = false;
        colorScreen.hidden = true;
        app.setStatus("Disconnected.");
    },
    onSliderChange: function(evt) {
        var type = evt.data;
        var thisObj = $(evt.target);
        var sliderDiv = thisObj.parent();
        var slider_val = sliderDiv.next().find('.slider_val');
        var newValue;
        if (type === 0) {
            newValue = thisObj.val();
            slider_val.html(newValue);
        }
        else {
            var rangeObj = sliderDiv.find('.topcoat-range');
            var min = rangeObj.attr('min');
            var max = rangeObj.attr('max');
            var curValue = parseInt(rangeObj.val(), 10);
            if (type === -1) { //reduce
                newValue = curValue - 1;
                if (newValue < min) return;
                rangeObj.val(newValue);
            } else if (type === 1) {
                newValue = curValue + 1;
                if (newValue > max) return;
                rangeObj.val(newValue);
            }
        }
        slider_val.html(newValue);
    },
    sendToDevice: function(c) {
        bluetoothSerial.write("c" + c + "\n");
    },
    timeoutId: 0,
    setStatus: function(status) {
        if (app.timeoutId) {
            clearTimeout(app.timeoutId);
        }
        messageDiv.innerText = status;
        app.timeoutId = setTimeout(function() { messageDiv.innerText = ""; }, 4000);
    },
    ondevicelist: function(devices) {
        var listItem, deviceId;

        // remove existing devices
        deviceList.innerHTML = "";
        app.setStatus("");

        devices.forEach(function(device) {
            listItem = document.createElement('li');
            listItem.className = "topcoat-list__item";
            if (device.hasOwnProperty("uuid")) { // TODO https://github.com/don/BluetoothSerial/issues/5
                deviceId = device.uuid;
            } else if (device.hasOwnProperty("address")) {
                deviceId = device.address;
            } else {
                deviceId = "ERROR " + JSON.stringify(device);
            }
            listItem.setAttribute('deviceId', device.address);
            listItem.innerHTML = device.name + "<br/><i>" + deviceId + "</i>";
            deviceList.appendChild(listItem);
        });

        if (devices.length === 0) {

            if (cordova.platformId === "ios") { // BLE
                app.setStatus("No Bluetooth Peripherals Discovered.");
            } else { // Android
                app.setStatus("Please Pair a Bluetooth Device.");
            }

        } else {
            app.setStatus("Found " + devices.length + " device" + (devices.length === 1 ? "." : "s."));
        }
    },
    generateFailureFunction: function(message) {
        var func = function(reason) {
            var details = "";
            if (reason) {
                details += ": " + JSON.stringify(reason);
            }
            app.setStatus(message + details);
        };
        return func;
    }
};