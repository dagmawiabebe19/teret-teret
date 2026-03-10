import { useState, useEffect, useRef, useMemo, useCallback } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const FREE_STORY_LIMIT = 3;

// ── UI translations for all 3 languages
const UI = {
  am: {
    subtitle: "አስማታዊ የኢትዮጵያ የጸሎተ ሌሊት ታሪኮች ✨",
    badge: "G · ለሁሉም ዕድሜ · ለልጆች ደህና",
    savedBtn: "📚 የተቀመጡ ታሪኮቼ",
    nameLabel: "⭐ የልጅዎ ስም",
    namePlaceholder: "ለምሳሌ: ሰላም, ዳዊት, ምህረት, ሊያ...",
    ageLabel: "🎂 የዕድሜ ቡድን",
    traitLabel: "💫 ባህሪያቸው...",
    regionLabel: "🏔️ ታሪኩ የት ይካሄድ?",
    generateBtn: "🌙 ታሪክ ንገሩኝ!",
    freeLeft: (n) => `${n} ነፃ ታሪክ ቀሩ`,
    loading: ["ጥንታዊ ተረተኛውን እየጠሩ...","ከደጋ ታሪኮችን እየሰበሰቡ...","ወዳጅ አንበሳ እያዳመጠ...","ለታሪኩ ጃቤና እያፈሉ...","የኢትዮጵያ ኮከቦች እየሰለፉ...","ልጅዎን ወደ ታሪኩ እየጠቀሙ...","ሽማግሌዎቹ ጥበብ እያካፈሉ...","ዝግጅቱ ተጠናቀቀ — እሳቱ ተቀጣጠለ...","በዩካሊፕቱስ ዛፍ ውስጥ ነፋስ...","ጄላዳ ዝንጀሮዎቹ እየዘፈኑ..."],
    exitBtn: "✕ ውጣ",
    continueHint: "ለቀጣዩ ጫን",
    finishHint: "ለመጨረሻ ጫን",
    endTitle: "ጣፋጭ ህልም",
    endSub: "ታሪኩ ሄደ ዘንቢሉ መጣ",
    anotherBtn: "✨ ሌላ ታሪክ!",
    homeBtn: "← ዋና ገጽ",
    copyBtn: "📋 ቅዳ",
    copiedBtn: "✅ ተቀድቷል",
    saveBtn: "💾 ቀምጥ",
    savedConfirm: "⭐ ተቀምጧል!",
    ageOpts: ["2–4 ዓ","5–7 ዓ","8–12 ዓ"],
    traits: ["በጣም ደፋር ነው","እንስሳትን ይወዳል","ለሁሉ ነገር ጉጉ ነው","ለሁሉም ደግ ነው","መደነስ ይወዳል","በጣም አስቂኝ ነው","ከአያቱ ጋር እንጀራ ማዘጋጀት ይወዳል","ብዙ ጥያቄዎችን ይጠይቃሉ","አብራሪ መሆን ይፈልጋሉ","እግር ኳስ ይወዳሉ","አያቱን ከኢትዮጵያ ናፍቃቸዋል","መሳል እና ቀለም መቀባት ይወዳሉ","በክፍሉ ፈጣኑ ሯጭ ነው","መዘፈን ይወዳሉ","አስቸጋሪ ነው ግን እጅግ ብልህ ነው","ጀብደኝነትን ይወዳሉ"],
  },
  en: {
    subtitle: "Magical Ethiopian Bedtime Stories ✨",
    badge: "G · ALL AGES · CHILD SAFE",
    savedBtn: "📚 My Saved Stories",
    nameLabel: "⭐ Child's name",
    namePlaceholder: "e.g. Selam, Dawit, Mekdes, Liya...",
    ageLabel: "🎂 Age group",
    traitLabel: "💫 They are...",
    regionLabel: "🏔️ Where should the story happen?",
    generateBtn: "🌙 Tell Me a Story!",
    freeLeft: (n) => `${n} free ${n===1?"story":"stories"} left`,
    loading: ["Calling the ancient storyteller...","Gathering tales from the highlands...","The friendly lion is listening...","Brewing jebena for the story circle...","The stars over Ethiopia are aligning...","Weaving your child into the story...","The wise elder is sharing wisdom...","Almost ready — the fire is lit...","Listening to the wind in the eucalyptus...","The gelada baboons are singing..."],
    exitBtn: "✕ Exit",
    continueHint: "tap to continue",
    finishHint: "tap to finish",
    endTitle: "Sweet Dreams",
    endSub: "The story went, the basket came",
    anotherBtn: "✨ Tell Another Story!",
    homeBtn: "← Home",
    copyBtn: "📋 Copy",
    copiedBtn: "✅ Copied",
    saveBtn: "💾 Save",
    savedConfirm: "⭐ Saved!",
    ageOpts: ["2–4 yrs","5–7 yrs","8–12 yrs"],
    traits: ["is very brave","loves animals","is curious about everything","is kind to everyone","loves to dance","is very funny","loves to cook injera with grandma","asks too many questions","wants to be a pilot","loves football","misses grandma in Ethiopia","loves to draw and paint","is the fastest runner in class","loves singing","is very shy but very smart","loves adventure"],
  },
  es: {
    subtitle: "Cuentos mágicos etíopes para dormir ✨",
    badge: "G · TODAS EDADES · SEGURO",
    savedBtn: "📚 Mis cuentos guardados",
    nameLabel: "⭐ Nombre del niño/a",
    namePlaceholder: "ej. Selam, Dawit, Mekdes, Liya...",
    ageLabel: "🎂 Grupo de edad",
    traitLabel: "💫 Él/ella es...",
    regionLabel: "🏔️ ¿Dónde ocurre el cuento?",
    generateBtn: "🌙 ¡Cuéntame un cuento!",
    freeLeft: (n) => `${n} cuento${n===1?"":"s"} gratis restante${n===1?"":"s"}`,
    loading: ["Llamando al cuentista ancestral...","Reuniendo historias de las montañas...","El amigable león está escuchando...","Preparando jebena para el círculo...","Las estrellas de Etiopía se alinean...","Tejiendo a tu hijo/a en el cuento...","El anciano sabio comparte su sabiduría...","Casi listo — el fuego está encendido...","Escuchando el viento en los eucaliptos...","Los gelada están cantando..."],
    exitBtn: "✕ Salir",
    continueHint: "toca para continuar",
    finishHint: "toca para terminar",
    endTitle: "Dulces Sueños",
    endSub: "El cuento se fue, la cesta llegó",
    anotherBtn: "✨ ¡Otro cuento!",
    homeBtn: "← Inicio",
    copyBtn: "📋 Copiar",
    copiedBtn: "✅ Copiado",
    saveBtn: "💾 Guardar",
    savedConfirm: "⭐ ¡Guardado!",
    ageOpts: ["2–4 años","5–7 años","8–12 años"],
    traits: ["es muy valiente","ama a los animales","es curioso/a sobre todo","es amable con todos","ama bailar","es muy gracioso/a","cocina injera con su abuela","hace demasiadas preguntas","quiere ser piloto","ama el fútbol","extraña a su abuela en Etiopía","ama dibujar y pintar","es el/la más rápido/a de su clase","ama cantar","es muy tímido/a pero muy inteligente","ama la aventura"],
  },
};

