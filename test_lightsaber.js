const lightsaber = require('./src/patterns/lightsaber');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderFrame(state) {
    return state.map(([r, g, b]) => {
        if (r === 0 && g === 0 && b === 0) return '·';
        if (r === 255 && g === 255 && b === 255) return '★'; // white tip
        return '█';
    }).join('');
}

function bladeLen(state) {
    // Count from index 0 until the first all-black LED
    let len = 0;
    for (let i = 0; i < state.length; i += 1) {
        const [r, g, b] = state[i];
        if (r === 0 && g === 0 && b === 0) break;
        len += 1;
    }
    return len;
}

// ---------------------------------------------------------------------------
// Test 1 – interval is a fixed value, not mutated during get()
// ---------------------------------------------------------------------------
console.log('Test 1 – interval stays fixed throughout all phases');
{
    const size = 10;
    const p = lightsaber(size);
    const initialInterval = p.interval;
    // Run enough frames to pass through all four phases at least once
    const totalFrames = (size * 2) + 60 + 45 + 20; // opening+holding+closing+closed-hold
    for (let i = 0; i < totalFrames; i += 1) {
        p.get();
        if (p.interval !== initialInterval) {
            console.error(`  ✗ interval changed to ${p.interval} at frame ${i} (expected ${initialInterval})`);
            process.exit(1);
        }
    }
    console.log(`  ✓ interval remained ${initialInterval}ms for all ${totalFrames} frames\n`);
}

// ---------------------------------------------------------------------------
// Test 2 – full phase cycle with size=10, visual frame log
// ---------------------------------------------------------------------------
console.log('Test 2 – full phase cycle (size=10), frame-by-frame visual');
{
    const size = 10;
    const p = lightsaber(size);

    // Run until we've seen opening, holding, closing, and closed-hold in sequence
    let sawOpening = false;
    let sawHolding = false;
    let sawClosing = false;
    let sawClosedHold = false;
    let cycleComplete = false;
    let prevLen = 0;
    const maxFrames = 500;

    for (let frame = 0; frame < maxFrames && !cycleComplete; frame += 1) {
        const state = p.get();
        const len = bladeLen(state);
        const visual = renderFrame(state);
        console.log(`  Frame ${String(frame).padStart(3)}: [${visual}]  len=${len}`);

        if (!sawOpening && len > prevLen) sawOpening = true;
        else if (sawOpening && !sawHolding && len === size) sawHolding = true;
        else if (sawHolding && !sawClosing && len < prevLen) sawClosing = true;
        else if (sawClosing && !sawClosedHold && len === 0) sawClosedHold = true;

        if (sawOpening && sawHolding && sawClosing && sawClosedHold) cycleComplete = true;
        prevLen = len;
    }

    if (!cycleComplete) {
        console.error('  ✗ Did not observe all four phases within max frames');
        process.exit(1);
    }
    console.log('  ✓ All four phases observed (opening → holding → closing → closed-hold)\n');
}

// ---------------------------------------------------------------------------
// Test 3 – hold phases are substantially longer than extend/retract phases
// ---------------------------------------------------------------------------
console.log('Test 3 – hold durations are substantially longer than extend/retract');
{
    const size = 10;
    const p = lightsaber(size);

    // Skip the initial closed-hold phase
    let inInitialClosedHold = true;
    let prevLen = 0;
    while (inInitialClosedHold) {
        const state = p.get();
        const len = bladeLen(state);
        if (len > prevLen) inInitialClosedHold = false; // opening started
        prevLen = len;
    }

    // Count opening frames (already ticked once above, len=1)
    let openingFrames = 1;
    let len = 1;
    while (len < size) {
        const state = p.get();
        len = bladeLen(state);
        if (len > openingFrames) openingFrames += 1; // still growing
    }
    // len === size, opening complete

    // Count holding frames
    let holdingFrames = 0;
    let stillHolding = true;
    while (stillHolding) {
        const state = p.get();
        len = bladeLen(state);
        if (len === size) {
            holdingFrames += 1;
        } else {
            stillHolding = false; // first retraction frame
        }
    }

    // Count closing frames (already ticked once: first retraction frame)
    let closingFrames = 1;
    len = bladeLen(p.get() /* one more frame */);
    while (len > 0) {
        const state = p.get();
        len = bladeLen(state);
        closingFrames += 1;
    }

    // Count closed-hold frames
    let closedHoldFrames = 0;
    let inClosedHold = true;
    while (inClosedHold) {
        const state = p.get();
        len = bladeLen(state);
        if (len === 0) {
            closedHoldFrames += 1;
        } else {
            inClosedHold = false; // next opening started
        }
    }

    console.log(`  opening frames   : ${openingFrames}`);
    console.log(`  holding frames   : ${holdingFrames}`);
    console.log(`  closing frames   : ${closingFrames}`);
    console.log(`  closed-hold frames: ${closedHoldFrames}`);

    // Hold phases should be substantially longer than extend/retract
    // HOLD_FRAMES=60, CLOSED_HOLD_FRAMES=45 vs size=10 frames to extend/retract
    if (holdingFrames < size) {
        console.error(`  ✗ holdingFrames (${holdingFrames}) should be >= size (${size})`);
        process.exit(1);
    }
    if (closedHoldFrames < size) {
        console.error(`  ✗ closedHoldFrames (${closedHoldFrames}) should be >= size (${size})`);
        process.exit(1);
    }
    // Specifically, holding should be ~60 frames and closed-hold ~45 frames
    if (holdingFrames < 55 || holdingFrames > 65) {
        console.error(`  ✗ holdingFrames (${holdingFrames}) should be ~60`);
        process.exit(1);
    }
    if (closedHoldFrames < 40 || closedHoldFrames > 50) {
        console.error(`  ✗ closedHoldFrames (${closedHoldFrames}) should be ~45`);
        process.exit(1);
    }
    console.log('  ✓ Hold phases are substantially longer than extend/retract phases\n');
}

