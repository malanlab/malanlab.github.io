document.addEventListener("DOMContentLoaded", () => {

const canvas = document.querySelector(".eeg-canvas");
if (!canvas) return;

const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

resize();
window.addEventListener("resize", resize);

// =======================================================
// CONFIGURATION
// =======================================================

const CHANNELS = 8;
const BUFFER_SIZE = 320;

const electrodeNames = [
    "Fp1","Fp2",
    "F3","F4",
    "C3","C4",
    "P3","P4"
];

// One buffer per EEG channel

const waves = [];

for (let ch = 0; ch < CHANNELS; ch++) {

    waves.push({

        samples: new Array(BUFFER_SIZE).fill(0),

        phase1: Math.random() * Math.PI * 2,
        phase2: Math.random() * Math.PI * 2,
        phase3: Math.random() * Math.PI * 2,

        alphaEnvelope: 0.5 + Math.random()*0.5

    });

}

// =======================================================
// Eye Blink
// =======================================================

let blink = {

    active:false,
    start:0,
    duration:0

};

// =======================================================
// EMG Burst
// =======================================================

let emg = {

    active:false,
    start:0,
    duration:0,
    channel:0

};

let frame = 0;

// =======================================================
// Generate one NEW sample
// =======================================================

function generateSample(wave, ch){

    wave.phase1 += 0.11;
    wave.phase2 += 0.035;
    wave.phase3 += 0.22;
    // Slowly changing alpha envelope

    wave.alphaEnvelope += (Math.random()-0.5)*0.01;
    wave.alphaEnvelope = Math.max(
        0.3,
        Math.min(1.3,wave.alphaEnvelope)
    );

    // Alpha rhythm (10 Hz look)

    let signal =
        Math.sin(wave.phase1) *
        (8 + 2*Math.sin(wave.phase2*0.2))
        *wave.alphaEnvelope;

    // Theta

    signal +=
        Math.sin(wave.phase2)*5;

    // Beta

    signal +=
        Math.sin(wave.phase3)*2;

    // Pink-ish noise

    signal += (Math.random()-0.5)*2.2;
    signal += Math.sin(frame * 0.006 + ch) * 3;

    // ===================================================
    // Eye blink
    // ===================================================

    if(blink.active){

        const p =
            (frame-blink.start)/blink.duration;

        if(p>1){

            blink.active=false;

        }else{

            let spike=0;

            if(p<0.18){

                spike=p/0.18;

            }else if(p<0.34){

                spike=1-(p-0.18)/0.16;

            }else if(p<0.55){

                spike=-0.35*(p-0.34)/0.21;

            }

            const frontalWeight =
                ch<2 ? 1.9 :
                ch<4 ? 0.7 :
                0.2;

            signal +=
                spike*55*frontalWeight;

        }

    }


    
    // ===================================================
    // EMG burst
    // ===================================================

    if(emg.active){

        const p =
            (frame-emg.start)/emg.duration;

        if(p>1){

            emg.active=false;

        }else if(ch===emg.channel){

            signal +=
                (Math.random() - 0.5) *
                18 *
                Math.sin(frame * 2.2);

        }

    }

    return signal;

}

// =======================================================
// DRAW
// =======================================================

function draw(){

    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = "rgba(5,10,20,0.45)";
    ctx.fillRect(0,0,w,h);

    const spacing = h/(CHANNELS+1);

    // ---------------------------------------------------
    // Random artefacts
    // ---------------------------------------------------

    if(!blink.active && Math.random()<0.003){

        blink.active=true;
        blink.start=frame;
        blink.duration=22+Math.random()*12;

    }

    if(!emg.active && Math.random()<0.001){

        emg.active=true;
        emg.start=frame;
        emg.duration=35+Math.random()*20;
        emg.channel=Math.floor(Math.random()*CHANNELS);

    }

    // ---------------------------------------------------
    // Labels
    // ---------------------------------------------------

    ctx.font="500 13px Inter, sans-serif";
    ctx.textAlign="right";
    ctx.textBaseline="middle";

    // ===================================================
    // CHANNEL LOOP
    // ===================================================

    for(let ch=0; ch<CHANNELS; ch++){

        const wave = waves[ch];

        const baseY = spacing*(ch+1);

        // -----------------------------------------------
        // Add one new sample
        // -----------------------------------------------

        wave.samples.push(
            generateSample(wave,ch)
        );

        wave.samples.shift();

        // -----------------------------------------------
        // Channel label
        // -----------------------------------------------

        ctx.fillStyle="rgba(140,200,255,.9)";
        ctx.fillText(
            electrodeNames[ch],
            46,
            baseY
        );

        // -----------------------------------------------
        // Glow
        // -----------------------------------------------

        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        
        ctx.shadowBlur = 14;
        ctx.shadowColor = "rgba(0,255,220,.32)";
        ctx.lineWidth=1.7;

        const dx=(w-70)/(BUFFER_SIZE-1);

        // -----------------------------------------------
        // Draw trace
        // -----------------------------------------------

        for(let i=0;i<BUFFER_SIZE-1;i++){

            const x1=60+i*dx;
            const x2=60+(i+1)*dx;

            const y1=baseY-wave.samples[i];
            const y2=baseY-wave.samples[i+1];

            // -------------------------------------------
            // Fade last 15%
            // -------------------------------------------

            let alpha=0.36;

            const fadeStart=w*0.84;

            if(x1>fadeStart){

            const fade =
                (x1 - fadeStart) /
                (w - fadeStart);
            
            alpha *= Math.pow(1 - fade, 2.4);
            alpha=Math.max(alpha,0);

            ctx.strokeStyle=
                `rgba(0,255,220,${alpha})`;

            ctx.beginPath();

            ctx.moveTo(x1,y1);
            ctx.lineTo(x2,y2);

            ctx.stroke();

        }

        ctx.shadowBlur=0;

    }


        // ===================================================
    // MOVING TIMING MARKERS
    // ===================================================

    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 1;

    const markerSpacing = 160;
    const speed = 2;

    for (let i = -1; i < Math.ceil(w / markerSpacing) + 1; i++) {

        const totalWidth = w + markerSpacing;
        
        const x =
            totalWidth -
            ((frame * speed + i * markerSpacing) % totalWidth);

        if (x < 55 || x > w) continue;

        ctx.beginPath();
        ctx.moveTo(x, 20);
        ctx.lineTo(x, h - 20);
        ctx.stroke();
    }

    // ===================================================
    // ADVANCE FRAME
    // ===================================================

    frame++;

    requestAnimationFrame(draw);

}

// =======================================================
// START
// =======================================================

draw();

});
                          
