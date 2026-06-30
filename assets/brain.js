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

    wave.phase1 += 0.08;
    wave.phase2 += 0.028;
    wave.phase3 += 0.17;

    // Slowly changing alpha envelope

    wave.alphaEnvelope += (Math.random()-0.5)*0.01;
    wave.alphaEnvelope = Math.max(
        0.3,
        Math.min(1.3,wave.alphaEnvelope)
    );

    // Alpha rhythm (10 Hz look)

    let signal =
        Math.sin(wave.phase1)*12*wave.alphaEnvelope;

    // Theta

    signal +=
        Math.sin(wave.phase2)*5;

    // Beta

    signal +=
        Math.sin(wave.phase3)*2;

    // Pink-ish noise

    signal +=
        (Math.random()-0.5)*4;

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
                spike*70*frontalWeight;

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
                Math.sin(frame*1.8)*
                (8+Math.random()*6);

        }

    }

    return signal;

}
