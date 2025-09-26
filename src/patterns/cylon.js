const { forAllLeds, colors } = require('./utils');

module.exports = function cylon(size) {
    let position = 0;
    let direction = 1;
    const tailLength = Math.max(3, Math.floor(size * 0.1)); // Tail length is 10% of strip, minimum 3
    
    return {
        interval: Math.max(20, 150 - (size * 0.5)), // Faster on shorter strips, respecting 20ms minimum
        get() {
            const state = [];
            
            // Initialize all LEDs to off
            forAllLeds(size, (i) => {
                state[i] = colors.off;
            });
            
            // Create the bright red eye with trailing fade effect
            for (let i = 0; i < tailLength; i += 1) {
                const ledIndex = position - i;
                if (ledIndex >= 0 && ledIndex < size) {
                    // Fade intensity based on distance from main eye
                    const intensity = Math.max(50, 255 - (i * 60));
                    state[ledIndex] = [intensity, 0, 0]; // Red with fading intensity
                }
            }
            
            // Move the position
            position += direction;
            
            // Bounce at the ends
            if (position >= size - 1) {
                direction = -1;
                position = size - 1;
            } else if (position <= 0) {
                direction = 1;
                position = 0;
            }
            
            return state;
        },
    };
};