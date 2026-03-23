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
  ['home','sira','infos','oumra','baraka','dhikr','espace'].forEach(n=>{
    const btn=document.getElementById('nb-'+n);const lbl=document.getElementById('nbl-'+n);
    if(btn) btn.style.opacity='0.5';
    if(lbl){lbl.style.color='var(--text-hint)';lbl.style.fontWeight='500';}
  });
  const navMap={verses:'coran',produit:'boutique',formulaire:'packages',packages:'oumra',boutique:'oumra',prieres:'oumra',coran:'oumra'};
  const nid=navMap[id]||id;
  const nb=document.getElementById('nb-'+nid);const nl=document.getElementById('nbl-'+nid);
  if(nb) nb.style.opacity='1';
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
    el.innerHTML=`<div style="text-align:center;"><button onclick="activerBoussole()" id="compass-btn" class="btn btn-primary">🧭 Activer la boussole</button></div>`;
  }
}
function setPrieresTab(tab){prieresTabState=tab;renderPrieres();}
function activerBoussole(){
  if(typeof DeviceOrientationEvent!=='undefined'&&typeof DeviceOrientationEvent.requestPermission==='function'){
    DeviceOrientationEvent.requestPermission().then(p=>{if(p==='granted')window.addEventListener('deviceorientation',onOrient,true);});
  } else window.addEventListener('deviceorientation',onOrient,true);
}
function onOrient(e){
  compassHeading=e.webkitCompassHeading!=null?e.webkitCompassHeading:(360-(e.alpha||0));
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
    <div style="font-size:26px;text-align:center;direction:rtl;font-family:var(--font-arabic);">${d.ar}</div>
    <div style="text-align:center;margin:20px 0;"><button id="dhikr-btn" onclick="tapDhikr()" style="width:120px;height:120px;border-radius:50%;font-size:40px;background:var(--primary);color:#fff;border:none;">${dhikrCount}</button></div>
    <div style="text-align:center;color:var(--text-hint);">Objectif: ${d.target}</div>`;
}
function tapDhikr(){dhikrCount++;dhikrTotal++;renderDhikr();}
function resetDhikr(){dhikrCount=0;renderDhikr();}
function selectDhikr(i){dhikrSel=i;dhikrCount=0;renderDhikr();}

function renderSalawat(){
  loadSalawat();
  const el=document.getElementById('salawat-tab-content');if(!el)return;
  el.innerHTML=`<div style="text-align:center;padding:20px;">
    <div style="font-size:32px;">🌹</div>
    <div style="font-size:40px;font-weight:900;">${salawatWeekCount.toLocaleString()}</div>
    <button onclick="tapSalawat()" class="btn btn-primary" style="width:150px;height:150px;border-radius:50%;margin-top:20px;">🌹</button>
  </div>`;
}
function tapSalawat(){salawatWeekCount++;saveSalawat();renderSalawat();}

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
