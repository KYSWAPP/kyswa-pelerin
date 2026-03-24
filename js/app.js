let prayerTimes=null,qiblaDir=null,compassHeading=0;
let dhikrSel=0,dhikrCount=0,dhikrTotal=0;
let pelerin=null,lastAzan={},prieresTabState="horaires";
let boutiqueFiltre="tout",barakaScore=0,notifPermission=false,sw=null;
let oumraStepId="bagages",barakaTab="quotidien";
let salawatWeekCount=0;
let currentLang='fr';

async function initSW(){
  if(!('serviceWorker' in navigator)) return;
  try{const r=await navigator.serviceWorker.register('/sw.js');await navigator.serviceWorker.ready;sw=r;}catch(e){}
}

function loadSalawat(){
  const data=JSON.parse(localStorage.getItem('salawat-count')||'{"count":0,"week":0}');
  const now=new Date();
  const week=getWeekNumber(now);
  if(data.week!==week){salawatWeekCount=0;}
  else{salawatWeekCount=data.count;}
}
function saveSalawat(){
  const week=getWeekNumber(new Date());
  localStorage.setItem('salawat-count',JSON.stringify({count:salawatWeekCount,week}));
}
function getWeekNumber(d){
  d=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));
  d.setUTCDate(d.getUTCDate()+4-(d.getUTCDay()||7));
  const yearStart=new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d-yearStart)/86400000)+1)/7);
}

async function demanderPermission(){
  if(!('Notification' in window)){showToast('📵','Non supporté','Installez l\'app !','#E53935');return;}
  const p=await Notification.requestPermission();
  if(p==='granted'){
    notifPermission=true;
    document.getElementById('notif-banner').style.display='none';
    showToast('✅','Activé !','Vous recevrez les rappels.','#00815A');
    programmerToutesNotifications();
    localStorage.setItem('kyswa-notif','true');
  } else {showToast('🔕','Refusée','Vérifiez vos réglages.','#E53935');}
}

function envoyerNotif(titre,corps,tag,delai=0){
  if(Notification.permission!=='granted') return;
  if(sw&&sw.active){sw.active.postMessage({type:'SCHEDULE_NOTIF',title:titre,body:corps,tag,delay:delai});}
  else setTimeout(()=>{try{new Notification(titre,{body:corps,icon:'/icon-192.png',tag});}catch(e){}},delai);
}

function programmerToutesNotifications(){
  if(!prayerTimes){setTimeout(programmerToutesNotifications,3000);return;}
  const now=new Date();
  PRAYERS.forEach(p=>{
    if(!prayerTimes[p]) return;
    const[h,m]=prayerTimes[p].split(':').map(Number);
    const t=new Date();t.setHours(h,m,0,0);
    const d=t-now;
    if(d>0) envoyerNotif(PICONS[p]+' '+p+' — '+prayerTimes[p],['Fajr','Isha'].includes(p)?'🕌 Madinah':'🕋 Makkah','azan-'+p,d);
  });
}

function showToast(icon,titre,msg,couleur='#00815A'){
  const c=document.getElementById('toast-container');
  if(!c) return;
  const t=document.createElement('div');
  t.className='toast';t.style.borderLeft='3px solid '+couleur;
  t.innerHTML=`<div class="toast-icon">${icon}</div><div class="toast-body"><div class="toast-title">${titre}</div><div class="toast-msg">${msg}</div></div><button class="toast-close" onclick="this.closest('.toast').remove()">×</button>`;
  c.appendChild(t);
  setTimeout(()=>{t.style.animation='fadeOut 0.3s ease forwards';setTimeout(()=>t.remove(),300);},5000);
}

function closeModal(){document.getElementById('modal-overlay').classList.remove('show');}

function showPage(id){
  document.querySelectorAll('.page').forEach(p=>{p.style.display='none';p.classList.remove('page-enter');});
  const pg=document.getElementById('pg-'+id);
  if(pg){
    pg.style.display='block';
    // Scroll to top first, then animate in
    document.documentElement.scrollTop=0;
    document.body.scrollTop=0;
    requestAnimationFrame(()=>pg.classList.add('page-enter'));
  }
  document.querySelectorAll('[id^="nb-"]').forEach(btn=>{
    btn.style.opacity='0.5';
    const lbl=document.getElementById(btn.id.replace('nb-','nbl-'));
    if(lbl){lbl.style.color='var(--text-hint)';lbl.style.fontWeight='500';}
  });
  const navMap={verses:'coran',produit:'boutique',formulaire:'packages'};
  const nid=navMap[id]||id;
  const nb=document.getElementById('nb-'+nid);const nl=document.getElementById('nbl-'+nid);
  if(nb){nb.style.opacity='1';nb.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});}
  if(nl){nl.style.color='var(--primary)';nl.style.fontWeight='700';}
  if(id==='prieres') renderPrieres();
  if(id==='coran') renderSurahs();
  if(id==='dhikr') renderDhikr();
  if(id==='espace') renderEspace();
  if(id==='boutique') renderBoutique();
  if(id==='baraka') renderBaraka();
  if(id==='oumra') renderOumra();
  if(id==='sira') renderSira();
  if(id==='infos') renderInfos();
}
function renderOumra(){
  const tabs=document.getElementById('oumra-tabs');
  if(tabs) tabs.innerHTML=OUMRA_STEPS.map(s=>`<button class="step-btn${s.id===oumraStepId?' active':''}" onclick="setOumraStep('${s.id}')">${s.icon} ${s.titre}</button>`).join('');
  const d=OUMRA_DATA[oumraStepId];
  const el=document.getElementById('oumra-content');
  if(el) el.innerHTML=`
    <div style="background:${d.couleur};border-radius:var(--radius-xl);padding:var(--space-lg);margin-bottom:var(--space-md);">
      <div style="color:#fff;font-size:18px;font-weight:800;margin-bottom:6px;">${d.titre}</div>
      <div style="color:rgba(255,255,255,0.8);font-size:12px;line-height:1.7;">${d.intro}</div>
    </div>
    ${d.invocations.map((inv,i)=>`
    <div class="invoc-card">
      <div style="padding:10px var(--space-md);background:rgba(0,129,90,0.06);border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px;">
        <div style="width:26px;height:26px;border-radius:8px;background:var(--primary);display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:700;flex-shrink:0;">${i+1}</div>
        <div style="font-size:12px;font-weight:700;color:var(--text-primary);">${inv.titre}</div>
      </div>
      <div style="padding:var(--space-md);">
        <div class="arabic-text">${inv.ar}</div>
        <div class="translit">${inv.translit}</div>
        <div class="traduction">${inv.fr}</div>
      </div>
    </div>`).join('')}
    <div style="display:flex;gap:10px;margin-top:var(--space-md);">
      ${OUMRA_STEPS.findIndex(s=>s.id===oumraStepId)>0?`<button onclick="prevOumraStep()" class="btn btn-ghost" style="flex:1;padding:14px;">← Étape précédente</button>`:''}
      ${OUMRA_STEPS.findIndex(s=>s.id===oumraStepId)<OUMRA_STEPS.length-1?`<button onclick="nextOumraStep()" class="btn btn-primary" style="flex:1;padding:14px;">Étape suivante →</button>`:'<div style="background:var(--primary-soft);border-radius:var(--radius-md);padding:14px;text-align:center;flex:1;color:var(--primary);font-weight:700;">🕋 Guide complet terminé — Mabrouk !</div>'}
    </div>`;
}
function setOumraStep(id){oumraStepId=id;renderOumra();window.scrollTo(0,100);}
function nextOumraStep(){
  const i=OUMRA_STEPS.findIndex(s=>s.id===oumraStepId);
  if(i<OUMRA_STEPS.length-1){oumraStepId=OUMRA_STEPS[i+1].id;renderOumra();window.scrollTo(0,100);}
}
function prevOumraStep(){
  const i=OUMRA_STEPS.findIndex(s=>s.id===oumraStepId);
  if(i>0){oumraStepId=OUMRA_STEPS[i-1].id;renderOumra();window.scrollTo(0,100);}
}

