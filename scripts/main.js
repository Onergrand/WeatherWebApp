import {getOpenWeatherApiKey, getTimeApiKey} from './api.js';

let mapIsShown = false;
let myMap;

const showWeatherButton = document.querySelector('.main-controls__container-show-weather');

function getWeather(latitude, longitude) {
    fetch(getOpenWeatherApiKey(latitude, longitude))
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(currentWeather => {
            getWeatherParameters(currentWeather, latitude, longitude);
            loadPhotos(currentWeather['weather'][0]['description']);
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
}

function getWeatherParameters(currentWeather, latitude, longitude) {
    document.querySelector('.main-weather-info__list-item-temperature')
        .textContent = `${Math.round(currentWeather['main']['temp'] - 273)}°C`;
    document.querySelector('.main-weather-info__list-item-feels')
        .textContent = `${Math.round(currentWeather['main']['feels_like'] - 273)}°C`;
    document.querySelector('.main-weather-info__list-item-pressure')
        .textContent = `${currentWeather['main']['pressure']}гПа`;
    document.querySelector('.main-weather-info__list-item-humidity')
        .textContent = `${currentWeather['main']['humidity']}%`;
    document.querySelector('.main-weather-info__list-item-wind-speed')
        .textContent = `${convertMetersPerSecondsToKilometersPerHour(currentWeather['wind']['speed'])}Км/ч`;
    document.querySelector('.main-weather-info__list-item-wind-direction')
        .textContent = `Ветер ${degreesToCompassDirection(parseInt(currentWeather['wind']['deg']))}`;


    setPlaceName(currentWeather['name'], latitude, longitude);
    timeInPlace(parseInt(currentWeather['timezone']));
}

function setPlaceName(place, latitude, longitude) {
    let placeName;

    if (place === '') {
        placeName = `Вне населенного пункта`;
    }
    else {
        placeName = place;
    }
    document.querySelector('.main-weather-info__list-item-place')
        .textContent = `${placeName}`;
    document.querySelector('.additional-weather-info__map-info__block-description')
        .innerHTML = `Место на координатах<br> ${formatNumber(latitude)}<br> ${formatNumber(longitude)}<br> ${placeName}`;
}

function formatNumber(number) {
    const integerPart = Math.floor(number);
    const decimalPart = Math.round((number - integerPart) * 100);

    return `${integerPart}'${String(decimalPart).padStart(2, '0')}"00`;
}

function loadMap(latitude, longitude) {
    ymaps.ready(init);

    function init () {
        if (mapIsShown) {
            myMap.destroy();
        }
        myMap = new ymaps.Map('map', {
                center: [latitude, longitude],
                zoom: 8
            },
            {
                searchControlProvider: 'yandex#search'
            });
        mapIsShown = true;
    }
}

function loadPhotos(currentWeather) {
    const currentWeatherPhotos = getPhotosDirectory(currentWeather);
    const directoryPath = '../img/' + currentWeatherPhotos + '/';
    const photoGallery = document.getElementById('photoGallery');
    photoGallery.innerHTML = '';

    document.querySelector('.additional-weather-info__weather__block-description')
        .innerHTML = getPhotoDescription(currentWeatherPhotos);
    addImage(directoryPath + currentWeatherPhotos);
}

function addImage(imageSrc) {
    const image = document.createElement('img');
    image.src = imageSrc + '_' + Math.floor(Math.random() * 6 + 1) + '.png';
    document.getElementById('photoGallery').appendChild(image);
}

function getPhotosDirectory(currentWeather) {
    switch (currentWeather) {
        case 'clear sky':
            return 'sunny';

        case 'mist':
            return 'mist';

        case 'snow':
            return 'snow';

        case 'rain':
        case 'shower rain':
        case 'thunderstorm':
            return 'rain';

        default:
            return 'clouds';
    }
}

function getPhotoDescription(currentWeather) {
    switch (currentWeather) {
        case 'sunny':
            return 'Сегодня отличная погода.<br> Сегодня определенно стоит куда-то <br>сходить на прогулку';

        case 'mist':
            return 'Сегодня туманно. <br>Будьте осторожны на дороге и ' +
                '<br>возьмите светоотражающие элементы, <br>если пойдете гулять';

        case 'snow':
            return 'На улице идет снег.<br> Оденьтесь потеплее и осторожно ходите <br>по скользким дорожкам';

        case 'rain':
            return 'Сегодня идет дождь, <br>стоит взять зонтик если <br>собираетесь на прогулку';

        default:
            return 'Сегодня облачно. <br>Не забудьте взять свитер или куртку, <br>чтобы быть в тепле в течение дня';
    }
}

function timeInPlace(seconds) {
    fetch(getTimeApiKey())
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
            document.querySelector('.main-weather-info__list-item-time')
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

function convertMetersPerSecondsToKilometersPerHour(metersPerSeconds) {
    return Math.round(metersPerSeconds * 36) / 10;
}

showWeatherButton.onclick = function () {
    showWeatherButton.classList.add('animation');

    const latitude = document.querySelector('.main-controls__inputs-list-item-latitude').value;
    const longitude = document.querySelector('.main-controls__inputs-list-item-longitude').value;

    //const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;

    getWeather(latitude, longitude);
    loadMap(latitude, longitude);

    setTimeout(() => {
        showWeatherButton.classList.remove('animation');
    }, 500);
}

