document.addEventListener("DOMContentLoaded", () => {

    const canvas = document.querySelector(".eeg-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // =========================================================
    // CANVAS
    // =========================================================

    function resize() {
        const dpr = window.devicePixelRatio || 1;

        canvas.width = canvas.offsetWidth * dpr;
        canvas.height = canvas.offsetHeight * dpr;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener("resize", resize);


    // =========================================================
    // EEG CONFIGURATION
    // =========================================================

    const CHANNELS = 8;

    const electrodeNames = [
        "Fp1", "Fp2",
        "F3",  "F4",
        "C3",  "C4",
        "P3",  "P4"
    ];

    /*
     * The animation is not intended to represent calibrated EEG.
     *
     * It is a visual approximation of multichannel resting-state EEG:
     *
     *   - 1/f-like background activity
     *   - alpha rhythm
     *   - theta activity
     *   - low-amplitude beta activity
     *   - correlated activity between channels
     *   - slow baseline drift
     *   - physiological/ocular contamination
     *
     * Values are arbitrary display units.
     */

    const SAMPLE_RATE = 250;
    const BUFFER_SIZE = 220;

    const waves = [];


    // =========================================================
    // RANDOM UTILITIES
    // =========================================================

    function randn() {

        let u = 0;
        let v = 0;

        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();

        return Math.sqrt(-2 * Math.log(u)) *
               Math.cos(2 * Math.PI * v);

    }


    // =========================================================
    // SHARED BRAIN ACTIVITY
    // =========================================================

    /*
     * A small common component is shared across channels.
     * This creates realistic-looking spatial correlation.
     */

    let globalAlphaPhase = Math.random() * Math.PI * 2;
    let globalThetaPhase = Math.random() * Math.PI * 2;

    let globalAlphaFreq = 9.5;
    let globalThetaFreq = 5.2;

    let globalSlow = 0;


    // =========================================================
    // CHANNEL INITIALIZATION
    // =========================================================

    for (let ch = 0; ch < CHANNELS; ch++) {

        waves.push({

            samples: new Array(BUFFER_SIZE).fill(0),

            // Independent oscillatory phases
            alphaPhase:
                Math.random() * Math.PI * 2,

            thetaPhase:
                Math.random() * Math.PI * 2,

            betaPhase:
                Math.random() * Math.PI * 2,

            // Slightly different alpha frequency per electrode
            alphaFreq:
                8.5 + Math.random() * 2.5,

            thetaFreq:
                4.2 + Math.random() * 1.8,

            betaFreq:
                18 + Math.random() * 7,

            // Spatially different alpha amplitude
            alphaAmplitude:
                ch >= 6
                    ? 8 + Math.random() * 4
                    : 3 + Math.random() * 3,

            thetaAmplitude:
                1.8 + Math.random() * 1.8,

            betaAmplitude:
                0.8 + Math.random() * 0.8,

            // Slow amplitude modulation
            alphaEnvelope:
                0.7 + Math.random() * 0.3,

            envelopePhase:
                Math.random() * Math.PI * 2,

            // Colored noise state
            noise1: 0,
            noise2: 0,

            // Slow baseline
            drift: 0,

            // Last output for physiological smoothness
            lastSignal: 0,

            // Channel gain
            gain:
                0.85 + Math.random() * 0.3,

            // Small spatial phase delay
            phaseOffset:
                (ch - 3.5) * 0.015

        });

    }


    // =========================================================
    // EYE BLINK
    // =========================================================

    let blink = {
        active: false,
        progress: 0,
        duration: 0
    };


    // =========================================================
    // MUSCLE ARTIFACT
    // =========================================================

    let muscle = {
        active: false,
        progress: 0,
        duration: 0,
        channel: 0
    };


    // =========================================================
    // GLOBAL PHYSIOLOGICAL STATE
    // =========================================================

    let frame = 0;


    // =========================================================
    // UPDATE GLOBAL BRAIN ACTIVITY
    // =========================================================

    function updateGlobalActivity() {

        // Small natural frequency wandering
        globalAlphaFreq += randn() * 0.015;
        globalThetaFreq += randn() * 0.01;

        globalAlphaFreq =
            Math.max(
                8.5,
                Math.min(11.5, globalAlphaFreq)
            );

        globalThetaFreq =
            Math.max(
                4.0,
                Math.min(6.5, globalThetaFreq)
            );


        globalAlphaPhase +=
            2 * Math.PI *
            globalAlphaFreq /
            SAMPLE_RATE;

        globalThetaPhase +=
            2 * Math.PI *
            globalThetaFreq /
            SAMPLE_RATE;


        // Very slow common baseline fluctuation

        globalSlow +=
            (randn() * 0.015 -
             globalSlow * 0.003);

    }


    // =========================================================
    // EEG SAMPLE GENERATOR
    // =========================================================

    function generateSample(wave, ch) {

        // -----------------------------------------------------
        // Frequency drift
        // -----------------------------------------------------

        wave.alphaFreq += randn() * 0.006;
        wave.thetaFreq += randn() * 0.004;
        wave.betaFreq  += randn() * 0.015;

        wave.alphaFreq =
            Math.max(
                8.0,
                Math.min(12.0, wave.alphaFreq)
            );

        wave.thetaFreq =
            Math.max(
                3.5,
                Math.min(7.0, wave.thetaFreq)
            );

        wave.betaFreq =
            Math.max(
                15,
                Math.min(30, wave.betaFreq)
            );


        // -----------------------------------------------------
        // Phase evolution
        // -----------------------------------------------------

        wave.alphaPhase +=
            2 * Math.PI *
            wave.alphaFreq /
            SAMPLE_RATE;

        wave.thetaPhase +=
            2 * Math.PI *
            wave.thetaFreq /
            SAMPLE_RATE;

        wave.betaPhase +=
            2 * Math.PI *
            wave.betaFreq /
            SAMPLE_RATE;


        // -----------------------------------------------------
        // Alpha envelope
        //
        // Alpha should not continuously pulse like a sine-wave
        // amplitude animation. It changes slowly and irregularly.
        // -----------------------------------------------------

        const envelopeTarget =
            0.72 +
            0.20 *
            Math.sin(
                wave.envelopePhase +
                frame * 0.002
            );

        wave.alphaEnvelope +=
            (envelopeTarget -
             wave.alphaEnvelope) * 0.0025;


        // -----------------------------------------------------
        // 1/f-like colored background activity
        // -----------------------------------------------------

        const whiteNoise = randn();

        wave.noise1 =
            0.985 * wave.noise1 +
            0.12 * whiteNoise;

        wave.noise2 =
            0.94 * wave.noise2 +
            0.20 * wave.noise1;


        const coloredNoise =
            wave.noise2;


        // -----------------------------------------------------
        // Alpha rhythm
        // -----------------------------------------------------

        const alpha =
            Math.sin(wave.alphaPhase)
            * wave.alphaAmplitude
            * wave.alphaEnvelope;


        // Small harmonic content
        const alphaHarmonic =
            0.12 *
            Math.sin(
                wave.alphaPhase * 2 +
                0.3
            ) *
            wave.alphaAmplitude;


        // -----------------------------------------------------
        // Theta
        // -----------------------------------------------------

        const theta =
            Math.sin(
                wave.thetaPhase +
                wave.phaseOffset
            )
            * wave.thetaAmplitude;


        // -----------------------------------------------------
        // Beta
        //
        // Much smaller than alpha/background activity.
        // -----------------------------------------------------

        const beta =
            Math.sin(wave.betaPhase)
            * wave.betaAmplitude;


        // -----------------------------------------------------
        // Common neural activity
        // -----------------------------------------------------

        const commonAlpha =
            Math.sin(globalAlphaPhase)
            * 2.0;

        const commonTheta =
            Math.sin(globalThetaPhase)
            * 0.9;


        // -----------------------------------------------------
        // Slow cortical drift
        // -----------------------------------------------------

        wave.drift +=
            randn() * 0.018 -
            wave.drift * 0.002;

        const slowDrift =
            wave.drift * 3 +
            globalSlow * 2;


        // -----------------------------------------------------
        // Combine
        // -----------------------------------------------------

        let signal =

            alpha +

            alphaHarmonic +

            theta +

            beta +

            coloredNoise * 2.2 +

            commonAlpha +

            commonTheta +

            slowDrift;


        // -----------------------------------------------------
        // EYE BLINK
        //
        // Strongest frontally, progressively weaker posteriorly.
        // -----------------------------------------------------

        if (blink.active) {

            blink.progress += 1;

            const p =
                blink.progress /
                blink.duration;

            if (p >= 1) {

                blink.active = false;

            } else {

                // Smooth transient
                const blinkShape =
                    Math.sin(Math.PI * p);

                let frontalWeight;

                if (ch < 2) {
                    frontalWeight = 2.5;
                } else if (ch < 4) {
                    frontalWeight = 1.0;
                } else if (ch < 6) {
                    frontalWeight = 0.35;
                } else {
                    frontalWeight = 0.12;
                }

                signal +=
                    blinkShape *
                    35 *
                    frontalWeight;

            }

        }


        // -----------------------------------------------------
        // EMG / muscle activity
        // -----------------------------------------------------

        if (muscle.active && ch === muscle.channel) {

            muscle.progress++;

            const p =
                muscle.progress /
                muscle.duration;

            if (p >= 1) {

                muscle.active = false;

            } else {

                // High-frequency irregular activity

                const emgNoise =
                    randn() * 7;

                signal +=
                    emgNoise *
                    Math.sin(
                        frame * 0.7
                    );

            }

        }


        // -----------------------------------------------------
        // Small measurement noise
        // -----------------------------------------------------

        signal += randn() * 0.8;


        // -----------------------------------------------------
        // Mild analog-like smoothing
        // -----------------------------------------------------

        signal =
            0.82 * wave.lastSignal +
            0.18 * signal;

        wave.lastSignal = signal;


        return signal * wave.gain;

    }


    // =========================================================
    // DRAW
    // =========================================================

    function draw() {

        const w = canvas.offsetWidth;
        const h = canvas.offsetHeight;


        // -----------------------------------------------------
        // Background
        // -----------------------------------------------------

        ctx.fillStyle =
            "rgba(5,10,20,0.30)";

        ctx.fillRect(
            0,
            0,
            w,
            h
        );


        // -----------------------------------------------------
        // Layout
        // -----------------------------------------------------

        const leftMargin = 58;
        const rightMargin = 12;

        const spacing =
            h / (CHANNELS + 1);


        // -----------------------------------------------------
        // Random physiological events
        // -----------------------------------------------------

        if (
            !blink.active &&
            Math.random() < 0.0015
        ) {

            blink.active = true;
            blink.progress = 0;

            blink.duration =
                25 +
                Math.random() * 15;

        }


        if (
            !muscle.active &&
            Math.random() < 0.0008
        ) {

            muscle.active = true;
            muscle.progress = 0;

            muscle.duration =
                30 +
                Math.random() * 25;

            muscle.channel =
                Math.floor(
                    Math.random() * CHANNELS
                );

        }


        // -----------------------------------------------------
        // Channel loop
        // -----------------------------------------------------

        for (
            let ch = 0;
            ch < CHANNELS;
            ch++
        ) {

            const wave = waves[ch];

            const baseY =
                spacing * (ch + 1);


            // -----------------------------------------------
            // New samples
            // -----------------------------------------------

            for (
                let k = 0;
                k < 2;
                k++
            ) {

                updateGlobalActivity();

                wave.samples.push(
                    generateSample(
                        wave,
                        ch
                    )
                );

                wave.samples.shift();

            }


            // -----------------------------------------------
            // Electrode label
            // -----------------------------------------------

            ctx.font =
                "500 12px Inter, sans-serif";

            ctx.textAlign = "right";
            ctx.textBaseline = "middle";

            ctx.fillStyle =
                "rgba(150,205,220,0.75)";

            ctx.fillText(
                electrodeNames[ch],
                45,
                baseY
            );


            // -----------------------------------------------
            // Baseline
            // -----------------------------------------------

            ctx.strokeStyle =
                "rgba(120,180,190,0.07)";

            ctx.lineWidth = 1;

            ctx.beginPath();

            ctx.moveTo(
                leftMargin,
                baseY
            );

            ctx.lineTo(
                w - rightMargin,
                baseY
            );

            ctx.stroke();


            // -----------------------------------------------
            // EEG trace
            // -----------------------------------------------

            ctx.lineWidth = 1.25;

            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            ctx.shadowBlur = 7;

            ctx.shadowColor =
                "rgba(0,255,220,0.20)";


            const dx =
                (w - leftMargin - rightMargin) /
                (BUFFER_SIZE - 1);


            ctx.beginPath();

            for (
                let i = 0;
                i < BUFFER_SIZE;
                i++
            ) {

                const x =
                    leftMargin +
                    i * dx;

                const y =
                    baseY -
                    wave.samples[i] * 0.65;


                if (i === 0) {

                    ctx.moveTo(
                        x,
                        y
                    );

                } else {

                    ctx.lineTo(
                        x,
                        y
                    );

                }

            }


            ctx.strokeStyle =
                "rgba(0,235,210,0.72)";

            ctx.stroke();

            ctx.shadowBlur = 0;

        }


        // -----------------------------------------------------
        // Small acquisition indicator
        // -----------------------------------------------------

        ctx.font =
            "500 10px Inter, sans-serif";

        ctx.textAlign = "left";

        ctx.fillStyle =
            "rgba(160,200,205,0.45)";

        ctx.fillText(
            "RESTING-STATE EEG",
            leftMargin,
            14
        );


        ctx.textAlign = "right";

        ctx.fillText(
            "8 channels · 250 Hz",
            w - rightMargin,
            14
        );


        // -----------------------------------------------------
        // Continue
        // -----------------------------------------------------

        frame++;

        requestAnimationFrame(draw);

    }


    // =========================================================
    // START
    // =========================================================

    draw();

});
