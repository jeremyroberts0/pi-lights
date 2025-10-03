const chalk = require('chalk');

/**
 * render to the console
 * @param {number[3][]} colors
 */
function consoleVisualizer(colors) {
    const brightness = global.consoleBrightness || 100;
    const brightChar = brightness > 75 ? '█' : brightness > 50 ? '▇' : brightness > 25 ? '▆' : brightness > 0 ? '▅' : '░';
    
    // For long LED strips, wrap at terminal width
    const terminalWidth = process.stdout.columns || 80;
    const colorChars = colors.map(color => chalk.rgb(...color)(brightChar)).reverse();
    
    console.clear();
    
    // Display LED strip with wrapping for long strips
    let output = '';
    for (let i = 0; i < colorChars.length; i += terminalWidth) {
        output += colorChars.slice(i, i + terminalWidth).join('') + '\n';
    }
    
    console.log(output);
    console.log(`LEDs: ${colors.length} | Brightness: ${brightness}% | Pattern: ${global.currentPatternName || 'unknown'}`);
}

module.exports = consoleVisualizer;