const AGES = [
  { value: "2-4", detail: "very short (under 200 words), extremely simple words, one tiny gentle challenge, very soothing" },
  { value: "5-7", detail: "short (250-350 words), simple words, one clear challenge with a happy resolution" },
  { value: "8-12", detail: "medium (400-550 words), richer vocabulary, more interesting challenge, deeper moral lesson" },
];

const TRAITS_EN = UI.en.traits; // always use English for API prompt

const REGIONS = [
  { name: "Addis Ababa",       detail: "the busy, colorful streets and eucalyptus forests of Ethiopia's capital city" },
  { name: "Lalibela",          detail: "the ancient rock-hewn churches and misty mountains of Lalibela" },
  { name: "Axum",              detail: "the ancient kingdom of Axum with its towering obelisks and stone ruins" },
  { name: "Gondar",            detail: "the royal castles and highland meadows of Gondar" },
  { name: "Lake Tana",         detail: "the shores of Lake Tana where hippos rest and monasteries sit on islands" },
  { name: "Simien Mountains",  detail: "the dramatic cliffs and misty peaks of the Simien Mountains" },
  { name: "Bale Mountains",    detail: "the cloud forests and alpine meadows of the Bale Mountains" },
  { name: "Harar",             detail: "the ancient walled city of Harar with its colorful markets and narrow alleys" },
  { name: "Omo Valley",        detail: "the lush Omo Valley where the great river meets ancient communities" },
  { name: "Kaffa forests",     detail: "the dense green forests of Kaffa — the birthplace of coffee itself" },
  { name: "Afar lowlands",     detail: "the volcanic Afar lowlands where hot springs bubble and salt caravans pass" },
  { name: "Rift Valley lakes", detail: "the Rift Valley lakes where thousands of flamingos paint the water pink" },
  { name: "Tigray highlands",  detail: "the rugged red rock highlands of Tigray dotted with cliff-top churches" },
  { name: "Gambella wetlands", detail: "the lush wetlands of Gambella where the Nile begins its long journey" },
  { name: "Dire Dawa",         detail: "the warm, bustling crossroads city of Dire Dawa" },
];

const ANIMALS = ["🦁","🐊","🦅","🐆","🐘","🦒","🦓","🦔","🐒","🦩"];

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────
function buildSystemPrompt(age) {
  const ageObj = AGES.find(a => a.value === age) || AGES[1];
  return `You are Aya — an ancient Ethiopian storyteller.

CONTENT RATING: G — STRICTLY ALL AGES. NEVER include violence, death, scary content, romance, adult themes, or cruel villains. All conflicts resolve through kindness or cleverness. All endings are warm and comforting.

AGE GROUP: ${ageObj.detail}

OUTPUT FORMAT — CRITICAL: Output ONLY clean story paragraphs with NO markdown, NO headers, NO dashes, NO asterisks. Format EXACTLY like this for every paragraph:

[AM] Amharic paragraph here.
[EN] English translation here.
[ES] Spanish translation here.

Every paragraph group MUST have all three lines. No other text anywhere.

STORY STRUCTURE:
1. Open [AM] with "ተረት ተረት..."
2. Vivid scene in the specific Ethiopian location
3. Child hero by exact name, appears at least 4 times
4. ONE friendly Ethiopian animal (hyena, lion, fox, gelada baboon, Ethiopian wolf, ibis, flamingo)
5. Gentle challenge of kindness or friendship
6. Wise elder with a real Ethiopian proverb
7. Hero solves it through humility, community, generosity
8. Warm moral lesson
9. End final [AM] with "ተረቱ ሄደ ዘንቢሉ መጣ"

DETAILS: injera, shiro, jebena, netela, gabi, eucalyptus trees, Blue Nile, highland mist.
NEVER use markdown. ONLY [AM]/[EN]/[ES] blocks.`;
}

