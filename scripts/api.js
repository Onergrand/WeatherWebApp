export function getOpenWeatherApiKey(latitude, longitude) {
    return `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=00b48d94481070eaee4d91619c5a0bbe`
}

export function getTimeApiKey() {
    return 'http://worldtimeapi.org/api/timezone/Europe/London';
}