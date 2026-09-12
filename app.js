const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];

const canvas=$("#canvas"),ctx=canvas.getContext("2d"),audio=$("#audio");
const coverInput=$("#coverInput"),backgroundInput=$("#backgroundInput"),audioInput=$("#audioInput"),titleInput=$("#titleInput"),descInput=$("#descInput");
const descImageInput=$("#descImageInput"),fontSearch=$("#fontSearch"),fontList=$("#fontList"),fontState=$("#fontState");
const ratioSelect=$("#ratioSelect"),qualitySelect=$("#qualitySelect"),vizSelect=$("#vizSelect"),themeSelect=$("#themeSelect");
const accentColor=$("#accentColor");
const gainRange=$("#gainRange"),blurRange=$("#blurRange"),darkenRange=$("#darkenRange"),descWidth=$("#descWidth");
const descX=$("#descX"),descY=$("#descY"),descAlign=$("#descAlign"),descStyle=$("#descStyle");
const playBtn=$("#playBtn"),exportBtn=$("#exportBtn"),mobileExportBtn=$("#mobileExportBtn"),downloadBtn=$("#downloadBtn"),stopBtn=$("#stopBtn"),langBtn=$("#langBtn");
const resetBackgroundBtn=$("#resetBackgroundBtn"),backgroundName=$("#backgroundName"),loopVideoBtn=$("#loopVideoBtn");
const statusText=$("#statusText"),progressBar=$("#progressBar"),hintText=$("#hintText"),canvasInfo=$("#canvasInfo"),timeText=$("#timeText");

let coverMedia=null,backgroundMedia=null,descMedia=null,audioCtx=null,analyser=null,sourceNode=null,freqData=null,floatFreqData=null,timeData=null,recorder=null,chunks=[];
let abortExport=false,currentLang="en",activeFont="Inter",loopVideos=true,dragging=false,dragOffset={x:0,y:0},descHit={x:0,y:0,w:0,h:0};
let coverDragging=false,coverDragOffset={x:0,y:0},coverHit={x:0,y:0,w:0,h:0};
let visualizerDragging=false,visualizerOffsetX=0,visualizerOffsetY=0,visualizerHit={x:0,y:0,w:0,h:0};
let titleDragging=false,titleOffsetX=0,titleOffsetY=0,titleHit={x:0,y:0,w:0,h:0};
let pointerDragStart={x:0,y:0,offsetX:0,offsetY:0,cx:0,cy:0};
let inkTime=0,inkLastFrame=performance.now(),inkKick=0;
let signalState=null;
let anemoneState=null;
let idolState=null;
let wispState=null;
let spacetimeState=null;
let fluidState=null;
let sandState=null;

const THEMES={
  violet:["#7765ff","#8f82ff","#c5c0ff"],
  cyan:["#40c9ff","#59e2d8","#baf8ff"],
  amber:["#f4b860","#ffd58a","#fff0bf"],
  rose:["#ff6f91","#ff9faf","#ffd0d8"],
  white:["#f2f2f2","#cfd2d6","#ffffff"]
};

const I18N={
 en:{
  studio:"Visualizer Studio",preview:"Preview",export:"Export MP4",project:"Project",assets:"Assets & content",
  cover:"Cover / Thumbnail",chooseCover:"Choose image or video",loopOn:"Loop video: On",loopOff:"Loop video: Off",background:"Background",chooseBackground:"Choose image or video",coverDefault:"Cover is used by default",useCover:"Use cover",audio:"Audio file",chooseAudio:"Choose MP3",title:"Title",
  description:"Description",optional:"Optional",descImage:"Description media",chooseDescImage:"Add image or video",
  imageHint:"Image, GIF or video shown inside description block",font:"Google Font",fontHelp:"Search or type any Google Font family.",
   canvas:"Canvas",dragTip:"Drag the title, description, cover, or visualizer on the canvas",design:"Design",layoutMotion:"Layout & motion",
  ratio:"Aspect ratio",quality:"Quality",visualizer:"Visualizer",accent:"Accent",descriptionLayout:"Description layout",
  alignLeft:"Left",alignCenter:"Center",alignRight:"Right",plain:"Plain",card:"Card",glass:"Glass",
  visualizerGain:"Visualizer gain",backgroundBlur:"Background blur",backgroundShade:"Background shade",
  descWidth:"Description width",position:"Description position",status:"Status",hint:"MP4 is rendered locally in your browser.",
  stop:"Stop export",ready:"Ready",audioReady:"Audio ready",rendering:"Rendering video…",converting:"Converting to MP4…",
  done:"MP4 ready",stopped:"Export stopped",fallback:"MP4 conversion failed; WebM is ready to download",needAudio:"Choose an MP3 file first.",
  noRecorder:"MediaRecorder is not supported in this browser.",trackTitle:"Track title",noFile:"No file selected",
   downloadFile:"Download file",shareTitle:"FrameBeat video",saveReady:"Your video is ready. Tap Download file to save it.",
   starting:"Starting export…",exportFailed:"Export failed",noCanvasCapture:"Video export is not supported by this mobile browser.",unsupportedFormat:"This browser cannot record a supported video format.",
   dropCover:"Drop for Cover",dropDesc:"Drop for Description"
 },
 fa:{
  background:"پس‌زمینه",chooseBackground:"انتخاب تصویر یا ویدئو",coverDefault:"به‌صورت پیش‌فرض از کاور استفاده می‌شود",useCover:"استفاده از کاور",loopOn:"تکرار ویدئو: روشن",loopOff:"تکرار ویدئو: خاموش",
  studio:"استودیو ویژوالایزر",preview:"پیش‌نمایش",export:"خروجی MP4",project:"پروژه",assets:"فایل‌ها و محتوا",
  cover:"کاور / تصویر بندانگشتی",chooseCover:"انتخاب تصویر یا ویدئو",audio:"فایل صوتی",chooseAudio:"انتخاب MP3",title:"عنوان",
  description:"توضیحات",optional:"اختیاری",descImage:"رسانه توضیحات",chooseDescImage:"افزودن تصویر یا ویدئو",
  imageHint:"تصویر، گیف یا ویدئو داخل بلوک توضیحات نمایش داده می‌شود",font:"فونت Google",fontHelp:"جست‌وجو کنید یا نام هر Google Font را بنویسید.",
   canvas:"بوم",dragTip:"توضیحات یا کاور را روی بوم بکشید و جابه‌جا کنید",design:"طراحی",layoutMotion:"چیدمان و حرکت",
  ratio:"نسبت تصویر",quality:"کیفیت",visualizer:"اکولایزر",accent:"رنگ اصلی",descriptionLayout:"چیدمان توضیحات",
  alignLeft:"چپ",alignCenter:"وسط",alignRight:"راست",plain:"ساده",card:"کارت",glass:"شیشه‌ای",
  visualizerGain:"شدت اکولایزر",backgroundBlur:"محو پس‌زمینه",backgroundShade:"تیرگی پس‌زمینه",
  descWidth:"عرض توضیحات",position:"موقعیت توضیحات",status:"وضعیت",hint:"خروجی MP4 داخل مرورگر ساخته می‌شود.",
  stop:"توقف خروجی",ready:"آماده",audioReady:"فایل صوتی آماده",rendering:"در حال رندر ویدئو…",converting:"در حال تبدیل به MP4…",
  done:"MP4 آماده شد",stopped:"خروجی متوقف شد",fallback:"تبدیل MP4 ناموفق بود؛ WebM آماده دانلود است",needAudio:"ابتدا فایل MP3 را انتخاب کنید.",
  noRecorder:"این مرورگر MediaRecorder را پشتیبانی نمی‌کند.",trackTitle:"عنوان موسیقی",noFile:"فایلی انتخاب نشده",
   downloadFile:"دانلود فایل",shareTitle:"ویدئوی FrameBeat",saveReady:"ویدئو آماده است. برای ذخیره، روی دانلود فایل بزنید.",
   starting:"در حال شروع خروجی…",exportFailed:"ساخت خروجی ناموفق بود",noCanvasCapture:"این مرورگر موبایل از خروجی ویدئو پشتیبانی نمی‌کند.",unsupportedFormat:"مرورگر امکان ضبط با فرمت ویدئویی مناسب را ندارد.",
   dropCover:"رها کنید برای کاور",dropDesc:"رها کنید برای توضیحات"
 }
};

function t(k){return I18N[currentLang][k]||k}
function applyLanguage(){
  document.documentElement.lang=currentLang;
  document.documentElement.dir=currentLang==="fa"?"rtl":"ltr";
  langBtn.textContent=currentLang==="en"?"FA":"EN";
  $$("[data-i18n]").forEach(el=>{
    const key=el.dataset.i18n;
    if(I18N[currentLang][key]) el.textContent=I18N[currentLang][key];
  });
  titleInput.placeholder=t("trackTitle");
  if(!audioInput.files[0]) $("#audioName").textContent=t("noFile");
  backgroundName.textContent=backgroundMedia&&backgroundInput.files[0]?backgroundInput.files[0].name:t("coverDefault");
  updateLoopButton();
  if(statusText.dataset.state) statusText.textContent=t(statusText.dataset.state);
}
langBtn.onclick=()=>{currentLang=currentLang==="en"?"fa":"en";applyLanguage()};

function setStatus(key,progress=null){
  statusText.dataset.state=key;
  statusText.textContent=t(key);
  if(progress!==null)progressBar.style.width=`${Math.max(0,Math.min(100,progress))}%`;
}

function fmt(sec){
  if(!Number.isFinite(sec))return"00:00";
  return `${Math.floor(sec/60).toString().padStart(2,"0")}:${Math.floor(sec%60).toString().padStart(2,"0")}`;
}

function fitCanvas(){
  const q=Number(qualitySelect.value),r=ratioSelect.value;
  let w,h;
  if(r==="16:9"){h=q;w=Math.round(q*16/9)}
  if(r==="9:16"){w=q;h=Math.round(q*16/9)}
  if(r==="1:1"){w=q;h=q}
  canvas.width=w;canvas.height=h;canvasInfo.textContent=`${w} × ${h}`;
}

