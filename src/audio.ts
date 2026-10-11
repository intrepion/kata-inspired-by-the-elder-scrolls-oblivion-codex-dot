// Original drifting harmonic score; no samples or external assets.
let ctx:AudioContext|undefined;
let timer:ReturnType<typeof setInterval>|undefined;
let enabled=false,index=0;
function tone(freq:number,duration:number,volume:number){
 if(!ctx)return;
 const oscillator=ctx.createOscillator(),gain=ctx.createGain();
 oscillator.type='sine';oscillator.frequency.value=freq;
 oscillator.connect(gain);gain.connect(ctx.destination);
 gain.gain.setValueAtTime(0,ctx.currentTime);
 gain.gain.linearRampToValueAtTime(volume,ctx.currentTime+.08);
 gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+duration);
 oscillator.start();oscillator.stop(ctx.currentTime+duration+.1);
}
function startScore(){
 clearInterval(timer);
 const score=()=>{
  const frequency=[146.83,174.61,220,196,130.81,164.81,196,220][index++%8];
  tone(frequency,2.8,.055);tone(frequency*2,2,.022);
 };
 score();timer=setInterval(score,1800);
}
export async function toggleAudio(){
 try{
  ctx??=new AudioContext();enabled=!enabled;
  if(enabled){await ctx.resume();startScore();}
  else{clearInterval(timer);await ctx.suspend();}
  return enabled;
 }catch{enabled=false;clearInterval(timer);return false;}
}
export function chime(){if(enabled&&ctx?.state==='running'){tone(440,.35,.045);tone(659.25,.65,.025);}}
export function suspendAudio(paused:boolean){
 if(!ctx||!enabled)return;
 if(paused){clearInterval(timer);void ctx.suspend();}
 else{void ctx.resume();startScore();}
}