function setBarakaTab(tab){
  barakaTab=tab;
  ['quotidien','postoumra'].forEach(t=>{
    const b=document.getElementById('btab-'+t);
    if(b){b.style.background=t===tab?'var(--primary)':'var(--dark-surface-2)';b.style.color=t===tab?'#fff':'var(--dark-hint)';}
  });
  renderBaraka();
}
function renderBaraka(){
  const s=document.getElementById('baraka-score');
  if(s) s.textContent=barakaScore;
  const el=document.getElementById('baraka-content');
  if(!el) return;
  if(barakaTab==='quotidien') renderBarakaQuotidien(el);
  else renderPostOumra(el);
}
function renderBarakaQuotidien(el){
  const today=new Date().toDateString();
  const done=JSON.parse(localStorage.getItem('baraka-done-'+today)||'{}');
  const items=[
    {id:'matin',icon:'🌅',titre:'Azkar Sabah',pts:50,azkar:true},
    {id:'soir',icon:'🌙',titre:'Azkar Massa',pts:50,azkar:true},
    {id:'witr',icon:'📿',titre:"Shaf'a & Witr",pts:100}
  ];
  el.innerHTML=items.map(item=>`
    <div class="card" onclick="${item.azkar?`openAzkar('${item.id}')`:`validerBaraka('${item.id}',${item.pts})`}">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:48px;height:48px;border-radius:14px;background:${done[item.id]?'var(--primary)':'var(--surface-2)'};display:flex;align-items:center;justify-content:center;font-size:22px;">${done[item.id]?'✅':item.icon}</div>
          <div><div style="font-size:14px;font-weight:700;">${item.titre}</div></div>
        </div>
        <div style="background:var(--gold-soft);color:var(--gold);border-radius:var(--radius-full);padding:4px 10px;font-size:11px;font-weight:700;">+${item.pts}</div>
      </div>
    </div>`).join('');
}
function validerBaraka(id,pts){
  const key='baraka-done-'+new Date().toDateString();
  const done=JSON.parse(localStorage.getItem(key)||'{}');
  if(!done[id]){done[id]=true;localStorage.setItem(key,JSON.stringify(done));barakaScore+=pts;if(pts>0) showToast('✨','Baraka !','+'+pts+' Hasanat','#00815A');}
  renderBaraka();
}

function renderPrieres(){
  const el=document.getElementById('prieres-content');if(!el) return;
  if(prieresTabState==='horaires'){
    el.innerHTML=`<div class="card" onclick="playAzan()" style="cursor:pointer;background:linear-gradient(135deg,#1A0A3E,#3D1A78);display:flex;align-items:center;gap:12px;">
      <div style="width:44px;height:44px;border-radius:var(--radius-sm);background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;font-size:22px;">🔊</div>
      <div style="flex:1;"><div style="color:#fff;font-size:14px;font-weight:700;">Écouter l'Azan</div><div style="color:rgba(255,255,255,0.6);font-size:11px;">Appel à la prière — Madinah</div></div>
    </div>` +
    PRAYERS.map(p=>{
      if(!prayerTimes) return`<div class="card">${PICONS[p]} ${p} <span style="color:var(--text-hint)">Chargement...</span></div>`;
      return`<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;"><div style="display:flex;align-items:center;gap:12px;"><div style="width:44px;height:44px;border-radius:var(--radius-sm);background:var(--surface-2);display:flex;align-items:center;justify-content:center;font-size:20px;">${PICONS[p]}</div><div><div style="font-size:15px;font-weight:700;">${p}</div></div></div><div style="font-size:20px;font-weight:800;">${prayerTimes[p]}</div></div></div>`;
    }).join('');
  } else {
    el.innerHTML=`
    <div style="text-align:center;padding:20px 0;">
      <div id="compass-msg" style="margin-bottom:20px;color:var(--text-secondary);font-size:13px;">Autorisez la localisation pour trouver la Qibla</div>
      <div style="position:relative;width:220px;height:220px;margin:0 auto 30px;border-radius:50%;border:4px solid var(--primary);display:flex;align-items:center;justify-content:center;background:var(--surface-2);box-shadow:inset 0 0 20px rgba(0,129,90,0.1);">
        <div id="qibla-arrow" style="font-size:50px;line-height:1;transition:transform 0.1s ease-out;display:flex;flex-direction:column;align-items:center;transform-origin:center center;">
          <div style="color:var(--primary);font-size:24px;margin-bottom:-10px;">▲</div>
          <div>🕋</div>
        </div>
        <div style="position:absolute;top:10px;font-size:14px;font-weight:800;color:var(--primary);">N</div>
        <div style="position:absolute;bottom:10px;font-size:14px;font-weight:800;color:var(--text-hint);">S</div>
        <div style="position:absolute;left:10px;font-size:14px;font-weight:800;color:var(--text-hint);">O</div>
        <div style="position:absolute;right:10px;font-size:14px;font-weight:800;color:var(--text-hint);">E</div>
      </div>
      <button onclick="activerBoussole()" id="compass-btn" class="btn btn-primary" style="padding:14px 24px;font-size:14px;">🧭 Activer la boussole</button>
    </div>`;
  }
}
function setPrieresTab(tab){prieresTabState=tab;renderPrieres();}
function activerBoussole(){
  if(!navigator.geolocation) {
    alert("La géolocalisation n'est pas supportée par votre navigateur.");
    return;
  }
  document.getElementById('compass-btn').innerText = "⏳ Recherche GPS...";
  navigator.geolocation.getCurrentPosition(pos => {
    const lat = pos.coords.latitude, lng = pos.coords.longitude;
    const phiK = 21.4225 * Math.PI / 180.0;
    const lambdaK = 39.8262 * Math.PI / 180.0;
    const phi = lat * Math.PI / 180.0;
    const lambda = lng * Math.PI / 180.0;
    const y = Math.sin(lambdaK - lambda);
    const x = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda);
    let qDir = Math.atan2(y, x) * 180.0 / Math.PI;
    qiblaDir = (qDir + 360) % 360;
    
    if(typeof DeviceOrientationEvent!=='undefined'&&typeof DeviceOrientationEvent.requestPermission==='function'){
      DeviceOrientationEvent.requestPermission().then(p=>{if(p==='granted')window.addEventListener('deviceorientation',onOrient,true);});
    } else {
      window.addEventListener('deviceorientation',onOrient,true);
      window.addEventListener('deviceorientationabsolute',onOrient,true);
    }
    document.getElementById('compass-btn').style.display = 'none';
    document.getElementById('compass-msg').innerText = "Tournez avec votre téléphone. La flèche vous pointe La Mecque.";
  }, err => {
    alert("Veuillez autoriser la géolocalisation pour trouver la Qibla.");
    document.getElementById('compass-btn').innerText = "🧭 Activer la boussole";
  });
}
function onOrient(e){
  compassHeading = e.webkitCompassHeading != null ? e.webkitCompassHeading : (360 - (e.alpha || 0));
  const el=document.getElementById('qibla-arrow');
  if(el) el.style.transform=`rotate(${(qiblaDir||0)-compassHeading}deg)`;
}

function renderSurahs(){
  const el=document.getElementById('surahs-list');if(!el) return;
  el.innerHTML=SURAHS.map(x=>`<div onclick="openSurah(${x.n},'${x.name}','${x.ar}')" class="card" style="display:flex;justify-content:space-between;cursor:pointer;"><div style="display:flex;align-items:center;gap:12px;"><div style="width:38px;height:38px;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;border-radius:8px;">${x.n}</div><div>${x.name}</div></div><div style="font-family:var(--font-arabic);">${x.ar}</div></div>`).join('');
}
function openSurah(n,name,ar){
  document.getElementById('surah-title').textContent=name;
  document.getElementById('surah-ar').textContent=ar;
  showPage('verses');
  fetch(`https://api.alquran.cloud/v1/surah/${n}`).then(r=>r.json()).then(d=>{
    document.getElementById('verses-list').innerHTML=d.data.ayahs.map(v=>`<div class="card"><div style="font-size:21px;text-align:right;direction:rtl;line-height:2.2;font-family:var(--font-arabic);">${v.text}</div></div>`).join('');
  });
}