function roundRect(c,x,y,w,h,r){
  r=Math.max(0,Math.min(r,w/2,h/2));
  c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);
  c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();
}

async function ensureAudioGraph(){
  if(audioCtx)return;
  audioCtx=new (window.AudioContext||window.webkitAudioContext)();
  analyser=audioCtx.createAnalyser();analyser.fftSize=8192;analyser.smoothingTimeConstant=.12;analyser.minDecibels=-96;analyser.maxDecibels=-18;
  sourceNode=audioCtx.createMediaElementSource(audio);sourceNode.connect(analyser);analyser.connect(audioCtx.destination);
  freqData=new Uint8Array(analyser.frequencyBinCount);floatFreqData=new Float32Array(analyser.frequencyBinCount);timeData=new Uint8Array(analyser.fftSize);
}

function mediaCover(media,x,y,w,h){
  const mw=media.videoWidth||media.naturalWidth||media.width,mh=media.videoHeight||media.naturalHeight||media.height;
  if(!mw||!mh)return;
  const ir=mw/mh,cr=w/h;let sx=0,sy=0,sw=mw,sh=mh;
  if(ir>cr){sw=mh*cr;sx=(mw-sw)/2}else{sh=mw/cr;sy=(mh-sh)/2}
  ctx.drawImage(media,sx,sy,sw,sh,x,y,w,h);
}

let coverOffsetX=0,coverOffsetY=0;
function getCoverLayout(){
  const w=canvas.width,h=canvas.height,min=Math.min(w,h),portrait=ratioSelect.value==="9:16";
  const size=min*(portrait?.46:.31);
  const x=w/2-size/2+coverOffsetX,y=h*(portrait?.135:.13)+coverOffsetY;
  return{x,y,size,cx:x+size/2,cy:y+size/2};
}

function getVisualizerMode(){
  return $("[data-viz].active")?.dataset.viz||vizSelect.value;
}

function drawBackground(){
  const w=canvas.width,h=canvas.height;
  const backdrop=backgroundMedia||coverMedia;
  if(backdrop){
    ctx.save();ctx.filter=`blur(${Number(blurRange.value)}px) saturate(.92)`;mediaCover(backdrop,-w*.025,-h*.025,w*1.05,h*1.05);ctx.restore();
  }else{
    ctx.fillStyle="#12141a";ctx.fillRect(0,0,w,h);
    const g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,"rgba(119,101,255,.22)");g.addColorStop(1,"rgba(255,255,255,0)");
    ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  }
  ctx.fillStyle=`rgba(0,0,0,${Number(darkenRange.value)})`;ctx.fillRect(0,0,w,h);
  const vign=ctx.createRadialGradient(w/2,h/2,Math.min(w,h)*.15,w/2,h/2,Math.max(w,h)*.7);
  vign.addColorStop(0,"rgba(0,0,0,0)");vign.addColorStop(1,"rgba(0,0,0,.38)");ctx.fillStyle=vign;ctx.fillRect(0,0,w,h);

}

function drawCover(){
  if(!coverMedia){coverHit={x:0,y:0,w:0,h:0};return}
  const {x,y,size,cx,cy}=getCoverLayout();
  if(getVisualizerMode()==="circle"){
    const r=size*.74;
    coverHit={x:cx-r,y:cy-r,w:r*2,h:r*2};
  }else{
    coverHit={x,y,w:size,h:size};
  }
  ctx.save();ctx.shadowColor="rgba(0,0,0,.48)";ctx.shadowBlur=size*.09;
  if(getVisualizerMode()==="circle"){
    const r=size*.74;
    ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.closePath();ctx.clip();
    mediaCover(coverMedia,cx-r,cy-r,r*2,r*2);
  }else{
    roundRect(ctx,x,y,size,size,size*.035);ctx.clip();mediaCover(coverMedia,x,y,size,size);
  }
  ctx.restore();
}

function gradient(x1,y1,x2,y2){
  const cs=THEMES[themeSelect.value];const g=ctx.createLinearGradient(x1,y1,x2,y2);
  g.addColorStop(0,cs[0]);g.addColorStop(.55,cs[1]);g.addColorStop(1,cs[2]);return g;
}

function drawVisualizer(){
  if(analyser){analyser.getByteFrequencyData(freqData);analyser.getFloatFrequencyData(floatFreqData);analyser.getByteTimeDomainData(timeData)}
  else{freqData=freqData||new Uint8Array(1024);timeData=timeData||new Uint8Array(2048).fill(128)}
  const mode=getVisualizerMode();
  if(mode==="circle"){visualizerHit={x:0,y:0,w:0,h:0};return drawCircle()}
  if(mode==="wave")return drawWave();
  if(mode==="ink")return drawInk();
  if(mode==="signal")return drawSignal();
  if(mode==="anemone")return drawAnemone();
  if(mode==="idol")return drawIdol();
  if(mode==="wisp")return drawWisp();
  if(mode==="spacetime")return drawSpacetime();
  if(mode==="fluid")return drawFluid();
  if(mode==="sand")return drawSand();
  drawBars(mode==="mirror");
}

function bandEnergy(from,to){
  if(!freqData?.length)return 0;
  const end=Math.min(freqData.length,to);let sum=0;
  for(let i=from;i<end;i++)sum+=freqData[i];
  return end>from?sum/(end-from)/255:0;
}

