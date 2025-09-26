const chalk = require('chalk');

let currentPattern = null;
let renderCount = 0;

/**
 * Set the current pattern name for display
 * @param {string} patternName
 */
function setCurrentPattern(patternName) {
    currentPattern = patternName;
    renderCount = 0;
}

/**
 * render to the console with enhanced visualization
 * @param {number[3][]} colors
 */
function consoleVisualizer(colors) {
    renderCount++;
    
    const terminalWidth = process.stdout.columns || 80;
    const ledCount = colors.length;
    
    // Create colored output
    let output = colors
        .map(color => chalk.rgb(...color)('●'))
        .reverse() // so it renders same as the led string
        .join('');
    
    // Handle line wrapping for long LED strips
    const wrappedLines = [];
    if (ledCount > terminalWidth - 10) { // Leave room for info
        for (let i = 0; i < output.length; i += terminalWidth - 10) {
            wrappedLines.push(output.slice(i, i + terminalWidth - 10));
        }
    } else {
        wrappedLines.push(output);
    }
    
    console.clear();
    
    // Display header information
    console.log(chalk.cyan('=== LED Terminal Debugger ==='));
    if (currentPattern) {
        console.log(chalk.yellow(`Pattern: ${currentPattern}`));
    }
    console.log(chalk.green(`LEDs: ${ledCount} | Renders: ${renderCount}`));
    console.log(chalk.gray('─'.repeat(Math.min(terminalWidth, 50))));
    
    // Display LED strip
    wrappedLines.forEach(line => {
        console.log(line);
    });
    
    console.log(chalk.gray('─'.repeat(Math.min(terminalWidth, 50))));
    console.log(chalk.dim('Use Ctrl+C to exit debug mode'));
}

// Export both functions for backwards compatibility
consoleVisualizer.setCurrentPattern = setCurrentPattern;

module.exports = consoleVisualizer;
