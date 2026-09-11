const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];

const canvas=$("#canvas"),ctx=canvas.getContext("2d"),audio=$("#audio");
const coverInput=$("#coverInput"),backgroundInput=$("#backgroundInput"),audioInput=$("#audioInput"),titleInput=$("#titleInput"),descInput=$("#descInput");
const descImageInput=$("#descImageInput"),fontSearch=$("#fontSearch"),fontList=$("#fontList"),fontState=$("#fontState");
const ratioSelect=$("#ratioSelect"),qualitySelect=$("#qualitySelect"),vizSelect=$("#vizSelect"),themeSelect=$("#themeSelect");
const gainRange=$("#gainRange"),blurRange=$("#blurRange"),darkenRange=$("#darkenRange"),descWidth=$("#descWidth");
const descX=$("#descX"),descY=$("#descY"),descAlign=$("#descAlign"),descStyle=$("#descStyle");
const playBtn=$("#playBtn"),exportBtn=$("#exportBtn"),mobileExportBtn=$("#mobileExportBtn"),downloadBtn=$("#downloadBtn"),stopBtn=$("#stopBtn"),langBtn=$("#langBtn");
const resetBackgroundBtn=$("#resetBackgroundBtn"),backgroundName=$("#backgroundName"),loopVideoBtn=$("#loopVideoBtn");
const statusText=$("#statusText"),progressBar=$("#progressBar"),hintText=$("#hintText"),canvasInfo=$("#canvasInfo"),timeText=$("#timeText");

let coverMedia=null,backgroundMedia=null,descMedia=null,audioCtx=null,analyser=null,sourceNode=null,freqData=null,timeData=null,recorder=null,chunks=[];
let abortExport=false,currentLang="en",activeFont="Inter",loopVideos=true,dragging=false,dragOffset={x:0,y:0},descHit={x:0,y:0,w:0,h:0};

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
  canvas:"Canvas",dragTip:"Drag the description block directly on the canvas",design:"Design",layoutMotion:"Layout & motion",
  ratio:"Aspect ratio",quality:"Quality",visualizer:"Visualizer",accent:"Accent",descriptionLayout:"Description layout",
  alignLeft:"Left",alignCenter:"Center",alignRight:"Right",plain:"Plain",card:"Card",glass:"Glass",
  visualizerGain:"Visualizer gain",backgroundBlur:"Background blur",backgroundShade:"Background shade",
  descWidth:"Description width",position:"Description position",status:"Status",hint:"MP4 is rendered locally in your browser.",
  stop:"Stop export",ready:"Ready",audioReady:"Audio ready",rendering:"Rendering video…",converting:"Converting to MP4…",
  done:"MP4 ready",stopped:"Export stopped",fallback:"MP4 conversion failed; WebM is ready to download",needAudio:"Choose an MP3 file first.",
  noRecorder:"MediaRecorder is not supported in this browser.",trackTitle:"Track title",noFile:"No file selected",
  downloadFile:"Download file",shareTitle:"FrameBeat video",saveReady:"Your video is ready. Tap Download file to save it.",
  starting:"Starting export…",exportFailed:"Export failed",noCanvasCapture:"Video export is not supported by this mobile browser.",unsupportedFormat:"This browser cannot record a supported video format."
 },
 fa:{
  background:"پس‌زمینه",chooseBackground:"انتخاب تصویر یا ویدئو",coverDefault:"به‌صورت پیش‌فرض از کاور استفاده می‌شود",useCover:"استفاده از کاور",loopOn:"تکرار ویدئو: روشن",loopOff:"تکرار ویدئو: خاموش",
  studio:"استودیو ویژوالایزر",preview:"پیش‌نمایش",export:"خروجی MP4",project:"پروژه",assets:"فایل‌ها و محتوا",
  cover:"کاور / تصویر بندانگشتی",chooseCover:"انتخاب تصویر یا ویدئو",audio:"فایل صوتی",chooseAudio:"انتخاب MP3",title:"عنوان",
  description:"توضیحات",optional:"اختیاری",descImage:"رسانه توضیحات",chooseDescImage:"افزودن تصویر یا ویدئو",
  imageHint:"تصویر، گیف یا ویدئو داخل بلوک توضیحات نمایش داده می‌شود",font:"فونت Google",fontHelp:"جست‌وجو کنید یا نام هر Google Font را بنویسید.",
  canvas:"بوم",dragTip:"بلوک توضیحات را مستقیم روی تصویر بکشید و جابه‌جا کنید",design:"طراحی",layoutMotion:"چیدمان و حرکت",
  ratio:"نسبت تصویر",quality:"کیفیت",visualizer:"اکولایزر",accent:"رنگ اصلی",descriptionLayout:"چیدمان توضیحات",
  alignLeft:"چپ",alignCenter:"وسط",alignRight:"راست",plain:"ساده",card:"کارت",glass:"شیشه‌ای",
  visualizerGain:"شدت اکولایزر",backgroundBlur:"محو پس‌زمینه",backgroundShade:"تیرگی پس‌زمینه",
  descWidth:"عرض توضیحات",position:"موقعیت توضیحات",status:"وضعیت",hint:"خروجی MP4 داخل مرورگر ساخته می‌شود.",
  stop:"توقف خروجی",ready:"آماده",audioReady:"فایل صوتی آماده",rendering:"در حال رندر ویدئو…",converting:"در حال تبدیل به MP4…",
  done:"MP4 آماده شد",stopped:"خروجی متوقف شد",fallback:"تبدیل MP4 ناموفق بود؛ WebM آماده دانلود است",needAudio:"ابتدا فایل MP3 را انتخاب کنید.",
  noRecorder:"این مرورگر MediaRecorder را پشتیبانی نمی‌کند.",trackTitle:"عنوان موسیقی",noFile:"فایلی انتخاب نشده",
  downloadFile:"دانلود فایل",shareTitle:"ویدئوی FrameBeat",saveReady:"ویدئو آماده است. برای ذخیره، روی دانلود فایل بزنید.",
  starting:"در حال شروع خروجی…",exportFailed:"ساخت خروجی ناموفق بود",noCanvasCapture:"این مرورگر موبایل از خروجی ویدئو پشتیبانی نمی‌کند.",unsupportedFormat:"مرورگر امکان ضبط با فرمت ویدئویی مناسب را ندارد."
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
  analyser=audioCtx.createAnalyser();analyser.fftSize=2048;analyser.smoothingTimeConstant=.84;
  sourceNode=audioCtx.createMediaElementSource(audio);sourceNode.connect(analyser);analyser.connect(audioCtx.destination);
  freqData=new Uint8Array(analyser.frequencyBinCount);timeData=new Uint8Array(analyser.fftSize);
}