// ─── PARSE STORY ─────────────────────────────────────────────────────────────
function parseStory(rawText) {
  const lines = rawText.split("\n");
  const pages = [];
  let cur = { am:"", en:"", es:"" };
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    if (t.startsWith("[AM]")) { if (cur.am) pages.push({...cur}); cur = { am:t.replace(/^\[AM\]\s*/,""), en:"", es:"" }; }
    else if (t.startsWith("[EN]")) cur.en = t.replace(/^\[EN\]\s*/,"");
    else if (t.startsWith("[ES]")) cur.es = t.replace(/^\[ES\]\s*/,"");
  }
  if (cur.am) pages.push({...cur});
  return pages.filter(p => p.am || p.en);
}

// ─── STARS ───────────────────────────────────────────────────────────────────
function Stars() {
  const stars = useMemo(() => Array.from({length:28},(_,i)=>({
    id:i, x:(i*37.3+11)%100, y:(i*53.7+7)%100,
    size:(i%3)+1, delay:(i*0.4)%4, dur:2+(i%3),
  })),[]);
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
      {stars.map(s=>(
        <div key={s.id} style={{position:"absolute",left:`${s.x}%`,top:`${s.y}%`,width:s.size,height:s.size,borderRadius:"50%",background:"#fff",opacity:0.4,animation:`twinkle ${s.dur}s ease-in-out infinite`,animationDelay:`${s.delay}s`}}/>
      ))}
    </div>
  );
}

// ─── LANGUAGE TOGGLE (global) ────────────────────────────────────────────────
function LangToggle({ lang, setLang, style={} }) {
  const opts = [{v:"am",label:"አማ"},{v:"en",label:"EN"},{v:"es",label:"ES"}];
  return (
    <div style={{ display:"flex", background:"rgba(255,255,255,0.09)", border:"1.5px solid rgba(255,215,0,0.18)", borderRadius:22, padding:3, gap:2, ...style }}>
      {opts.map(o=>(
        <button key={o.v} onClick={()=>setLang(o.v)} style={{
          padding:"5px 11px", borderRadius:16, border:"none", cursor:"pointer",
          background: lang===o.v ? "linear-gradient(135deg,#7b2d8b,#c44dff)" : "transparent",
          color: lang===o.v ? "#fff" : "rgba(255,215,0,0.5)",
          fontSize:11, fontWeight:800, fontFamily:"'Nunito',sans-serif",
          transition:"all 0.2s", minWidth:32, textAlign:"center",
        }}>{o.label}</button>
      ))}
    </div>
  );
}

// ─── CAMPFIRE ────────────────────────────────────────────────────────────────
function Campfire({ size=1 }) {
  const s = size;
  const flames = [
    {l:"50%",ml:-7*s,w:14*s,h:38*s,color:"#FF6B00",dur:"0.9s",delay:"0s"},
    {l:"30%",ml:-5*s,w:10*s,h:28*s,color:"#FFB300",dur:"1.1s",delay:"0.15s"},
    {l:"68%",ml:-5*s,w:10*s,h:24*s,color:"#FF8C00",dur:"0.8s",delay:"0.3s"},
    {l:"50%",ml:-4*s,w:8*s,h:16*s,color:"#FFE066",dur:"0.7s",delay:"0.1s"},
  ];
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
      <div style={{position:"relative",width:44*s,height:50*s}}>
        {flames.map((f,i)=>(
          <div key={i} style={{position:"absolute",bottom:0,left:f.l,marginLeft:f.ml,width:f.w,height:f.h,background:`radial-gradient(ellipse at 50% 100%,${f.color},transparent)`,borderRadius:"50% 50% 20% 20%",animation:`fireFlicker ${f.dur} ease-in-out infinite`,animationDelay:f.delay,transformOrigin:"bottom center",opacity:0.9}}/>
        ))}
      </div>
      <div style={{display:"flex",gap:3*s}}>
        {["#5c2e00","#7a3d00","#4a2200"].map((c,i)=>(
          <div key={i} style={{width:14*s,height:7*s,background:c,borderRadius:4*s}}/>
        ))}
      </div>
      <div style={{width:80*s,height:14*s,background:"radial-gradient(ellipse,rgba(255,140,0,0.18) 0%,transparent 70%)",marginTop:2*s,borderRadius:"50%"}}/>
    </div>
  );
}

// ─── FIREFLIES ───────────────────────────────────────────────────────────────
function Fireflies() {
  const flies = useMemo(()=>Array.from({length:10},(_,i)=>({
    id:i,x:10+(i*71.3)%80,y:10+(i*53.7)%75,
    tx:(-30+(i*47)%60)+"px",ty:(-40+(i*31)%80)+"px",
    tx2:(20+(i*29)%50)+"px",ty2:(10+(i*61)%60)+"px",
    dur:5+(i%4),delay:(i*0.8)%6,size:2+(i%2),
  })),[]);
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:1}}>
      {flies.map(f=>(
        <div key={f.id} style={{position:"absolute",left:`${f.x}%`,top:`${f.y}%`,width:f.size,height:f.size,borderRadius:"50%",background:"#c8b0ff",boxShadow:"0 0 5px 2px rgba(180,140,255,0.55)","--tx":f.tx,"--ty":f.ty,"--tx2":f.tx2,"--ty2":f.ty2,animation:`fireflyMove ${f.dur}s ease-in-out infinite`,animationDelay:`${f.delay}s`}}/>
      ))}
    </div>
  );
}