// Anemone: an audio-reactive tunnel of glowing, jewel-like particles.
function drawAnemone(){
  const w=canvas.width,h=canvas.height,min=Math.min(w,h),now=performance.now();
  const count=Math.max(190,Math.min(360,Math.round(w*h/5600)));
  if(!anemoneState||anemoneState.count!==count){
    let seed=0x9e3779b9;
    const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
    const particles=Array.from({length:count},(_,i)=>({
      angle:random()*Math.PI*2,arm:(i%7)*.085+(random()-.5)*.22,
      z:.08+random()*1.12,size:.45+random()*1.15,sides:4+Math.floor(random()*4),
      hue:random(),spin:(random()-.5)*1.4,wobble:random()*Math.PI*2
    }));
    anemoneState={count,particles,last:now,kick:0};
  }
  const s=anemoneState,dt=Math.min(.04,(now-s.last)/1000);s.last=now;
  const gain=+gainRange.value,bass=bandEnergy(1,22)*gain,mids=bandEnergy(22,170)*gain,highs=bandEnergy(170,700)*gain;
  const kick=Math.max(0,bass-s.kick);s.kick+=(bass-s.kick)*Math.min(1,dt*8);
  const clock=audio.src?audio.currentTime:now/1000,cx=w*.5+visualizerOffsetX,cy=h*.5+visualizerOffsetY;
  const palette=["#ff2ca8","#ff4c22","#ffad32","#fff08a","#9cff3d","#2fffe0","#8b4cff"];
  visualizerHit={x:0,y:0,w,h};
  ctx.save();
  ctx.fillStyle=(backgroundMedia||coverMedia)?"rgba(3,0,3,.72)":"#080205";ctx.fillRect(0,0,w,h);
  const haze=ctx.createRadialGradient(cx,cy,0,cx,cy,min*.62);
  haze.addColorStop(0,`rgba(255,112,72,${.12+bass*.12})`);haze.addColorStop(.42,"rgba(80,10,35,.09)");haze.addColorStop(1,"rgba(0,0,0,.34)");
  ctx.fillStyle=haze;ctx.fillRect(0,0,w,h);ctx.globalCompositeOperation="lighter";
  for(const p of s.particles){
    p.z-=dt*(.105+bass*.19+kick*.34);
    if(p.z<.055){p.z+=1.13;p.angle=(p.angle+2.18+Math.sin(clock*.17)*.08)%(Math.PI*2)}
    const depth=1/p.z-1/1.18,twist=clock*(.035+mids*.025)+p.arm*(1.4-p.z);
    const radius=depth*min*.31*(.7+.3*Math.sin(p.angle*3+p.wobble));
    const a=p.angle+twist,x=cx+Math.cos(a)*radius*w/min,y=cy+Math.sin(a)*radius;
    if(x<-60||x>w+60||y<-60||y>h+60)continue;
    const perspective=Math.min(3.4,.55/p.z),pulse=1+highs*.55+kick*1.8;
    const r=Math.max(1.2,p.size*min*.0065*perspective*pulse),color=palette[Math.min(palette.length-1,Math.floor(p.hue*palette.length))];
    ctx.globalAlpha=Math.min(.96,.16+(1-p.z/1.18)*.9);
    ctx.shadowColor=color;ctx.shadowBlur=r*(1.8+bass*3.2);ctx.fillStyle=color;
    ctx.beginPath();
    for(let j=0;j<p.sides;j++){
      const pa=j/p.sides*Math.PI*2+p.spin*clock,rr=r*(j%2?.82:1),px=x+Math.cos(pa)*rr,py=y+Math.sin(pa)*rr;
      if(j===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
    }
    ctx.closePath();ctx.fill();
    ctx.globalAlpha*=.72;ctx.shadowBlur=0;ctx.fillStyle="#fff6d7";ctx.beginPath();ctx.arc(x-r*.18,y-r*.2,Math.max(.6,r*.24),0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
}

// Idol: a breathing, mirrored mandala made from the selected visual media.
function drawIdol(){
  const w=canvas.width,h=canvas.height,min=Math.min(w,h),now=performance.now();
  if(!idolState||idolState.w!==w||idolState.h!==h){
    const buffer=document.createElement("canvas");buffer.width=w;buffer.height=h;
    idolState={w,h,buffer,bctx:buffer.getContext("2d"),last:now,phase:0,kick:0};
  }
  const s=idolState,dt=Math.min(.04,(now-s.last)/1000);s.last=now;
  const gain=+gainRange.value,bass=bandEnergy(1,25)*gain,mids=bandEnergy(25,190)*gain,highs=bandEnergy(190,900)*gain;
  const kick=Math.max(0,bass-s.kick);s.kick+=(bass-s.kick)*Math.min(1,dt*7);
  s.phase+=dt*(.12+mids*.14+kick*.32);
  s.bctx.setTransform(1,0,0,1,0,0);s.bctx.clearRect(0,0,w,h);s.bctx.drawImage(canvas,0,0);
  const cx=w*.5+visualizerOffsetX,cy=h*.5+visualizerOffsetY,segments=12,step=Math.PI*2/segments;
  const zoom=1.38+.12*Math.sin(s.phase*1.7)+bass*.18+kick*.2;
  visualizerHit={x:0,y:0,w,h};ctx.save();ctx.fillStyle="#03110c";ctx.fillRect(0,0,w,h);
  for(let i=0;i<segments;i++){
    ctx.save();ctx.translate(cx,cy);ctx.rotate(i*step+s.phase*.16);
    ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,Math.max(w,h)*1.15,-step*.51,step*.51);ctx.closePath();ctx.clip();
    if(i%2)ctx.scale(1,-1);
    ctx.rotate(-s.phase*.34+.08*Math.sin(s.phase+i));ctx.scale(zoom,zoom);
    ctx.translate(-w*.5,-h*.5);ctx.globalAlpha=.9;ctx.drawImage(s.buffer,0,0,w,h);ctx.restore();
  }
  ctx.globalCompositeOperation="screen";
  const colors=["#123e29","#315b49","#7979a9","#a9b9ef"];
  for(let ring=0;ring<5;ring++){
    const petals=8+(ring%2)*4,r=min*(.07+ring*.075)*(1+bass*.08+kick*.15),petal=min*(.055+ring*.012);
    ctx.globalAlpha=.13+highs*.13;ctx.fillStyle=colors[ring%colors.length];ctx.shadowColor=colors[(ring+2)%colors.length];ctx.shadowBlur=min*.018;
    for(let i=0;i<petals;i++){
      const a=i/petals*Math.PI*2-s.phase*(.18+ring*.025),x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;
      ctx.save();ctx.translate(x,y);ctx.rotate(a+Math.PI/2);ctx.beginPath();
      ctx.moveTo(0,-petal*1.45);ctx.quadraticCurveTo(petal,-petal*.25,0,petal*1.4);ctx.quadraticCurveTo(-petal,-petal*.25,0,-petal*1.45);ctx.fill();ctx.restore();
    }
  }
  ctx.globalCompositeOperation="source-over";ctx.shadowBlur=0;
  const vignette=ctx.createRadialGradient(cx,cy,min*.08,cx,cy,Math.max(w,h)*.68);
  vignette.addColorStop(0,`rgba(190,205,255,${.08+kick*.12})`);vignette.addColorStop(.55,"rgba(2,18,12,.12)");vignette.addColorStop(1,"rgba(0,5,4,.62)");
  ctx.globalAlpha=1;ctx.fillStyle=vignette;ctx.fillRect(0,0,w,h);ctx.restore();
}

// Wisp: luminous filaments orbiting a soft, bass-reactive nebula core.
function drawWisp(){
  const w=canvas.width,h=canvas.height,min=Math.min(w,h),now=performance.now(),count=Math.max(150,Math.min(280,Math.round(w*h/7200)));
  if(!wispState||wispState.w!==w||wispState.h!==h||wispState.count!==count){
    let seed=0x51f15e;
    const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
    const trails=document.createElement("canvas");trails.width=w;trails.height=h;
    const particles=Array.from({length:count},()=>({
      a:random()*Math.PI*2,r:.12+random()*.54,speed:.28+random()*.9,drift:(random()-.5)*.05,
      phase:random()*Math.PI*2,width:.35+random()*1.25,life:random(),hue:random()
    }));
    wispState={w,h,count,trails,tctx:trails.getContext("2d"),particles,last:now,phase:0,kick:0};
  }
  const s=wispState,dt=Math.min(.04,(now-s.last)/1000);s.last=now;
  const gain=+gainRange.value,bass=bandEnergy(1,24)*gain,mids=bandEnergy(24,180)*gain,highs=bandEnergy(180,950)*gain;
  const kick=Math.max(0,bass-s.kick);s.kick+=(bass-s.kick)*Math.min(1,dt*8);s.phase+=dt*(.22+mids*.3);
  const cx=w*(.48+.035*Math.sin(s.phase*.43))+visualizerOffsetX,cy=h*(.5+.045*Math.cos(s.phase*.37))+visualizerOffsetY;
  const tc=s.tctx;tc.save();tc.globalCompositeOperation="destination-out";tc.fillStyle=`rgba(0,0,0,${.035+dt*.65})`;tc.fillRect(0,0,w,h);
  tc.globalCompositeOperation="lighter";tc.lineCap="round";
  for(const p of s.particles){
    const oldA=p.a,oldR=p.r;p.a+=dt*p.speed*(.32+mids*.75)*(p.r<.3?1.7:1);p.r+=dt*(p.drift+Math.sin(s.phase*.7+p.phase)*.009);
    if(p.r>.7||p.r<.08){p.r=.12+((p.life+=.319)%1)*.5;p.a+=2.4;p.drift=-p.drift}
    const ripple=1+.13*Math.sin(p.a*3+p.phase+s.phase*1.3),rx=min*oldR*ripple*w/min,ry=min*oldR*(.62+.08*Math.sin(p.phase));
    const nripple=1+.13*Math.sin(p.a*3+p.phase+s.phase*1.3),nrx=min*p.r*nripple*w/min,nry=min*p.r*(.62+.08*Math.sin(p.phase));
    const x1=cx+Math.cos(oldA)*rx,y1=cy+Math.sin(oldA)*ry,x2=cx+Math.cos(p.a)*nrx,y2=cy+Math.sin(p.a)*nry;
    const alpha=.035+highs*.11+(1-p.r)*.025;
    tc.strokeStyle=p.hue<.72?`rgba(83,48,255,${alpha})`:`rgba(245,74,255,${alpha*.85})`;
    tc.lineWidth=Math.max(.6,p.width*min*.0022*(1+highs*.7));tc.shadowColor=p.hue<.72?"#4b38ff":"#ff54e8";tc.shadowBlur=min*.008;tc.beginPath();tc.moveTo(x1,y1);tc.quadraticCurveTo((x1+x2)/2+Math.sin(p.phase+s.phase)*min*.006,(y1+y2)/2+Math.cos(p.phase-s.phase)*min*.006,x2,y2);tc.stroke();
  }
  tc.restore();
  visualizerHit={x:0,y:0,w,h};ctx.save();ctx.fillStyle="rgba(3,0,13,.82)";ctx.fillRect(0,0,w,h);ctx.globalCompositeOperation="screen";ctx.globalAlpha=.92;ctx.drawImage(s.trails,0,0);
  const coreR=min*(.15+bass*.075+kick*.13),core=ctx.createRadialGradient(cx-coreR*.12,cy-coreR*.1,0,cx,cy,coreR*1.75);
  core.addColorStop(0,"rgba(255,247,255,.98)");core.addColorStop(.12,"rgba(255,146,244,.95)");core.addColorStop(.38,"rgba(244,61,221,.62)");core.addColorStop(.7,"rgba(105,35,255,.20)");core.addColorStop(1,"rgba(30,12,110,0)");
  ctx.globalAlpha=.72+Math.min(.25,kick);ctx.fillStyle=core;ctx.beginPath();ctx.arc(cx,cy,coreR*1.75,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=.25+highs*.2;ctx.strokeStyle="#9e78ff";ctx.lineWidth=Math.max(1,min*.003);ctx.shadowColor="#704cff";ctx.shadowBlur=min*.025;
  for(let ring=0;ring<3;ring++){
    ctx.beginPath();
    for(let i=0;i<=90;i++){const a=i/90*Math.PI*2+s.phase*(ring%2?-.16:.12),rr=min*(.25+ring*.105)*(1+.08*Math.sin(a*5+s.phase*2+ring));const x=cx+Math.cos(a)*rr*w/min,y=cy+Math.sin(a)*rr*.62;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)}ctx.stroke();
  }
  ctx.restore();
}

// Spacetime: side-on hyperspace streaks accelerating out of a distant origin.
function drawSpacetime(){
  const w=canvas.width,h=canvas.height,min=Math.min(w,h),now=performance.now(),count=Math.max(120,Math.min(250,Math.round(w*h/7600)));
  if(!spacetimeState||spacetimeState.w!==w||spacetimeState.h!==h||spacetimeState.count!==count){
    let seed=0x5acedeed;
    const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
    const particles=Array.from({length:count},()=>({
      z:.04+random()*.96,y:(random()-.5)*1.25,x:(random()-.12)*.8,size:.35+random()*1.25,
      speed:.55+random()*.85,hue:random(),flicker:random()*Math.PI*2
    }));
    spacetimeState={w,h,count,particles,last:now,kick:0,phase:0};
  }
  const s=spacetimeState,dt=Math.min(.04,(now-s.last)/1000);s.last=now;
  const gain=+gainRange.value,bass=bandEnergy(1,24)*gain,mids=bandEnergy(24,190)*gain,highs=bandEnergy(190,1000)*gain;
  const kick=Math.max(0,bass-s.kick);s.kick+=(bass-s.kick)*Math.min(1,dt*9);s.phase+=dt;
  const ox=w*(.12+.025*Math.sin(s.phase*.31))+visualizerOffsetX,oy=h*(.51+.035*Math.cos(s.phase*.27))+visualizerOffsetY;
  const colors=["#64f7d2","#a8ff73","#fff09a","#ff854f","#ee8cff","#9cb7ff"];
  visualizerHit={x:0,y:0,w,h};ctx.save();ctx.fillStyle="rgba(0,3,8,.9)";ctx.fillRect(0,0,w,h);
  const glow=ctx.createRadialGradient(ox,oy,0,ox,oy,min*.48);glow.addColorStop(0,`rgba(105,210,180,${.13+bass*.12})`);glow.addColorStop(.3,"rgba(45,85,85,.045)");glow.addColorStop(1,"rgba(0,0,0,0)");ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
  ctx.globalCompositeOperation="lighter";ctx.lineCap="round";
  for(const p of s.particles){
    const oldZ=p.z,velocity=dt*p.speed*(.16+bass*.34+mids*.12+kick*.52);p.z-=velocity;
    if(p.z<.025){p.z=.82+((p.hue*7.13+s.phase*.017)%1)*.18;p.y=((p.y*1.73+.61)%1.3)-.65;p.x=((p.x*1.91+.37)%1)*.78}
    const project=z=>({x:ox+(p.x*w*.82+w*.055)/z,y:oy+p.y*h*.52/z});
    const head=project(p.z),tail=project(Math.min(1.3,oldZ+(.035+mids*.09+highs*.07)));
    if(head.x<-120||head.x>w+160||head.y<-100||head.y>h+100)continue;
    const color=colors[Math.min(colors.length-1,Math.floor(p.hue*colors.length))],perspective=Math.min(4,.16/p.z);
    const alpha=Math.min(.95,.16+(1-p.z)*.72+highs*.2),width=Math.max(.45,p.size*min*.0017*perspective);
    ctx.globalAlpha=alpha*.34;ctx.strokeStyle=color;ctx.lineWidth=width*3.5;ctx.shadowColor=color;ctx.shadowBlur=width*6;ctx.beginPath();ctx.moveTo(tail.x,tail.y);ctx.lineTo(head.x,head.y);ctx.stroke();
    ctx.globalAlpha=alpha;ctx.lineWidth=width;ctx.shadowBlur=width*2;ctx.beginPath();ctx.moveTo(tail.x,tail.y);ctx.lineTo(head.x,head.y);ctx.stroke();
    const r=Math.max(1,width*(1.3+kick*1.8)),star=ctx.createRadialGradient(head.x,head.y,0,head.x,head.y,r*4);
    star.addColorStop(0,"rgba(255,255,255,.98)");star.addColorStop(.25,color);star.addColorStop(1,"rgba(0,0,0,0)");ctx.globalAlpha=alpha*(.8+.2*Math.sin(s.phase*8+p.flicker));ctx.fillStyle=star;ctx.beginPath();ctx.arc(head.x,head.y,r*4,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
}

// Fluid: persistent clouds of coloured ink carried through a curling flow field.
function drawFluid(){
  const w=canvas.width,h=canvas.height,min=Math.min(w,h),now=performance.now(),count=Math.max(180,Math.min(330,Math.round(w*h/6200)));
  if(!fluidState||fluidState.w!==w||fluidState.h!==h||fluidState.count!==count){
    let seed=0xf10dca7;
    const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
    const field=document.createElement("canvas");field.width=w;field.height=h;
    const particles=Array.from({length:count},(_,i)=>({
      family:i%3,x:random(),y:random(),vx:0,vy:0,age:random(),life:.8+random()*1.8,
      size:.45+random()*1.4,phase:random()*Math.PI*2
    }));
    fluidState={w,h,count,field,fctx:field.getContext("2d"),particles,last:now,phase:0,kick:0};
  }
  const s=fluidState,dt=Math.min(.04,(now-s.last)/1000);s.last=now;
  const gain=+gainRange.value,bass=bandEnergy(1,26)*gain,mids=bandEnergy(26,210)*gain,highs=bandEnergy(210,1000)*gain;
  const kick=Math.max(0,bass-s.kick);s.kick+=(bass-s.kick)*Math.min(1,dt*7);s.phase+=dt*(.18+mids*.25);
  const emitters=[
    {x:.19+.1*Math.sin(s.phase*.63),y:.43+.17*Math.cos(s.phase*.41),color:"42,214,159"},
    {x:.76+.09*Math.cos(s.phase*.51),y:.35+.17*Math.sin(s.phase*.47),color:"85,45,255"},
    {x:.52+.13*Math.sin(s.phase*.37+2),y:.77+.09*Math.cos(s.phase*.59),color:"255,111,37"}
  ];
  const fc=s.fctx;fc.save();fc.globalCompositeOperation="destination-out";fc.fillStyle=`rgba(0,0,0,${.012+dt*.28})`;fc.fillRect(0,0,w,h);fc.globalCompositeOperation="lighter";
  for(const p of s.particles){
    p.age+=dt;
    if(p.age>p.life||p.x<-.15||p.x>1.15||p.y<-.2||p.y>1.2){
      const e=emitters[p.family],a=p.phase+s.phase*1.7;p.x=e.x+Math.cos(a)*(.012+bass*.025);p.y=e.y+Math.sin(a)*(.012+bass*.025);p.vx=Math.cos(a)*.018;p.vy=Math.sin(a)*.018;p.age=0;p.life=.75+(p.phase%1)*1.7;
    }
    const curlA=Math.sin(p.x*8.7+s.phase*1.1)+Math.cos(p.y*9.3-s.phase*.83)+Math.sin((p.x+p.y)*5.1+p.phase);
    const angle=curlA*2.05+s.phase*.24,force=dt*(.075+mids*.11+kick*.12);
    p.vx=p.vx*.965+Math.cos(angle)*force;p.vy=p.vy*.965+Math.sin(angle)*force*w/h;
    const px=p.x*w,py=p.y*h;p.x+=p.vx*dt*4.2;p.y+=p.vy*dt*4.2;
    const nx=p.x*w,ny=p.y*h,e=emitters[p.family],fade=Math.sin(Math.min(1,p.age/p.life)*Math.PI),radius=min*.032*p.size*(1+bass*.25+kick*.45);
    const cloud=fc.createRadialGradient(nx,ny,0,nx,ny,radius);cloud.addColorStop(0,`rgba(${e.color},${(.055+highs*.025)*fade})`);cloud.addColorStop(.48,`rgba(${e.color},${.028*fade})`);cloud.addColorStop(1,`rgba(${e.color},0)`);
    fc.fillStyle=cloud;fc.beginPath();fc.arc(nx,ny,radius,0,Math.PI*2);fc.fill();
    fc.strokeStyle=`rgba(${e.color},${(.025+highs*.03)*fade})`;fc.lineWidth=Math.max(1,radius*.22);fc.lineCap="round";fc.beginPath();fc.moveTo(px,py);fc.lineTo(nx,ny);fc.stroke();
  }
  fc.restore();
  visualizerHit={x:0,y:0,w,h};ctx.save();ctx.fillStyle="rgba(0,2,4,.93)";ctx.fillRect(0,0,w,h);ctx.globalCompositeOperation="screen";ctx.globalAlpha=.96;ctx.drawImage(s.field,0,0);
  for(let i=0;i<emitters.length;i++){
    const e=emitters[i],r=min*(.045+bass*.035+kick*.065),g=ctx.createRadialGradient(e.x*w,e.y*h,0,e.x*w,e.y*h,r*2.8);
    g.addColorStop(0,`rgba(${e.color},${.72+Math.min(.2,kick)})`);g.addColorStop(.3,`rgba(${e.color},.22)`);g.addColorStop(1,`rgba(${e.color},0)`);ctx.fillStyle=g;ctx.beginPath();ctx.arc(e.x*w,e.y*h,r*2.8,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
}

// Sand: shimmering grains gathering along slowly deforming organic contours.
function drawSand(){
  const w=canvas.width,h=canvas.height,min=Math.min(w,h),now=performance.now(),count=Math.max(950,Math.min(1900,Math.round(w*h/1050)));
  if(!sandState||sandState.w!==w||sandState.h!==h||sandState.count!==count){
    let seed=0x5a6d1234;
    const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
    const grains=Array.from({length:count},(_,i)=>({
      loop:i%7,t:random()*Math.PI*2,offset:(random()-.5),size:.35+random()*1.45,
      phase:random()*Math.PI*2,hue:random(),loose:random()<.12
    }));
    sandState={w,h,count,grains,last:now,phase:0,kick:0,level:0,beat:0};
  }
  const s=sandState,dt=Math.min(.04,(now-s.last)/1000);s.last=now;
  const gain=+gainRange.value,bass=bandEnergy(1,26)*gain,mids=bandEnergy(26,220)*gain,highs=bandEnergy(220,1300)*gain;
  const energy=bass*.72+mids*.28,onset=Math.max(0,energy-s.level);
  s.level+=(energy-s.level)*Math.min(1,dt*(energy>s.level?5:1.6));
  s.beat=Math.max(s.beat*Math.exp(-dt*7.5),Math.min(1,onset*9));
  const kick=Math.max(s.beat,Math.max(0,bass-s.kick)*5);s.kick+=(bass-s.kick)*Math.min(1,dt*9);
  const rhythm=Math.min(1,energy*.72+kick*1.15);s.phase+=dt*(.10+mids*.24+rhythm*.34);
  const centers=[[.30,.29,.22,.15],[.58,.25,.24,.14],[.72,.52,.18,.22],[.50,.57,.22,.17],[.30,.68,.19,.20],[.61,.78,.22,.13],[.43,.42,.13,.12]];
  const palette=["#81784c","#aaa16a","#586f52","#9b744b","#d0c58a"];
  visualizerHit={x:0,y:0,w,h};ctx.save();ctx.fillStyle="rgba(0,1,2,.95)";ctx.fillRect(0,0,w,h);ctx.globalCompositeOperation="lighter";
  for(const g of s.grains){
    const c=centers[g.loop],t=g.t+s.phase*(g.loop%2?-.12:.15),lobes=2+(g.loop%4);
    const beatWave=Math.sin(t*(5+g.loop%3)+g.phase*.25),deform=1+.24*Math.sin(t*lobes+s.phase*(.7+g.loop*.08)+g.phase*.18)+rhythm*(.10+.11*kick)*beatWave;
    let x=(c[0]+Math.cos(t)*c[2]*deform+Math.sin(t*2.3+g.phase)*.018)*w;
    let y=(c[1]+Math.sin(t)*c[3]*deform+Math.cos(t*1.7+g.phase)*.018)*h;
    const spread=min*(.0025+highs*.004+rhythm*.009+kick*.018),normal=t+Math.PI*.5;
    x+=Math.cos(normal)*g.offset*spread+(g.loose?Math.sin(g.phase+s.phase)*min*.055:0);
    y+=Math.sin(normal)*g.offset*spread+(g.loose?Math.cos(g.phase-s.phase*.7)*min*.055:0);
    const flicker=.22+.28*Math.max(0,Math.sin(s.phase*9+g.phase))+highs*.25+rhythm*.38+kick*.45,color=palette[Math.min(palette.length-1,Math.floor(g.hue*palette.length))];
    const r=Math.max(.45,g.size*min*.00125*(1+rhythm*.35+kick*.9));ctx.globalAlpha=Math.min(.96,flicker*(g.loose?.3:.68));ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=(g.hue>.72||kick>.18)?r*(2+kick*5):0;
    if(g.hue>.65){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}else ctx.fillRect(x-r*.5,y-r*.5,r,r);
  }
  ctx.globalAlpha=.12+bass*.08;ctx.strokeStyle="#b7aa70";ctx.lineWidth=Math.max(.5,min*.0007);ctx.shadowBlur=min*.006;
  for(let l=0;l<centers.length;l++){
    const c=centers[l],lobes=2+(l%4);ctx.beginPath();
    for(let i=0;i<=100;i++){const t=i/100*Math.PI*2+s.phase*(l%2?-.12:.15),d=1+.24*Math.sin(t*lobes+s.phase*(.7+l*.08))+rhythm*(.08+.09*kick)*Math.sin(t*(5+l%3));const x=(c[0]+Math.cos(t)*c[2]*d)*w,y=(c[1]+Math.sin(t)*c[3]*d)*h;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)}ctx.stroke();
  }
  ctx.restore();
}

// Marbled ink: lows deepen the folds, mids move them and kicks flash their rims.
function drawInk(){
  const w=canvas.width,h=canvas.height,min=Math.min(w,h),now=performance.now();
  const dt=Math.min(.04,(now-inkLastFrame)/1000);inkLastFrame=now;
  const gain=+gainRange.value,bass=bandEnergy(1,18)*gain,mids=bandEnergy(18,150)*gain;
  const kick=Math.max(0,bass-inkKick);inkKick+=(bass-inkKick)*Math.min(1,dt*7);
  inkTime=audio.src?audio.currentTime:now/1000;
  const cs=THEMES[themeSelect.value],t0=inkTime;
  visualizerHit={x:visualizerOffsetX,y:visualizerOffsetY,w,h};
  ctx.save();ctx.fillStyle="rgba(2,2,11,.72)";ctx.fillRect(0,0,w,h);ctx.translate(visualizerOffsetX,visualizerOffsetY);ctx.globalCompositeOperation="screen";
  for(let layer=0;layer<3;layer++){
    const base=layer===0?cs[0]:layer===1?cs[1]:cs[2];
    ctx.globalAlpha=layer===0?.82:layer===1?.34:.14;
    ctx.filter=`blur(${min*(.025+layer*.018)}px) saturate(${1.35+mids*.8})`;
    for(let i=0;i<14;i++){
      const seed=i*2.399+layer*4.17;
      const x=w*(.5+.47*Math.sin(seed+t0*(.17+layer*.035)+Math.sin(t0*.31+seed)*.7));
      const y=h*(.5+.43*Math.cos(seed*1.37-t0*(.13+layer*.025)+Math.sin(t0*.23+seed)*.65));
      const pulse=1+mids*.32+kick*1.7;
      const rx=min*(.12+.055*Math.sin(seed*2.1+t0*.27))*pulse;
      const ry=rx*(.58+.38*Math.cos(seed+t0*.19));
      const g=ctx.createRadialGradient(x-rx*.2,y-ry*.15,0,x,y,rx);
      g.addColorStop(0,base);g.addColorStop(.48,base);g.addColorStop(1,"transparent");
      ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x,y,rx,Math.max(8,ry),seed+t0*.055,0,Math.PI*2);ctx.fill();
    }
  }
  ctx.filter="none";ctx.globalCompositeOperation="lighter";ctx.globalAlpha=Math.min(.46,kick*2.5);
  ctx.fillStyle=cs[2];ctx.fillRect(0,0,w,h);ctx.restore();
}

function drawSignal(){
  const w=canvas.width,h=canvas.height,count=Math.max(112,Math.min(180,Math.round(w/8)));
  if(!signalState||signalState.count!==count){
    signalState={count,values:new Float32Array(count),peaks:new Float32Array(count),holds:new Float32Array(count),history:[],queue:[],last:null,frame:0};
  }
  const s=signalState,clock=audio.src?audio.currentTime:performance.now()/1000;
  let dt=s.last===null?1/60:Math.max(0,Math.min(.05,clock-s.last));
  if(s.last!==null&&(clock<s.last-.03||clock-s.last>.5)){
    s.values.fill(0);s.peaks.fill(0);s.holds.fill(0);s.history=[];s.queue=[];dt=1/60;
  }
  s.last=clock;
  const gain=+gainRange.value,hasSpectrum=analyser&&audioCtx&&floatFreqData;
  const hzPerBin=hasSpectrum?audioCtx.sampleRate/analyser.fftSize:1,minHz=28,maxHz=Math.min(19000,(audioCtx?.sampleRate||44100)*.47);
  const rawTargets=new Float32Array(count);
  for(let i=0;i<count;i++){
    const t0=i/count,t1=(i+1)/count;
    const low=minHz*Math.pow(maxHz/minHz,t0),high=minHz*Math.pow(maxHz/minHz,t1);
    const from=Math.max(1,Math.floor(low/hzPerBin)),to=hasSpectrum?Math.min(floatFreqData.length,Math.max(from+1,Math.ceil(high/hzPerBin))):from;
    let power=0,top=-120;
    for(let j=from;j<to;j++){const db=floatFreqData[j];if(Number.isFinite(db)){power+=Math.pow(10,db/10);if(db>top)top=db}}
    const average=power>0?10*Math.log10(power/Math.max(1,to-from)):-120;
    const center=Math.sqrt(low*high),slope=3.2*Math.log2(center/1000);
    const db=Math.max(average,top-7)+slope;
    rawTargets[i]=Math.min(1,Math.max(0,(db+82)/58)*gain);
  }
  const rendering=recorder&&recorder.state==="recording";
  const latency=rendering?0:Math.min(.16,Math.max(.025,(audioCtx?.baseLatency||0)+(audioCtx?.outputLatency||0)));
  const stamp=performance.now();s.queue.push({at:stamp,values:rawTargets});
  const targetStamp=stamp-latency*1000;
  while(s.queue.length>2&&s.queue[1].at<=targetStamp)s.queue.shift();
  const targets=latency===0?rawTargets:(s.queue[0]?.values||rawTargets);
  if(latency===0)s.queue.length=0;
  for(let i=0;i<count;i++){
    const target=targets[i];
    const speed=target>s.values[i]?85:14;
    s.values[i]+=(target-s.values[i])*(1-Math.exp(-dt*speed));
    if(s.values[i]>=s.peaks[i]){s.peaks[i]=s.values[i];s.holds[i]=.24}
    else if(s.holds[i]>0)s.holds[i]-=dt;
    else s.peaks[i]=Math.max(s.values[i],s.peaks[i]-dt*.22);
  }
  if(++s.frame%2===0){s.history.unshift(s.values.slice());if(s.history.length>20)s.history.pop()}

  ctx.save();
  ctx.fillStyle=(backgroundMedia||coverMedia)?"rgba(0,0,2,.78)":"#000";ctx.fillRect(0,0,w,h);
  ctx.strokeStyle="rgba(74,80,160,.10)";ctx.lineWidth=Math.max(1,w*.0007);
  for(let i=1;i<=4;i++){const y=h*i/6;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
  visualizerHit={x:visualizerOffsetX,y:h*.375+visualizerOffsetY,w,h:h*.59};
  ctx.translate(visualizerOffsetX,visualizerOffsetY);
  const base=h*.965,maxH=h*.59,bw=w/count,gap=Math.max(1,bw*.16);
  const spectrumGradient=ctx.createLinearGradient(0,0,w,0);
  spectrumGradient.addColorStop(0,"#7628ff");spectrumGradient.addColorStop(.24,"#343cff");
  spectrumGradient.addColorStop(.48,"#18c8d4");spectrumGradient.addColorStop(.67,"#35f06f");
  spectrumGradient.addColorStop(.84,"#d7ec3f");spectrumGradient.addColorStop(1,"#ff7024");
  ctx.fillStyle=spectrumGradient;ctx.shadowColor="#36d9ff";ctx.shadowBlur=Math.max(4,w*.004);
  for(let i=0;i<count;i++){
    const bh=Math.max(1,s.values[i]*maxH),x=i*bw+gap/2;
    roundRect(ctx,x,base-bh,Math.max(1,bw-gap),bh,Math.min(bw*.4,4));ctx.fill();
  }
  ctx.shadowBlur=0;
  const trails=[[17,"rgba(30,110,255,.28)",1.3],[10,"rgba(115,40,255,.42)",1.7],[4,"rgba(35,255,185,.38)",1.4]];
  for(const [age,color,width] of trails){
    const values=s.history[age];if(!values)continue;
    ctx.strokeStyle=color;ctx.lineWidth=Math.max(1,width*w/800);ctx.beginPath();
    for(let i=0;i<count;i++){const x=(i+.5)*bw,y=base-values[i]*maxH;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)}ctx.stroke();
  }
  ctx.strokeStyle=spectrumGradient;ctx.lineWidth=Math.max(1.5,w*.002);ctx.shadowColor="#9fffe0";ctx.shadowBlur=Math.max(3,w*.003);ctx.beginPath();
  for(let i=0;i<count;i++){const x=(i+.5)*bw,y=base-s.values[i]*maxH;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)}ctx.stroke();
  ctx.shadowColor="#3dff91";ctx.shadowBlur=Math.max(4,w*.004);ctx.fillStyle="#45ff91";
  const marker=Math.max(2,w*.004);
  for(let i=0;i<count;i+=2){const x=(i+.5)*bw-marker/2,y=base-s.peaks[i]*maxH-marker/2;ctx.fillRect(x,y,marker,marker*.62)}
  ctx.restore();
}

function drawBars(mirror){
  const w=canvas.width,h=canvas.height,gain=+gainRange.value,count=Math.max(50,Math.min(120,Math.round(w/16)));
  const width=w*.72,start=w*.14+visualizerOffsetX,bw=width/count,gap=bw*.38,base=h*.91+visualizerOffsetY,maxH=h*.115;
  visualizerHit={x:start,y:base-maxH,w:width,h:mirror?maxH*1.45+4:maxH};
  ctx.fillStyle=gradient(start,base-maxH,start+width,base);ctx.shadowColor=THEMES[themeSelect.value][0];ctx.shadowBlur=Math.min(14,w*.006);
  for(let i=0;i<count;i++){
    const idx=Math.floor((i/count)*freqData.length*.55),v=freqData[idx]/255*gain,bh=Math.max(2,Math.min(maxH,v*maxH));
    const x=start+i*bw;roundRect(ctx,x,base-bh,bw-gap,bh,(bw-gap)/2);ctx.fill();
    if(mirror){ctx.globalAlpha=.18;roundRect(ctx,x,base+4,bw-gap,bh*.45,(bw-gap)/2);ctx.fill();ctx.globalAlpha=1}
  }
  ctx.shadowBlur=0;
}

function drawCircle(){
  const {cx,cy,size}=getCoverLayout(),r=size*.74,gain=+gainRange.value,min=Math.min(canvas.width,canvas.height);
  ctx.strokeStyle=gradient(cx-r,cy,cx+r,cy);ctx.lineWidth=Math.max(2,min*.0026);ctx.lineCap="round";
  for(let i=0;i<144;i++){
    const a=i/144*Math.PI*2-Math.PI/2,idx=Math.floor(i/144*freqData.length*.58),v=freqData[idx]/255*gain,len=r*(.07+Math.min(.48,v*.40));
    ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);ctx.lineTo(cx+Math.cos(a)*(r+len),cy+Math.sin(a)*(r+len));ctx.stroke();
  }
}

function drawWave(){
  const w=canvas.width,h=canvas.height,start=w*.13+visualizerOffsetX,end=w*.87+visualizerOffsetX,y=h*.89+visualizerOffsetY,amp=h*.06*+gainRange.value;
  visualizerHit={x:start,y:y-amp,w:end-start,h:amp*2};
  ctx.strokeStyle=gradient(start,y,end,y);ctx.lineWidth=Math.max(2,w*.0018);ctx.beginPath();
  for(let i=0;i<timeData.length;i+=4){const x=start+i/(timeData.length-1)*(end-start),yy=y+(timeData[i]-128)/128*amp;if(i===0)ctx.moveTo(x,yy);else ctx.lineTo(x,yy)}
  ctx.stroke();
}

function getFont(){return `"${activeFont.replace(/"/g,"")}", system-ui, sans-serif`}

function wrapLines(text,maxWidth,font,maxLines=5){
  ctx.font=font;
  const words=text.trim().split(/\s+/).filter(Boolean);let lines=[],line="";
  for(const word of words){
    const test=line?line+" "+word:word;
    if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word;if(lines.length>=maxLines-1)break}else line=test;
  }
  if(line&&lines.length<maxLines)lines.push(line);
  return lines;
}

function drawContent(){
  const w=canvas.width,h=canvas.height,min=Math.min(w,h);
  const title=titleInput.value.trim()||t("trackTitle");
  const fontSize=Math.round(min*.052),x=w/2+titleOffsetX,y=h*(ratioSelect.value==="9:16"?.58:.59)+titleOffsetY;
  ctx.save();ctx.fillStyle="#fff";ctx.textAlign="center";ctx.textBaseline="middle";
  ctx.font=`700 ${fontSize}px ${getFont()}`;
  const titleWidth=Math.min(w,Math.max(fontSize,ctx.measureText(title).width));
  titleHit={x:x-titleWidth/2,y:y-fontSize*.7,w:titleWidth,h:fontSize*1.4};
  ctx.shadowColor="rgba(0,0,0,.48)";ctx.shadowBlur=min*.012;
  ctx.fillText(title,x,y);ctx.restore();
  drawDescription();
}

function drawDescription(){
  const text=descInput.value.trim();if(!text&&!descMedia){descHit={x:0,y:0,w:0,h:0};return}
  const w=canvas.width,h=canvas.height,min=Math.min(w,h),blockW=w*(+descWidth.value/100);
  const pad=min*.022,imgSize=descMedia?min*.105:0,gap=descMedia?min*.018:0;
  const fontSize=Math.round(min*.021),lineH=fontSize*1.42,maxTextW=blockW-pad*2-(descMedia?imgSize+gap:0);
  const lines=text?wrapLines(text,maxTextW,`500 ${fontSize}px ${getFont()}`,5):[];
  const textH=Math.max(imgSize,lines.length*lineH);
  const blockH=Math.max(min*.07,textH+pad*2);
  const cx=w*(+descX.value/100),cy=h*(+descY.value/100),x=Math.max(0,Math.min(w-blockW,cx-blockW/2)),y=Math.max(0,Math.min(h-blockH,cy-blockH/2));
  descHit={x,y,w:blockW,h:blockH};

  ctx.save();
  if(descStyle.value!=="plain"){
    if(descStyle.value==="glass"){ctx.fillStyle="rgba(18,19,22,.46)";ctx.strokeStyle="rgba(255,255,255,.14)"}
    else{ctx.fillStyle="rgba(16,17,20,.86)";ctx.strokeStyle="rgba(255,255,255,.08)"}
    roundRect(ctx,x,y,blockW,blockH,min*.018);ctx.fill();ctx.lineWidth=Math.max(1,min*.0012);ctx.stroke();
  }
  if(descMedia){
    const ix=x+pad,iy=y+(blockH-imgSize)/2;roundRect(ctx,ix,iy,imgSize,imgSize,min*.012);ctx.clip();mediaCover(descMedia,ix,iy,imgSize,imgSize);
    ctx.restore();ctx.save();
  }

  const textXBase=x+pad+(descMedia?imgSize+gap:0),available=blockW-pad*2-(descMedia?imgSize+gap:0);
  let align=descAlign.value;
  if(currentLang==="fa"&&align==="left") align="right";
  if(currentLang==="fa"&&descAlign.value==="right") align="left";
  ctx.textAlign=align;ctx.textBaseline="top";ctx.fillStyle="rgba(255,255,255,.86)";
  ctx.font=`500 ${fontSize}px ${getFont()}`;
  const tx=align==="center"?textXBase+available/2:align==="right"?textXBase+available:textXBase;
  const sy=y+(blockH-lines.length*lineH)/2;
  lines.forEach((line,i)=>ctx.fillText(line,tx,sy+i*lineH));
  ctx.restore();
}

function drawFrame(){
  const mode=getVisualizerMode();
  drawBackground();
  if(mode==="ink"||mode==="signal"||mode==="anemone"||mode==="idol"||mode==="wisp"||mode==="spacetime"||mode==="fluid"||mode==="sand"){drawVisualizer();drawCover()}
  else{drawCover();drawVisualizer()}
  drawContent();
  timeText.textContent=`${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;
  requestAnimationFrame(drawFrame);
}

function releaseVisualMedia(media){
  if(!media)return;
  const url=media.dataset.objectUrl;
  if(media.tagName==="VIDEO"){media.pause();media.removeAttribute("src");media.load()}
  if(url)URL.revokeObjectURL(url);
}
function loadVisualFile(file,current,cb){
  if(!file)return;
  const url=URL.createObjectURL(file),isVideo=file.type.startsWith("video/")||/\.(mp4|webm|ogv|mov|m4v)$/i.test(file.name);
  const media=isVideo?document.createElement("video"):new Image();
  media.dataset.objectUrl=url;
  const ready=()=>{releaseVisualMedia(current);cb(media);updateLoopButton();if(isVideo)media.play().catch(()=>{})};
  const failed=()=>{URL.revokeObjectURL(url);alert(`Unable to load ${file.name}`)};
  if(isVideo){media.muted=true;media.loop=loopVideos;media.playsInline=true;media.preload="auto";media.onloadeddata=ready;media.onerror=failed}
  else{media.onload=ready;media.onerror=failed}
  media.src=url;
}
function visualVideos(){return [...new Set([coverMedia,backgroundMedia,descMedia].filter(media=>media&&media.tagName==="VIDEO"))]}
function updateLoopButton(){
  if(!loopVideoBtn)return;
  loopVideoBtn.hidden=visualVideos().length===0;
  loopVideoBtn.textContent=t(loopVideos?"loopOn":"loopOff");
  loopVideoBtn.classList.toggle("active",loopVideos);
  loopVideoBtn.setAttribute("aria-pressed",String(loopVideos));
  visualVideos().forEach(video=>video.loop=loopVideos);
}
function syncVisualVideos(force=false){
  visualVideos().forEach(video=>{
    if(!Number.isFinite(video.duration)||!video.duration)return;
    const target=loopVideos?audio.currentTime%video.duration:Math.min(audio.currentTime,Math.max(0,video.duration-.05));
    if(force||Math.abs(video.currentTime-target)>.3)try{video.currentTime=target}catch(_){}
  });
}
async function playVisualVideos(){
  syncVisualVideos(true);
  await Promise.all(visualVideos().map(video=>video.play().catch(()=>{})));
}
function pauseVisualVideos(){visualVideos().forEach(video=>video.pause())}
loopVideoBtn.onclick=()=>{loopVideos=!loopVideos;updateLoopButton();syncVisualVideos(true);if(!audio.paused)playVisualVideos()};

coverInput.onchange=e=>loadVisualFile(e.target.files[0],coverMedia,media=>coverMedia=media);
backgroundInput.onchange=e=>{
  const file=e.target.files[0];
  loadVisualFile(file,backgroundMedia,media=>{backgroundMedia=media;backgroundName.textContent=file.name});
};
resetBackgroundBtn.onclick=()=>{
  releaseVisualMedia(backgroundMedia);backgroundMedia=null;backgroundInput.value="";backgroundName.textContent=t("coverDefault");updateLoopButton();
};
descImageInput.onchange=e=>loadVisualFile(e.target.files[0],descMedia,media=>descMedia=media);

audioInput.onchange=async e=>{
  const f=e.target.files[0];if(!f)return;
  audio.src=URL.createObjectURL(f);signalState=null;$("#audioName").textContent=f.name;await ensureAudioGraph();setStatus("audioReady",0);
};

[ratioSelect,qualitySelect].forEach(el=>el.onchange=fitCanvas);

$$("[data-viz]").forEach(b=>b.onclick=()=>{
  $$("[data-viz]").forEach(x=>x.classList.remove("active"));b.classList.add("active");vizSelect.value=b.dataset.viz;
});
$$(".swatch").forEach(b=>b.onclick=()=>{
  $$(".swatch,.color-picker").forEach(x=>x.classList.remove("active"));b.classList.add("active");themeSelect.value=b.dataset.theme;
  document.documentElement.style.setProperty("--accent",getComputedStyle(b).getPropertyValue("--c"));
});
function mixWithWhite(hex,amount){
  const n=parseInt(hex.slice(1),16),channel=shift=>Math.round(((n>>shift)&255)+(255-((n>>shift)&255))*amount);
  return `rgb(${channel(16)},${channel(8)},${channel(0)})`;
}
function applyCustomAccent(){
  const color=accentColor.value;
  THEMES.custom=[color,mixWithWhite(color,.28),mixWithWhite(color,.62)];
  themeSelect.value="custom";
  $$(".swatch,.color-picker").forEach(x=>x.classList.remove("active"));accentColor.classList.add("active");
  document.documentElement.style.setProperty("--accent",color);
}
accentColor.addEventListener("input",applyCustomAccent);
accentColor.addEventListener("change",applyCustomAccent);

function updateSliderLabels(){
  $("#gainVal").textContent=`${(+gainRange.value).toFixed(2)}×`;
  $("#blurVal").textContent=blurRange.value;
  $("#darkenVal").textContent=`${Math.round(+darkenRange.value*100)}%`;
  $("#descWidthVal").textContent=`${descWidth.value}%`;
}
[gainRange,blurRange,darkenRange,descWidth].forEach(x=>x.oninput=updateSliderLabels);

async function loadFont(name){
  name=(name||"Inter").trim();if(!name)return;
  activeFont=name;
  const id="dynamic-google-font";
  let link=document.getElementById(id);if(link)link.remove();
  link=document.createElement("link");link.id=id;link.rel="stylesheet";
  link.href=`https://fonts.googleapis.com/css2?family=${encodeURIComponent(name).replace(/%20/g,"+")}:wght@400;500;600;700;800&display=swap`;
  document.head.appendChild(link);
  try{await document.fonts.load(`700 32px "${name}"`);fontState.textContent="Loaded"}catch(_){fontState.textContent="Requested"}
}

let fontTimer;
fontSearch.addEventListener("input",()=>{clearTimeout(fontTimer);fontTimer=setTimeout(()=>loadFont(fontSearch.value),450)});
fontSearch.addEventListener("change",()=>loadFont(fontSearch.value));

async function loadGoogleFontsCatalog(){
  const fallback=["Inter","Roboto","Open Sans","Lato","Montserrat","Poppins","Oswald","Raleway","Nunito","Merriweather","Playfair Display","Bebas Neue","DM Sans","Manrope","Rubik","Work Sans","Noto Sans","Noto Serif","Noto Sans Arabic","Vazirmatn"];
  let fonts=fallback;
  try{
    const r=await fetch("https://fonts.google.com/metadata/fonts");
    if(r.ok){
      const raw=await r.text(),clean=raw.replace(/^\)\]\}'\n?/,""),data=JSON.parse(clean);
      if(Array.isArray(data.familyMetadataList)) fonts=data.familyMetadataList.map(x=>x.family).filter(Boolean);
    }
  }catch(_){}
  fontList.innerHTML="";
  fonts.forEach(name=>{const o=document.createElement("option");o.value=name;fontList.appendChild(o)});
}
fontSearch.value="Inter";loadGoogleFontsCatalog();loadFont("Inter");

