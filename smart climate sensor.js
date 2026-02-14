let sensorData = [];
let currentIndex = 0;

async function init() {
    const response = await fetch("data.json");
    sensorData = await response.json();

    updateUI();
    setInterval(updateUI, 4000);
}

function updateUI() {
    const sensor = sensorData[currentIndex];

    document.getElementById("temp").innerText = sensor.temperature;
    document.getElementById("hum").innerText = sensor.humidity;
    document.getElementById("motion").innerText = sensor.motion ? "Detected" : "Not Detected";
    document.getElementById("relay1").innerText = sensor.relay1 ? "ON" : "OFF";
    document.getElementById("relay2").innerText = sensor.relay2 ? "ON" : "OFF";

    checkAlert(sensor);

    currentIndex = (currentIndex + 1) % sensorData.length;
}

function checkAlert(sensor) {
    const alertBox = document.getElementById("alertBox");

    if (!sensor.motion && (sensor.relay1 || sensor.relay2)) {
        alertBox.classList.remove("hidden");
    } else {
        alertBox.classList.add("hidden");
    }
}

init();