const BASE_PATH = '/pi-lights'
module.exports = {
    PORT: 8080,
    BASE_PATH,
    LED_BASE_PATH: `${BASE_PATH}/leds`,
    LED_COUNT: 640,
}