function pointerToCanvas(ev){
  const r=canvas.getBoundingClientRect();return{x:(ev.clientX-r.left)*canvas.width/r.width,y:(ev.clientY-r.top)*canvas.height/r.height};
}
canvas.addEventListener("pointerdown",ev=>{
  const p=pointerToCanvas(ev),b=descHit,c=coverHit,ti=titleHit;
  const v=visualizerHit,mode=getVisualizerMode();
  if(p.x>=b.x&&p.x<=b.x+b.w&&p.y>=b.y&&p.y<=b.y+b.h){
    dragging=true;dragOffset={x:p.x-(b.x+b.w/2),y:p.y-(b.y+b.h/2)};canvas.setPointerCapture(ev.pointerId);canvas.style.cursor="grabbing";
  }else if(p.x>=ti.x&&p.x<=ti.x+ti.w&&p.y>=ti.y&&p.y<=ti.y+ti.h){
    titleDragging=true;pointerDragStart={x:p.x,y:p.y,offsetX:titleOffsetX,offsetY:titleOffsetY,cx:ti.x+ti.w/2,cy:ti.y+ti.h/2};canvas.setPointerCapture(ev.pointerId);canvas.style.cursor="grabbing";
  }else if(p.x>=c.x&&p.x<=c.x+c.w&&p.y>=c.y&&p.y<=c.y+c.h){
    coverDragging=true;pointerDragStart={x:p.x,y:p.y,offsetX:coverOffsetX,offsetY:coverOffsetY,cx:c.x+c.w/2,cy:c.y+c.h/2};canvas.setPointerCapture(ev.pointerId);canvas.style.cursor="grabbing";
  }else if(mode!=="circle"&&p.x>=v.x&&p.x<=v.x+v.w&&p.y>=v.y&&p.y<=v.y+v.h){
    visualizerDragging=true;pointerDragStart={x:p.x,y:p.y,offsetX:visualizerOffsetX,offsetY:visualizerOffsetY,cx:v.x+v.w/2,cy:v.y+v.h/2};canvas.setPointerCapture(ev.pointerId);canvas.style.cursor="grabbing";
  }
});
canvas.addEventListener("pointermove",ev=>{
  const p=pointerToCanvas(ev),b=descHit,c=coverHit,ti=titleHit;
  if(coverDragging){
    coverOffsetX=Math.max(pointerDragStart.offsetX-pointerDragStart.cx,Math.min(pointerDragStart.offsetX+canvas.width-pointerDragStart.cx,pointerDragStart.offsetX+p.x-pointerDragStart.x));
    coverOffsetY=Math.max(pointerDragStart.offsetY-pointerDragStart.cy,Math.min(pointerDragStart.offsetY+canvas.height-pointerDragStart.cy,pointerDragStart.offsetY+p.y-pointerDragStart.y));
  }else if(dragging){
    descX.value=Math.round(Math.max(0,Math.min(100,(p.x-dragOffset.x)/canvas.width*100)));
    descY.value=Math.round(Math.max(0,Math.min(100,(p.y-dragOffset.y)/canvas.height*100)));
  }else if(titleDragging){
    titleOffsetX=Math.max(pointerDragStart.offsetX-pointerDragStart.cx,Math.min(pointerDragStart.offsetX+canvas.width-pointerDragStart.cx,pointerDragStart.offsetX+p.x-pointerDragStart.x));
    titleOffsetY=Math.max(pointerDragStart.offsetY-pointerDragStart.cy,Math.min(pointerDragStart.offsetY+canvas.height-pointerDragStart.cy,pointerDragStart.offsetY+p.y-pointerDragStart.y));
  }else if(visualizerDragging){
    visualizerOffsetX=Math.max(pointerDragStart.offsetX-pointerDragStart.cx,Math.min(pointerDragStart.offsetX+canvas.width-pointerDragStart.cx,pointerDragStart.offsetX+p.x-pointerDragStart.x));
    visualizerOffsetY=Math.max(pointerDragStart.offsetY-pointerDragStart.cy,Math.min(pointerDragStart.offsetY+canvas.height-pointerDragStart.cy,pointerDragStart.offsetY+p.y-pointerDragStart.y));
  }else{
    const v=visualizerHit,onCover=p.x>=c.x&&p.x<=c.x+c.w&&p.y>=c.y&&p.y<=c.y+c.h;
    const onDesc=p.x>=b.x&&p.x<=b.x+b.w&&p.y>=b.y&&p.y<=b.y+b.h;
    const onTitle=p.x>=ti.x&&p.x<=ti.x+ti.w&&p.y>=ti.y&&p.y<=ti.y+ti.h;
    const onVisualizer=getVisualizerMode()!=="circle"&&p.x>=v.x&&p.x<=v.x+v.w&&p.y>=v.y&&p.y<=v.y+v.h;
    canvas.style.cursor=(onCover||onDesc||onTitle||onVisualizer)?"grab":"default";
  }
});
canvas.addEventListener("pointerup",ev=>{coverDragging=false;dragging=false;titleDragging=false;visualizerDragging=false;canvas.style.cursor="default";try{canvas.releasePointerCapture(ev.pointerId)}catch(_){}});
canvas.addEventListener("pointercancel",()=>{coverDragging=false;dragging=false;titleDragging=false;visualizerDragging=false;canvas.style.cursor="default"});

