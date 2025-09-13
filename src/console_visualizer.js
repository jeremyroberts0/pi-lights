const chalk = require('chalk');

/**
 * render to the console with brightness simulation
 * @param {number[3][]} colors - Array of RGB color arrays
 * @param {number} brightness - Brightness level (0-100)
 */
function consoleVisualizer(colors, brightness = 100) {
    // Apply brightness scaling to RGB values
    const adjustedColors = colors.map(([r, g, b]) => {
        const scale = brightness / 100;
        return [
            Math.round(r * scale),
            Math.round(g * scale),
            Math.round(b * scale)
        ];
    });

    const terminalChars = adjustedColors
        .map(color => chalk.rgb(...color)('*'))
        .reverse() // so it renders same as the led string
        .join(''); // no spaces in terminal
    console.clear();
    console.log(terminalChars);
}

module.exports = consoleVisualizer;
