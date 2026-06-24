"use client";


import { useState, useRef, useEffect, useCallback } from "react";

// ── パスワード認証コンポーネント ─────────────────────────────────────────────
const CORRECT_PW = "twin2026";
const PW_KEY = "slide_maker_auth";

function PasswordScreen({ onUnlock }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  const tryLogin = () => {
    if (pw === CORRECT_PW) {
      sessionStorage.setItem(PW_KEY, "ok");
      onUnlock();
    } else {
      setErr("パスワードが違います");
      setPw("");
    }
  };

  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(135deg,#0d0020 0%,#1a0040 50%,#000510 100%)",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"'Noto Sans JP',sans-serif",
    }}>
      <div style={{
        background:"rgba(255,255,255,0.07)",
        border:"1px solid rgba(180,140,255,0.3)",
        borderRadius:20, padding:"40px 32px",
        maxWidth:340, width:"90%", textAlign:"center",
        backdropFilter:"blur(10px)",
      }}>
        <div style={{fontSize:48,marginBottom:12}}>🎬</div>
        <h2 style={{color:"#fff",fontSize:20,fontWeight:900,margin:"0 0 6px",
          fontFamily:"'Cormorant Garamond',serif"}}>スライド動画メーカー</h2>
        <p style={{color:"rgba(255,255,255,0.55)",fontSize:13,margin:"0 0 20px"}}>
          パスワードを入力してください
        </p>
        <input
          type="password"
          value={pw}
          onChange={e=>{setPw(e.target.value);setErr("");}}
          onKeyDown={e=>e.key==="Enter"&&tryLogin()}
          placeholder="パスワードを入力"
          style={{
            width:"100%", padding:"14px 16px", borderRadius:12,
            border:"2px solid rgba(180,140,255,0.4)",
            background:"rgba(255,255,255,0.1)", color:"#fff",
            fontSize:18, textAlign:"center", letterSpacing:4,
            outline:"none", fontFamily:"inherit", boxSizing:"border-box",
          }}
          autoFocus
        />
        <button
          onClick={tryLogin}
          style={{
            marginTop:14, width:"100%", padding:14, border:"none",
            borderRadius:12,
            background:"linear-gradient(135deg,#8040d0,#c060d0)",
            color:"#fff", fontSize:16, fontWeight:900, cursor:"pointer",
            fontFamily:"inherit", letterSpacing:1,
            boxShadow:"0 4px 20px rgba(160,80,255,0.4)",
          }}
        >
          入力する
        </button>
        {err && <div style={{color:"#ff8080",fontSize:13,marginTop:10}}>{err}</div>}
      </div>
    </div>
  );
}

