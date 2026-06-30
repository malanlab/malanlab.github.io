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

    // -------------------------------------------------
    // CONFIG
    // -------------------------------------------------

    const WAVE_COUNT = 8;
    const BUFFER_SIZE = 320;

    const electrodeNames = [
        "Fp1","Fp2",
        "F3","F4",
        "C3","C4",
        "P3","P4"
    ];

    const waves = [];

    for (let i = 0; i < WAVE_COUNT; i++) {

        waves.push({
            buffer: Array.from(
                {length: BUFFER_SIZE},
                () => (Math.random()-0.5)*10
            )
        });

    }

    // -------------------------------------------------
    // BLINK
    // -------------------------------------------------

    let blink = {
        active:false,
        start:0,
        duration:0
    };

    let t = 0;

    // -------------------------------------------------
    // DRAW
    // -------------------------------------------------

    function draw(){

        const w = canvas.width;
        const h = canvas.height;

        ctx.fillStyle = "rgba(5,10,20,0.45)";
        ctx.fillRect(0,0,w,h);

        const baseSpacing = h/9;

        // Random blink every few seconds

        if(!blink.active && Math.random()<0.005){

            blink.active=true;
            blink.start=t;
            blink.duration=20+Math.random()*15;

        }

        ctx.font="500 13px Inter, sans-serif";
        ctx.textAlign="right";
        ctx.textBaseline="middle";

        // ============================================
        // CHANNELS
        // ============================================

        for(let i=0;i<WAVE_COUNT;i++){

            const wave = waves[i];

            const baseY = baseSpacing*(i+1);

            ctx.fillStyle="rgba(140,200,255,.9)";
            ctx.fillText(electrodeNames[i],45,baseY);

            // ------------------------------------
            // Continuously generate NEW sample
            // ------------------------------------

            const last = wave.buffer[wave.buffer.length-1];

            const newSample =
                  last*0.96
                + (Math.random()-0.5)*1.8
                + Math.sin(t*0.05+i*0.7)*0.8
                + Math.sin(t*0.11+i)*0.35;

            wave.buffer.shift();
            wave.buffer.push(newSample);

            // ------------------------------------
            // Eye blink
            // ------------------------------------

            let blinkSignal=0;

            if(blink.active){

                const p=(t-blink.start)/blink.duration;

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
                        i<2 ? 1.8 :
                        i<4 ? 0.7 :
                        0.2;

                    blinkSignal=spike*90*frontalWeight;

                }

            }

            // ------------------------------------
            // Draw waveform
            // ------------------------------------

            ctx.beginPath();

            ctx.lineWidth=2;

            ctx.strokeStyle="rgba(0,255,210,.08)";

            ctx.shadowBlur=18;
            ctx.shadowColor="rgba(0,255,210,.25)";

            for(let x=0;x<w;x+=2){

                const idx=Math.floor(
                    x/w*wave.buffer.length
                );

                const noise=wave.buffer[idx];

                const burstCenter=(t*4)%w;

                const burst=
                    Math.sin((t*0.02+i)*0.6)
                    *
                    Math.exp(
                        -((x-burstCenter)**2)/20000
                    );

                const smooth=
                    Math.sin(x*0.008+i*0.8)*2;

                let muscle=0;

                if(Math.random()<0.00035){

                    muscle=
                        Math.sin(x*0.45+t)
                        *
                        Math.exp(
                            -((x-w*0.7)**2)/1500
                        )
                        *8;

                }

                // fade end

                let fade=1;

                const fadeStart=w*0.88;

                if(x>fadeStart){

                    fade=
                        1-
                        (x-fadeStart)/
                        (w-fadeStart);

                    fade=Math.max(fade,0);

                }

                const signal =
                      noise*3.2
                    + burst*16
                    + smooth
                    + muscle
                    + blinkSignal;

                const y=
                    baseY+
                    signal*fade;

                if(x===0)
                    ctx.moveTo(x,y);
                else
                    ctx.lineTo(x,y);

            }

            ctx.stroke();

            ctx.shadowBlur=0;

            ctx.strokeStyle="rgba(0,255,220,.38)";
            ctx.lineWidth=1.2;
            ctx.stroke();

        }

        // ============================================
        // Vertical timing markers
        // ============================================

        ctx.strokeStyle="rgba(255,255,255,.18)";
        ctx.lineWidth=1;

        for(let i=0;i<6;i++){

            const x=(t*4+i*160)%w;

            const y=h*(0.15+i*0.14);

            ctx.beginPath();
            ctx.moveTo(x,y-10);
            ctx.lineTo(x,y+10);
            ctx.stroke();

        }

        t++;

        requestAnimationFrame(draw);

    }

    draw();

});