playBtn.onclick=async()=>{
  if(!audio.src){alert(t("needAudio"));return}
  await ensureAudioGraph();if(audioCtx.state==="suspended")await audioCtx.resume();
  if(audio.paused){await playVisualVideos();await audio.play()}else audio.pause();
};

async function exportVideo(){
  if(!audio.src){alert(t("needAudio"));return}
  if(typeof MediaRecorder==="undefined"){alert(t("noRecorder"));return}
  if(typeof canvas.captureStream!=="function"){showExportError(t("noCanvasCapture"));return}

  abortExport=false;setExportDisabled(true);downloadBtn.hidden=true;hintText.textContent=t("hint");stopBtn.disabled=false;chunks=[];setStatus("starting",0);
  let dest,canvasStream,outStream;
  try{
    await ensureAudioGraph();if(audioCtx.state==="suspended")await audioCtx.resume();
    const mime=getRecorderMimeType();
    if(!mime)throw Error(t("unsupportedFormat"));
    canvasStream=canvas.captureStream(30);dest=audioCtx.createMediaStreamDestination();analyser.connect(dest);
    outStream=new MediaStream([...canvasStream.getVideoTracks(),...dest.stream.getAudioTracks()]);
    recorder=new MediaRecorder(outStream,{mimeType:mime,videoBitsPerSecond:qualitySelect.value==="1080"?7000000:4000000});
    recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
    const recorderFailure=new Promise((_,reject)=>recorder.addEventListener("error",e=>reject(e.error||Error("MediaRecorder error")),{once:true}));
    recorder.start(1000);
    audio.currentTime=0;await playVisualVideos();await audio.play();setStatus("rendering",0);

    await Promise.race([waitForRecordingEnd(),recorderFailure]);
    if(recorder.state!=="inactive")await new Promise((resolve,reject)=>{
      recorder.addEventListener("stop",resolve,{once:true});
      recorder.addEventListener("error",e=>reject(e.error||Error("MediaRecorder error")),{once:true});
      recorder.stop();
    });
    if(abortExport){setStatus("stopped",0);return}
    if(!chunks.length)throw Error("The browser produced an empty recording");

    const recordedMime=recorder.mimeType||mime;
    const recordedBlob=new Blob(chunks,{type:recordedMime});
    if(recordedMime.toLowerCase().includes("mp4")){
      offerDownload(recordedBlob,"framebeat-visualizer.mp4");setStatus("done",100);
    }else{
      setStatus("converting",90);
      try{const mp4Blob=await transcodeToMp4(recordedBlob);offerDownload(mp4Blob,"framebeat-visualizer.mp4");setStatus("done",100)}
      catch(err){console.error(err);offerDownload(recordedBlob,"framebeat-visualizer.webm");setStatus("fallback",100)}
    }
  }catch(err){
    console.error(err);audio.pause();
    if(recorder&&recorder.state!=="inactive")try{recorder.stop()}catch(_){}
    showExportError(err&&err.message?err.message:t("exportFailed"));
  }finally{
    if(dest)try{analyser.disconnect(dest)}catch(_){}
    if(canvasStream)canvasStream.getTracks().forEach(track=>track.stop());
    if(outStream)outStream.getTracks().forEach(track=>track.stop());
    setExportDisabled(false);stopBtn.disabled=true;
  }
}
function getRecorderMimeType(){
  const types=["video/mp4;codecs=avc1.42E01E,mp4a.40.2","video/mp4;codecs=h264,aac","video/mp4","video/webm;codecs=vp8,opus","video/webm;codecs=vp9,opus","video/webm"];
  return types.find(type=>MediaRecorder.isTypeSupported(type))||"";
}
function waitForRecordingEnd(){return new Promise(resolve=>{
  const tick=()=>{if(audio.duration)setStatus("rendering",audio.currentTime/audio.duration*88)};
  const finish=()=>{cleanup();resolve()};
  const watch=setInterval(()=>{if(abortExport){audio.pause();cleanup();resolve()}},200);
  const cleanup=()=>{clearInterval(watch);audio.removeEventListener("timeupdate",tick);audio.removeEventListener("ended",finish)};
  audio.addEventListener("timeupdate",tick);audio.addEventListener("ended",finish);
})}
function showExportError(message){statusText.dataset.state="";statusText.textContent=t("exportFailed");hintText.textContent=message;progressBar.style.width="0%"}
function setExportDisabled(disabled){exportBtn.disabled=disabled;mobileExportBtn.disabled=disabled}
exportBtn.onclick=mobileExportBtn.onclick=exportVideo;stopBtn.onclick=()=>abortExport=true;

