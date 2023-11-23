import {getOpenWeatherApiKey, getTimeApiKey} from './api.js';
//gitGuardian ругался на то что у меня ключи api были в коде поэтому я вынес их в другой файл

let mapIsShown = false;
let myMap;
let historyElementsCount = 0;
let errorWasShown = false;

const showWeatherButton = document.querySelector('.main-controls__container-show-weather');
const showHistoryButton = document.querySelector('.main-controls__history__block');

async function getWeather(latitude, longitude) {
    try {
        const response = await fetch(getOpenWeatherApiKey(latitude, longitude));

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const currentWeather = await response.json();
        getWeatherParameters(currentWeather, latitude, longitude);
        loadPhotos(currentWeather['weather'][0]['description']);
    } catch (error) {
        console.error('Fetch error:', error);
    }
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

    return `${integerPart}'${String(decimalPart).padStart(2, '0')}`;
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

async function timeInPlace(shiftInSeconds) {
    try {
        const response = await fetch(getTimeApiKey());

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const utcTime = await response.json();
        getTime(utcTime, shiftInSeconds);
    }
    catch (error) {
        console.error('Fetch error:', error);
    }
}

function getTime(utcTime, shiftInSeconds) {
    const date = utcTime['utc_datetime'].toString();
    let hours = parseInt(date.slice(11, 13)) + ((shiftInSeconds / 60) / 60);
    let minutes = parseInt(date.slice(14, 16));

    if (hours % 1 === 0.5) {
        const remainderInMinutes = 0.5 * 60;
        const newMinutes = minutes + remainderInMinutes;
        hours -= 0.5;

        if (minutes >= 30) {
            hours += 1;
            minutes = newMinutes % 30;
        }

        else {
            minutes = newMinutes;
        }
    }

    document.querySelector('.main-weather-info__list-item-time')
        .textContent = `${hours}:${minutes}`;
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

showWeatherButton.onclick = async function () {
    showWeatherButton.classList.add('animation');

    const latitude = document.querySelector('.main-controls__inputs-list-item-latitude').value;
    const longitude = document.querySelector('.main-controls__inputs-list-item-longitude').value;

    showErrorMessage(parseFloat(latitude), parseFloat(longitude));

    if (!errorWasShown) {
        try {
            await getWeather(latitude, longitude);
            loadMap(latitude, longitude);
            appendInfoToHistory(latitude, longitude);
        }
        catch (error) {
            throw new Error('Error in showWeatherButton.onclick');
        }
        finally {
            setTimeout(() => {
                showWeatherButton.classList.remove('animation');
            }, 500);
        }
    }
}

function appendInfoToHistory(latitude, longitude) {
    maintainHistoryLimit();

    const currentTime = getCurrentTime();
    const historyElement = document.createElement('li');

    historyElement.innerHTML =
        `<h3>${currentTime}</h3> 
        <div>
            <p>Широта: ${formatNumber(latitude)}</p>
            <p>Долгота: ${formatNumber(longitude)}</p>
        </div>`;

    const historyList = document.querySelector('.main-controls__history__list')
    historyList.insertBefore(historyElement, historyList.firstChild);
    historyElementsCount++;

    const myList = document.getElementById('myList');
    myList.style.maxHeight = myList.scrollHeight + 'px';
}

function getCurrentTime() {
    const date = new Date(Date.now());
    let minutes = date.getMinutes();

    if (minutes.toString().length === 1) {
        minutes = '0' + minutes;
    }

    return date.getHours() + ':' + minutes;
}

function maintainHistoryLimit() {
    const historyList = document.querySelector('.main-controls__history__list')
    if (historyElementsCount >= 4) {
        historyList.removeChild(historyList.lastChild);
        historyElementsCount--;
    }
}


function showErrorMessage(latitude, longitude) {
    if (!(-90 <= latitude && latitude <= 90) || !(-180 <= longitude && longitude <= 180)){
        document.querySelector('.main-controls__inputs-list-item-latitude').style.borderColor = '#BA2B3C';
        document.querySelector('.main-controls__inputs-list-item-longitude').style.borderColor = '#BA2B3C';
        errorWasShown = true;
    }
    else if (errorWasShown) {
        document.querySelector('.main-controls__inputs-list-item-latitude').style.borderColor = '#000';
        document.querySelector('.main-controls__inputs-list-item-longitude').style.borderColor = '#000';
        errorWasShown = false;
    }
}

showHistoryButton.onclick = function () {
    const myList = document.getElementById('myList');
    const isListVisible = myList.style.maxHeight !== '0px';

    if (isListVisible) {
        myList.style.maxHeight = '0';
    }
    else {
        myList.style.maxHeight = myList.scrollHeight + 'px';
    }
}
