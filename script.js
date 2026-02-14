/* ================================
   EMAIL CONFIG
================================ */

const EMAIL_ENABLED = false; // true for real email

const EMAIL_CONFIG = {
    PUBLIC_KEY: "T7IZyomsi6yw5n3zJ",
    SERVICE_ID: "service_alndbse",
    TEMPLATE_ID: "template_ytjalc6",
    TO_NAME: "Ganga"
};

if (EMAIL_ENABLED) {
    (function () {
        emailjs.init(EMAIL_CONFIG.PUBLIC_KEY);
    })();
}

/* ================================
   EMAIL FUNCTION
================================ */

function sendAlertEmail(data) {

    if (!EMAIL_ENABLED) {
        console.log("📧 MOCK EMAIL SENT");
        console.table(data);
        return;
    }

    emailjs.send(
        EMAIL_CONFIG.SERVICE_ID,
        EMAIL_CONFIG.TEMPLATE_ID,
        data
    )
    .then(res => console.log("✅ Email sent!", res.status))
    .catch(err => console.error("❌ Email failed:", err));
}

/* ================================
   SENSOR DATA HANDLING
================================ */

let sensorData = [];
let currentIndex = 0;
let emailSent = false;

async function init() {
    const response = await fetch("data.json");
    sensorData = await response.json();

    updateUI();
    setInterval(updateUI, 4000);
}

/* ================================
   MAIN UPDATE FUNCTION
================================ */

function updateUI() {

    const sensor = sensorData[currentIndex];

    applyAutomation(sensor);

    document.getElementById("temp").innerText = sensor.temperature;
    document.getElementById("hum").innerText = sensor.humidity;
    document.getElementById("motion").innerText =
        sensor.motion ? "Detected" : "No Motion";

    const devices = [
        "FAN1","FAN2","FAN3","FAN4",
        "TUBELIGHT1","TUBELIGHT2",
        "VENTILATION"
    ];

    devices.forEach(device => {
        document.getElementById(device).innerText =
            sensor[device] === true ? "ON" : "OFF";
    });

    checkForAlert(sensor);

    currentIndex = (currentIndex + 1) % sensorData.length;
}

/* ================================
   AUTOMATION RULES
================================ */

function applyAutomation(sensor) {

    if (sensor.motion) {

        // Tubelights ON
        sensor.TUBELIGHT1 = true;
        sensor.TUBELIGHT2 = true;

        // Temp > 30 → all fans ON
        if (sensor.temperature > 30) {
            sensor.FAN1 = true;
            sensor.FAN2 = true;
            sensor.FAN3 = true;
            sensor.FAN4 = true;
        }

        // Humidity > 70 → Ventilation ON
        if (sensor.humidity > 70) {
            sensor.VENTILATION = true;
        }

        emailSent = false;
    }
}

/* ================================
   ALERT LOGIC
================================ */

function checkForAlert(sensor) {

    const devices = [
        "FAN1","FAN2","FAN3","FAN4",
        "TUBELIGHT1","TUBELIGHT2",
        "VENTILATION"
    ];

    const anyDeviceOn = devices.some(d => sensor[d] === true);

    if (!sensor.motion && anyDeviceOn) {

        document
            .getElementById("alertBox")
            .classList.remove("hidden");

        if (!emailSent) {

            sendAlertEmail({
                to_name: EMAIL_CONFIG.TO_NAME,
                temperature: sensor.temperature,
                humidity: sensor.humidity,
                motion: "No Motion",
                message: "⚠ Appliance left ON without motion detected."
            });

            emailSent = true;
        }

        // Turn OFF all devices
        devices.forEach(d => sensor[d] = false);

    } else {
        document
            .getElementById("alertBox")
            .classList.add("hidden");
    }
}

init();