async function transcodeToMp4(blob){
  if(!window.FFmpegWASM||!window.FFmpegUtil)throw Error("FFmpeg unavailable");
  const {FFmpeg}=window.FFmpegWASM,{fetchFile}=window.FFmpegUtil,ffmpeg=new FFmpeg();
  ffmpeg.on("progress",({progress})=>setStatus("converting",90+progress*10));
  const base="https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd";
  await ffmpeg.load({coreURL:`${base}/ffmpeg-core.js`,wasmURL:`${base}/ffmpeg-core.wasm`});
  await ffmpeg.writeFile("input.webm",await fetchFile(blob));
  await ffmpeg.exec(["-i","input.webm","-c:v","libx264","-preset","veryfast","-crf","20","-pix_fmt","yuv420p","-c:a","aac","-b:a","192k","-movflags","+faststart","output.mp4"]);
  const data=await ffmpeg.readFile("output.mp4");return new Blob([data.buffer],{type:"video/mp4"});
}
function isMobileDownload(){return matchMedia("(max-width: 720px), (pointer: coarse)").matches}
function offerDownload(blob,name){
  if(!isMobileDownload()){downloadBlob(blob,name);return}
  downloadBtn.hidden=false;
  hintText.textContent=t("saveReady");
  downloadBtn.onclick=()=>saveBlobOnMobile(blob,name);
}
async function saveBlobOnMobile(blob,name){
  const file=typeof File!=="undefined"?new File([blob],name,{type:blob.type||"application/octet-stream"}):null;
  if(file&&navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){
    try{await navigator.share({files:[file],title:t("shareTitle")});return}
    catch(err){if(err.name==="AbortError")return}
  }
  downloadBlob(blob,name);
}
function downloadBlob(blob,name){const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},60000)}

