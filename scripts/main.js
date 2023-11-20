const apiKey = '00b48d94481070eaee4d91619c5a0bbe';

const showWeatherButton = document.querySelector('.main-controls__container-show-weather');

function getWeather(apiUrl) {
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(currentWeather => {
            console.log(currentWeather['main']['temp']);
            document.querySelector('.weather-info-temperature')
                .textContent = `${Math.round(currentWeather['main']['temp'] - 273)}°C`;
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
}

showWeatherButton.onclick = function () {
    const latitude = document.querySelector('.main-controls__inputs-list-item-latitude').value;
    const longitude = document.querySelector('.main-controls__inputs-list-item-longitude').value;

    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;

    getWeather(apiUrl)
}