function mediaCover(media,x,y,w,h){
  const mw=media.videoWidth||media.naturalWidth||media.width,mh=media.videoHeight||media.naturalHeight||media.height;
  if(!mw||!mh)return;
  const ir=mw/mh,cr=w/h;let sx=0,sy=0,sw=mw,sh=mh;
  if(ir>cr){sw=mh*cr;sx=(mw-sw)/2}else{sh=mw/cr;sy=(mh-sh)/2}
  ctx.drawImage(media,sx,sy,sw,sh,x,y,w,h);
}

function getCoverLayout(){
  const w=canvas.width,h=canvas.height,min=Math.min(w,h),portrait=ratioSelect.value==="9:16";
  const size=min*(portrait?.46:.31);
  const x=w/2-size/2,y=h*(portrait?.135:.13);
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
  if(!coverMedia)return;
  const {x,y,size,cx,cy}=getCoverLayout();
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
  if(analyser){analyser.getByteFrequencyData(freqData);analyser.getByteTimeDomainData(timeData)}
  else{freqData=freqData||new Uint8Array(1024);timeData=timeData||new Uint8Array(2048).fill(128)}
  const mode=getVisualizerMode();
  if(mode==="circle")return drawCircle();
  if(mode==="wave")return drawWave();
  drawBars(mode==="mirror");
}

function drawBars(mirror){
  const w=canvas.width,h=canvas.height,gain=+gainRange.value,count=Math.max(50,Math.min(120,Math.round(w/16)));
  const width=w*.72,start=w*.14,bw=width/count,gap=bw*.38,base=h*.91,maxH=h*.115;
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
  const w=canvas.width,h=canvas.height,start=w*.13,end=w*.87,y=h*.89,amp=h*.06*+gainRange.value;
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
  ctx.save();ctx.fillStyle="#fff";ctx.textAlign="center";ctx.textBaseline="middle";
  ctx.font=`700 ${Math.round(min*.052)}px ${getFont()}`;ctx.shadowColor="rgba(0,0,0,.48)";ctx.shadowBlur=min*.012;
  ctx.fillText(title,w/2,h*(ratioSelect.value==="9:16"?.58:.59));ctx.restore();
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
  drawBackground();drawCover();drawVisualizer();drawContent();
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
  audio.src=URL.createObjectURL(f);$("#audioName").textContent=f.name;await ensureAudioGraph();setStatus("audioReady",0);
};

[ratioSelect,qualitySelect].forEach(el=>el.onchange=fitCanvas);

$$("[data-viz]").forEach(b=>b.onclick=()=>{
  $$("[data-viz]").forEach(x=>x.classList.remove("active"));b.classList.add("active");vizSelect.value=b.dataset.viz;
});
$$(".swatch").forEach(b=>b.onclick=()=>{
  $$(".swatch").forEach(x=>x.classList.remove("active"));b.classList.add("active");themeSelect.value=b.dataset.theme;
  document.documentElement.style.setProperty("--accent",getComputedStyle(b).getPropertyValue("--c"));
});

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
  const p=pointerToCanvas(ev),b=descHit;
  if(p.x>=b.x&&p.x<=b.x+b.w&&p.y>=b.y&&p.y<=b.y+b.h){
    dragging=true;dragOffset={x:p.x-(b.x+b.w/2),y:p.y-(b.y+b.h/2)};canvas.setPointerCapture(ev.pointerId);canvas.style.cursor="grabbing";
  }
});
canvas.addEventListener("pointermove",ev=>{
  const p=pointerToCanvas(ev),b=descHit;
  if(dragging){
    descX.value=Math.round(Math.max(0,Math.min(100,(p.x-dragOffset.x)/canvas.width*100)));
    descY.value=Math.round(Math.max(0,Math.min(100,(p.y-dragOffset.y)/canvas.height*100)));
  }else{
    canvas.style.cursor=(p.x>=b.x&&p.x<=b.x+b.w&&p.y>=b.y&&p.y<=b.y+b.h)?"grab":"default";
  }
});
canvas.addEventListener("pointerup",ev=>{dragging=false;canvas.style.cursor="default";try{canvas.releasePointerCapture(ev.pointerId)}catch(_){}});
canvas.addEventListener("pointercancel",()=>{dragging=false;canvas.style.cursor="default"});

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
audio.addEventListener("play",playVisualVideos);
audio.addEventListener("pause",pauseVisualVideos);
audio.addEventListener("seeked",()=>{syncVisualVideos(true);if(!audio.paused)playVisualVideos()});
audio.addEventListener("timeupdate",()=>syncVisualVideos());
fitCanvas();updateSliderLabels();applyLanguage();setStatus("ready",0);drawFrame();