audio.addEventListener("loadedmetadata",()=>timeText.textContent=`00:00 / ${fmt(audio.duration)}`);
audio.addEventListener("play",async()=>{
  if(audioCtx?.state==="suspended")try{await audioCtx.resume()}catch(_){}
  playVisualVideos();
});
audio.addEventListener("pause",()=>{pauseVisualVideos();if(signalState){signalState.queue=[];signalState.last=null}});
audio.addEventListener("seeked",()=>{signalState=null;syncVisualVideos(true);if(!audio.paused)playVisualVideos()});
audio.addEventListener("timeupdate",()=>syncVisualVideos());

const dropOverlay=$("#dropOverlay");
const dropTargets=$$(".drop-zone-target");
let dragCounter=0;

function isAudioFile(file){return file&&(file.type.startsWith("audio/")||/\.(mp3|wav|ogg|flac|aac|m4a)$/i.test(file.name))}

function getFileFromEvent(ev){
  if(ev.dataTransfer&&ev.dataTransfer.files&&ev.dataTransfer.files.length>0)return ev.dataTransfer.files[0];
  if(ev.dataTransfer&&ev.dataTransfer.items&&ev.dataTransfer.items.length>0){
    for(let i=0;i<ev.dataTransfer.items.length;i++){
      const item=ev.dataTransfer.items[i];
      if(item.kind==="file")return item.getAsFile();
    }
  }
  return null;
}