function setDhikrTab(tab){
  const dc=document.getElementById('dhikr-tab-content'),sc=document.getElementById('salawat-tab-content');
  if(tab==='dhikr'){dc.style.display='block';sc.style.display='none';renderDhikr();}
  else{dc.style.display='none';sc.style.display='block';renderSalawat();}
}
function renderDhikr(){
  const d=DHIKRS[dhikrSel],done=dhikrCount>=d.target;
  const el=document.getElementById('dhikr-body');
  if(el) el.innerHTML=`
    <div style="background:#ffffff;padding:24px;border-radius:var(--radius-lg);margin-bottom:30px;box-shadow:0 10px 30px rgba(0,0,0,0.1);border:1px solid rgba(0,129,90,0.1);">
      <div style="font-size:32px;text-align:center;direction:rtl;font-family:var(--font-arabic);color:var(--primary-dark);margin-bottom:12px;text-shadow:0 1px 2px rgba(0,0,0,0.05);">${d.ar}</div>
      <div style="font-size:15px;text-align:center;font-weight:600;color:#333;margin-bottom:4px;">${d.translit}</div>
      <div style="font-size:13px;text-align:center;color:#666;">${d.fr}</div>
    </div>
    <div style="text-align:center;">
      <div style="font-size:12px;font-weight:800;color:var(--text-hint);text-transform:uppercase;letter-spacing:2px;margin-bottom:20px;">Objectif : ${d.target}</div>
      <button id="dhikr-btn" onclick="tapDhikr()" style="
        width:160px;height:160px;border-radius:50%;font-size:48px;font-weight:900;
        background:${done?'linear-gradient(135deg,#D4AF37,#AA8222)':'linear-gradient(135deg,var(--primary),var(--primary-dark))'};
        color:#fff;border:none;box-shadow:0 15px 35px ${done?'rgba(212,175,55,0.4)':'rgba(0,129,90,0.4)'};
        transition:transform 0.1s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.1s;
        cursor:pointer;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;
        user-select:none;-webkit-tap-highlight-color:transparent;
      "
      onpointerdown="this.style.transform='scale(0.9)';this.style.boxShadow='0 5px 15px rgba(0,0,0,0.2)';"
      onpointerup="this.style.transform='scale(1)';this.style.boxShadow='0 15px 35px ${done?'rgba(212,175,55,0.4)':'rgba(0,129,90,0.4)'}';"
      onpointercancel="this.style.transform='scale(1)';"
      >${dhikrCount}</button>
      <div style="height:30px;">
        ${done?'<div style="color:#D4AF37;font-weight:800;font-size:16px;">✨ Objectif atteint ! ✨</div>':''}
      </div>
    </div>`;
}
function tapDhikr(){if(navigator.vibrate)navigator.vibrate(30);dhikrCount++;dhikrTotal++;renderDhikr();}
function resetDhikr(){dhikrCount=0;renderDhikr();}
function selectDhikr(i){dhikrSel=i;dhikrCount=0;renderDhikr();}

function renderSalawat(){
  loadSalawat();
  const el=document.getElementById('salawat-tab-content');if(!el)return;
  el.innerHTML=`
  <div style="text-align:center;padding:10px 0;">
    <div style="background:var(--surface-2);border-radius:var(--radius-lg);padding:30px 20px;box-shadow:inset 0 0 20px rgba(220,20,60,0.05);border:1px solid rgba(220,20,60,0.1);margin-bottom:40px;">
      <div style="font-size:40px;margin-bottom:10px;">🌹</div>
      <div style="font-size:14px;color:var(--text-secondary);font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px;">Total Salawat</div>
      <div style="font-size:56px;font-weight:900;color:transparent;background:linear-gradient(135deg,#e91e63,#9c27b0);-webkit-background-clip:text;background-clip:text;">${salawatWeekCount.toLocaleString()}</div>
    </div>
    <button onclick="tapSalawat()" style="
      width:180px;height:180px;border-radius:50%;font-size:60px;
      background:linear-gradient(135deg,#ff4081,#c51162);
      color:#fff;border:none;box-shadow:0 15px 35px rgba(233,30,99,0.4);
      transition:transform 0.1s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.1s;
      cursor:pointer;display:flex;align-items:center;justify-content:center;margin:0 auto;
      user-select:none;-webkit-tap-highlight-color:transparent;
    "
    onpointerdown="this.style.transform='scale(0.9)';this.style.boxShadow='0 5px 15px rgba(233,30,99,0.2)';"
    onpointerup="this.style.transform='scale(1)';this.style.boxShadow='0 15px 35px rgba(233,30,99,0.4)';"
    onpointercancel="this.style.transform='scale(1)';"
    >🤲</button>
    <div style="margin-top:20px;font-size:14px;color:var(--text-hint);font-weight:600;">Appuyez pour envoyer vos bénédictions</div>
  </div>`;
}
function tapSalawat(){if(navigator.vibrate)navigator.vibrate(30);salawatWeekCount++;saveSalawat();renderSalawat();}