// ─── PAYWALL ─────────────────────────────────────────────────────────────────
function PaywallModal({ onClose, t }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:20}}>
      <div style={{background:"linear-gradient(135deg,#1a1a4e,#2d1b69)",borderRadius:28,padding:"36px 28px",maxWidth:340,width:"100%",border:"2px solid rgba(255,215,0,0.45)",textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,0.7)"}}>
        <div style={{fontSize:52,marginBottom:12}}>⭐</div>
        <h2 style={{fontFamily:"'Fredoka One',cursive",color:"#FFD700",fontSize:22,marginBottom:10}}>
          {t==="am"?"3 ነፃ ታሪኮች ተጠቀሙ!":t==="es"?"¡3 cuentos gratis usados!":"3 free stories used!"}
        </h2>
        <p style={{color:"#c9b8e8",fontSize:14,lineHeight:1.6,marginBottom:20}}>
          {t==="am"?"ሊሚቱን ያስወጉ እና ያልተወሰነ ታሪኮችን ያግኙ።":t==="es"?"Suscríbete para cuentos ilimitados.":"Subscribe for unlimited magical stories."}
        </p>
        <div style={{background:"rgba(255,215,0,0.08)",border:"1.5px solid rgba(255,215,0,0.3)",borderRadius:14,padding:16,marginBottom:20}}>
          <p style={{color:"#FFD700",fontSize:22,fontWeight:900,margin:0,fontFamily:"'Fredoka One',cursive"}}>$4.99 / {t==="am"?"ወር":t==="es"?"mes":"month"}</p>
          <p style={{color:"#c9b8e8",fontSize:12,margin:"4px 0 0"}}>
            {t==="am"?"ያልተወሰነ · ሁሉም ዕድሜ · ማቋረጥ ይቻላል":t==="es"?"Ilimitado · Todas edades · Cancela cuando quieras":"Unlimited · All ages · Cancel anytime"}
          </p>
        </div>
        <button style={{width:"100%",padding:15,background:"linear-gradient(135deg,#FF8C00,#FFD700)",border:"none",borderRadius:14,color:"#1a1a4e",fontSize:16,fontWeight:900,cursor:"pointer",fontFamily:"'Fredoka One',cursive",marginBottom:10}}>
          🌙 {t==="am"?"አሁን ይመዝገቡ":t==="es"?"Suscribirse ahora":"Subscribe Now"}
        </button>
        <button onClick={onClose} style={{background:"none",border:"none",color:"rgba(255,255,255,0.35)",fontSize:13,cursor:"pointer",textDecoration:"underline"}}>
          {t==="am"?"ለቆይ":t==="es"?"Quizás luego":"Maybe later"}
        </button>
      </div>
    </div>
  );
}