// ── QR ────────────────────────────────────────────────────────────────────────
function qrSrc(text, size = 200) {
  if (!text) return null;
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&format=png`;
}

// ── roundRect polyfill ────────────────────────────────────────────────────────
function safeRoundRect(ctx, x, y, w, h, r) {
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y); ctx.arcTo(x+w,y,x+w,y+r,r);
    ctx.lineTo(x + w, y + h - r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
    ctx.lineTo(x + r, y + h); ctx.arcTo(x,y+h,x,y+h-r,r);
    ctx.lineTo(x, y + r); ctx.arcTo(x,y,x+r,y,r);
    ctx.closePath();
  }
}

// ── Constants ─────────────────────────────────────────────────────────────────
const VW = 1080, VH = 1920, FPS = 30;

const EFFECTS = [
  { id:"none",      label:"なし" },
  { id:"particles", label:"✨ 光粒子" },
  { id:"stars",     label:"⭐ 星降り" },
  { id:"ripple",    label:"🌊 波紋" },
  { id:"aurora",    label:"🌌 オーロラ" },
  { id:"confetti",  label:"🎉 紙吹雪" },
];
const FONT_OPTS = [
  { id:"cormorant", label:"エレガント",   css:"'Cormorant Garamond',serif" },
  { id:"noto",      label:"スタンダード", css:"'Noto Sans JP',sans-serif" },
  { id:"rounded",   label:"ポップ",       css:"'M PLUS Rounded 1c',sans-serif" },
];
const SOLID_COLORS = [
  { id:"night",    label:"夜空",     v:["#0d0020","#1a0040","#000510"] },
  { id:"dawn",     label:"夜明け",   v:["#1a0530","#4a1560","#0a0520"] },
  { id:"gold",     label:"ゴールド", v:["#1a1000","#3a2800","#0a0800"] },
  { id:"forest",   label:"森",       v:["#001a08","#003018","#000e05"] },
  { id:"ocean",    label:"海",       v:["#000d1a","#001a30","#000508"] },
  { id:"rose",     label:"ローズ",   v:["#1a0010","#380020","#0a0008"] },
  { id:"white",    label:"白",       v:["#f8f6ff","#ede8ff","#f0f4ff"] },
  { id:"cream",    label:"クリーム", v:["#fdf6ec","#f5ead8","#faf2e4"] },
  { id:"charcoal", label:"濃灰",     v:["#1a1a1a","#2a2a2a","#111111"] },
  { id:"sakura",   label:"桜",       v:["#ffe8f0","#ffd0e0","#fff0f5"] },
  { id:"navy",     label:"ネイビー", v:["#050820","#0a1040","#020510"] },
  { id:"matcha",   label:"抹茶",     v:["#102010","#1a3020","#080f08"] },
];
const OVERLAY_OPTS = [
  { id:"none",     label:"なし",       value:null },
  { id:"lavender", label:"ラベンダー", value:"rgba(150,100,200,0.35)" },
  { id:"midnight", label:"ネイビー",   value:"rgba(10,10,60,0.45)" },
  { id:"gold",     label:"ゴールド",   value:"rgba(180,140,40,0.25)" },
  { id:"rose",     label:"ローズ",     value:"rgba(200,80,120,0.30)" },
  { id:"aqua",     label:"アクア",     value:"rgba(40,180,200,0.30)" },
  { id:"warm",     label:"ウォーム",   value:"rgba(220,160,60,0.25)" },
  { id:"dark",     label:"暗め",       value:"rgba(0,0,0,0.45)" },
];

const TEMPLATES = [
  { label:"🔮 占い・ヒーリング", slides:[
    { mainText:"あなたに光が届きますように", subText:"今日も、ありのままで美しい", solidColor:"dawn", effect:"aurora", overlay:"lavender", font:"cormorant", fontSize:72, textColor:"#ffe0ff", duration:6 },
    { mainText:"無料鑑定受付中", subText:"詳しくはプロフィールのリンクから", solidColor:"night", effect:"stars", overlay:"midnight", font:"cormorant", fontSize:68, textColor:"#ffffff", duration:5, qrUrl:"https://twinkle-lab.jp", qrLabel:"Twinkle Lab" },
  ]},
  { label:"🍽️ 飲食店・カフェ", slides:[
    { mainText:"本日のおすすめ", subText:"シェフ特製ランチコース", solidColor:"cream", effect:"none", overlay:"warm", font:"noto", fontSize:80, textColor:"#3a1a00", duration:5 },
    { mainText:"ご予約はこちら", subText:"当日予約もOKです", solidColor:"cream", effect:"confetti", overlay:"none", font:"noto", fontSize:72, textColor:"#3a1a00", duration:5, qrUrl:"https://example.com", qrLabel:"予約ページ" },
  ]},
  { label:"💄 美容・サロン", slides:[
    { mainText:"新メニュー登場", subText:"トリートメント 60分 ¥8,800", solidColor:"rose", effect:"particles", overlay:"rose", font:"cormorant", fontSize:76, textColor:"#fff0f5", duration:5 },
    { mainText:"初回限定 20%OFF", subText:"お気軽にご相談ください", solidColor:"rose", effect:"ripple", overlay:"none", font:"cormorant", fontSize:68, textColor:"#fff0f5", duration:5, qrUrl:"https://example.com", qrLabel:"予約する" },
  ]},
  { label:"🏠 不動産・住宅", slides:[
    { mainText:"新築物件のご紹介", subText:"駅徒歩5分 ・ 3LDK", solidColor:"navy", effect:"none", overlay:"midnight", font:"noto", fontSize:74, textColor:"#e0f0ff", duration:5 },
    { mainText:"無料相談受付中", subText:"お気軽にお問い合わせを", solidColor:"navy", effect:"stars", overlay:"midnight", font:"noto", fontSize:68, textColor:"#e0f0ff", duration:5, qrUrl:"https://example.com", qrLabel:"詳細を見る" },
  ]},
  { label:"🌿 農業・食品", slides:[
    { mainText:"旬の野菜　直送します", subText:"農薬不使用・こだわりの農場から", solidColor:"matcha", effect:"particles", overlay:"none", font:"noto", fontSize:70, textColor:"#d0ffd0", duration:5 },
    { mainText:"ご注文はこちら", subText:"送料無料キャンペーン実施中", solidColor:"matcha", effect:"ripple", overlay:"none", font:"noto", fontSize:68, textColor:"#d0ffd0", duration:5, qrUrl:"https://example.com", qrLabel:"ショップを見る" },
  ]},
  { label:"📣 イベント告知", slides:[
    { mainText:"イベント開催決定！", subText:"日時：○月○日（土）13:00〜", solidColor:"gold", effect:"confetti", overlay:"gold", font:"rounded", fontSize:76, textColor:"#fff8e0", duration:5 },
    { mainText:"参加申込受付中", subText:"定員限定・お早めに！", solidColor:"gold", effect:"stars", overlay:"gold", font:"rounded", fontSize:68, textColor:"#fff8e0", duration:5, qrUrl:"https://example.com", qrLabel:"申し込む" },
  ]},
  { label:"🕌 ハラルフード", slides:[
    { mainText:"Halal Certified\nハラル認証取得", subText:"安心してお召し上がりください", solidColor:"forest", effect:"particles", overlay:"none", font:"noto", fontSize:72, textColor:"#c8ffc8", duration:6 },
    { mainText:"ご注文・お問い合わせ", subText:"aslink.tokyo", solidColor:"forest", effect:"ripple", overlay:"none", font:"noto", fontSize:68, textColor:"#c8ffc8", duration:5, qrUrl:"https://aslink.tokyo", qrLabel:"ASlink" },
  ]},
];

let _sid = 0;
function makeSlide(o = {}) {
  return {
    id: ++_sid, duration: 5,
    bgType: "solid", solidColor: "night", image: null,
    overlay: "none", effect: "particles",
    mainText: "", subText: "",
    font: "cormorant", fontSize: 72, textColor: "#ffffff",
    textAlign: "center", textValign: "middle",
    textShadow: true, textVertical: false,
    qrUrl: "", qrLabel: "", qrSize: 180, qrPosition: "bottom",
    ttsText: "",
    ...o,
  };
}

function initFx(type) {
  if (type === "ripple") return Array.from({length:12},()=>({x:Math.random()*VW,y:Math.random()*VH,r:Math.random()*80,maxR:Math.random()*200+100,speed:Math.random()*0.8+0.4}));
  if (type === "confetti") return Array.from({length:80},()=>({x:Math.random()*VW,y:Math.random()*-VH,vx:(Math.random()-0.5)*4,vy:Math.random()*4+2,r:Math.random()*10+4,color:["#ff6b9d","#ffd700","#7ec8e3","#c8e3a0","#ffb347","#da70d6"][Math.floor(Math.random()*6)],rot:Math.random()*Math.PI*2,rotV:(Math.random()-0.5)*0.1}));
  return Array.from({length:type==="aurora"?40:80},()=>({x:Math.random()*VW,y:Math.random()*VH,r:Math.random()*(type==="stars"?3:4)+1,vx:(Math.random()-0.5)*0.6,vy:type==="stars"?Math.random()*1.5+0.5:(Math.random()-0.5)*0.6,phase:Math.random()*Math.PI*2,speed:Math.random()*0.03+0.01}));
}

function drawFx(ctx, type, state, frame, scale) {
  if (type==="none"||!state?.length) return;
  ctx.save(); ctx.scale(scale,scale);
  if (type==="ripple") {
    state.forEach(rp=>{
      rp.r+=rp.speed; if(rp.r>rp.maxR){rp.r=0;rp.x=Math.random()*VW;rp.y=Math.random()*VH;rp.maxR=Math.random()*200+100;}
      ctx.save();ctx.globalAlpha=(1-rp.r/rp.maxR)*0.5;ctx.strokeStyle="rgba(200,180,255,1)";ctx.lineWidth=1.5;
      ctx.beginPath();ctx.arc(rp.x,rp.y,rp.r,0,Math.PI*2);ctx.stroke();ctx.restore();
    });
  } else if (type==="confetti") {
    state.forEach(p=>{
      p.x+=p.vx;p.y+=p.vy;p.rot+=p.rotV;
      if(p.y>VH+20){p.y=-20;p.x=Math.random()*VW;}
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle=p.color;ctx.globalAlpha=0.85;
      ctx.fillRect(-p.r/2,-p.r/4,p.r,p.r/2);ctx.restore();
    });
  } else {
    state.forEach(p=>{
      const a=(Math.sin(p.phase+frame/FPS*p.speed*5)+1)/2;
      ctx.save();ctx.globalAlpha=a*0.85;
      if(type==="aurora"){
        const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*6);
        g.addColorStop(0,"rgba(160,100,255,0.9)");g.addColorStop(0.5,"rgba(80,200,220,0.5)");g.addColorStop(1,"rgba(0,0,0,0)");
        ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(p.x,p.y,p.r*6,p.r*2,p.phase,0,Math.PI*2);ctx.fill();
      } else {
        const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r);
        if(type==="stars"){g.addColorStop(0,"rgba(255,240,200,1)");g.addColorStop(1,"rgba(255,240,200,0)");}
        else{g.addColorStop(0,"rgba(220,180,255,1)");g.addColorStop(1,"rgba(180,140,255,0)");}
        ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
      }
      p.x+=p.vx;p.y+=p.vy;
      if(p.x<0)p.x=VW;if(p.x>VW)p.x=0;
      if(p.y>VH){p.y=0;p.x=Math.random()*VW;}if(p.y<0)p.y=VH;
      ctx.restore();
    });
  }
  ctx.restore();
}

function wrapText(ctx, text, maxW) {
  const lines=[];
  (text||"").split("\n").forEach(para=>{
    let line="";
    for(const ch of para){if(ctx.measureText(line+ch).width>maxW&&line){lines.push(line);line=ch;}else line+=ch;}
    lines.push(line);
  });
  return lines;
}

function hexRgba(hex, a) {
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}

function easeAlpha(frame, totalF) {
  const fd = 0.8 * FPS;
  let t = 1;
  if (frame < fd) t = frame / fd;
  else if (frame > totalF - fd) t = (totalF - frame) / fd;
  return Math.sin((Math.max(0, Math.min(1, t)) * Math.PI) / 2);
}

function drawVerticalText(ctx, text, x, y, lh) {
  [...text].forEach((ch, i) => ctx.fillText(ch, x, y + i * lh));
}

function drawFrame(ctx, slide, frame, totalF, fxState, qrImg, logoImg, global, scale=1) {
  const w=ctx.canvas.width, h=ctx.canvas.height;
  ctx.clearRect(0,0,w,h);
  if(slide.bgType==="image"&&slide.image?.obj){
    const img=slide.image.obj,ratio=img.width/img.height,cr=w/h;
    let dx=0,dy=0,dw=w,dh=h;
    if(ratio>cr){dw=h*ratio;dx=(w-dw)/2;}else{dh=w/ratio;dy=(h-dh)/2;}
    ctx.drawImage(img,dx,dy,dw,dh);
  } else {
    const sc=SOLID_COLORS.find(c=>c.id===slide.solidColor)||SOLID_COLORS[0];
    const bg=ctx.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,sc.v[0]);bg.addColorStop(0.5,sc.v[1]);bg.addColorStop(1,sc.v[2]);
    ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
  }
  const ov=OVERLAY_OPTS.find(o=>o.id===slide.overlay);
  if(ov?.value){ctx.fillStyle=ov.value;ctx.fillRect(0,0,w,h);}
  drawFx(ctx,slide.effect,fxState,frame,scale);
  const alpha = easeAlpha(frame, totalF);
  const fontCss=FONT_OPTS.find(f=>f.id===slide.font)?.css||FONT_OPTS[0].css;
  const fs=Math.round(slide.fontSize*scale);
  const subFs=Math.round(fs*0.52);
  const pad=Math.round(70*scale);
  const hAlign=slide.textAlign||"center";
  const maxW=w-pad*2;
  if(slide.textShadow){ctx.shadowColor="rgba(0,0,0,0.75)";ctx.shadowBlur=22*scale;}
  if(slide.textVertical) {
    const lh=fs*1.3;
    const mainChars=[...(slide.mainText||"")];
    const subChars=[...(slide.subText||"")];
    const totalW=(mainChars.length?1:0)*fs+(subChars.length?1:0)*subFs+pad;
    let baseX=w/2+totalW/2-fs/2;
    const startY=h/2-mainChars.length*lh/2;
    ctx.font=`300 ${fs}px ${fontCss}`;ctx.textAlign="center";
    ctx.fillStyle=hexRgba(slide.textColor,alpha);
    drawVerticalText(ctx,slide.mainText||"",baseX,startY+fs,lh);
    if(slide.subText){
      baseX-=fs+pad*0.3;
      ctx.font=`300 ${subFs}px ${fontCss}`;
      ctx.fillStyle=hexRgba(slide.textColor,alpha*0.8);
      drawVerticalText(ctx,slide.subText,baseX,startY+subFs,subFs*1.3);
    }
  } else {
    const textX=hAlign==="center"?w/2:hAlign==="left"?pad:w-pad;
    ctx.textAlign=hAlign;
    ctx.font=`300 ${fs}px ${fontCss}`;
    ctx.fillStyle=hexRgba(slide.textColor,alpha);
    const mainLines=wrapText(ctx,slide.mainText,maxW);
    const lh=fs*1.55,subLh=subFs*1.6;
    const mainH=mainLines.length*lh;
    const subLines=wrapText(ctx,slide.subText,maxW);
    const gap=Math.round(20*scale);
    const totalTextH=mainH+(subLines.length>0?gap+subLines.length*subLh:0);
    const vp=slide.textValign||"middle";
    let baseY=vp==="middle"?h/2-totalTextH/2+fs*0.4:vp==="top"?pad*2.5+fs:h-pad*2-totalTextH+fs;
    mainLines.forEach((ln,i)=>ctx.fillText(ln,textX,baseY+i*lh));
    if(subLines.length>0){
      ctx.font=`300 ${subFs}px ${fontCss}`;
      ctx.fillStyle=hexRgba(slide.textColor,alpha*0.8);
      subLines.forEach((ln,i)=>ctx.fillText(ln,textX,baseY+mainH+gap+i*subLh));
    }
  }
  ctx.shadowBlur=0;ctx.shadowColor="transparent";
  if(qrImg&&slide.qrUrl){
    const qs=Math.round(slide.qrSize*scale),qp=Math.round(20*scale);
    let qx,qy;
    if(slide.qrPosition==="bottom"){qx=w/2-qs/2;qy=h-qs-pad;}
    else if(slide.qrPosition==="center"){qx=w/2-qs/2;qy=h/2-qs/2;}
    else{qx=w-qs-qp;qy=h-qs-qp;}
    ctx.save();ctx.globalAlpha=alpha;
    ctx.fillStyle="#ffffff";
    ctx.beginPath();safeRoundRect(ctx,qx-qp/2,qy-qp/2,qs+qp,qs+qp,12*scale);ctx.fill();
    ctx.drawImage(qrImg,qx,qy,qs,qs);
    if(slide.qrLabel){
      ctx.font=`400 ${Math.round(26*scale)}px ${fontCss}`;
      ctx.fillStyle="#222";ctx.textAlign="center";
      ctx.fillText(slide.qrLabel,qx+qs/2,qy+qs+Math.round(28*scale));
    }
    ctx.restore();
  }
  if(logoImg&&global.logoEnabled){
    const ls=Math.round(global.logoSize*scale),lp=Math.round(16*scale);
    const pos=global.logoPosition||"bottomRight";
    let lx=w-ls-lp,ly=h-ls-lp;
    if(pos==="topLeft"){lx=lp;ly=lp;}
    else if(pos==="topRight"){lx=w-ls-lp;ly=lp;}
    else if(pos==="bottomLeft"){lx=lp;ly=h-ls-lp;}
    ctx.save();ctx.globalAlpha=(global.logoOpacity||0.7)*alpha;
    ctx.drawImage(logoImg,lx,ly,ls,ls);ctx.restore();
  }
}

function useQrImg(url, size) {
  const [img,setImg]=useState(null);
  useEffect(()=>{
    if(!url){setImg(null);return;}
    const i=new Image();i.crossOrigin="anonymous";
    i.onload=()=>setImg(i);i.onerror=()=>setImg(null);
    i.src=qrSrc(url,size);
  },[url,size]);
  return img;
}

function speak(text){
  if(typeof window==="undefined"||!window.speechSynthesis)return;
  window.speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  u.lang="ja-JP";u.rate=0.9;
  window.speechSynthesis.speak(u);
}
function stopSpeak(){
  if(typeof window!=="undefined")window.speechSynthesis?.cancel();
}

// ── メインアプリ ──────────────────────────────────────────────────────────────
function SlideVideoApp() {
  useEffect(()=>{
    if(document.getElementById("slide-video-fonts")) return;
    const fl=document.createElement("link");
    fl.id="slide-video-fonts"; fl.rel="stylesheet";
    fl.href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Noto+Sans+JP:wght@300;400;700&family=M+PLUS+Rounded+1c:wght@300;400&display=swap";
    document.head.appendChild(fl);
  },[]);

  const [slides, setSlides] = useState([
    makeSlide({mainText:"あなたに光が届きますように",subText:"今日も、ありのままで美しい",effect:"aurora",solidColor:"dawn",overlay:"lavender",font:"cormorant",fontSize:72,textColor:"#ffe0ff",duration:6}),
    makeSlide({mainText:"詳しくはこちら",subText:"twinkle-lab.jp",qrUrl:"https://twinkle-lab.jp",qrLabel:"Twinkle Lab",effect:"stars",solidColor:"night",duration:5}),
  ]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [previewSlide, setPreviewSlide] = useState(0);
  const [tab, setTab] = useState("bg");
  const [recording, setRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState(null);
  const [recordError, setRecordError] = useState("");
  const [recordDone, setRecordDone] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [global, setGlobal] = useState({
    logoEnabled:false, logoSize:120, logoPosition:"bottomRight", logoOpacity:0.7, logoImage:null,
    bgmEnabled:false, bgmFile:null, bgmVolume:0.6, bgmLoop:true,
  });

  const previewCanvasRef = useRef(null);
  const recordCanvasRef  = useRef(null);
  const fxRef     = useRef({});
  const frameRef  = useRef(0);
  const slidesRef = useRef(slides); slidesRef.current = slides;
  const globalRef = useRef(global); globalRef.current = global;
  const logoImgRef= useRef(null);

  const sl = slides[activeSlide] || slides[0];
  const qrImg = useQrImg(sl.qrUrl, sl.qrSize);
  const totalDuration = slides.reduce((a,s)=>a+s.duration,0);

  useEffect(()=>{
    slides.forEach(s=>{
      const k=`${s.id}-${s.effect}`;
      if(!fxRef.current[k]) fxRef.current[k]=initFx(s.effect);
    });
  },[slides]);

  useEffect(()=>{
    if(!global.logoImage){logoImgRef.current=null;return;}
    const img=new Image();img.onload=()=>logoImgRef.current=img;img.src=global.logoImage;
  },[global.logoImage]);

  useEffect(()=>{
    const canvas=previewCanvasRef.current;if(!canvas)return;
    let raf;
    const loop=()=>{
      const all=slidesRef.current;
      const totalF=all.reduce((a,s)=>a+s.duration*FPS,0)||1;
      frameRef.current=(frameRef.current+1)%totalF;
      const frame=frameRef.current;
      let elapsed=0,si=0;
      for(let i=0;i<all.length;i++){const sf=all[i].duration*FPS;if(frame<elapsed+sf){si=i;break;}elapsed+=sf;}
      setPreviewSlide(si);
      const cur=all[si];
      const lf=frame-elapsed,tf=cur.duration*FPS;
      const k=`${cur.id}-${cur.effect}`;
      const fxState=fxRef.current[k]||[];
      const qEl=document.getElementById(`qr-hidden-${cur.id}`);
      drawFrame(canvas.getContext("2d"),cur,lf,tf,fxState,qEl,logoImgRef.current,globalRef.current,canvas.width/VW);
      raf=requestAnimationFrame(loop);
    };
    raf=requestAnimationFrame(loop);
    return()=>cancelAnimationFrame(raf);
  },[]);

  const updateSlide = useCallback((idx,patch)=>{setSlides(p=>p.map((s,i)=>i===idx?{...s,...patch}:s));setVideoUrl(null);setRecordDone(false);},[]);
  const updateGlobal = useCallback((patch)=>setGlobal(p=>({...p,...patch})),[]);

  const addSlide=()=>{const s=makeSlide();setSlides(p=>[...p,s]);setActiveSlide(slides.length);setTab("bg");};
  const removeSlide=(idx)=>{if(slides.length<=1)return;setSlides(p=>p.filter((_,i)=>i!==idx));setActiveSlide(i=>Math.min(i,slides.length-2));};
  const moveSlide=(from,to)=>{if(to<0||to>=slides.length)return;setSlides(p=>{const n=[...p];[n[from],n[to]]=[n[to],n[from]];return n;});setActiveSlide(to);};
  const dupSlide=(idx)=>{const s={...slides[idx],id:++_sid};setSlides(p=>[...p.slice(0,idx+1),s,...p.slice(idx+1)]);setActiveSlide(idx+1);};

  const applyTemplate=(tpl)=>{setSlides(tpl.slides.map(s=>makeSlide(s)));setActiveSlide(0);setShowTemplates(false);setVideoUrl(null);setRecordDone(false);};

  const saveProject=()=>{
    const data=slides.map(s=>({...s,image:s.image?{src:s.image.src}:null}));
    const blob=new Blob([JSON.stringify({slides:data,global:{...global,bgmFile:null}})],{type:"application/json"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="project.json";a.click();
  };
  const loadProject=(e)=>{
    const f=e.target.files[0];if(!f)return;
    const r=new FileReader();
    r.onload=ev=>{
      try{
        const {slides:sd,global:gl}=JSON.parse(ev.target.result);
        const loaded=sd.map(s=>{
          const ns=makeSlide(s);
          if(s.image?.src){const img=new Image();img.onload=()=>setSlides(p=>p.map(x=>x.id===ns.id?{...x,image:{src:s.image.src,obj:img}}:x));img.src=s.image.src;ns.image={src:s.image.src,obj:null};}
          return ns;
        });
        setSlides(loaded);if(gl)setGlobal(g=>({...g,...gl}));
      }catch(e){alert("ファイルの読み込みに失敗しました");}
    };
    r.readAsText(f);
  };

  const handleRecord=async()=>{
    if(recording)return;
    setRecording(true);setProgress(0);setVideoUrl(null);setRecordError("");setRecordDone(false);
    slides.forEach(s=>{fxRef.current[`${s.id}-${s.effect}`]=initFx(s.effect);});
    try {
      const canvas=recordCanvasRef.current;
      canvas.width=VW;canvas.height=VH;
      const ctx=canvas.getContext("2d");
      const mime=["video/webm;codecs=vp9","video/webm;codecs=vp8","video/webm"].find(m=>MediaRecorder.isTypeSupported(m));
      if(!mime) throw new Error("このブラウザは動画録画に対応していません（Chrome推奨）");
      let audioStream=null,audioCtx=null;
      if(global.bgmEnabled&&global.bgmFile){
        try{
          audioCtx=new AudioContext();
          const buf=await global.bgmFile.arrayBuffer();
          const decoded=await audioCtx.decodeAudioData(buf);
          const src=audioCtx.createBufferSource();
          src.buffer=decoded;src.loop=global.bgmLoop;
          const gain=audioCtx.createGain();gain.gain.value=global.bgmVolume;
          const dest=audioCtx.createMediaStreamDestination();
          src.connect(gain);gain.connect(dest);src.start();
          audioStream=dest.stream;
        }catch(e){console.warn("BGM error",e);}
      }
      const videoStream=canvas.captureStream(FPS);
      const tracks=[...videoStream.getTracks(),...(audioStream?audioStream.getTracks():[])];
      const stream=new MediaStream(tracks);
      const rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:12_000_000});
      const chunks=[];
      rec.ondataavailable=e=>e.data.size&&chunks.push(e.data);
      rec.onstop=()=>{
        try{
          const blob=new Blob(chunks,{type:mime});
          setVideoUrl(URL.createObjectURL(blob));
          setRecordDone(true);
        } catch(e){setRecordError("動画の生成に失敗しました");}
        finally{setRecording(false);setProgress(100);audioCtx?.close();}
      };
      rec.onerror=(e)=>{setRecordError(`録画エラー: ${e.error?.message||"不明"}`);setRecording(false);audioCtx?.close();};
      rec.start();
      const total=slides.reduce((a,s)=>a+s.duration*FPS,0);
      let done=0;
      for(const slide of slides){
        let qImg=null;
        if(slide.qrUrl){qImg=await new Promise(res=>{const i=new Image();i.crossOrigin="anonymous";i.onload=()=>res(i);i.onerror=()=>res(null);i.src=qrSrc(slide.qrUrl,slide.qrSize);});}
        const sf=slide.duration*FPS;
        const fxState=fxRef.current[`${slide.id}-${slide.effect}`];
        for(let lf=0;lf<sf;lf++,done++){
          drawFrame(ctx,slide,lf,sf,fxState,qImg,logoImgRef.current,globalRef.current,1);
          setProgress(Math.round((done/total)*99));
          await new Promise(r=>requestAnimationFrame(r));
        }
      }
      rec.stop();
    } catch(err) {
      setRecordError(err.message||"録画に失敗しました");
      setRecording(false);
    }
  };

  const handleSpeak=()=>{
    if(speaking){stopSpeak();setSpeaking(false);return;}
    const text=slides.map(s=>s.ttsText||s.mainText||"").filter(Boolean).join("。");
    speak(text);setSpeaking(true);
    setTimeout(()=>setSpeaking(false),text.length*200+3000);
  };

  return(
    <div style={{minHeight:"100vh",background:"#0f0f14",color:"#e8e0ff",fontFamily:"'Noto Sans JP',sans-serif",display:"flex",flexDirection:"column",padding:"20px 16px 60px",gap:20}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:11,letterSpacing:6,color:"#a080d0",marginBottom:4}}>SLIDE VIDEO MAKER v2.1</div>
        <h1 style={{margin:0,fontSize:24,fontFamily:"'Cormorant Garamond',serif",fontWeight:300,background:"linear-gradient(90deg,#c080ff,#fff0ff,#80c8ff)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
          スライド動画メーカー
        </h1>
        <p style={{margin:"4px 0 0",fontSize:11,opacity:0.45}}>BGM・ロゴ・縦書き・テンプレート対応 — 占い・飲食・美容・ハラルなんでも</p>
        <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:12,flexWrap:"wrap"}}>
          <SmBtn onClick={()=>setShowTemplates(v=>!v)}>🎨 テンプレート</SmBtn>
          <SmBtn onClick={saveProject}>💾 保存</SmBtn>
          <label style={{...smBtnStyle,cursor:"pointer"}}>📂 読込<input type="file" accept=".json" style={{display:"none"}} onChange={loadProject}/></label>
        </div>
      </div>

      {showTemplates&&(
        <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(180,140,255,0.2)",borderRadius:14,padding:"16px",maxWidth:860,margin:"0 auto",width:"100%"}}>
          <div style={{fontSize:11,color:"#c0a0ff",letterSpacing:2,marginBottom:12}}>🎨 テンプレートを選択（現在のスライドは上書きされます）</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {TEMPLATES.map((t,i)=>(
              <button key={i} onClick={()=>applyTemplate(t)} style={{padding:"8px 16px",borderRadius:20,border:"1px solid rgba(180,140,255,0.3)",background:"rgba(255,255,255,0.05)",color:"#e0d0ff",cursor:"pointer",fontSize:12}}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{display:"flex",gap:20,flexWrap:"wrap",justifyContent:"center"}}>
        <div style={{flex:"1 1 340px",maxWidth:430,display:"flex",flexDirection:"column",gap:14}}>
          <Panel title={`📋 スライド一覧（合計 ${totalDuration}秒）`}>
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {slides.map((s,i)=>(
                <div key={s.id} onClick={()=>setActiveSlide(i)}
                  style={{display:"flex",alignItems:"center",gap:8,padding:"9px 12px",borderRadius:10,
                    background:i===activeSlide?"rgba(160,80,255,0.2)":"rgba(255,255,255,0.04)",
                    border:`1px solid ${i===activeSlide?"rgba(160,80,255,0.6)":"rgba(255,255,255,0.08)"}`,
                    cursor:"pointer",transition:"all 0.15s"}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:i===previewSlide?"#c080ff":"#333",flexShrink:0}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:"bold",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                      {i+1}. {s.mainText||(s.qrUrl?"[QRスライド]":"(空)")}
                    </div>
                    <div style={{fontSize:10,opacity:0.45}}>{s.duration}秒 · {s.effect} · {s.bgType==="image"?"画像":"カラー"}{s.textVertical?" · 縦書き":""}</div>
                  </div>
                  <div style={{display:"flex",gap:3,flexShrink:0}}>
                    <IconBtn onClick={e=>{e.stopPropagation();dupSlide(i)}} title="複製">⊕</IconBtn>
                    <IconBtn onClick={e=>{e.stopPropagation();moveSlide(i,i-1)}} title="上へ">▲</IconBtn>
                    <IconBtn onClick={e=>{e.stopPropagation();moveSlide(i,i+1)}} title="下へ">▼</IconBtn>
                    <IconBtn onClick={e=>{e.stopPropagation();removeSlide(i)}} danger>✕</IconBtn>
                  </div>
                </div>
              ))}
              <button onClick={addSlide} style={{...btnStyle,background:"rgba(255,255,255,0.06)",fontSize:13}}>＋ スライドを追加</button>
            </div>
          </Panel>

          <div style={{display:"flex",gap:3,borderBottom:"1px solid rgba(255,255,255,0.08)",paddingBottom:8,flexWrap:"wrap"}}>
            {[["bg","🖼 背景"],["text","✍ テキスト"],["effect","✨ FX"],["qr","🔗 QR"],["tts","🔊 読上"],["global","⚙️ 全体"]].map(([id,lbl])=>(
              <button key={id} onClick={()=>setTab(id)} style={{flex:"1 1 auto",padding:"6px 4px",fontSize:10.5,border:"none",borderRadius:6,cursor:"pointer",
                background:tab===id?"rgba(160,80,255,0.35)":"rgba(255,255,255,0.05)",
                color:tab===id?"#e0c0ff":"#8070a0"}}>
                {lbl}
              </button>
            ))}
          </div>

          {tab==="bg"&&(
            <Panel title="🖼 背景設定">
              <Row label="📸 背景画像（任意）">
                <label style={uploadLabelStyle}>
                  {sl.image?"🖼 画像を変更する":"＋ 画像をアップロード"}
                  <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>{
                    const f=e.target.files[0];if(!f)return;
                    const r=new FileReader();r.onload=ev=>{const img=new Image();img.onload=()=>updateSlide(activeSlide,{image:{src:ev.target.result,obj:img},bgType:"image"});img.src=ev.target.result;};r.readAsDataURL(f);
                  }}/>
                </label>
                {sl.image&&(
                  <div style={{position:"relative",marginTop:6}}>
                    <img src={sl.image.src} alt="" style={{width:"100%",height:90,objectFit:"cover",borderRadius:8,opacity:0.85}}/>
                    <button onClick={()=>updateSlide(activeSlide,{image:null,bgType:"solid"})}
                      style={{position:"absolute",top:4,right:4,background:"rgba(0,0,0,0.6)",border:"none",borderRadius:4,color:"#ff8080",cursor:"pointer",fontSize:11,padding:"2px 7px"}}>✕ 削除</button>
                    <div style={{position:"absolute",bottom:4,left:6,fontSize:10,color:"#c0ffc0",background:"rgba(0,0,0,0.55)",padding:"1px 6px",borderRadius:4}}>✅ 画像使用中</div>
                  </div>
                )}
              </Row>
              <Row label={sl.bgType==="image"?"🎨 カラー（画像なし時）":"🎨 背景カラー"}>
                <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:6}}>
                  {SOLID_COLORS.map(c=>(
                    <button key={c.id} onClick={()=>updateSlide(activeSlide,{solidColor:c.id})} title={c.label}
                      style={{width:30,height:30,borderRadius:7,border:sl.solidColor===c.id?"2px solid #c080ff":"2px solid transparent",
                        background:`linear-gradient(135deg,${c.v[0]},${c.v[1]})`,cursor:"pointer"}}/>
                  ))}
                </div>
                {sl.bgType==="image"&&(
                  <button onClick={()=>updateSlide(activeSlide,{bgType:"solid",image:null})}
                    style={{fontSize:11,padding:"4px 10px",border:"1px solid rgba(255,140,140,0.4)",borderRadius:6,background:"rgba(200,60,60,0.15)",color:"#ffaaaa",cursor:"pointer"}}>
                    🗑 画像を外してカラーに戻す
                  </button>
                )}
              </Row>
              <Row label="🎨 オーバーレイ">
                <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                  {OVERLAY_OPTS.map(o=><Chip key={o.id} active={sl.overlay===o.id} onClick={()=>updateSlide(activeSlide,{overlay:o.id})}>{o.label}</Chip>)}
                </div>
              </Row>
              <Row label={`⏱ 表示秒数: ${sl.duration}秒`}>
                <input type="range" min={2} max={15} value={sl.duration} onChange={e=>updateSlide(activeSlide,{duration:+e.target.value})} style={{width:"100%",accentColor:"#c080ff"}}/>
              </Row>
            </Panel>
          )}

          {tab==="text"&&(
            <Panel title="✍ テキスト設定">
              <Row label="メインテキスト">
                <textarea value={sl.mainText} onChange={e=>updateSlide(activeSlide,{mainText:e.target.value})} rows={3} style={taStyle} placeholder="例：あなたに光が届きますように"/>
              </Row>
              <Row label="サブテキスト">
                <textarea value={sl.subText} onChange={e=>updateSlide(activeSlide,{subText:e.target.value})} rows={2} style={taStyle} placeholder="例：本日も素敵な一日を"/>
              </Row>
              <Row label="フォント">
                <select value={sl.font} onChange={e=>updateSlide(activeSlide,{font:e.target.value})} style={selectStyle}>
                  {FONT_OPTS.map(f=><option key={f.id} value={f.id}>{f.label}</option>)}
                </select>
              </Row>
              <Row label={`文字サイズ: ${sl.fontSize}px`}>
                <input type="range" min={28} max={140} value={sl.fontSize} onChange={e=>updateSlide(activeSlide,{fontSize:+e.target.value})} style={{width:"100%",accentColor:"#c080ff"}}/>
              </Row>
              <Row label="文字色">
                <div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap"}}>
                  <input type="color" value={sl.textColor} onChange={e=>updateSlide(activeSlide,{textColor:e.target.value})} style={{width:38,height:28,border:"none",background:"none",cursor:"pointer"}}/>
                  {["#ffffff","#ffe0ff","#fffde0","#d0ffe0","#e0f0ff","#ffd0a0","#222222"].map(c=>(
                    <button key={c} onClick={()=>updateSlide(activeSlide,{textColor:c})}
                      style={{width:22,height:22,borderRadius:4,background:c,border:sl.textColor===c?"2px solid #c080ff":"1px solid #555",cursor:"pointer"}}/>
                  ))}
                </div>
              </Row>
              <Row label="テキスト方向">
                <div style={{display:"flex",gap:6}}>
                  <Chip active={!sl.textVertical} onClick={()=>updateSlide(activeSlide,{textVertical:false})}>横書き</Chip>
                  <Chip active={!!sl.textVertical} onClick={()=>updateSlide(activeSlide,{textVertical:true})}>縦書き 🈀</Chip>
                </div>
              </Row>
              {!sl.textVertical&&<>
                <Row label="横位置">
                  <div style={{display:"flex",gap:6}}>
                    {[["center","中央"],["left","左"],["right","右"]].map(([v,l])=><Chip key={v} active={sl.textAlign===v} onClick={()=>updateSlide(activeSlide,{textAlign:v})}>{l}</Chip>)}
                  </div>
                </Row>
                <Row label="縦位置">
                  <div style={{display:"flex",gap:6}}>
                    {[["middle","中央"],["top","上"],["bottom","下"]].map(([v,l])=><Chip key={v} active={sl.textValign===v} onClick={()=>updateSlide(activeSlide,{textValign:v})}>{l}</Chip>)}
                  </div>
                </Row>
              </>}
              <Row label="シャドウ">
                <Chip active={sl.textShadow} onClick={()=>updateSlide(activeSlide,{textShadow:!sl.textShadow})}>{sl.textShadow?"ON":"OFF"}</Chip>
              </Row>
            </Panel>
          )}

          {tab==="effect"&&(
            <Panel title="✨ エフェクト">
              <Row label="エフェクト">
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {EFFECTS.map(ef=><Chip key={ef.id} active={sl.effect===ef.id} onClick={()=>updateSlide(activeSlide,{effect:ef.id})}>{ef.label}</Chip>)}
                </div>
              </Row>
            </Panel>
          )}

          {tab==="qr"&&<QRPanel slide={sl} slideIdx={activeSlide} updateSlide={updateSlide}/>}

          {tab==="tts"&&(
            <Panel title="🔊 テキスト読み上げ">
              <p style={{fontSize:11,opacity:0.55,margin:"0 0 8px"}}>プレビュー用。動画ファイルには含まれません。</p>
              <Row label="読み上げテキスト（空欄＝メインテキスト使用）">
                <textarea value={sl.ttsText} onChange={e=>updateSlide(activeSlide,{ttsText:e.target.value})} rows={3} style={taStyle} placeholder={sl.mainText||"テキストを入力"}/>
              </Row>
              <div style={{display:"flex",gap:8,marginTop:6}}>
                <button onClick={handleSpeak} style={{...btnStyle,background:speaking?"rgba(200,60,60,0.4)":"rgba(60,160,100,0.35)",flex:1}}>
                  {speaking?"⏹ 停止":"▶ 全スライド読み上げ"}
                </button>
                <button onClick={()=>speak(sl.ttsText||sl.mainText||"")} style={{...btnStyle,background:"rgba(60,100,200,0.3)"}}>
                  このスライドのみ
                </button>
              </div>
            </Panel>
          )}

          {tab==="global"&&(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <Panel title="🎵 BGM設定">
                <Row label="BGMを使用する">
                  <Chip active={global.bgmEnabled} onClick={()=>updateGlobal({bgmEnabled:!global.bgmEnabled})}>
                    {global.bgmEnabled?"ON — BGMあり":"OFF — 無音"}
                  </Chip>
                </Row>
                {global.bgmEnabled&&(
                  <>
                    <Row label="音楽ファイル（MP3/WAV/M4A）">
                      <label style={uploadLabelStyle}>
                        {global.bgmFile?"🎵 変更する":"＋ 音楽ファイルをアップ"}
                        <input type="file" accept="audio/*" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(!f)return;updateGlobal({bgmFile:f});}}/>
                      </label>
                      {global.bgmFile&&<div style={{fontSize:11,opacity:0.6,marginTop:4}}>✅ {global.bgmFile.name}</div>}
                    </Row>
                    <Row label={`音量: ${Math.round(global.bgmVolume*100)}%`}>
                      <input type="range" min={0} max={1} step={0.05} value={global.bgmVolume} onChange={e=>updateGlobal({bgmVolume:+e.target.value})} style={{width:"100%",accentColor:"#c080ff"}}/>
                    </Row>
                    <Row label="ループ">
                      <Chip active={global.bgmLoop} onClick={()=>updateGlobal({bgmLoop:!global.bgmLoop})}>{global.bgmLoop?"ループON":"ループOFF"}</Chip>
                    </Row>
                    <p style={{fontSize:10,opacity:0.45,margin:0}}>※ 著作権フリー音源をご使用ください。</p>
                  </>
                )}
              </Panel>
              <Panel title="🏷️ ロゴ・透かし（全スライド共通）">
                <Row label="ロゴを表示する">
                  <Chip active={global.logoEnabled} onClick={()=>updateGlobal({logoEnabled:!global.logoEnabled})}>{global.logoEnabled?"ON":"OFF"}</Chip>
                </Row>
                {global.logoEnabled&&(
                  <>
                    <Row label="ロゴ画像">
                      <label style={uploadLabelStyle}>
                        {global.logoImage?"🖼 変更する":"＋ ロゴをアップロード"}
                        <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>updateGlobal({logoImage:ev.target.result});r.readAsDataURL(f);}}/>
                      </label>
                      {global.logoImage&&<img src={global.logoImage} alt="" style={{width:60,height:60,objectFit:"contain",marginTop:6,background:"rgba(255,255,255,0.1)",padding:4,borderRadius:6}}/>}
                    </Row>
                    <Row label={`サイズ: ${global.logoSize}px`}>
                      <input type="range" min={40} max={300} value={global.logoSize} onChange={e=>updateGlobal({logoSize:+e.target.value})} style={{width:"100%",accentColor:"#c080ff"}}/>
                    </Row>
                    <Row label={`透明度: ${Math.round(global.logoOpacity*100)}%`}>
                      <input type="range" min={0.1} max={1} step={0.05} value={global.logoOpacity} onChange={e=>updateGlobal({logoOpacity:+e.target.value})} style={{width:"100%",accentColor:"#c080ff"}}/>
                    </Row>
                    <Row label="位置">
                      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                        {[["topLeft","左上"],["topRight","右上"],["bottomLeft","左下"],["bottomRight","右下"]].map(([v,l])=>(
                          <Chip key={v} active={global.logoPosition===v} onClick={()=>updateGlobal({logoPosition:v})}>{l}</Chip>
                        ))}
                      </div>
                    </Row>
                  </>
                )}
              </Panel>
            </div>
          )}
        </div>

        <div style={{flex:"0 0 auto",display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
          <div style={{position:"relative"}}>
            <div style={{width:258,height:458,borderRadius:16,overflow:"hidden",border:"1px solid rgba(160,100,255,0.3)",boxShadow:"0 0 40px rgba(120,60,220,0.3)"}}>
              <canvas ref={previewCanvasRef} width={258} height={458} style={{display:"block",width:"100%",height:"100%"}}/>
            </div>
            <div style={{position:"absolute",top:8,left:8,background:"rgba(0,0,0,0.6)",padding:"2px 8px",borderRadius:5,fontSize:10,color:"#c0a0ff",letterSpacing:1}}>LIVE</div>
            <div style={{position:"absolute",bottom:8,right:8,background:"rgba(0,0,0,0.6)",padding:"2px 8px",borderRadius:5,fontSize:10,color:"#a0c0ff"}}>{previewSlide+1}/{slides.length}</div>
          </div>

          <div style={{width:258,display:"flex",flexDirection:"column",gap:10}}>
            <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(160,100,255,0.15)",borderRadius:12,padding:"12px 14px"}}>
              <div style={{fontSize:10,color:"#c0a0ff",letterSpacing:2,marginBottom:6}}>📤 動画を生成</div>
              <div style={{fontSize:10,opacity:0.45,marginBottom:10}}>
                合計 {totalDuration}秒 · {slides.length}スライド<br/>
                出力: 1080×1920 縦型
                {global.bgmEnabled&&global.bgmFile?" · BGMあり":""}
                {global.logoEnabled&&global.logoImage?" · ロゴあり":""}
              </div>
              <button onClick={handleRecord} disabled={recording} style={{...btnStyle,width:"100%",
                background:recording?"rgba(80,50,120,0.4)":"linear-gradient(135deg,#8040d0,#c060d0)",
                boxShadow:recording?"none":"0 4px 20px rgba(160,80,255,0.4)",fontSize:14,fontWeight:"bold"}}>
                {recording?`🎬 生成中 ${progress}%`:"🎬 動画を生成"}
              </button>
              {recording&&(
                <div style={{marginTop:8,height:4,background:"rgba(255,255,255,0.1)",borderRadius:2}}>
                  <div style={{height:"100%",width:`${progress}%`,background:"linear-gradient(90deg,#8040d0,#c060d0)",borderRadius:2,transition:"width 0.1s"}}/>
                </div>
              )}
              {recordError&&(
                <div style={{marginTop:8,padding:"8px 10px",background:"rgba(200,60,60,0.2)",border:"1px solid rgba(255,100,100,0.4)",borderRadius:8,fontSize:11,color:"#ffaaaa"}}>
                  ⚠️ {recordError}
                </div>
              )}
              {recordDone&&!recording&&(
                <div style={{marginTop:8,padding:"6px 10px",background:"rgba(60,200,100,0.2)",border:"1px solid rgba(100,255,140,0.4)",borderRadius:8,fontSize:11,color:"#a0ffb0",textAlign:"center"}}>
                  ✅ ダウンロード準備完了！
                </div>
              )}
            </div>
            {videoUrl&&(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <video src={videoUrl} controls width={258} style={{borderRadius:12,background:"#000"}}/>
                <a href={videoUrl} download="slide-video.webm" style={{display:"block",textAlign:"center",textDecoration:"none",padding:"11px 0",borderRadius:10,background:"linear-gradient(135deg,#304080,#6040a0)",color:"#e0d0ff",fontSize:13,fontWeight:"bold",letterSpacing:1}}>
                  ⬇️ ダウンロード (.webm)
                </a>
                {!mp4Url&&(<button onClick={()=>convertToMp4(videoUrl)} disabled={converting} style={{padding:"11px 0",border:"none",borderRadius:10,background:converting?"rgba(80,50,20,0.6)":"linear-gradient(135deg,#804020,#c06020)",color:"#fff8e0",fontSize:13,fontWeight:"bold",cursor:"pointer",width:"100%",marginTop:4}}>{converting?`🔄 MP4変換中 ${mp4Progress}%`:"📱 MP4に変換する（Instagram・TikTok用）"}</button>)}
                {converting&&(<div style={{height:4,background:"rgba(255,255,255,0.1)",borderRadius:2,marginTop:4}}><div style={{height:"100%",width:`${mp4Progress}%`,background:"linear-gradient(90deg,#804020,#c06020)",borderRadius:2,transition:"width 0.3s"}}/></div>)}
                {mp4Error&&(<div style={{padding:"8px 10px",background:"rgba(200,60,60,0.2)",border:"1px solid rgba(255,100,100,0.4)",borderRadius:8,fontSize:11,color:"#ffaaaa",marginTop:4}}>⚠️ {mp4Error}</div>)}
                {mp4Url&&(<a href={mp4Url} download="slide-video.mp4" style={{display:"block",textAlign:"center",textDecoration:"none",padding:"13px 0",borderRadius:10,background:"linear-gradient(135deg,#206040,#40a060)",color:"#e0ffe0",fontSize:14,fontWeight:"bold",letterSpacing:1,marginTop:4}}>✅ MP4ダウンロード</a>)}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{display:"none"}}>
        {slides.map(s=>s.qrUrl&&<img key={s.id} id={`qr-hidden-${s.id}`} src={qrSrc(s.qrUrl,s.qrSize)} crossOrigin="anonymous" alt=""/>)}
      </div>
      <canvas ref={recordCanvasRef} style={{display:"none"}}/>
    </div>
  );
}

// ── QRPanel ───────────────────────────────────────────────────────────────────
function QRPanel({slide, slideIdx, updateSlide}) {
  const [url,   setUrl]   = useState(slide.qrUrl      || "");
  const [label, setLabel] = useState(slide.qrLabel    || "");
  const [size,  setSize]  = useState(slide.qrSize     || 180);
  const [pos,   setPos]   = useState(slide.qrPosition || "bottom");
  const prevIdx = useRef(slideIdx);

  useEffect(()=>{
    if(prevIdx.current!==slideIdx){
      setUrl(slide.qrUrl||"");setLabel(slide.qrLabel||"");
      setSize(slide.qrSize||180);setPos(slide.qrPosition||"bottom");
      prevIdx.current=slideIdx;
    }
  },[slideIdx,slide]);

  const commit=useCallback(()=>
    updateSlide(slideIdx,{qrUrl:url,qrLabel:label,qrSize:size,qrPosition:pos})
  ,[slideIdx,url,label,size,pos,updateSlide]);

  return(
    <Panel title="🔗 QRコード設定">
      <Row label="URL（入力後、枠外クリックで反映）">
        <input value={url} onChange={e=>setUrl(e.target.value)} onBlur={commit}
          style={inputStyle} placeholder="https://example.com"/>
      </Row>
      <Row label="ラベルテキスト">
        <input value={label} onChange={e=>setLabel(e.target.value)} onBlur={commit}
          style={inputStyle} placeholder="例：詳細はこちら"/>
      </Row>
      <Row label={`QRサイズ: ${size}px`}>
        <input type="range" min={100} max={400} value={size}
          onChange={e=>setSize(+e.target.value)}
          onMouseUp={commit} onTouchEnd={commit}
          style={{width:"100%",accentColor:"#c080ff"}}/>
      </Row>
      <Row label="位置">
        <div style={{display:"flex",gap:6}}>
          {[["bottom","下部"],["center","中央"],["overlay","右下"]].map(([v,l])=>(
            <Chip key={v} active={pos===v} onClick={()=>{setPos(v);updateSlide(slideIdx,{qrUrl:url,qrLabel:label,qrSize:size,qrPosition:v});}}>{l}</Chip>
          ))}
        </div>
      </Row>
      {url?(
        <div style={{textAlign:"center",marginTop:6}}>
          <img src={qrSrc(url,size)} crossOrigin="anonymous" alt="QR" style={{width:90,height:90,background:"#fff",padding:5,borderRadius:8}}/>
          <div style={{fontSize:10,opacity:0.45,marginTop:3}}>QRプレビュー</div>
        </div>
      ):(
        <div style={{textAlign:"center",opacity:0.35,fontSize:12,padding:"10px 0"}}>
          URLを入力 → 枠外クリックでQR生成
        </div>
      )}
    </Panel>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function Panel({title,children}){return(<div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(180,140,255,0.12)",borderRadius:12,padding:"14px 16px"}}><div style={{fontSize:11,color:"#c0a0ff",letterSpacing:2,marginBottom:12}}>{title}</div><div style={{display:"flex",flexDirection:"column",gap:12}}>{children}</div></div>);}
function Row({label,children}){return(<div><div style={{fontSize:10,opacity:0.45,marginBottom:5,letterSpacing:0.5}}>{label}</div>{children}</div>);}
function Chip({active,onClick,children}){return(<button onClick={onClick} style={{padding:"5px 12px",borderRadius:20,fontSize:11,cursor:"pointer",border:active?"1.5px solid #c080ff":"1.5px solid rgba(180,140,255,0.25)",background:active?"rgba(160,80,255,0.25)":"rgba(255,255,255,0.04)",color:active?"#e0c0ff":"#9080b0",letterSpacing:0.5,transition:"all 0.15s"}}>{children}</button>);}
function IconBtn({onClick,children,danger,title}){return(<button onClick={onClick} title={title} style={{width:22,height:22,padding:0,border:"none",borderRadius:4,background:danger?"rgba(200,60,60,0.25)":"rgba(255,255,255,0.07)",color:danger?"#ff8080":"#a080c0",cursor:"pointer",fontSize:10}}>{children}</button>);}
function SmBtn({onClick,children}){return(<button onClick={onClick} style={smBtnStyle}>{children}</button>);}

const btnStyle={padding:"10px 16px",border:"none",borderRadius:10,color:"#e0d0ff",cursor:"pointer",letterSpacing:0.5,transition:"all 0.15s"};
const smBtnStyle={padding:"6px 14px",border:"1px solid rgba(180,140,255,0.25)",borderRadius:20,background:"rgba(255,255,255,0.06)",color:"#c0a0ff",cursor:"pointer",fontSize:12,letterSpacing:0.5};
const taStyle={width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(180,140,255,0.2)",borderRadius:8,color:"#e8d8ff",padding:"8px 10px",fontSize:13,fontFamily:"'Noto Sans JP',sans-serif",resize:"vertical",outline:"none",boxSizing:"border-box"};
const inputStyle={width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(180,140,255,0.2)",borderRadius:8,color:"#e8d8ff",padding:"8px 10px",fontSize:13,outline:"none",boxSizing:"border-box"};
const selectStyle={width:"100%",background:"rgba(30,20,50,0.9)",border:"1px solid rgba(180,140,255,0.2)",borderRadius:8,color:"#e8d8ff",padding:"7px 10px",fontSize:12,outline:"none"};
const uploadLabelStyle={display:"flex",alignItems:"center",justifyContent:"center",padding:"10px 16px",background:"rgba(255,255,255,0.05)",border:"1.5px dashed rgba(180,140,255,0.4)",borderRadius:10,cursor:"pointer",fontSize:12,color:"#c0a0ff"};

// ── ルートコンポーネント（認証ゲート付き） ─────────────────────────────────
export default function SlideVideoMaker() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setAuthed(sessionStorage.getItem(PW_KEY) === "ok");
    }
  }, []);

  if (!authed) {
    return <PasswordScreen onUnlock={() => setAuthed(true)} />;
  }
  return <SlideVideoApp />;
}
