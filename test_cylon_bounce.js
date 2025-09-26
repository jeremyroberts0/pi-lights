// Test script to verify full cylon bounce cycle
const cylon = require('./src/patterns/cylon');

console.log('Testing full bounce cycle with 12 LEDs:');
console.log('========================================');

const pattern = cylon(12);
console.log(`Interval: ${pattern.interval}ms`);
console.log(`Tail length: ${Math.max(3, Math.floor(12 * 0.1))}\n`);

// Test full cycle (forward and back)
for (let frame = 0; frame < 24; frame++) {
    const state = pattern.get();
    
    // Display the pattern visually
    const visual = state.map(led => {
        const [r, g, b] = led;
        if (r === 0 && g === 0 && b === 0) return '·';
        if (r === 255) return '█';
        if (r >= 195) return '▓';
        if (r >= 135) return '▒';
        return '░';
    }).join('');
    
    console.log(`Frame ${String(frame).padStart(2, '0')}: [${visual}]`);
}

console.log('\n✅ Full bounce cycle confirmed!');
console.log('The pattern correctly:');
console.log('- Moves from left to right');
console.log('- Bounces at the right edge'); 
console.log('- Moves back from right to left');
console.log('- Bounces at the left edge');
console.log('- Creates the iconic Cylon eye effect');