// ---------------------------------------------------------------------------
// Test 4 – blade tip is white, body is the current saber color
// ---------------------------------------------------------------------------
console.log('Test 4 – blade tip is white, body is saber color');
{
    const size = 20;
    const p = lightsaber(size);

    // Advance until blade is mid-extension
    let foundMidExtend = false;
    for (let i = 0; i < 500; i += 1) {
        const state = p.get();
        const len = bladeLen(state);
        if (len >= 5 && len < size) {
            const tip = state[len - 1];
            const body = state[0];
            const [tr, tg, tb] = tip;
            if (tr === 255 && tg === 255 && tb === 255) {
                console.log(`  ✓ Tip at index ${len - 1} is white [255,255,255]`);
                foundMidExtend = true;
            }
            const [br, bg, bb] = body;
            const isBlack = br === 0 && bg === 0 && bb === 0;
            if (!isBlack) {
                console.log(`  ✓ Body at index 0 is colored [${br},${bg},${bb}] (saber color)`);
            }
            if (foundMidExtend) break;
        }
    }
    if (!foundMidExtend) {
        console.error('  ✗ Never observed white tip during extension');
        process.exit(1);
    }
    console.log();
}

// ---------------------------------------------------------------------------
// Test 5 – color cycles to next saber color after each retraction
// ---------------------------------------------------------------------------
console.log('Test 5 – saber color advances after each full open/close cycle');
{
    const size = 10;
    const p = lightsaber(size);

    function getBodyColor(state) {
        // Return the body color of the first non-white lit LED, or null if blade is off
        for (let i = 0; i < state.length; i += 1) {
            const [r, g, b] = state[i];
            if (r === 0 && g === 0 && b === 0) break;
            if (!(r === 255 && g === 255 && b === 255)) return [r, g, b];
        }
        return null;
    }

    const observedColors = [];
    const maxFrames = 1000;

    for (let i = 0; i < maxFrames; i += 1) {
        const state = p.get();
        const color = getBodyColor(state);
        if (color) {
            const key = color.join(',');
            if (observedColors.length === 0 || observedColors[observedColors.length - 1] !== key) {
                observedColors.push(key);
            }
        }
        if (observedColors.length >= 4) break;
    }

    console.log(`  Observed colors (first 4 ignitions): ${observedColors.join(' → ')}`);
    if (observedColors.length < 2) {
        console.error('  ✗ Did not observe color change after cycle');
        process.exit(1);
    }
    const allDifferent = new Set(observedColors).size === observedColors.length;
    if (!allDifferent) {
        console.error('  ✗ Expected distinct colors on consecutive ignitions');
        process.exit(1);
    }
    console.log('  ✓ Saber color advances each cycle\n');
}

// ---------------------------------------------------------------------------
// Test 6 – multiple sizes produce valid patterns
// ---------------------------------------------------------------------------
console.log('Test 6 – pattern works correctly across multiple strip sizes');
[5, 10, 30, 60, 100].forEach((size) => {
    const p = lightsaber(size);
    const { interval } = p;
    console.log(`  size=${size}: interval=${interval}ms`);

    // Verify interval is always >= 20
    if (interval < 20) {
        console.error(`  ✗ interval ${interval} < minimum 20`);
        process.exit(1);
    }

    // Run a full cycle and verify blade never exceeds size
    const totalFrames = (size * 2) + 200;
    for (let i = 0; i < totalFrames; i += 1) {
        const state = p.get();
        if (state.length !== size) {
            console.error(`  ✗ frame length ${state.length} !== size ${size}`);
            process.exit(1);
        }
        const len = bladeLen(state);
        if (len > size) {
            console.error(`  ✗ blade length ${len} exceeds strip size ${size}`);
            process.exit(1);
        }
    }
    console.log(`  ✓ size=${size} passed`);
});
console.log();

console.log('✅ All lightsaber pattern tests passed!');
