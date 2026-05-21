/* Guide */
// ── ガイドモーダル ────────────────────────────────────────
const _guideCache={};
let _guideCurrentTab='overview';

function getGuideBasePath(){
  const base=location.pathname.replace(/\/[^/]*$/,'');
  return base+'/guide';
}

async function fetchGuide(tabKey){
  if(_guideCache[tabKey])return _guideCache[tabKey];
  const lang=st.lang==='en'?'en':'ja';
  const urls=[
    `${getGuideBasePath()}/${lang}/${tabKey}.md`,
    `${getGuideBasePath()}/${tabKey}.md`,
  ];
  for(const url of urls){
    try{
      const res=await fetch(url);
      if(res.ok){
        const text=await res.text();
        _guideCache[tabKey]=text;
        return text;
      }
    }catch{}
  }
  return null;
}

async function switchGuideTab(tabKey){
  _guideCurrentTab=tabKey;
  const l=L[st.lang];
  document.querySelectorAll('.guide-tab').forEach(b=>
    b.classList.toggle('active',b.dataset.guide===tabKey)
  );
  const body=document.getElementById('guide-body');
  body.innerHTML=`<p class="guide-loading">${l.guideLoading}</p>`;
  const md=await fetchGuide(tabKey);
  if(!md){
    body.innerHTML=`<p class="guide-loading" style="color:#c0453a;">${l.guideError}</p>`;
    return;
  }
  body.innerHTML=md2h(md);
}

function openGuide(tab='overview'){
  if(isBusy())return;
  document.getElementById('guide-overlay').classList.add('show');
  Object.keys(_guideCache).forEach(k=>delete _guideCache[k]);
  switchGuideTab(tab);
  document.addEventListener('keydown',onGuideKeyDown);
}

function closeGuide(){
  document.getElementById('guide-overlay').classList.remove('show');
  document.removeEventListener('keydown',onGuideKeyDown);
}

function onGuideOverlayClick(e){
  if(e.target===document.getElementById('guide-overlay'))closeGuide();
}

function onGuideKeyDown(e){
  if(e.key==='Escape')closeGuide();
}