function applyDragFile(file){
  if(!file)return;
  if(isAudioFile(file)){
    audio.src=URL.createObjectURL(file);signalState=null;$("#audioName").textContent=file.name;ensureAudioGraph().then(()=>setStatus("audioReady",0));
  }else{
    loadVisualFile(file,coverMedia,media=>coverMedia=media);
  }
}

function applyDragFileToTarget(file,target){
  if(!file)return;
  if(target==="cover"){
    loadVisualFile(file,coverMedia,media=>coverMedia=media);
  }else if(target==="desc"){
    loadVisualFile(file,descMedia,media=>descMedia=media);
  }
}

function applyDragFileToDropzone(file,dz){
  if(!file)return;
  const input=dz.querySelector("input[type=file]");
  if(!input)return;
  if(input.id==="coverInput") loadVisualFile(file,coverMedia,media=>coverMedia=media);
  else if(input.id==="backgroundInput") loadVisualFile(file,backgroundMedia,media=>{backgroundMedia=media;backgroundName.textContent=file.name});
  else if(input.id==="descImageInput") loadVisualFile(file,descMedia,media=>descMedia=media);
  else if(input.id==="audioInput"){
    audio.src=URL.createObjectURL(file);signalState=null;$("#audioName").textContent=file.name;ensureAudioGraph().then(()=>setStatus("audioReady",0));
  }
}

document.addEventListener("dragenter",ev=>{
  ev.preventDefault();
  dragCounter++;
  if(dragCounter===1)dropOverlay.hidden=false;
});
document.addEventListener("dragover",ev=>{
  ev.preventDefault();
  ev.dataTransfer.dropEffect="copy";
});
document.addEventListener("dragleave",ev=>{
  ev.preventDefault();dragCounter--;
  if(dragCounter<=0){dragCounter=0;dropOverlay.hidden=true;dropTargets.forEach(t=>t.classList.remove("drag-hover"))}
});
document.addEventListener("drop",ev=>{
  ev.preventDefault();dragCounter=0;dropOverlay.hidden=true;
  dropTargets.forEach(t=>t.classList.remove("drag-hover"));
  const file=getFileFromEvent(ev);
  applyDragFile(file);
});

dropTargets.forEach(target=>{
  target.addEventListener("dragenter",ev=>{ev.preventDefault();target.classList.add("drag-hover")});
  target.addEventListener("dragover",ev=>{ev.preventDefault();ev.dataTransfer.dropEffect="copy"});
  target.addEventListener("dragleave",()=>target.classList.remove("drag-hover"));
  target.addEventListener("drop",ev=>{
    ev.preventDefault();ev.stopPropagation();dragCounter=0;dropOverlay.hidden=true;
    dropTargets.forEach(t=>t.classList.remove("drag-hover"));
    const file=getFileFromEvent(ev);
    applyDragFileToTarget(file,target.dataset.target);
  });
});

document.querySelectorAll(".dropzone").forEach(dz=>{
  dz.addEventListener("dragover",ev=>{ev.preventDefault();ev.stopPropagation();dz.classList.add("drag-over")});
  dz.addEventListener("dragleave",()=>dz.classList.remove("drag-over"));
  dz.addEventListener("drop",ev=>{
    ev.preventDefault();ev.stopPropagation();dz.classList.remove("drag-over");
    const file=getFileFromEvent(ev);
    applyDragFileToDropzone(file,dz);
  });
});

fitCanvas();updateSliderLabels();applyLanguage();setStatus("ready",0);drawFrame();
