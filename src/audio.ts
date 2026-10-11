// Original four-note drifting harmonic score; no samples or external assets.
let ctx:AudioContext|undefined, timer:ReturnType<typeof setInterval>|undefined,enabled=false,index=0;
function tone(freq:number,duration:number,volume:number){
 if(!ctx)return;const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=freq;o.connect(g);g.connect(ctx.destination);g.gain.setValueAtTime(0,ctx.currentTime);g.gain.linearRampToValueAtTime(volume,ctx.currentTime+.08);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+duration);o.start();o.stop(ctx.currentTime+duration+.1);
}
export async function toggleAudio(){try{ctx??=new AudioContext();await ctx.resume();enabled=!enabled;if(enabled){const score=()=>{const f=[146.83,174.61,220,196,130.81,164.81,196,220][index++%8];tone(f,2.8,.055);tone(f*2,2,.022);};score();timer=setInterval(score,1800);}else{clearInterval(timer);await ctx.suspend();}return enabled;}catch{return false;}}
export function chime(){if(enabled){tone(440,.35,.045);tone(659.25,.65,.025);}}
export function suspendAudio(paused:boolean){if(ctx&&enabled){if(paused)void ctx.suspend();else void ctx.resume();}}