// renderBoutique, openProduit, renderEspace, renderLogin are defined below (after init)
async function doLogin(){
  const phone=document.getElementById('login-phone')?.value||'';
  const res=await fetch(SB_URL+'/rest/v1/clients?telephone=eq.'+phone,{headers:{'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY}});
  const data=await res.json();
  if(data&&data.length>0){pelerin=data[0];renderEspace();}
}

function deconnecter(){pelerin=null;renderEspace();}

function t(key){return(LANGS[currentLang]&&LANGS[currentLang][key])||LANGS.fr[key]||key;}
function setLang(lang){
  currentLang=lang;
  localStorage.setItem('kyswa-lang',lang);
  showPage(document.querySelector('.page[style*="block"]')?.id.replace('pg-','')||'home');
}

// ── Azan Audio ──────────────────────────────────────────────────────────────
let azanAudio=null;
function playAzan(){
  if(azanAudio){azanAudio.pause();azanAudio=null;return;}
  azanAudio=new Audio(AUDIO_MAP.talbiya);
  azanAudio.play().then(()=>{
    showToast('🔊','Azan','Lecture en cours...','#1565C0');
  }).catch(()=>{
    showToast('⚠️','Erreur audio','Touchez d\'abord l\'écran.','#E53935');
  });
  azanAudio.onended=()=>{azanAudio=null;};
}
function stopAzan(){if(azanAudio){azanAudio.pause();azanAudio=null;}}

async function init(){
  // Splash screen
  const splash=document.getElementById('splash-screen');
  if(splash){
    setTimeout(()=>{
      splash.style.transition='opacity 0.5s ease';
      splash.style.opacity='0';
      setTimeout(()=>{splash.style.display='none';},500);
    },1800);
  }

  await initSW();
  loadSalawat();
  const savedLang=localStorage.getItem('kyswa-lang');
  if(savedLang) currentLang=savedLang;

  // Auto-restore notification permission
  if('Notification' in window && Notification.permission==='granted'){
    notifPermission=true;
    const banner=document.getElementById('notif-banner');
    if(banner) banner.style.display='none';
  }

  const loc={lat:14.6937,lng:-17.4441};
  fetch(`https://api.aladhan.com/v1/timings?latitude=${loc.lat}&longitude=${loc.lng}&method=2`)
    .then(r=>r.json()).then(data=>{
      prayerTimes=data.data.timings;
      startTicker();
    }).catch(()=>{});

  showPage('home');
  renderQuiz();
  renderDuaList();
}
function startTicker(){
  setInterval(()=>{
    if(!prayerTimes) return;
    const now=new Date();
    const list=PRAYERS.map(p=>{
      const[ph,pm]=prayerTimes[p].split(':').map(Number);
      const d=new Date();d.setHours(ph,pm,0,0);return{name:p,time:prayerTimes[p],diff:d-now};
    }).filter(p=>p.diff>0).sort((a,b)=>a.diff-b.diff);
    
    let nxt;
    if(list.length){
      nxt=list[0];
    } else {
      // S'il n'y a plus de prières aujourd'hui, on prend le Fajr de demain
      const[ph,pm]=prayerTimes[PRAYERS[0]].split(':').map(Number);
      const d=new Date(); d.setDate(now.getDate()+1); d.setHours(ph,pm,0,0);
      nxt={name:PRAYERS[0],time:prayerTimes[PRAYERS[0]],diff:d-now};
    }

    const nm=document.getElementById('next-prayer-name'),ct=document.getElementById('countdown-el');
    if(nm) nm.textContent=PICONS[nxt.name]+' '+nxt.name+' — '+nxt.time;
    if(ct){
      let s=Math.floor(nxt.diff/1000);
      let h=Math.floor(s/3600); s%=3600;
      let m=Math.floor(s/60); s%=60;
      ct.textContent=`-${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    }
  },1000);
}

init();

// ── Render Sira ──────────────────────────────────────────────────────────────
let siraIdx = 0;
function renderSira(){
  const tabs = document.getElementById('sira-tabs');
  if(tabs) tabs.innerHTML = SIRA_LECONS.map((l,i)=>
    `<button class="step-btn${i===siraIdx?' active':''}" onclick="setSiraLecon(${i})">Leçon ${l.num}</button>`
  ).join('');
  const l = SIRA_LECONS[siraIdx];
  const el = document.getElementById('sira-content');
  if(el) el.innerHTML = `
    <div class="card" style="background:linear-gradient(135deg,#1A0A3E,#3D1A78);">
      <div style="color:rgba(255,255,255,0.6);font-size:10px;letter-spacing:1px;">LEÇON ${l.num} / ${SIRA_LECONS.length}</div>
      <div style="color:#fff;font-size:18px;font-weight:800;margin:8px 0;">${l.titre}</div>
      <div style="color:rgba(255,255,255,0.8);font-size:13px;line-height:1.7;">${l.contenu}</div>
    </div>
    <div class="card" style="background:linear-gradient(135deg,#005C40,#00815A);">
      <div style="color:rgba(255,255,255,0.6);font-size:10px;letter-spacing:1px;">HADITH DU JOUR</div>
      <div style="color:#7FFFD4;font-size:15px;font-style:italic;margin-top:8px;line-height:1.7;">"${l.hadith}"</div>
    </div>
    <div style="display:flex;gap:10px;margin-top:8px;">
      ${siraIdx>0?`<button onclick="prevSira()" class="btn btn-ghost" style="flex:1;">← Précédente</button>`:''}
      ${siraIdx<SIRA_LECONS.length-1?`<button onclick="nextSira()" class="btn btn-primary" style="flex:1;">Suivante →</button>`:'<div style="text-align:center;flex:1;background:var(--primary-soft);border-radius:var(--radius-md);padding:14px;color:var(--primary);font-weight:700;">🌟 30 leçons terminées !</div>'}
    </div>`;
}
function setSiraLecon(i){siraIdx=i;renderSira();window.scrollTo(0,100);}
function nextSira(){if(siraIdx<SIRA_LECONS.length-1){siraIdx++;renderSira();window.scrollTo(0,100);}}
function prevSira(){if(siraIdx>0){siraIdx--;renderSira();window.scrollTo(0,100);}}

// ── Render Infos ─────────────────────────────────────────────────────────────
let infosTab = 'climat';
function setInfosTab(tab){
  infosTab = tab;
  renderInfos();
}
function renderInfos(){
  const el = document.getElementById('infos-content');
  if(!el) return;
  const tabs = ['climat','interdits','bagages','sante'];
  const labels = {climat:'🌡️ Climat',interdits:'🚫 Interdits',bagages:'🎒 Bagages',sante:'💊 Santé'};
  let tabsHtml = `<div style="display:flex;gap:6px;margin-bottom:var(--space-md);overflow-x:auto;scrollbar-width:none;">`;
  tabs.forEach(t=>{
    tabsHtml += `<button onclick="setInfosTab('${t}')" style="flex-shrink:0;background:${t===infosTab?'var(--primary)':'var(--surface-2)'};color:${t===infosTab?'#fff':'var(--text-secondary)'};border:none;border-radius:var(--radius-full);padding:7px 14px;font-size:11px;font-weight:${t===infosTab?'700':'500'};cursor:pointer;">${labels[t]}</button>`;
  });
  tabsHtml += `</div>`;

  let contentHtml = '';
  if(infosTab==='climat'){
    contentHtml = CLIMAT_DATA.map(c=>`
      <div class="card" style="padding:12px var(--space-md);">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div style="font-weight:700;">${c.mois}</div>
          <div style="font-size:12px;color:var(--text-secondary);">${c.makkah}</div>
          <div style="font-size:11px;color:${c.pluie==='Non'?'var(--primary)':'var(--blue)'};">${c.pluie==='Non'?'☀️':'🌧️'}</div>
        </div>
        <div style="font-size:11px;color:var(--text-hint);margin-top:4px;">${c.conseil}</div>
      </div>`).join('');
  } else if(infosTab==='interdits'){
    contentHtml = `
      <div class="card"><div style="font-weight:700;margin-bottom:8px;">🧔 Hommes</div>${INTERDITS_DATA.hommes.map(i=>`<div style="margin-bottom:6px;"><strong>${i.interdit}</strong><br><span style="font-size:11px;color:var(--text-hint);">${i.explication}</span></div>`).join('')}</div>
      <div class="card"><div style="font-weight:700;margin-bottom:8px;">🧕 Femmes</div>${INTERDITS_DATA.femmes.map(i=>`<div style="margin-bottom:6px;"><strong>${i.interdit}</strong><br><span style="font-size:11px;color:var(--text-hint);">${i.explication}</span></div>`).join('')}</div>
      <div class="card" style="background:var(--primary-soft);"><div style="font-weight:700;margin-bottom:8px;color:var(--primary);">✅ Permis</div>${INTERDITS_DATA.permis.map(p=>`<div style="margin-bottom:4px;">${p}</div>`).join('')}</div>`;
  } else if(infosTab==='bagages'){
    contentHtml = BAGAGES_DATA.map(b=>`<div class="card"><div style="font-weight:700;margin-bottom:8px;">${b.cat}</div>${b.items.map(i=>`<div style="font-size:13px;padding:3px 0;border-bottom:1px solid var(--border);">· ${i}</div>`).join('')}</div>`).join('');
  } else if(infosTab==='sante'){
    contentHtml = SANTE_DATA.map(s=>`<div class="card"><div style="display:flex;align-items:center;gap:10px;"><div style="font-size:26px;">${s.icon}</div><div><div style="font-weight:700;">${s.titre}</div><div style="font-size:12px;color:var(--text-secondary);">${s.desc}</div></div></div></div>`).join('');
  }
  el.innerHTML = tabsHtml + contentHtml;
}

// ── Filter Boutique ──────────────────────────────────────────────────────────
function filterBoutique(cat){
  boutiqueFiltre = cat;
  document.querySelectorAll('[id^="cat-"]').forEach(b=>{
    const isCat = b.id==='cat-'+cat;
    b.style.background = isCat?'#fff':'rgba(255,255,255,0.15)';
    b.style.color = isCat?'#3D1A78':'#fff';
    b.style.fontWeight = isCat?'700':'400';
  });
  renderBoutique();
}
function renderBoutique(){
  const f = boutiqueFiltre==='tout'?PRODUITS:PRODUITS.filter(p=>p.cat===boutiqueFiltre);
  const el = document.getElementById('boutique-grid');
  if(el) el.innerHTML = f.map(p=>`
    <div onclick="openProduit(${p.id})" class="card" style="cursor:pointer;margin-bottom:0;">
      <div style="font-size:36px;text-align:center;margin-bottom:8px;">${p.emoji}</div>
      <div style="font-size:13px;font-weight:700;margin-bottom:4px;">${p.nom}</div>
      <div style="font-size:11px;color:var(--text-hint);margin-bottom:8px;">${p.desc}</div>
      <div style="font-size:14px;font-weight:800;color:var(--primary);">${p.prix}<span style="font-size:10px;"> FCFA</span></div>
    </div>`).join('');
}
function openProduit(id){
  const p = PRODUITS.find(x=>x.id===id);
  if(!p) return;
  const el = document.getElementById('produit-content');
  if(el) el.innerHTML = `
    <div style="background:linear-gradient(160deg,#1A0A3E,#3D1A78);padding:var(--hero-pt) var(--space-md) var(--space-lg);">
      <button onclick="showPage('boutique')" style="background:rgba(255,255,255,0.15);border:none;border-radius:var(--radius-sm);padding:8px 14px;color:#fff;font-size:13px;cursor:pointer;margin-bottom:12px;">← Retour</button>
      <div style="text-align:center;font-size:64px;">${p.emoji}</div>
      <div style="color:#fff;font-size:20px;font-weight:800;text-align:center;margin-top:12px;">${p.nom}</div>
    </div>
    <div style="padding:var(--space-md);">
      <div class="card">
        <div style="font-size:13px;color:var(--text-secondary);margin-bottom:12px;">${p.desc}</div>
        <div style="font-size:28px;font-weight:900;color:var(--primary);">${p.prix} <span style="font-size:14px;">FCFA</span></div>
      </div>
      <a href="https://wa.me/221787811616?text=Je%20commande%20${encodeURIComponent(p.nom)}" target="_blank" class="btn btn-whatsapp">📱 Commander via WhatsApp</a>
    </div>`;
  showPage('produit');
}

// ── Render Espace ────────────────────────────────────────────────────────────
function renderEspace(){
  if(!pelerin){renderLogin();return;}
  const loginSec = document.getElementById('espace-login-section');
  const profilSec = document.getElementById('espace-profil-section');
  if(loginSec) loginSec.style.display='none';
  if(profilSec){
    profilSec.style.display='block';
    profilSec.innerHTML=`
      <div style="background:linear-gradient(160deg,var(--primary-dark),var(--primary));padding:var(--hero-pt) var(--space-md) var(--space-lg);">
        <div style="color:rgba(255,255,255,0.6);font-size:11px;">MON ESPACE</div>
        <div style="color:#fff;font-size:22px;font-weight:800;">${pelerin.prenom||''} ${pelerin.nom||''}</div>
        <div style="color:rgba(255,255,255,0.7);font-size:13px;">${pelerin.email||pelerin.telephone||''}</div>
      </div>
      <div style="padding:var(--space-md);">
        <button onclick="deconnecter()" class="btn btn-ghost">🚪 Déconnexion</button>
      </div>`;
  }
}
function renderLogin(){
  const loginSec = document.getElementById('espace-login-section');
  const profilSec = document.getElementById('espace-profil-section');
  if(profilSec) profilSec.style.display='none';
  if(loginSec){
    loginSec.style.display='block';
    loginSec.innerHTML=`
      <div style="background:linear-gradient(160deg,var(--primary-dark),var(--primary));padding:var(--hero-pt) var(--space-md) var(--space-lg);">
        <div style="color:rgba(255,255,255,0.6);font-size:11px;">KYSWA TRAVEL</div>
        <div style="color:#fff;font-size:22px;font-weight:800;">Mon Espace</div>
        <div style="color:rgba(255,255,255,0.65);font-size:12px;">Connectez-vous pour suivre votre parcours</div>
      </div>
      <div style="padding:var(--space-md);">
        <div class="card">
          <div class="section-label">Téléphone</div>
          <input type="tel" id="login-phone" placeholder="77 123 45 67" class="input" style="margin-bottom:var(--space-md);"/>
          <button onclick="doLogin()" class="btn btn-primary">Se connecter</button>
        </div>
        <a href="https://wa.me/221787811616?text=Je%20veux%20demander%20un%20acc%C3%A8s%20Kyswa%20Travel" target="_blank" class="btn btn-outline" style="margin-top:10px;">📋 Demander un accès</a>
      </div>`;
  }
}

// ── Post-Oumra 40j ───────────────────────────────────────────────────────────
function renderPostOumra(el){
  const done = JSON.parse(localStorage.getItem('postoumra-done')||'{}');
  el.innerHTML = POST_40.map(item=>`
    <div class="card" onclick="validerPostOumra(${item.jour},${item.pts})" style="cursor:pointer;border:${done[item.jour]?'1.5px solid var(--primary)':'1px solid var(--border)'};">
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="width:40px;height:40px;border-radius:12px;background:${done[item.jour]?'var(--primary)':'var(--surface-2)'};display:flex;align-items:center;justify-content:center;font-weight:900;color:${done[item.jour]?'#fff':'var(--text-hint)'};">${item.jour}</div>
        <div style="flex:1;"><div style="font-weight:700;">${item.titre}</div><div style="font-size:12px;color:var(--text-hint);">${item.desc}</div></div>
        <div style="background:var(--gold-soft);color:var(--gold);border-radius:var(--radius-full);padding:4px 10px;font-size:11px;font-weight:700;">+${item.pts}</div>
      </div>
    </div>`).join('');
}
function validerPostOumra(jour,pts){
  const done = JSON.parse(localStorage.getItem('postoumra-done')||'{}');
  if(!done[jour]){done[jour]=true;localStorage.setItem('postoumra-done',JSON.stringify(done));barakaScore+=pts;showToast('✅','Baraka !','+'+pts+' Hasanat','#00815A');}
  renderBaraka();
}

// ── Azkar Modal ──────────────────────────────────────────────────────────────
function openAzkar(type){
  const data = type==='matin'?AZKAR_MATIN:type==='soir'?AZKAR_SOIR:AZKAR_SOMMEIL;
  const titre = type==='matin'?'🌅 Azkar Sabah':type==='soir'?'🌙 Azkar Massa':'💤 Azkar Sommeil';
  const el = document.getElementById('modal-content');
  if(el) el.innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-md);">
      <div style="font-size:16px;font-weight:800;">${titre}</div>
      <button onclick="closeModal()" style="background:var(--surface-2);border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;">✕</button>
    </div>
    ${data.map(a=>`
      <div class="invoc-card">
        <div style="padding:12px var(--space-md);">
          <div class="arabic-text">${a.ar}</div>
          <div class="translit">${a.translit}</div>
          <div class="traduction">${a.fr}</div>
          ${a.repetitions>1?`<div style="margin-top:8px;background:var(--primary-soft);border-radius:var(--radius-sm);padding:4px 10px;font-size:11px;color:var(--primary);font-weight:700;display:inline-block;">× ${a.repetitions}</div>`:''}
        </div>
      </div>`).join('')}
    <button onclick="validerBaraka('${type}',50)" class="btn btn-primary" style="margin-top:var(--space-md);">✅ Azkar terminés — +50 Hasanat</button>`;
  document.getElementById('modal-overlay').classList.add('show');
}

// ── Lang Menu ────────────────────────────────────────────────────────────────
function toggleLangMenu(){
  const menu = document.getElementById('lang-menu');
  if(menu) menu.classList.toggle('show');
}

// ── Formulaire WhatsApp ──────────────────────────────────────────────────────
function envoyerFormulaire(){
  const type = document.getElementById('f-type')?.value||'';
  const mois = document.getElementById('f-mois')?.value||'';
  const nom = document.getElementById('f-nom')?.value||'';
  const phone = document.getElementById('f-phone')?.value||'';
  const msg = `Salam Alaikum! Je veux une offre Kyswa Travel.\n📦 Package: ${type}\n📅 Mois: ${mois}\n👤 Nom: ${nom}\n📞 Tél: +221${phone}`;
  window.open('https://wa.me/221787811616?text='+encodeURIComponent(msg),'_blank');
}

function envoyerMessage(){
  const nom = document.getElementById('msg-nom')?.value||'';
  const phone = document.getElementById('msg-phone')?.value||'';
  const sujet = document.getElementById('msg-sujet')?.value||'';
  const texte = document.getElementById('msg-texte')?.value||'';
  const msg = `Salam Alaikum! Sujet: ${sujet}\nDe: ${nom} (${phone})\n${texte}`;
  window.open('https://wa.me/221787811616?text='+encodeURIComponent(msg),'_blank');
}

// ── Du'a perso ───────────────────────────────────────────────────────────────
function ajouterDua(){
  const titre = document.getElementById('dua-titre')?.value.trim();
  const texte = document.getElementById('dua-texte')?.value.trim();
  if(!titre||!texte){showToast('⚠️','Incomplet','Remplissez le titre et le texte.','#E53935');return;}
  const duas = JSON.parse(localStorage.getItem('duas-perso')||'[]');
  duas.push({titre,texte,date:new Date().toLocaleDateString()});
  localStorage.setItem('duas-perso',JSON.stringify(duas));
  document.getElementById('dua-titre').value='';
  document.getElementById('dua-texte').value='';
  renderDuaList();
  showToast('🤲','Du\'a sauvegardé !','','#00815A');
}
function renderDuaList(){
  const duas=JSON.parse(localStorage.getItem('duas-perso')||'[]');
  const el=document.getElementById('dua-list');
  if(!el) return;
  el.innerHTML=duas.map((d,i)=>`<div class="card"><div style="display:flex;justify-content:space-between;"><div style="font-size:13px;font-weight:700;">${d.titre}</div><button onclick="supprimerDua(${i})" style="background:none;border:none;color:var(--danger);cursor:pointer;">✕</button></div><div style="font-size:12px;color:var(--text-secondary);margin-top:6px;">${d.texte}</div></div>`).join('');
}
function supprimerDua(i){
  const duas=JSON.parse(localStorage.getItem('duas-perso')||'[]');
  duas.splice(i,1);
  localStorage.setItem('duas-perso',JSON.stringify(duas));
  renderDuaList();
}

// ── Quiz ─────────────────────────────────────────────────────────────────────
let quizIdx=0,quizScore=0;
function renderQuiz(){
  const el=document.getElementById('quiz-content');
  if(!el) return;
  if(quizIdx>=QUIZ_QUESTIONS.length){
    el.innerHTML=`<div class="card" style="text-align:center;"><div style="font-size:48px;">🏆</div><div style="font-size:20px;font-weight:800;margin:12px 0;">Score: ${quizScore}/${QUIZ_QUESTIONS.length}</div><button onclick="quizIdx=0;quizScore=0;renderQuiz();" class="btn btn-primary">Recommencer</button></div>`;
    return;
  }
  const q=QUIZ_QUESTIONS[quizIdx];
  el.innerHTML=`<div class="card"><div style="font-size:13px;font-weight:700;margin-bottom:16px;">${quizIdx+1}/${QUIZ_QUESTIONS.length} — ${q.q}</div>${q.r.map((r,i)=>`<button onclick="repondreQuiz(${i})" class="btn btn-ghost" style="margin-bottom:8px;">${r}</button>`).join('')}</div>`;
}
function repondreQuiz(i){
  const q=QUIZ_QUESTIONS[quizIdx];
  if(i===q.b){quizScore++;showToast('✅','Correct !','+1 point','#00815A');}
  else showToast('❌','Incorrect','La bonne réponse: '+q.r[q.b],'#E53935');
  quizIdx++;
  setTimeout(renderQuiz,800);
}

// ── Sadaqa montant ───────────────────────────────────────────────────────────
function setSadaqaMontant(m){
  const el=document.getElementById('sadaqa-montant');
  if(el) el.value=m;
  const w=document.getElementById('wave-btn');
  const o=document.getElementById('orange-btn');
  if(w) w.href=`https://pay.wave.com/m/M_OfAgT8X_IT4B/c/sn/?amount=${m}`;
  if(o) o.href=`https://om.orange.sn/payment?amount=${m}`;
}

// ── setDhikrTabAndShow ───────────────────────────────────────────────────────
function setDhikrTabAndShow(){
  showPage('dhikr');
  setDhikrTab('salawat');
}

// ══════ ZAKAT ══════
const ZK_NISAB=416500,ZK_RATE=0.025;
function zkFmt(n){if(!n&&n!==0)return"—";return new Intl.NumberFormat("fr-FR").format(Math.round(n))+" FCFA";}
function zkCat(cat,el){document.querySelectorAll(".zkf").forEach(f=>f.classList.remove("active"));document.querySelectorAll(".zcat").forEach(c=>c.classList.remove("active"));document.getElementById("zkf-"+cat)?.classList.add("active");el.classList.add("active");document.getElementById("zakat-result").classList.remove("show");}
function zkShow(zakatable,zakat,details,note){
  const box=document.getElementById("zakat-result"),body=document.getElementById("zk-result-body");
  let html="";
  if(zakatable<ZK_NISAB){html=`<div class="zk-alert">✅ <strong>Pas de Zakat obligatoire</strong><br>Base (${zkFmt(zakatable)}) inférieure au nisab (${zkFmt(ZK_NISAB)}).<br>La Sadaqa volontaire reste recommandée.</div>`;}
  else{html=`<div class="zk-nisab" style="margin-bottom:10px;"><div class="zk-ndot" style="background:#10b981;"></div><span>Nisab atteint ✅ — Zakat <strong style="color:#10b981;">obligatoire</strong></span></div><div class="zk-rrow"><div><div class="zk-rname">💰 Base zakatisable</div><div class="zk-rbasis">${details}</div></div><div class="zk-rval">${zkFmt(zakatable)}</div></div><div class="zk-total"><span class="tl">⚖️ Zakat à payer</span><span class="tv">${zkFmt(zakat)}</span></div>`;if(note)html+=`<div class="zk-alert" style="margin-top:7px;">${note}</div>`;}
  body.innerHTML=html;box.classList.add("show");setTimeout(()=>box.scrollIntoView({behavior:"smooth",block:"nearest"}),150);
}
function vv(id){return+(document.getElementById(id)?.value||0);}
function zkCalcEp(){const t=vv("ep-cash")+vv("ep-mobile")+vv("ep-bank")+vv("ep-loans")-vv("ep-debts");zkShow(t,t*ZK_RATE,"2.5% sur liquidités nettes","📅 Hawl requis — 1 an lunaire au-dessus du nisab.");}
function zkCalcCo(){const t=vv("co-stock")+vv("co-cash")+vv("co-recv")-vv("co-pay");zkShow(t,t*ZK_RATE,"2.5% sur actifs circulants nets","📅 Calculé à la date anniversaire du hawl.");}
function zkCalcOr(){const gv=vv("or-g")*vv("or-price"),av=vv("ag-g")*vv("ag-price"),t=gv+av;zkShow(t,t*ZK_RATE,"Or: "+zkFmt(gv)+" | Argent: "+zkFmt(av),"Nisab Or="+zkFmt(85*vv("or-price"))+" | Nisab Argent="+zkFmt(595*vv("ag-price")));}
function zkCalcAg(){const qty=vv("ag-qty"),rate=+(document.getElementById("ag-irr")?.value||0.1),kgp=vv("ag-kgp");if(qty<653){zkShow(0,0,"","Récolte ("+qty+"kg) < nisab (653kg = 5 wasq).");return;}const lbl=rate===0.1?"10% (pluie)":rate===0.05?"5% (irrigation)":"7.5% (mixte)";const base=kgp?qty*kgp:qty;zkShow(base,base*rate,lbl+" sur "+qty+"kg","⏰ Payable à chaque récolte — sans attendre le hawl.");}
function zkPreviewBt(){const cam=vv("bt-cam"),cat=vv("bt-cat"),shp=vv("bt-shp");let res=[];if(cam>0){let c=cam<5?"Pas de Zakat":cam<=9?"1 mouton":cam<=14?"2 moutons":cam<=19?"3 moutons":cam<=24?"4 moutons":cam<=35?"1 chamelle 1an":cam<=45?"1 chamelle 2ans":cam<=60?"1 chamelle 3ans":cam<=90?"2 chamelles 2ans":"2 chamelles 3ans+";res.push("🐪 "+cam+" → "+c);}if(cat>0){let c=cat<30?"Pas de Zakat":cat<=39?"1 veau 1an":cat<=59?"1 vache 2ans":""+Math.floor(cat/30)+" veaux";res.push("🐄 "+cat+" → "+c);}if(shp>0){let c=shp<40?"Pas de Zakat":shp<=120?"1 bête":shp<=200?"2 bêtes":shp<=399?"3 bêtes":""+Math.floor(shp/100)+" bêtes";res.push("🐑 "+shp+" → "+c);}const p=document.getElementById("bt-prev");if(p)p.textContent=res.join(" | ");}
function zkCalcBt(){zkPreviewBt();const prev=document.getElementById("bt-prev")?.textContent||"Veuillez saisir vos animaux.";const box=document.getElementById("zakat-result"),body=document.getElementById("zk-result-body");body.innerHTML=`<div class="zk-alert"><strong>📊 Résultat Bétail :</strong><br>${prev}</div><div class="zk-info" style="margin-top:6px;">⏱️ Hawl requis (1 an) · Animaux en pâture libre (saïma)</div>`;box.classList.add("show");setTimeout(()=>box.scrollIntoView({behavior:"smooth",block:"nearest"}),150);}
function zkToggleAc(){const t=document.getElementById("ac-type")?.value;const r=document.getElementById("ac-div-row");if(r)r.style.display=t==="industry"?"block":"none";}
function zkCalcAc(){zkToggleAc();const type=document.getElementById("ac-type")?.value,val=vv("ac-val");let z,d;if(type==="trade"){z=val;d="2.5% sur valeur totale";}else{z=vv("ac-divs");d="2.5% sur dividendes + trésorerie";}zkShow(z,z*ZK_RATE,d,"");}
function zkCalcLo(){const base=vv("lo-sav")>0?vv("lo-sav"):Math.max(0,vv("lo-inc")-vv("lo-chg"));zkShow(base,base*ZK_RATE,"2.5% sur loyers nets économisés","🏠 L'immeuble lui-même n'est pas zakatisable.");}
function zkUpdateMiRate(){const r=+(document.getElementById("mi-type")?.value||0.2);const l=document.getElementById("mi-rate-lbl");if(l)l.textContent=(r*100).toFixed(0)+"%";}
function zkCalcMi(){const val=vv("mi-val"),rate=+(document.getElementById("mi-type")?.value||0.2);zkShow(val,val*rate,(rate*100).toFixed(0)+"% sur production",rate===0.2?"🏺 Rikaz : payable immédiatement, sans hawl.":"⛏️ Payable à chaque extraction.");}
function zkCalcSa(){const mth=vv("sa-mth"),sav=vv("sa-sav"),m=document.getElementById("sa-mth2")?.value;if(m==="savings"){zkShow(sav,sav*ZK_RATE,"2.5% sur épargne accumulée","📚 Opinion Maliki : épargne ayant tenu 1 an au-dessus du nisab.");}else{const a=mth*12;zkShow(a,a*ZK_RATE,"2.5% sur revenu annuel ("+mth.toLocaleString("fr-FR")+"×12)","💡 Permet de payer mensuellement ou annuellement.");}}

// ══════ MIRAS ══════
const mrS={husband:false,wives:0,sons:0,daughters:0,grandsons:0,granddaughters:0,father:false,mother:false,grandfather:false,gm_pat:false,gm_mat:false,full_brothers:0,full_sisters:0,pat_brothers:0,pat_sisters:0,mat_siblings:0};
function mrFmt(n){return new Intl.NumberFormat("fr-FR").format(Math.round(n))+" FCFA";}
function gcd2(a,b){return b===0?a:gcd2(b,a%b);}
function lcm2(a,b){return a*b/gcd2(a,b);}
function mrGoStep(n){document.querySelectorAll(".mr-step").forEach(s=>s.classList.remove("active"));document.getElementById("mr-step"+n)?.classList.add("active");document.querySelectorAll(".mr-dot").forEach((d,i)=>{d.classList.remove("active","done");if(i+1<n)d.classList.add("done");if(i+1===n)d.classList.add("active");});window.scrollTo({top:0,behavior:"smooth"});}
function mrUpdateSummary(){const e=+(document.getElementById("mr-estate")?.value||0),d=+(document.getElementById("mr-debts")?.value||0),f=+(document.getElementById("mr-funeral")?.value||0),b=+(document.getElementById("mr-bequest")?.value||0);const aD=e-d-f,bq=Math.min(b/100*aD,aD/3),net=Math.max(0,aD-bq);document.getElementById("mrs-gross").textContent=mrFmt(e);document.getElementById("mrs-debts").textContent=d>0?"−"+mrFmt(d):"0";document.getElementById("mrs-funeral").textContent=f>0?"−"+mrFmt(f):"0";document.getElementById("mrs-bequest").textContent=bq>0?"−"+mrFmt(bq):"0";document.getElementById("mrs-net").textContent=mrFmt(Math.max(0,net));}
function mrToggle(k){mrS[k]=!mrS[k];document.getElementById("mrt-"+k)?.classList.toggle("sel",mrS[k]);if(k==="husband"&&mrS[k]){mrS.wives=0;["wife1","wife2"].forEach(x=>document.getElementById("mrt-"+x)?.classList.remove("sel"));document.getElementById("mr-wives-row").style.display="none";}}
function mrSetWives(n){mrS.husband=false;document.getElementById("mrt-husband")?.classList.remove("sel");document.getElementById("mrt-wife1")?.classList.remove("sel");document.getElementById("mrt-wife2")?.classList.remove("sel");if(mrS.wives===n){mrS.wives=0;document.getElementById("mr-wives-row").style.display="none";return;}mrS.wives=n===1?1:2;document.getElementById("mrt-wife"+n)?.classList.add("sel");document.getElementById("mr-wives-row").style.display=n===2?"flex":"none";if(n===2)document.getElementById("mr-wv").textContent=mrS.wives;}
function mrAdjWives(d){const v=Math.min(4,Math.max(2,mrS.wives+d));mrS.wives=v;document.getElementById("mr-wv").textContent=v;}
function mrAdj(k,d){const v=Math.max(0,(mrS[k]||0)+d);mrS[k]=v;document.getElementById("mrv-"+k).textContent=v;}
function computeMiras(){
  const estate=+(document.getElementById("mr-estate")?.value||0),debts=+(document.getElementById("mr-debts")?.value||0),funeral=+(document.getElementById("mr-funeral")?.value||0),bqP=+(document.getElementById("mr-bequest")?.value||0);
  if(estate<=0){showToast("⚠️","Attention","Veuillez saisir la masse successorale.","#E53935");return;}
  const afterD=estate-debts-funeral,actualBq=Math.min(bqP/100*afterD,afterD/3),net=Math.max(0,afterD-actualBq);
  const h={...mrS},excl=[],act={...h};
  const hasSon=h.sons>0,hasMD=h.sons>0||h.grandsons>0,hasC=h.sons>0||h.daughters>0,hasD=hasC||h.grandsons>0||h.granddaughters>0;
  if(h.father&&h.grandfather){act.grandfather=false;excl.push({n:"Grand-père paternel",r:"Exclu par le père"});}
  if(h.mother){if(h.gm_pat){act.gm_pat=false;excl.push({n:"Grand-mère paternelle",r:"Exclue par la mère"});}if(h.gm_mat){act.gm_mat=false;excl.push({n:"Grand-mère maternelle",r:"Exclue par la mère"});}}
  if(h.father&&h.gm_pat&&!h.mother){act.gm_pat=false;excl.push({n:"Grand-mère paternelle",r:"Exclue par le père"});}
  if(hasSon&&(h.grandsons>0||h.granddaughters>0)){act.grandsons=0;act.granddaughters=0;excl.push({n:"Petits-fils/Petites-filles",r:"Exclus par les fils"});}
  if(h.father||hasMD){if(h.full_brothers>0){act.full_brothers=0;excl.push({n:h.full_brothers+" Frère(s) germain(s)",r:"Exclus par père ou fils"});}if(h.pat_brothers>0){act.pat_brothers=0;excl.push({n:h.pat_brothers+" Frère(s) consanguin(s)",r:"Exclus par père ou fils"});}}
  if(h.full_brothers>0&&h.pat_brothers>0&&!h.father&&!hasMD){act.pat_brothers=0;excl.push({n:h.pat_brothers+" Fr. consanguin(s)",r:"Exclus par frères germains"});}
  if(hasD||h.father||act.grandfather){if(h.mat_siblings>0){act.mat_siblings=0;excl.push({n:h.mat_siblings+" Fr./Sœur(s) utérin(s)",r:"Exclus par descendants ou père"});}}
  if(h.daughters>=2&&h.granddaughters>0&&h.grandsons===0&&!hasSon){act.granddaughters=0;excl.push({n:h.granddaughters+" Petite(s)-fille(s)",r:"Exclues (2/3 comblés par les filles)"});}
  const hMDA=act.sons>0||act.grandsons>0,hCA=act.sons>0||act.daughters>0,hDA=hCA||act.grandsons>0||act.granddaughters>0;
  let shares=[];
  if(act.husband)shares.push({n:"Époux",ar:"الزَّوْج",f:hDA?[1,4]:[1,2],b:hDA?"1/4":"1/2"});
  if(act.wives>0)shares.push({n:act.wives===1?"Épouse":act.wives+" Épouses",ar:"الزَّوْجَة",f:hDA?[1,8]:[1,4],b:hDA?"1/8 partagé":"1/4 partagé",wives:act.wives});
  if(act.mother){const nb=(act.full_brothers+act.full_sisters+act.pat_brothers+act.pat_sisters+act.mat_siblings);shares.push({n:"Mère",ar:"الأُمّ",f:(hDA||nb>=2)?[1,6]:[1,3],b:hDA?"1/6":nb>=2?"1/6 (2+ frères/sœurs)":"1/3"});}
  if(act.father){if(hMDA)shares.push({n:"Père",ar:"الأَب",f:[1,6],b:"1/6"});else if(hDA)shares.push({n:"Père",ar:"الأَب",f:[1,6],b:"1/6 + résidu",asaba:"father_bonus"});else shares.push({n:"Père",ar:"الأَب",f:[0,1],b:"Résidu total",asaba:"pure"});}
  if(act.grandfather){if(hMDA)shares.push({n:"Grand-père pat.",ar:"الجَدّ",f:[1,6],b:"1/6"});else if(hDA)shares.push({n:"Grand-père pat.",ar:"الجَدّ",f:[1,6],b:"1/6 + résidu",asaba:"father_bonus"});else shares.push({n:"Grand-père pat.",ar:"الجَدّ",f:[0,1],b:"Résidu",asaba:"pure"});}
  const gmc=(act.gm_pat?1:0)+(act.gm_mat?1:0);if(gmc>0){const pf=gmc===2?[1,12]:[1,6];if(act.gm_pat)shares.push({n:"Grand-mère pat.",ar:"الجَدَّة",f:pf,b:gmc===2?"1/12":"1/6"});if(act.gm_mat)shares.push({n:"Grand-mère mat.",ar:"الجَدَّة",f:pf,b:gmc===2?"1/12":"1/6"});}
  if(act.daughters>0&&!hMDA){const f=act.daughters===1?[1,2]:[2,3];shares.push({n:act.daughters===1?"Fille":act.daughters+" Filles",ar:"البِنْت",f,b:act.daughters===1?"1/2":"2/3",count:act.daughters});}
  if(act.sons>0)shares.push({n:act.daughters>0?act.sons+" Fils + "+act.daughters+" Filles":act.sons+" Fils",ar:"الأَبْنَاء",f:[0,1],b:"Résidu — fils=2×fille",asaba:"sons_daus",sons:act.sons,daughters:act.daughters});
  if(act.grandsons>0&&act.sons===0)shares.push({n:act.granddaughters>0?act.grandsons+" PF+"+act.granddaughters+" Pf":act.grandsons+" Petits-fils",ar:"بَنُو الابن",f:[0,1],b:"Résidu",asaba:"sons_daus",sons:act.grandsons,daughters:act.granddaughters||0});
  if(act.granddaughters>0&&act.grandsons===0&&act.sons===0){if(act.daughters===0){const f=act.granddaughters===1?[1,2]:[2,3];shares.push({n:act.granddaughters+" Petite(s)-fille(s)",ar:"بِنْت الابن",f,b:act.granddaughters===1?"1/2":"2/3",count:act.granddaughters});}else if(act.daughters===1)shares.push({n:act.granddaughters+" Petite(s)-fille(s)",ar:"بِنْت الابن",f:[1,6],b:"1/6",count:act.granddaughters});}
  if(act.full_brothers>0&&!act.father&&!hMDA)shares.push({n:act.full_sisters>0?act.full_brothers+" Fr.+"+act.full_sisters+" S.germains":act.full_brothers+" Frère(s) germain(s)",ar:"الإِخْوَة الأَشِقَّاء",f:[0,1],b:"Résidu asaba",asaba:"sons_daus",sons:act.full_brothers,daughters:act.full_sisters});
  if(act.full_sisters>0&&act.full_brothers===0&&!act.father&&!hMDA){if(hCA&&act.sons===0)shares.push({n:act.full_sisters+" Sœur(s) germaine(s)",ar:"الأَخَوَات",f:[0,1],b:"Résidu avec filles",asaba:"sisters_dau",count:act.full_sisters});else if(!hDA){const f=act.full_sisters===1?[1,2]:[2,3];shares.push({n:act.full_sisters===1?"Sœur germaine":act.full_sisters+" Sœurs germaines",ar:"الأُخْت الشَّقِيقَة",f,b:act.full_sisters===1?"1/2":"2/3",count:act.full_sisters});}}
  if(act.pat_brothers>0&&!act.father&&!hMDA&&act.full_brothers===0)shares.push({n:act.pat_sisters>0?act.pat_brothers+" Fr.cons.+"+act.pat_sisters+" S.cons.":act.pat_brothers+" Frère(s) consanguin(s)",ar:"الأَخ لِأَب",f:[0,1],b:"Résidu",asaba:"sons_daus",sons:act.pat_brothers,daughters:act.pat_sisters});
  if(act.pat_sisters>0&&act.pat_brothers===0&&!act.father&&!hMDA&&act.full_brothers===0){if(act.full_sisters===1)shares.push({n:act.pat_sisters+" Sœur(s) consanguine(s)",ar:"الأُخْت لِأَب",f:[1,6],b:"1/6",count:act.pat_sisters});else if(act.full_sisters===0&&!hDA){const f=act.pat_sisters===1?[1,2]:[2,3];shares.push({n:act.pat_sisters===1?"Sœur consanguine":act.pat_sisters+" Sœurs consanguines",ar:"الأُخْت لِأَب",f,b:act.pat_sisters===1?"1/2":"2/3",count:act.pat_sisters});}else if(hCA&&act.sons===0)shares.push({n:act.pat_sisters+" Sœur(s) cons.",ar:"الأُخْت لِأَب",f:[0,1],b:"Résidu avec filles",asaba:"sisters_dau",count:act.pat_sisters});}
  if(act.mat_siblings>0){const f=act.mat_siblings===1?[1,6]:[1,3];shares.push({n:act.mat_siblings+" Fr./Sœur(s) utérin(s)",ar:"الإِخْوَة لِأُمّ",f,b:act.mat_siblings===1?"1/6":"1/3 partagé",count:act.mat_siblings});}
  let totN=0,totD=1;const fixedS=shares.filter(s=>!s.asaba);
  for(const s of fixedS){const d=lcm2(totD,s.f[1]);totN=totN*(d/totD)+s.f[0]*(d/s.f[1]);totD=d;}
  let reN=totD-totN,adjL="";const asabaS=shares.filter(s=>s.asaba);
  if(reN<0){adjL="awl";const tf=totN/totD;for(const s of fixedS)s.adjPct=s.f[0]/s.f[1]/tf;}
  else if(reN>0&&asabaS.length===0){adjL="radd";const rH=fixedS.filter(s=>!s.n.includes("poux")&&!s.n.includes("pouse"));const rT=rH.reduce((sum,s)=>sum+s.f[0]/s.f[1],0);for(const s of rH)s.rB=reN/totD*(s.f[0]/s.f[1]/rT);}
  if(reN>0&&asabaS.length>0){const residue=reN/totD;const pA=asabaS.filter(s=>s.asaba==="pure");for(const s of asabaS){if(s.asaba==="father_bonus")s.aP=residue;else if(s.asaba==="pure")s.aP=residue/pA.length;else if(s.asaba==="sons_daus"){s.aP=residue;const u=s.sons*2+(s.daughters||0);s.pS=u>0?residue*2/u:0;s.pD=u>0?residue/u:0;}else if(s.asaba==="sisters_dau"){s.aP=residue;s.pP=s.count>0?residue/s.count:residue;}}}
  const recap=`<div class="mr-er"><span>Masse brute</span><span>${mrFmt(estate)}</span></div>`+(debts>0?`<div class="mr-er"><span>− Dettes</span><span>${mrFmt(debts)}</span></div>`:"")+( funeral>0?`<div class="mr-er"><span>− Funéraires</span><span>${mrFmt(funeral)}</span></div>`:"")+( actualBq>0?`<div class="mr-er"><span>− Wasiyya</span><span>${mrFmt(actualBq)}</span></div>`:"")+`<div class="mr-er tot"><span>= Net distribuable</span><span>${mrFmt(net)}</span></div>`;
  document.getElementById("mr-recap").innerHTML=recap;
  document.getElementById("mr-awl-radd").innerHTML=adjL==="awl"?`<div class="zk-alert">⚡ <strong>AWL</strong> : Parts > 1 — réduites proportionnellement.</div>`:adjL==="radd"?`<div class="zk-alert">↩️ <strong>RADD</strong> : Résidu redistribué aux héritiers (hors conjoint).</div>`:"";
  let rH="";
  for(const s of shares){let pct;if(s.asaba){const a=s.aP||0;pct=s.asaba==="father_bonus"?1/6+a:a;}else{const bp=s.adjPct!==undefined?s.adjPct:s.f[0]/s.f[1];pct=bp+(s.rB||0);}const amount=net*pct,bW=Math.min(100,pct*100);
  rH+=`<div class="zk-rrow"><div style="flex:1;"><div class="zk-rname">${s.n} <span style="font-family:'Amiri',serif;font-size:.74rem;color:#8aada0;">${s.ar}</span></div><div class="zk-rbasis">${s.b}</div>${s.pS!==undefined&&s.sons>0?`<div class="zk-rbasis">👦 ${mrFmt(net*s.pS)} | 👧 ${mrFmt(net*s.pD)}</div>`:""}${s.pP!==undefined?`<div class="zk-rbasis">Par personne: ${mrFmt(net*s.pP)}</div>`:""}${s.wives>1?`<div class="zk-rbasis">Par épouse: ${mrFmt(amount/s.wives)}</div>`:""}${s.count>1&&!s.asaba?`<div class="zk-rbasis">Par personne: ${mrFmt(amount/s.count)}</div>`:""}
  <div class="mr-sbar"><div class="mr-sbg"><div class="mr-sf" style="width:${bW}%"></div></div></div></div><div style="text-align:right;margin-left:10px;flex-shrink:0;"><div class="zk-rpct">${(pct*100).toFixed(2)}%</div><div class="zk-rval">${mrFmt(amount)}</div></div></div>`;}
  if(!shares.length)rH=`<div class="zk-alert">⚠️ Aucun héritier sélectionné.</div>`;
  document.getElementById("mr-result-body").innerHTML=rH;
  let eH="";
  if(excl.length>0){eH=`<div class="zk-excl"><h4>❌ Héritiers exclus (محجوبون)</h4>`;for(const e of excl)eH+=`<div class="zk-ei"><span><strong>${e.n}</strong> — ${e.r}</span></div>`;eH+=`</div>`;}
  eH+=`<div class="zk-excl" style="margin-top:8px;background:rgba(212,160,23,0.07);border-color:rgba(212,160,23,0.17);"><h4 style="color:#f0c040;">🚫 Qui N'hérite PAS en Islam — par la volonté d'Allah ﷻ</h4><div class="zk-ei" style="color:#8aada0;">Non-musulman (الكافر) — différence de religion bloque l'héritage</div><div class="zk-ei" style="color:#8aada0;">Meurtrier du défunt (القاتل) — la main qui tue n'hérite pas</div><div class="zk-ei" style="color:#8aada0;">Esclave (الرقيق)</div><div class="zk-ei" style="color:#8aada0;">Héritier décédé avant le défunt</div><div class="zk-ei" style="color:#8aada0;">Enfant sans filiation légitime reconnue</div><div class="mr-quran" style="margin-top:7px;">لِلذَّكَرِ مِثْلُ حَظِّ الْأُنثَيَيْنِ — النساء ٤:١١<br>وَلَكُمْ نِصْفُ مَا تَرَكَ أَزْوَاجُكُمْ — النساء ٤:١٢</div></div>`;
  document.getElementById("mr-excluded").innerHTML=eH;
  mrGoStep(3);
}
function resetMiras(){Object.keys(mrS).forEach(k=>{mrS[k]=typeof mrS[k]==="boolean"?false:0;});document.querySelectorAll(".mr-ti").forEach(el=>el.classList.remove("sel"));document.querySelectorAll(".mr-cval").forEach(el=>el.textContent="0");document.getElementById("mr-wives-row").style.display="none";["mr-estate","mr-debts","mr-funeral"].forEach(id=>{const el=document.getElementById(id);if(el)el.value="";});mrUpdateSummary();mrGoStep(1);}

// Fin
