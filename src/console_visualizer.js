const chalk = require('chalk');

/**
 * render to the console with enhanced visualization
 * @param {number[3][]} colors
 */
function consoleVisualizer(colors) {
    console.clear();
    
    // Header with LED count and instructions
    console.log(chalk.cyan('━'.repeat(Math.min(colors.length, process.stdout.columns - 10))));
    console.log(chalk.cyan(`LED Strip Debugger - ${colors.length} LEDs`));
    console.log(chalk.gray('Press Ctrl+C to exit'));
    console.log(chalk.cyan('━'.repeat(Math.min(colors.length, process.stdout.columns - 10))));
    
    // Render LEDs as colored blocks
    const ledBlocks = colors
        .map((color, index) => {
            const [r, g, b] = color;
            // Use full block character for better visual impact
            return chalk.rgb(r, g, b)('█');
        })
        .reverse() // so it renders same as the led string
        .join('');
    
    console.log(ledBlocks);
    
    // Add position indicators for every 10th LED
    if (colors.length > 10) {
        const indicators = [];
        for (let i = 0; i < colors.length; i++) {
            if (i % 10 === 0) {
                indicators.push(chalk.gray(String(i).padStart(1)));
            } else if (i % 5 === 0) {
                indicators.push(chalk.gray('│'));
            } else {
                indicators.push(' ');
            }
        }
        console.log(indicators.reverse().join(''));
    }
    
    console.log(chalk.cyan('━'.repeat(Math.min(colors.length, process.stdout.columns - 10))));
}

module.exports = consoleVisualizer;