// ─── STORY READER ─────────────────────────────────────────────────────────────
function StoryReader({ pages, childName, region, rawStory, onNew, onAnother, onSave, onCopy, copied, lang, setLang }) {
  const [page,     setPage]     = useState(0);
  const [dir,      setDir]      = useState("fwd");
  const [animKey,  setAnimKey]  = useState(0);
  const [showEnd,  setShowEnd]  = useState(false);
  const [saved,    setSaved]    = useState(false);
  const touchStartX = useRef(null);
  const t = UI[lang];

  const total    = pages.length;
  const progress = total > 0 ? (page+1)/total : 0;
  const current  = pages[page] || {};
  const text     = lang==="am" ? current.am : lang==="en" ? (current.en||current.am) : (current.es||current.am);

  const goNext = useCallback(()=>{ if(page<total-1){setDir("fwd");setAnimKey(k=>k+1);setPage(p=>p+1);}else setShowEnd(true); },[page,total]);
  const goPrev = useCallback(()=>{ if(page>0){setDir("bck");setAnimKey(k=>k+1);setPage(p=>p-1);setShowEnd(false);} },[page]);
  const onTouchStart=(e)=>{touchStartX.current=e.touches[0].clientX;};
  const onTouchEnd=(e)=>{ if(touchStartX.current===null)return; const dx=e.changedTouches[0].clientX-touchStartX.current; if(Math.abs(dx)>40){dx<0?goNext():goPrev();} touchStartX.current=null; };

  const topBar = (
    <div style={{position:"relative",zIndex:10,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 16px 10px",borderBottom:"1px solid rgba(255,215,0,0.07)"}}>
      <button onClick={onNew} style={{background:"none",border:"none",color:"rgba(200,180,255,0.4)",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>{t.exitBtn}</button>
      <LangToggle lang={lang} setLang={setLang}/>
      <p style={{fontFamily:"'Nunito',sans-serif",fontSize:11,color:"rgba(200,180,255,0.35)",fontWeight:700}}>{page+1} / {total}</p>
    </div>
  );

  if (showEnd) return (
    <div style={{position:"fixed",inset:0,zIndex:50,background:"linear-gradient(180deg,#0d0d2b 0%,#1a1a4e 30%,#2d1b69 65%,#3d1580 100%)",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <Stars/><Fireflies/>
      {topBar}
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:28,animation:"fadeSlideUp 0.5s ease forwards",position:"relative",zIndex:5}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:50,marginBottom:12}}>🌙</div>
          <p style={{fontFamily:"'Lora',Georgia,serif",fontSize:19,color:"#FFD700",fontWeight:700,marginBottom:6}}>ተረቱ ሄደ ዘንቢሉ መጣ</p>
          <p style={{fontFamily:"'Lora',Georgia,serif",fontSize:13,color:"rgba(200,180,255,0.6)",fontStyle:"italic",marginBottom:20}}>{t.endSub}</p>
          <p style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:"#c9b8e8"}}>{t.endTitle}, {childName} 🌟</p>
        </div>
        <div style={{marginBottom:24}}><Campfire size={1.1}/></div>
        <div style={{display:"flex",flexDirection:"column",gap:9,width:"100%",maxWidth:290}}>
          <div style={{display:"flex",gap:9}}>
            <button onClick={onCopy} style={{flex:1,padding:"11px 8px",background:"rgba(255,255,255,0.07)",border:"1.5px solid rgba(255,255,255,0.13)",borderRadius:13,color:"#c9b8e8",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>
              {copied?t.copiedBtn:t.copyBtn}
            </button>
            <button onClick={()=>{onSave();setSaved(true);}} style={{flex:1,padding:"11px 8px",background:saved?"rgba(255,215,0,0.1)":"rgba(255,255,255,0.07)",border:`1.5px solid ${saved?"rgba(255,215,0,0.35)":"rgba(255,255,255,0.13)"}`,borderRadius:13,color:"#FFD700",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>
              {saved?t.savedConfirm:t.saveBtn}
            </button>
          </div>
          <button onClick={onAnother} style={{padding:14,background:"linear-gradient(135deg,#FF8C00,#FFD700)",border:"none",borderRadius:13,color:"#1a1a4e",fontSize:15,fontWeight:900,cursor:"pointer",fontFamily:"'Fredoka One',cursive",boxShadow:"0 4px 18px rgba(255,140,0,0.35)"}}>
            {t.anotherBtn}
          </button>
          <button onClick={onNew} style={{padding:12,background:"none",border:"1.5px solid rgba(255,255,255,0.1)",borderRadius:13,color:"rgba(255,255,255,0.35)",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>
            {t.homeBtn}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="tap-zone" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} style={{position:"fixed",inset:0,zIndex:50,background:"linear-gradient(180deg,#0d0d2b 0%,#1a1a4e 30%,#2d1b69 65%,#3d1580 100%)",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <Stars/><Fireflies/>
      {topBar}
      {/* progress */}
      <div style={{height:2,background:"rgba(255,255,255,0.05)",zIndex:10,position:"relative"}}>
        <div style={{height:"100%",width:`${progress*100}%`,background:"linear-gradient(90deg,#c44dff,#FFD700)",transition:"width 0.4s ease",boxShadow:"0 0 8px rgba(196,77,255,0.55)"}}/>
      </div>
      <div style={{textAlign:"center",paddingTop:8,position:"relative",zIndex:10}}>
        <p style={{fontFamily:"'Lora',Georgia,serif",fontSize:11,color:"rgba(200,180,255,0.35)",fontStyle:"italic"}}>🏔️ {region||"Ethiopian highlands"}</p>
      </div>
      {/* paragraph */}
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"12px 26px 6px",position:"relative",zIndex:5,overflow:"hidden"}}>
        <div key={animKey} className={dir==="fwd"?"page-fwd":"page-bck"} style={{width:"100%",maxWidth:520,textAlign:"center"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:20}}>
            <div style={{height:1,flex:1,background:"linear-gradient(90deg,transparent,rgba(196,77,255,0.18))"}}/>
            <div style={{width:24,height:24,borderRadius:"50%",border:"1.5px solid rgba(196,77,255,0.28)",display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(196,77,255,0.4)",fontSize:10,fontWeight:700,fontFamily:"'Lora',serif"}}>{page+1}</div>
            <div style={{height:1,flex:1,background:"linear-gradient(90deg,rgba(196,77,255,0.18),transparent)"}}/>
          </div>
          <p style={{fontFamily:"'Lora',Georgia,serif",fontSize:lang==="am"?"clamp(18px,5vw,24px)":"clamp(15px,4vw,20px)",lineHeight:lang==="am"?2.0:1.85,color:"#e8e0ff",fontWeight:500,letterSpacing:lang==="am"?"0.02em":"0.01em",textShadow:"0 2px 28px rgba(160,100,255,0.12)"}}>
            {text}
          </p>
        </div>
      </div>
      {/* nav */}
      <div style={{position:"relative",zIndex:10,display:"flex",flexDirection:"column",alignItems:"center",paddingBottom:16,gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:20}}>
          <button onClick={goPrev} disabled={page===0} style={{width:42,height:42,borderRadius:"50%",background:page>0?"rgba(196,77,255,0.1)":"rgba(255,255,255,0.03)",border:`1.5px solid ${page>0?"rgba(196,77,255,0.28)":"rgba(255,255,255,0.05)"}`,color:page>0?"rgba(200,160,255,0.8)":"rgba(255,255,255,0.08)",fontSize:20,cursor:page>0?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}}>‹</button>
          <Campfire size={0.8}/>
          <button onClick={goNext} style={{width:42,height:42,borderRadius:"50%",background:page<total-1?"rgba(196,77,255,0.15)":"linear-gradient(135deg,rgba(255,140,0,0.28),rgba(255,215,0,0.18))",border:`1.5px solid ${page<total-1?"rgba(196,77,255,0.38)":"rgba(255,215,0,0.38)"}`,color:page<total-1?"rgba(200,160,255,0.9)":"rgba(255,215,0,0.9)",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}}>
            {page<total-1?"›":"★"}
          </button>
        </div>
        <p style={{fontFamily:"'Nunito',sans-serif",fontSize:10,color:"rgba(196,77,255,0.28)",fontWeight:700,letterSpacing:1.5,textTransform:"uppercase"}}>
          {page<total-1?t.continueHint:t.finishHint}
        </p>
      </div>
    </div>
  );
}

// ─── BUTTON STYLE ─────────────────────────────────────────────────────────────
const btnStyle = (active, color="gold") => ({
  background: active?(color==="gold"?"linear-gradient(135deg,#FF8C00,#FFD700)":"linear-gradient(135deg,#7b2d8b,#c44dff)"):"rgba(255,255,255,0.07)",
  border:`1.5px solid ${active?(color==="gold"?"#FFD700":"#c44dff"):"rgba(255,255,255,0.13)"}`,
  borderRadius:20, padding:"7px 13px",
  color:active?(color==="gold"?"#1a1a4e":"#fff"):"#c9b8e8",
  fontSize:12, fontWeight:700, cursor:"pointer",
  transition:"all 0.2s", fontFamily:"'Nunito',sans-serif",
});

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen,          setScreen]          = useState("home");
  const [childName,       setChildName]       = useState("");
  const [trait,           setTrait]           = useState("");
  const [traitIdx,        setTraitIdx]        = useState(null);
  const [region,          setRegion]          = useState("");
  const [age,             setAge]             = useState("5-7");
  const [pages,           setPages]           = useState([]);
  const [rawStory,        setRawStory]        = useState("");
  const [loadingMsg,      setLoadingMsg]      = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error,           setError]           = useState("");
  const [lang,            setLang]            = useState("en");
  const [storiesUsed,     setStoriesUsed]     = useState(()=>{ try{return parseInt(localStorage.getItem("teret_used")||"0")}catch{return 0} });
  const [savedStories,    setSavedStories]    = useState(()=>{ try{return JSON.parse(localStorage.getItem("teret_saved")||"[]")}catch{return []} });
  const [showPaywall,     setShowPaywall]     = useState(false);
  const [showSaved,       setShowSaved]       = useState(false);
  const [copied,          setCopied]          = useState(false);
  const intervalRef = useRef(null);
  const progressRef = useRef(null);

  const t = UI[lang];
  const loadingMessages = t.loading;

  useEffect(()=>{
    if(screen==="loading"){
      let msg=0;
      intervalRef.current=setInterval(()=>{msg=(msg+1)%loadingMessages.length;setLoadingMsg(msg);},1800);
      let prog=0;
      progressRef.current=setInterval(()=>{prog=Math.min(prog+Math.random()*2.5,90);setLoadingProgress(prog);},200);
    }
    return()=>{clearInterval(intervalRef.current);clearInterval(progressRef.current);};
  },[screen, lang]);

  const saveCount=(n)=>{setStoriesUsed(n);try{localStorage.setItem("teret_used",n)}catch{}};
  const saveStory=()=>{
    const entry={id:Date.now(),name:childName,region:region||"Ethiopian highlands",date:new Date().toLocaleDateString(),content:rawStory};
    const updated=[entry,...savedStories].slice(0,10);
    setSavedStories(updated);
    try{localStorage.setItem("teret_saved",JSON.stringify(updated))}catch{}
  };
  const copyStory=()=>{try{navigator.clipboard.writeText(rawStory);setCopied(true);setTimeout(()=>setCopied(false),2000);}catch{}};

  const handleTraitSelect=(idx)=>{ setTraitIdx(traitIdx===idx?null:idx); setTrait(traitIdx===idx?"":(TRAITS_EN[idx]||"")); };

  const generateStory=async()=>{
    if(!childName.trim())return;
    if(storiesUsed>=FREE_STORY_LIMIT){setShowPaywall(true);return;}
    setScreen("loading");setLoadingMsg(0);setLoadingProgress(0);setError("");setPages([]);
    const regionObj=REGIONS.find(r=>r.name===region);
    const userPrompt=`Write a bedtime story for a child named ${childName} who ${trait||"is kind and brave"}. Set the story in ${regionObj?regionObj.detail:"the beautiful Ethiopian highlands"}. Make ${childName} the clear hero.`;
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1400,system:buildSystemPrompt(age),messages:[{role:"user",content:userPrompt}]})});
      const data=await res.json();
      const raw=data.content?.map(b=>b.text||"").join("")||"";
      setRawStory(raw);
      const parsed=parseStory(raw);
      clearInterval(intervalRef.current);clearInterval(progressRef.current);
      setLoadingProgress(100);saveCount(storiesUsed+1);
      setTimeout(()=>{setPages(parsed);setScreen("story");},500);
    }catch(e){setError("Something went wrong. Please try again.");setScreen("home");}
  };

  // Global top-right lang toggle (home + loading screens)
  const GlobalToggle = (
    <div style={{position:"fixed",top:16,right:68,zIndex:10}}>
      <LangToggle lang={lang} setLang={setLang}/>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka+One&family=Lora:ital,wght@0,500;0,600;0,700;1,400;1,500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0} body{margin:0}
        @keyframes floatBounce{0%,100%{transform:translateY(0) rotate(-5deg)}50%{transform:translateY(-12px) rotate(5deg)}}
        @keyframes twinkle{0%,100%{opacity:0.1;transform:scale(1)}50%{opacity:0.7;transform:scale(1.4)}}
        @keyframes fadeSlideUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
        @keyframes wiggle{0%,100%{transform:rotate(0)}25%{transform:rotate(-8deg)}75%{transform:rotate(8deg)}}
        @keyframes fireFlicker{0%,100%{transform:scaleY(1) scaleX(1)}30%{transform:scaleY(1.1) scaleX(0.93)}60%{transform:scaleY(0.92) scaleX(1.05)}}
        @keyframes fireflyMove{0%{transform:translate(0,0);opacity:0}15%{opacity:0.8}50%{transform:translate(var(--tx),var(--ty));opacity:0.55}85%{opacity:0.2}100%{transform:translate(var(--tx2),var(--ty2));opacity:0}}
        @keyframes slideInRight{from{opacity:0;transform:translateX(50px)}to{opacity:1;transform:translateX(0)}}
        @keyframes slideInLeft{from{opacity:0;transform:translateX(-50px)}to{opacity:1;transform:translateX(0)}}
        .btn-hover:hover{transform:scale(1.05)} .gen-btn:hover{transform:scale(1.02);filter:brightness(1.1)}
        .page-fwd{animation:slideInRight 0.4s cubic-bezier(0.22,1,0.36,1) forwards}
        .page-bck{animation:slideInLeft 0.4s cubic-bezier(0.22,1,0.36,1) forwards}
        .tap-zone{-webkit-tap-highlight-color:transparent;user-select:none}
        input::placeholder{color:rgba(255,255,255,0.3)}
        ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-thumb{background:rgba(196,77,255,0.3);border-radius:3px}
      `}</style>

      {showPaywall&&<PaywallModal onClose={()=>setShowPaywall(false)} t={lang}/>}

      {/* STORY READER */}
      {screen==="story"&&(
        <StoryReader pages={pages} childName={childName} region={region} rawStory={rawStory}
          onNew={()=>{setScreen("home");setPages([]);setChildName("");setTrait("");setTraitIdx(null);setRegion("");}}
          onAnother={generateStory} onSave={saveStory} onCopy={copyStory} copied={copied}
          lang={lang} setLang={setLang}
        />
      )}

      <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#0d0d2b 0%,#1a1a4e 25%,#2d1b69 55%,#5a2d00 100%)",fontFamily:"'Nunito',sans-serif",position:"relative",overflow:"hidden"}}>
        <Stars/>
        {[["🦁","8%","right","8%","0s"],["🐘","15%","left","5%","1s"],["🦒","20%","right","4%","0.5s"],["🦅","40%","left","2%","1.5s"]].map(([e,top,side,pos,d],i)=>(
          <div key={i} style={{position:"fixed",top,[side]:pos,fontSize:22,opacity:0.08,animation:"floatBounce 3s ease-in-out infinite",animationDelay:d,pointerEvents:"none",zIndex:0}}>{e}</div>
        ))}
        <div style={{position:"fixed",top:16,right:16,fontSize:44,animation:"pulse 4s ease-in-out infinite",filter:"drop-shadow(0 0 16px rgba(255,220,100,0.4))",zIndex:2,pointerEvents:"none"}}>🌙</div>

        {/* Global language toggle — home & loading */}
        {screen!=="story" && GlobalToggle}

        {screen==="home"&&storiesUsed<FREE_STORY_LIMIT&&(
          <div style={{position:"fixed",top:18,left:18,background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,215,0,0.2)",borderRadius:10,padding:"5px 10px",fontSize:10,color:"rgba(255,215,0,0.65)",fontWeight:700,zIndex:2}}>
            {t.freeLeft(FREE_STORY_LIMIT-storiesUsed)}
          </div>
        )}

        <div style={{maxWidth:600,margin:"0 auto",padding:"20px 18px 80px",position:"relative",zIndex:1}}>

          {/* ══ HOME ══ */}
          {screen==="home"&&(
            <div style={{animation:"fadeSlideUp 0.6s ease forwards"}}>
              <div style={{textAlign:"center",padding:"34px 0 24px"}}>
                <div style={{fontSize:56,marginBottom:8,animation:"wiggle 2.5s ease-in-out infinite",display:"inline-block"}}>📖</div>
                <h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:"clamp(30px,8vw,46px)",color:"#FFD700",textShadow:"0 4px 0 rgba(0,0,0,0.3),0 0 26px rgba(255,215,0,0.35)",lineHeight:1.1,marginBottom:6}}>ተረት ተረት</h1>
                <p style={{fontSize:13,color:"#c9b8e8",fontWeight:600,marginBottom:10}}>{t.subtitle}</p>
                <span style={{display:"inline-block",background:"rgba(255,255,255,0.09)",border:"1.5px solid rgba(255,255,255,0.18)",borderRadius:8,padding:"3px 11px",fontSize:11,fontWeight:900,color:"#fff",letterSpacing:1}}>{t.badge}</span>
              </div>

              {savedStories.length>0&&(
                <button onClick={()=>setShowSaved(!showSaved)} style={{width:"100%",padding:"10px",background:"rgba(255,255,255,0.05)",border:"1.5px solid rgba(255,215,0,0.16)",borderRadius:14,color:"#FFD700",fontSize:13,fontWeight:800,cursor:"pointer",marginBottom:10,fontFamily:"'Nunito',sans-serif"}}>
                  {t.savedBtn} ({savedStories.length})
                </button>
              )}
              {showSaved&&(
                <div style={{background:"rgba(255,255,255,0.05)",border:"1.5px solid rgba(255,215,0,0.1)",borderRadius:18,padding:13,marginBottom:13}}>
                  {savedStories.map(s=>(
                    <div key={s.id} style={{padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.05)",cursor:"pointer"}}
                      onClick={()=>{setRawStory(s.content);setChildName(s.name);setPages(parseStory(s.content));setScreen("story");setShowSaved(false);}}>
                      <p style={{color:"#FFD700",fontSize:13,fontWeight:800}}>⭐ {s.name}'s story</p>
                      <p style={{color:"rgba(255,255,255,0.3)",fontSize:11}}>{s.region} · {s.date}</p>
                    </div>
                  ))}
                </div>
              )}

              <div style={{background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",borderRadius:26,border:"1.5px solid rgba(255,255,255,0.11)",padding:"24px 18px",boxShadow:"0 18px 50px rgba(0,0,0,0.3)"}}>

                {/* Name */}
                <div style={{marginBottom:18}}>
                  <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,fontWeight:800,color:"#FFD700",marginBottom:7}}>{t.nameLabel}</label>
                  <input value={childName} onChange={e=>setChildName(e.target.value)} placeholder={t.namePlaceholder}
                    style={{width:"100%",background:"rgba(255,255,255,0.09)",border:"1.5px solid rgba(255,215,0,0.28)",borderRadius:13,padding:"12px 15px",color:"#fff",fontSize:15,fontFamily:"'Nunito',sans-serif",fontWeight:700,outline:"none"}}
                    onFocus={e=>{e.target.style.borderColor="#FFD700";e.target.style.background="rgba(255,255,255,0.15)"}}
                    onBlur={e=>{e.target.style.borderColor="rgba(255,215,0,0.28)";e.target.style.background="rgba(255,255,255,0.09)"}}
                  />
                </div>

                {/* Age */}
                <div style={{marginBottom:18}}>
                  <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,fontWeight:800,color:"#FFD700",marginBottom:7}}>{t.ageLabel}</label>
                  <div style={{display:"flex",gap:7}}>
                    {AGES.map((a,i)=>(
                      <button key={a.value} className="btn-hover" onClick={()=>setAge(a.value)} style={{...btnStyle(age===a.value,"gold"),flex:1,textAlign:"center"}}>{t.ageOpts[i]}</button>
                    ))}
                  </div>
                </div>

                {/* Trait */}
                <div style={{marginBottom:18}}>
                  <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,fontWeight:800,color:"#FFD700",marginBottom:7}}>{t.traitLabel}</label>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {t.traits.map((tr,i)=>(
                      <button key={i} className="btn-hover" onClick={()=>handleTraitSelect(i)} style={btnStyle(traitIdx===i,"gold")}>{tr}</button>
                    ))}
                  </div>
                </div>

                {/* Region */}
                <div style={{marginBottom:22}}>
                  <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,fontWeight:800,color:"#FFD700",marginBottom:7}}>{t.regionLabel}</label>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {REGIONS.map(r=>(
                      <button key={r.name} className="btn-hover" onClick={()=>setRegion(region===r.name?"":r.name)} style={btnStyle(region===r.name,"purple")}>{r.name}</button>
                    ))}
                  </div>
                </div>

                {error&&<p style={{color:"#ff8080",fontSize:13,marginBottom:12,fontWeight:700}}>{error}</p>}

                <button className="gen-btn" onClick={generateStory} disabled={!childName.trim()} style={{
                  width:"100%",padding:15,
                  background:childName.trim()?"linear-gradient(135deg,#FF8C00,#FFD700)":"rgba(255,255,255,0.09)",
                  border:"none",borderRadius:15,
                  color:childName.trim()?"#1a1a4e":"rgba(255,255,255,0.25)",
                  fontSize:17,fontWeight:900,cursor:childName.trim()?"pointer":"not-allowed",
                  fontFamily:"'Fredoka One',cursive",letterSpacing:1,
                  boxShadow:childName.trim()?"0 4px 20px rgba(255,140,0,0.38)":"none",transition:"all 0.3s"
                }}>{t.generateBtn}</button>
              </div>

              <div style={{textAlign:"center",marginTop:20,fontSize:24,letterSpacing:6,opacity:0.4}}>🦁 🐘 🦒 🦅 🦊</div>
            </div>
          )}

          {/* ══ LOADING ══ */}
          {screen==="loading"&&(
            <div style={{minHeight:"85vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",animation:"fadeSlideUp 0.4s ease forwards"}}>
              <div style={{fontSize:82,marginBottom:16,animation:"pulse 1.4s ease-in-out infinite",filter:"drop-shadow(0 0 24px rgba(255,215,0,0.6))"}}>📖</div>
              <div style={{display:"flex",gap:11,marginBottom:24,fontSize:30}}>
                {ANIMALS.map((a,i)=>(
                  <span key={i} style={{display:"inline-block",animation:"floatBounce 0.9s ease-in-out infinite",animationDelay:`${i*0.11}s`}}>{a}</span>
                ))}
              </div>
              <div style={{background:"rgba(255,255,255,0.08)",borderRadius:18,padding:"13px 24px",marginBottom:24,textAlign:"center",border:"1.5px solid rgba(255,215,0,0.18)",minWidth:250,maxWidth:310}}>
                <div style={{fontSize:26,marginBottom:4}}>{ANIMALS[loadingMsg%ANIMALS.length]}</div>
                <p style={{color:"#FFD700",fontSize:13,fontWeight:800,fontFamily:"'Nunito',sans-serif",lineHeight:1.4}}>{loadingMessages[loadingMsg]}</p>
              </div>
              <div style={{width:250,height:11,background:"rgba(255,255,255,0.09)",borderRadius:99,overflow:"hidden",border:"1.5px solid rgba(255,215,0,0.18)"}}>
                <div style={{height:"100%",width:`${loadingProgress}%`,background:"linear-gradient(90deg,#c44dff,#FFD700)",borderRadius:99,transition:"width 0.3s ease",boxShadow:"0 0 9px rgba(196,77,255,0.45)"}}/>
              </div>
              <p style={{color:"rgba(255,255,255,0.28)",fontSize:11,marginTop:5,fontWeight:700}}>{Math.round(loadingProgress)}%</p>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
