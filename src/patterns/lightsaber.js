const { forAllLeds } = require('./utils');

// Saber colors cycled on each ignition
const SABER_COLORS = [
    [0, 80, 255], // blue
    [0, 220, 60], // green
    [220, 0, 0], // red
    [160, 0, 255], // purple
];

// The timer in leds.js is created once with `interval` and never rescheduled,
// so all phases tick at EXTEND_INTERVAL ms/frame.  The hold frame counts below
// are sized so that hold wall-clock time ≈ 3× the extension time at that rate:
//   holding:     60 frames × EXTEND_INTERVAL  ≈  3 × (20 × EXTEND_INTERVAL)
//   closed-hold: 45 frames × EXTEND_INTERVAL  ≈  3 × (15 × EXTEND_INTERVAL)
const HOLD_FRAMES = 60;
const CLOSED_HOLD_FRAMES = 45;

module.exports = function lightsaber(size) {
    const EXTEND_INTERVAL = Math.max(20, Math.round(600 / size));

    let colorIndex = 0;
    let bladeLength = 0;
    let phase = 'closed-hold';
    let holdFrames = 0;

    return {
        interval: EXTEND_INTERVAL,
        get() {
            // Advance state FIRST so the rendered frame reflects the new state.
            // This ensures the very first frame of 'opening' already shows
            // bladeLength=1 (no extra dark frame at ignition start).
            switch (phase) {
            case 'opening':
                bladeLength += 1;
                if (bladeLength >= size) {
                    bladeLength = size;
                    phase = 'holding';
                    holdFrames = 0;
                }
                break;
            case 'holding':
                holdFrames += 1;
                if (holdFrames >= HOLD_FRAMES) {
                    phase = 'closing';
                }
                break;
            case 'closing':
                bladeLength -= 1;
                if (bladeLength <= 0) {
                    bladeLength = 0;
                    phase = 'closed-hold';
                    holdFrames = 0;
                    colorIndex = (colorIndex + 1) % SABER_COLORS.length;
                }
                break;
            case 'closed-hold':
                holdFrames += 1;
                if (holdFrames >= CLOSED_HOLD_FRAMES) {
                    phase = 'opening';
                    holdFrames = 0;
                    bladeLength = 1; // first opening frame starts with a lit LED
                }
                break;
            default:
                break;
            }

            // Render current state
            const frame = [];
            forAllLeds(size, (i) => { frame[i] = [0, 0, 0]; });

            const [r, g, b] = SABER_COLORS[colorIndex % SABER_COLORS.length];

            for (let i = 0; i < bladeLength; i += 1) {
                if (i === bladeLength - 1) {
                    frame[i] = [255, 255, 255]; // white tip
                } else {
                    frame[i] = [r, g, b];
                }
            }

            return frame;
        },
    };
};
