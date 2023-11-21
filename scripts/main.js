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
            getWeatherParameters(currentWeather);
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
}

function getWeatherParameters(currentWeather) {
    console.log(currentWeather['name']);

    document.querySelector('.weather-info__list-item-temperature')
        .textContent = `${Math.round(currentWeather['main']['temp'] - 273)}°C`;
    document.querySelector('.weather-info__list-item-feels')
        .textContent = `${Math.round(currentWeather['main']['feels_like'] - 273)}°C`;
    document.querySelector('.weather-info__list-item-pressure')
        .textContent = `${currentWeather['main']['pressure']}гПа`;
    document.querySelector('.weather-info__list-item-humidity')
        .textContent = `${currentWeather['main']['humidity']}%`;
    document.querySelector('.weather-info__list-item-wind-speed')
        .textContent = `${convertMilesPerHourToKilometersPerHour(currentWeather['wind']['speed'])}Км/ч`;
    document.querySelector('.weather-info__list-item-wind-direction')
        .textContent = `Ветер: ${degreesToCompassDirection(parseInt(currentWeather['wind']['deg']))}`;


    setPlaceName(currentWeather['name']);
    timeInPlace(parseInt(currentWeather['timezone']));
}

function setPlaceName(cityName) {
    if ('' === cityName) {
        document.querySelector('.weather-info__list-item-place')
            .textContent = `Вне населенного пункта`;
    }
    else {
        document.querySelector('.weather-info__list-item-place')
            .textContent = `${cityName}`;
    }
}

function timeInPlace(seconds) {
    fetch('http://worldtimeapi.org/api/timezone/Europe/London')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(utcTime => { // 2023-11-21T11:53:43.729054+00:00  11
            const date = utcTime['utc_datetime'].toString()
            const hours = parseInt(date.slice(11, 13)) + ((seconds / 60) / 60);
            const minutes = date.slice(14, 16);
            document.querySelector('.weather-info__list-item-time')
                .textContent = `${hours}:${minutes}`;
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
}

function degreesToCompassDirection(degrees) {
    degrees = (degrees + 360) % 360;

    const directions = ['северный', 'северо-восточный', 'восточный',
        'юго-восточный', 'южный', 'юго-западный', 'западный', 'северо-западный'];
    const index = Math.round(degrees / 45) % 8;

    return directions[index];
}

function convertMilesPerHourToKilometersPerHour(milesPerHour) {
    const conversionFactor = 1.60934;
    const kilometersPerHour = milesPerHour * conversionFactor;

    // Округляем до 1 знака после запятой
    const roundedKilometersPerHour = Math.round(kilometersPerHour * 10) / 10;

    return roundedKilometersPerHour;
}

showWeatherButton.onclick = function () {
    const latitude = document.querySelector('.main-controls__inputs-list-item-latitude').value;
    const longitude = document.querySelector('.main-controls__inputs-list-item-longitude').value;

    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;

    getWeather(apiUrl)
}
