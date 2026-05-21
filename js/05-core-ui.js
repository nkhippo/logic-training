/* Core UI */
// ── i18n 適用 ─────────────────────────────────────────────
const DIFF_LABELS_JA={1:'★入門',2:'★★基礎',3:'★★★標準',4:'★★★★上級',5:'★★★★★超難問'};
const DIFF_LABELS_EN={1:'★Beginner',2:'★★Basic',3:'★★★Standard',4:'★★★★Advanced',5:'★★★★★Master'};
const FILL_HINT_NONE_NOTE_JA='\n\n重要：難易度3以上ではhintsフィールドはすべて必ず空文字列("")にしてください。ヒントを含む文字列を返してはいけません。';
const FILL_HINT_NONE_NOTE_EN='\n\nIMPORTANT: For difficulty 3 and above, every hints field must be an empty string (""). Do not return any hint text.';
const FILL_FORMAT_NOTE_JA='文章の書式ルール：\n- 段落の冒頭は全角スペース「　」を1つ入れてインデントすること\n- 段落の区切りには改行を入れること\n- 読みやすさを重視し、1段落は3〜5文程度にまとめること';
const FILL_FORMAT_NOTE_EN='Formatting rules:\n- Indent the first line of each paragraph with a single space or em-space\n- Add a line break between paragraphs\n- Keep each paragraph to 3-5 sentences for readability';
const SUM_FORMAT_NOTE_JA='文章の書式ルール：\n- 段落の冒頭は全角スペース「　」を1つ入れてインデントすること\n- 段落の区切りには改行を入れること';
const SUM_FORMAT_NOTE_EN='Formatting rules:\n- Indent the first line of each paragraph\n- Add a line break between paragraphs';
function dlabel(d){return(st.lang==='ja'?DIFF_LABELS_JA:DIFF_LABELS_EN)[d]||'—';}
const BADGE={1:'b1',2:'b2',3:'b3',4:'b4',5:'b5'};
function industryDisplayLabel(value,lang){
  if(!value)return L[lang||st.lang].metaIndustryNone||'未選択';
  const ind=INDUSTRY_PRESETS[lang||st.lang].find(p=>p.value===value);
  return ind?.label||L[lang||st.lang].metaIndustryNone||'未選択';
}
function buildProblemMetaHtml(prob,lang){
  const l=L[lang||st.lang];
  const diffNum=+(prob.diff||0);
  const diffPart=diffNum?`<span class="meta-tag meta-diff"><span class="badge ${BADGE[diffNum]||'b3'}">${dlabel(diffNum)}</span></span>`:'';
  const indKey=l.metaIndustry||'業界';
  return`<div class="problem-meta-row">
    <span class="meta-tag">${esc(l.theme)}${esc(prob.theme||'—')}</span>
    <span class="meta-tag">${esc(indKey)}：${esc(industryDisplayLabel(prob.industry,lang))}</span>
    ${diffPart}
  </div>`;
}
function renderProblemMeta(elId,prob){
  const el=document.getElementById(elId);
  if(el)el.innerHTML=buildProblemMetaHtml(prob,prob.lang||st.lang);
}
function genIndustrySnapshot(){return st.industry||'';}

function ui(id,txt){const e=document.getElementById(id);if(e)e.textContent=txt;}
function applyLang(){
  const l=L[st.lang];
  ui('ui-app-title',l.appTitle);
  ui('ui-f-sub-new',l.subNew);ui('ui-f-sub-past',l.subPast);
  ui('ui-s-sub-new',l.subNew);ui('ui-s-sub-past',l.subPast);
  ui('ui-guide-btn',l.guideBtn);ui('ui-guide-title',l.guideTitle);
  ui('ui-gtab-overview',l.gTabOverview);ui('ui-gtab-fill',l.gTabFill);ui('ui-gtab-summary',l.gTabSummary);
  ui('ui-gtab-critique',l.gTabCritique);ui('ui-gtab-ame',l.gTabAme);ui('ui-gtab-kibari',l.gTabKibari);
  ui('ui-tab-fill',l.tabFill);ui('ui-tab-critique',l.tabCritique);ui('ui-tab-sum',l.tabSum);ui('ui-tab-ame',l.tabAme);ui('ui-tab-kibari',l.tabKibari);
  setThemeLabel('ui-f-theme-lbl',l);
  ui('ui-f-gen',l.genBtn);ui('ui-f-inst',l.fInst);ui('ui-f-submit',l.submitBtn);
  ui('ui-f-pq',l.pq);ui('ui-f-pa',l.pa);
  ui('ui-f-gen-loading',l.genLoading);
  ui('ui-f-rand',l.rand);
  ui('ui-f-back',l.back);ui('ui-fp-all',l.all);
  const rp=document.getElementById('r-premise');
  if(rp)rp.placeholder='';
  setThemeLabel('ui-s-theme-lbl',l);
  ui('ui-s-vol-lbl',l.sVolLbl);ui('ui-vol-short',l.volShort);ui('ui-vol-mid',l.volMid);ui('ui-vol-long',l.volLong);
  const fmtVolChars=n=>st.lang==='ja'?n.toLocaleString('ja-JP')+'字':n.toLocaleString('en-US')+' chars';
  ui('ui-vol-short-chars',fmtVolChars(S_LENGTH_VARIABLE.short.chars));
  ui('ui-vol-mid-chars',fmtVolChars(S_LENGTH_VARIABLE.mid.chars));
  ui('ui-vol-long-chars',fmtVolChars(S_LENGTH_VARIABLE.long.chars));
  ui('ui-s-gen',l.sGenBtn);ui('ui-s-inst',l.sInst);ui('ui-s-submit',l.sSubmit);
  ui('ui-s-ans-mode-lbl',l.ansModeLbl);ui('ui-s-amode-text',l.amodeText);ui('ui-s-amode-photo',l.amodePhoto);
  ui('ui-s-photo-lbl',l.photoLbl);ui('ui-s-upload-hint',l.uploadHint);ui('ui-s-upload-note',l.uploadNote);ui('ui-s-memo-lbl',l.memoLbl);
  ui('ui-c-ans-mode-lbl',l.ansModeLbl);ui('ui-c-amode-text',l.amodeText);ui('ui-c-amode-photo',l.amodePhoto);
  ui('ui-c-photo-lbl',l.photoLbl);ui('ui-c-upload-hint',l.uploadHint);ui('ui-c-upload-note',l.uploadNote);ui('ui-c-memo-lbl',l.memoLbl);
  ui('ui-a-ans-mode-lbl',l.ansModeLbl);ui('ui-a-amode-text',l.amodeText);ui('ui-a-amode-photo',l.amodePhoto);
  ui('ui-a-photo-lbl',l.photoLbl);ui('ui-a-upload-hint',l.uploadHint);ui('ui-a-upload-note',l.uploadNote);ui('ui-a-memo-lbl',l.memoLbl);
  ui('ui-f-copy',l.copyBtn);ui('ui-s-copy',l.copyBtn);
  ui('ui-s-pq',l.pq);ui('ui-s-pa',l.pa);
  ui('ui-s-gen-loading',l.genLoading);
  ui('ui-s-rand',l.rand);
  ui('ui-s-back',l.back);ui('ui-sp-all',l.all);

  ui('ui-c-sub-new',l.subNew);ui('ui-c-sub-past',l.subPast);
  setThemeLabel('ui-c-theme-lbl',l);
  ui('ui-c-gen',l.cGenBtn);ui('ui-c-gen-loading',l.cGenLoading);
  ui('ui-c-inst',l.cInst);ui('ui-c-submit',l.cSubmit);ui('ui-c-pa',l.pa);
  ui('ui-a-sub-new',l.subNew);ui('ui-a-sub-past',l.subPast);
  setThemeLabel('ui-a-theme-lbl',l);
  setThemeLabel('ui-kb-theme-lbl',l);
  document.querySelectorAll('.ui-industry-lbl').forEach(el=>{el.textContent=l.industryLbl||'業界（任意）';});
  ['ui-f-diff-lbl','ui-s-diff-lbl','ui-c-diff-lbl','ui-a-diff-lbl','ui-kb-diff-lbl'].forEach(id=>{
    const el=document.getElementById(id);
    if(el)el.innerHTML=esc(l.diffLbl)+' <span class="label-req">*</span>';
  });
  ui('ui-a-gen',l.aGenBtn);ui('ui-a-gen-loading',l.aGenLoading);
  ui('ui-a-law-lbl',l.aLawLbl);ui('ui-a-article-lbl',l.aArticleLbl);ui('ui-a-submit',l.aSubmit);ui('ui-a-pa',l.pa);
  ui('ui-a-rand',l.rand);ui('ui-a-back',l.back);ui('ui-ap-all',l.all);
  ui('ui-c-rand',l.rand);ui('ui-c-back',l.back);ui('ui-cp-all',l.all);
  ui('ui-kb-sub-new',l.subNew);ui('ui-kb-sub-past',l.subPast);
  ui('ui-kb-gen',l.kbGenBtn);ui('ui-kb-gen-loading',l.kbGenLoading);
  ui('ui-kb-situation-lbl',l.kbSituationLbl);ui('ui-kb-submit',l.kbSubmit);
  ui('ui-kb-pa',l.pa);ui('ui-kb-rand',l.rand);ui('ui-kb-back',l.back);ui('ui-kbp-all',l.all);

  // diff labels
  for(let d=1;d<=5;d++){
    const fe=document.getElementById('fd'+d),se=document.getElementById('sd'+d),ce=document.getElementById('cd'+d),ae=document.getElementById('ad'+d),kbe=document.getElementById('kbd'+d);
    if(fe)fe.textContent=l.dLabels[d-1];
    if(se)se.textContent=l.dLabels[d-1];
    if(ce)ce.textContent=l.dLabels[d-1];
    if(ae)ae.textContent=l.dLabels[d-1];
    if(kbe)kbe.textContent=l.dLabels[d-1];
  }
  // diff desc & auto info
  updateDiffUI('f');updateDiffUI('s');updateDiffUI('c');updateDiffUI('a');updateDiffUI('kb');
  ['f','s','c','a','kb'].forEach(m=>updateThemeUI(m));
  updateIndustryUI();
  ['f','s','c','a','kb'].forEach(m=>updateDiffUI(m));
  // lang buttons
  document.querySelectorAll('.lang-btn').forEach((b,i)=>b.classList.toggle('active',i===(st.lang==='ja'?0:1)));
  document.documentElement.lang=st.lang;
  if(st.genBusy)updateGenStatusUI(st.genBusy);
  if(st.gradeBusy)updateGradeStatusUI(st.gradeBusy);
  updateApiKeyUI();
  ui('ui-setting-btn',l.settingBtn||'設定');
  updatePersonaBadge();
}

function genPrefix(mode){if(mode==='fill')return 'f';if(mode==='summary')return 's';if(mode==='critique')return 'c';if(mode==='ame')return 'a';if(mode==='kibari')return 'kb';return mode;}
function updateGenStatusUI(mode){
  const l=L[st.lang],p=genPrefix(mode);
  ui(p+'-gen-lbl-llm',l.genPhaseLlm);
  ui(p+'-gen-lbl-process',l.genPhaseProcess);
  const btn=document.getElementById(p+'-gen-btn');
  if(btn&&st.genBusy===mode)btn.querySelector('span').textContent=l.genBtnBusy;
  if(st.genPhase){
    const title=document.getElementById(p+'-gen-status-title');
    if(title)title.textContent=st.genPhase==='llm'?l.genPhaseLlm:l.genPhaseProcess;
  }
}
function setGenPhase(mode,phase){
  st.genPhase=phase;
  const order=['llm','process'];
  order.forEach(s=>{
    const el=document.getElementById(genPrefix(mode)+'-gen-step-'+s);
    if(!el)return;
    el.classList.remove('pending','active','done');
    if(!phase){el.classList.add('pending');return;}
    const pi=order.indexOf(phase),si=order.indexOf(s);
    if(si<pi)el.classList.add('done');
    else if(si===pi)el.classList.add('active');
    else el.classList.add('pending');
  });
  updateGenStatusUI(mode);
}
function showBusyOverlay(message){
  const l=L[st.lang];
  const ov=document.getElementById('app-busy-overlay');
  const msg=document.getElementById('app-busy-overlay-msg');
  const hint=document.getElementById('app-busy-overlay-hint');
  if(msg)msg.textContent=message||'';
  if(hint)hint.textContent=l.busyOverlayHint||'';
  if(ov){ov.classList.add('show');ov.setAttribute('aria-hidden','false');}
}
function hideBusyOverlay(){
  const ov=document.getElementById('app-busy-overlay');
  if(ov){ov.classList.remove('show');ov.setAttribute('aria-hidden','true');}
}
function collectAppLockEls(){
  return document.querySelectorAll(
    '.app .tab, .app .sub-tab, .app .lang-btn, .app .guide-btn, .app button, .app input, .app textarea, .app select, .app .pcard, .app .pf-tab, .app .back-btn'
  );
}
function lockEl(el){
  if(el.closest('#app-busy-overlay'))return;
  if(el.tagName==='BUTTON'||el.tagName==='INPUT'||el.tagName==='TEXTAREA'||el.tagName==='SELECT'){
    el.dataset.appWasDisabled=el.disabled?'1':'0';
    el.disabled=true;
  }else{
    el.dataset.appLocked='1';
    el.style.pointerEvents='none';
    el.style.opacity='0.55';
  }
}
function unlockEl(el){
  if(el.dataset.appLocked){
    delete el.dataset.appLocked;
    el.style.pointerEvents='';
    el.style.opacity='';
  }else if(el.dataset.appWasDisabled!==undefined){
    el.disabled=el.dataset.appWasDisabled==='1';
    delete el.dataset.appWasDisabled;
  }
}
function lockAppInteractive(){
  _appLockedEls=[...collectAppLockEls()];
  _appLockedEls.forEach(el=>lockEl(el));
}
function unlockAppInteractive(){
  _appLockedEls.forEach(unlockEl);
  _appLockedEls=[];
}
function beginAppBusy(kind,mode,message){
  if(isBusy())return false;
  if(kind==='gen')st.genBusy=mode;
  else st.gradeBusy=mode;
  setAppBusyClass();
  showBusyOverlay(message);
  lockAppInteractive();
  updateApiKeyUI();
  return true;
}
function endAppBusy(kind,mode){
  if(kind==='gen'){if(st.genBusy!==mode)return;st.genBusy=null;st.genPhase=null;}
  else{if(st.gradeBusy!==mode)return;st.gradeBusy=null;st.gradePhase=null;}
  setAppBusyClass();
  hideBusyOverlay();
  unlockAppInteractive();
  updateApiKeyUI();
}
function beginGen(mode){
  const l=L[st.lang];
  const msg=mode==='summary'?l.sGenLoading:mode==='critique'?l.cGenLoading:mode==='ame'?l.aGenLoading:mode==='kibari'?l.kbGenLoading:l.busyOverlayGen||l.genLoading;
  if(!beginAppBusy('gen',mode,msg))return false;
  const p=genPrefix(mode);
  const loadEl=document.getElementById(p+'-gen-loading');
  if(loadEl)loadEl.style.display='flex';
  const loadLbl=mode==='summary'?l.sGenLoading:mode==='critique'?l.cGenLoading:mode==='ame'?l.aGenLoading:mode==='kibari'?l.kbGenLoading:l.genLoading;
  ui(p+'-gen-loading',loadLbl);
  const btn=document.getElementById(p+'-gen-btn');
  if(btn)btn.classList.add('is-loading');
  return true;
}
function endGen(mode){
  if(st.genBusy!==mode)return;
  const p=genPrefix(mode);
  const loadEl=document.getElementById(p+'-gen-loading');
  if(loadEl)loadEl.style.display='none';
  const btn=document.getElementById(p+'-gen-btn');
  if(btn){
    btn.classList.remove('is-loading');
    const genLbl=mode==='fill'?L[st.lang].genBtn:mode==='summary'?L[st.lang].sGenBtn:mode==='critique'?L[st.lang].cGenBtn:mode==='ame'?L[st.lang].aGenBtn:mode==='kibari'?L[st.lang].kbGenBtn:L[st.lang].cGenBtn;
    const span=btn.querySelector('span');
    if(span)span.textContent=genLbl;
  }
  setGenPhase(mode,null);
  endAppBusy('gen',mode);
}

function updateGradeStatusUI(){
  const l=L[st.lang];
  ui('f-grade-lbl-llm',l.gradePhaseLlm);
  ui('f-grade-lbl-process',l.gradePhaseProcess);
  const btn=document.getElementById('f-submit');
  if(btn&&st.gradeBusy)btn.querySelector('span').textContent=l.submitBtnBusy;
  if(st.gradePhase){
    const title=document.getElementById('f-grade-status-title');
    if(title)title.textContent=st.gradePhase==='llm'?l.gradingLoading:l.gradePhaseProcess;
  }
}
function setGradePhase(phase){
  st.gradePhase=phase;
  ['llm','process'].forEach(s=>{
    const el=document.getElementById('f-grade-step-'+s);
    if(!el)return;
    el.classList.remove('pending','active','done');
    if(!phase){el.classList.add('pending');return;}
    const order=['llm','process'],pi=order.indexOf(phase),si=order.indexOf(s);
    if(si<pi)el.classList.add('done');
    else if(si===pi)el.classList.add('active');
    else el.classList.add('pending');
  });
  updateGradeStatusUI();
}
function beginGrade(){
  const l=L[st.lang];
  if(!beginAppBusy('grade','fill',l.busyOverlayGrade||l.gradingLoading))return false;
  document.getElementById('f-grade-status').hidden=false;
  document.getElementById('f-fb').innerHTML='';
  updateGradeStatusUI();
  setGradePhase('llm');
  const btn=document.getElementById('f-submit');
  if(btn)btn.classList.add('is-loading');
  return true;
}
function endGrade(){
  if(st.gradeBusy!=='fill')return;
  document.getElementById('f-grade-status').hidden=true;
  const btn=document.getElementById('f-submit');
  if(btn){
    btn.classList.remove('is-loading');
    const span=btn.querySelector('span');
    if(span)span.textContent=L[st.lang].submitBtn;
  }
  setGradePhase(null);
  endAppBusy('grade','fill');
}
function beginGradeBusy(mode){
  return beginAppBusy('grade',mode,L[st.lang].busyOverlayGrade||L[st.lang].gradingLoading);
}
function endGradeBusy(mode){
  endAppBusy('grade',mode);
}
function resetGenConditions(){
  st.fDocType='';
  st.sDocType='';
  st.cDocType='';
  st.aDocType='';
  st.industry='';
  st.fDiff=0;
  st.sDiff=0;
  st.cDiff=0;
  st.aDiff=0;
  st.kibariDiff=0;
  st.kibariScene='';
  st.sVolume='';
  ['f','s','c','a','kb'].forEach(m=>updateThemeUI(m));
  updateIndustryUI();
  ['f','s','c','a','kb'].forEach(m=>updateDiffUI(m));
  document.querySelectorAll('#s-volume-selector .vol-btn').forEach(b=>b.classList.remove('active'));
}

function diffValueFor(mode){
  if(mode==='f')return st.fDiff;
  if(mode==='s')return st.sDiff;
  if(mode==='c')return st.cDiff;
  if(mode==='kb')return st.kibariDiff;
  return st.aDiff;
}
function isDiffSelected(mode){
  const d=diffValueFor(mode);
  return d>=1&&d<=5;
}
function isBlankAnswer(s){
  const t=String(s||'').trim();
  return !t||t==='—'||t==='－';
}
function setThemeLabel(id,l){
  const el=document.getElementById(id);
  if(el)el.innerHTML=esc(l.themeLbl||l.fThemeLbl)+' <span class="label-req">*</span>';
}
function validateBeforeGen(mode){
  const l=L[st.lang];
  if(!themeValueFor(mode)){
    alert(l.themeRequired);
    return false;
  }
  if(!isDiffSelected(mode)){
    alert(l.diffRequired);
    return false;
  }
  return true;
}
function updateDiffUI(m){
  const l=L[st.lang];
  const diff=diffValueFor(m);
  const prefix=m==='f'?'f':m==='s'?'s':m==='c'?'c':m==='kb'?'kb':'a';
  document.querySelectorAll('#'+prefix+'-diff-row .diff-btn').forEach(b=>{
    b.classList.toggle('sel',isDiffSelected(m)&&parseInt(b.dataset.d)===diff);
  });
  const descId=m==='f'?'f-diff-desc':m==='s'?'s-diff-desc':m==='c'?'c-diff-desc':m==='kb'?'kb-diff-desc':'a-diff-desc';
  const descEl=document.getElementById(descId);
  if(descEl){
    if(!isDiffSelected(m))descEl.textContent='';
    else if(m==='f')descEl.textContent=l.fDescs[diff-1];
    else if(m==='s')descEl.textContent=l.sDescs[diff-1];
    else if(m==='c')descEl.textContent=l.cDescs[diff-1];
    else if(m==='kb')descEl.textContent=l.kbDescs[diff-1];
    else descEl.textContent=l.aDescs[diff-1];
  }
  if(m==='s'){
    const vs=document.getElementById('s-volume-selector');
    if(vs)vs.style.display=isDiffSelected(m)&&diff>=4?'':'none';
  }
  updateThemeUI(m);
}

const THEME_PRESET_COLS=5;

function themeListFor(mode){
  const lang=st.lang==='en'?'en':'ja';
  if(mode==='f')return FILL_PRESETS[lang];
  if(mode==='s')return SUMMARY_PRESETS[lang];
  if(mode==='c')return CRITIQUE_PRESETS[lang];
  if(mode==='kb')return KIBARI_PRESETS[lang];
  return AME_PRESETS[lang];
}

function themeDiffFor(mode){
  if(mode==='f')return st.fDiff;
  if(mode==='s')return st.sDiff;
  if(mode==='c')return st.cDiff;
  if(mode==='kb')return st.kibariDiff;
  return st.aDiff;
}

function themeValueFor(mode){
  if(mode==='f')return st.fDocType;
  if(mode==='s')return st.sDocType;
  if(mode==='c')return st.cDocType;
  if(mode==='kb')return st.kibariScene;
  return st.aDocType;
}

function themeStKey(mode){
  if(mode==='f')return 'fDocType';
  if(mode==='s')return 'sDocType';
  if(mode==='c')return 'cDocType';
  if(mode==='kb')return 'kibariScene';
  return 'aDocType';
}

function getThemePreset(mode){
  const diff=themeDiffFor(mode);
  const value=themeValueFor(mode);
  if(!value)return null;
  const p=themeListFor(mode).find(x=>x.value===value);
  if(!p||p.minDiff>diff)return null;
  return p;
}

function buildThemeInFromDocType(mode,isEN){
  return buildThemeInFromTheme(mode,isEN);
}
function buildThemeInFromTheme(mode,isEN){
  const lang=isEN?'en':'ja';
  const preset=getThemePreset(mode);
  if(!preset)return '';
  const ind=INDUSTRY_PRESETS[lang].find(p=>p.value===st.industry);
  const indNote=st.industry&&ind?(isEN?` Industry context: ${ind.label}.`:` 業界：${ind.label}。`):'';
  return preset.label+indNote;
}

function setDocType(mode,value){setTheme(mode,value);}
function setTheme(mode,value){
  if(isBusy())return;
  const diff=themeDiffFor(mode);
  const p=themeListFor(mode).find(x=>x.value===value);
  const diffOk=!diff||diff<1||p.minDiff<=diff;
  if(!p||!diffOk)return;
  st[themeStKey(mode)]=value;
  updateThemeUI(mode);
}

function setIndustry(value){
  if(isBusy())return;
  st.industry=value;
  document.querySelectorAll('.industry-preset-row .preset-btn')
    .forEach(b=>b.classList.toggle('sel',!!value&&b.dataset.industry===value));
}

function updateDocTypeUI(mode){updateThemeUI(mode);}
function updateThemeUI(mode){
  const diff=themeDiffFor(mode);
  const presets=themeListFor(mode);
  let current=themeValueFor(mode);
  const stKey=themeStKey(mode);
  const rowEl=document.getElementById(mode+'-theme-row');
  if(!rowEl)return;
  if(current&&diff>=1){
    const p=presets.find(x=>x.value===current);
    if(p&&p.minDiff>diff){
      st[stKey]='';
      current='';
    }
  }
  rowEl.className='preset-row';
  let html=presets.map(p=>{
    const enabled=!diff||diff<1||p.minDiff<=diff;
    const sel=enabled&&p.value===current;
    if(enabled){
      return `<button type="button" class="preset-btn${sel?' sel':''}" data-theme="${p.value}" onclick="setTheme('${mode}','${p.value}')">${esc(p.label)}</button>`;
    }
    return `<button type="button" class="preset-btn" disabled data-theme="${p.value}">${esc(p.label)}</button>`;
  }).join('');
  for(let i=presets.length;i<THEME_PRESET_COLS;i++)html+='<div class="preset-spacer" aria-hidden="true"></div>';
  rowEl.innerHTML=html;
}

function updateIndustryUI(){
  const lang=st.lang==='en'?'en':'ja';
  const presets=INDUSTRY_PRESETS[lang];
  const html=presets.map(p=>
    `<button type="button" class="preset-btn${st.industry&&p.value===st.industry?' sel':''}" data-industry="${p.value}" onclick="setIndustry('${p.value}')">${esc(p.label)}</button>`
  ).join('');
  document.querySelectorAll('.industry-preset-row').forEach(rowEl=>{
    rowEl.innerHTML=html;
  });
}

// ── ペルソナ設定 ────────────────────────────────────────

function openPersonaModal(){
  if(isBusy())return;
  const l=L[st.lang];
  document.getElementById('ui-persona-title').textContent=l.personaTitle||'ペルソナ設定';
  document.getElementById('ui-persona-desc').textContent=l.personaDesc||'';
  document.getElementById('ui-persona-industry-lbl').textContent=l.personaIndustryLbl||'業界 × 職種';
  document.getElementById('ui-persona-tenure-lbl').textContent=l.personaTenureLbl||'勤続年数';
  document.getElementById('ui-persona-add-btn').textContent=l.personaAddBtn||'＋ 追加';
  document.getElementById('ui-persona-save-btn').textContent=l.personaSaveBtn||'保存';
  document.getElementById('ui-persona-clear-btn').textContent=l.personaClearBtn||'クリア';
  renderTenureSelect();
  renderPersonaRows();
  document.getElementById('persona-overlay').classList.add('show');
  document.addEventListener('keydown',onPersonaKeyDown);
}

function closePersonaModal(){
  document.getElementById('persona-overlay').classList.remove('show');
  document.removeEventListener('keydown',onPersonaKeyDown);
}

function onPersonaKeyDown(e){
  if(e.key==='Escape')closePersonaModal();
}

function renderTenureSelect(){
  const lang=st.lang==='en'?'en':'ja';
  const options=PERSONA_TENURE_OPTIONS[lang];
  const sel=document.getElementById('persona-tenure');
  sel.innerHTML=options.map(o=>
    `<option value="${o.value}"${o.value===st.tenure?' selected':''}>${esc(o.label)}</option>`
  ).join('');
  updateTenureDesc();
}

function updateTenureDesc(){
  const lang=st.lang==='en'?'en':'ja';
  const val=document.getElementById('persona-tenure').value;
  const desc=PERSONA_TENURE_DESC[lang][val]||'';
  document.getElementById('persona-tenure-desc').textContent=desc;
}

function renderPersonaRows(){
  const lang=st.lang==='en'?'en':'ja';
  const l=L[st.lang];
  const industries=PERSONA_INDUSTRY_ROLES[lang];
  const container=document.getElementById('persona-rows');
  const rows=st.personas.length?st.personas:[{industry:'',role:''}];
  container.innerHTML=rows.map((p,i)=>buildPersonaRowHtml(p,i,industries,l)).join('');
  updatePersonaAddBtn();
}

function buildPersonaRowHtml(p,i,industries,l){
  const industryOpts=industries.map(ind=>
    `<option value="${esc(ind.industry)}"${ind.industry===p.industry?' selected':''}>${esc(ind.industry)}</option>`
  ).join('');
  const selectedInd=industries.find(ind=>ind.industry===p.industry);
  const roleOpts=selectedInd
    ?selectedInd.roles.map(r=>`<option value="${esc(r)}"${r===p.role?' selected':''}>${esc(r)}</option>`).join('')
    :'';
  return `<div class="persona-row" data-idx="${i}" style="display:flex;gap:6px;align-items:center;margin-bottom:6px;">
    <select class="persona-industry-sel" style="flex:1;padding:7px 8px;border:.5px solid var(--border2);border-radius:var(--r-md);font-size:12px;background:var(--bg2);color:var(--text);"
      onchange="onPersonaIndustryChange(${i})">
      <option value="">${esc(l.personaIndustryPlaceholder||'業界を選択')}</option>
      ${industryOpts}
    </select>
    <select class="persona-role-sel" style="flex:1;padding:7px 8px;border:.5px solid var(--border2);border-radius:var(--r-md);font-size:12px;background:var(--bg2);color:var(--text);"
      ${!selectedInd?'disabled':''}>
      <option value="">${esc(l.personaRolePlaceholder||'職種を選択')}</option>
      ${roleOpts}
    </select>
    ${i>0?`<button type="button" onclick="removePersonaRow(${i})" style="flex-shrink:0;background:none;border:none;cursor:pointer;color:var(--text2);font-size:16px;padding:0 4px;">×</button>`:'<span style="width:24px;flex-shrink:0;"></span>'}
  </div>`;
}

function onPersonaIndustryChange(idx){
  const lang=st.lang==='en'?'en':'ja';
  const l=L[st.lang];
  const industries=PERSONA_INDUSTRY_ROLES[lang];
  const rows=document.querySelectorAll('.persona-row');
  const row=rows[idx];
  if(!row)return;
  const indSel=row.querySelector('.persona-industry-sel');
  const roleSel=row.querySelector('.persona-role-sel');
  const selectedInd=industries.find(ind=>ind.industry===indSel.value);
  if(selectedInd){
    roleSel.disabled=false;
    roleSel.innerHTML=`<option value="">${esc(l.personaRolePlaceholder||'職種を選択')}</option>`
      +selectedInd.roles.map(r=>`<option value="${esc(r)}">${esc(r)}</option>`).join('');
  }else{
    roleSel.disabled=true;
    roleSel.innerHTML=`<option value="">${esc(l.personaRolePlaceholder||'職種を選択')}</option>`;
  }
}

function addPersonaRow(){
  const lang=st.lang==='en'?'en':'ja';
  const l=L[st.lang];
  const industries=PERSONA_INDUSTRY_ROLES[lang];
  const container=document.getElementById('persona-rows');
  const currentRows=container.querySelectorAll('.persona-row').length;
  if(currentRows>=3)return;
  const idx=currentRows;
  const div=document.createElement('div');
  div.innerHTML=buildPersonaRowHtml({industry:'',role:''},idx,industries,l);
  container.appendChild(div.firstElementChild);
  updatePersonaAddBtn();
}

function removePersonaRow(idx){
  const rows=document.querySelectorAll('.persona-row');
  if(rows[idx])rows[idx].remove();
  document.querySelectorAll('.persona-row').forEach((row,i)=>{
    row.dataset.idx=i;
    const delBtn=row.querySelector('button[onclick^="removePersonaRow"]');
    if(delBtn)delBtn.setAttribute('onclick',`removePersonaRow(${i})`);
    const indSel=row.querySelector('.persona-industry-sel');
    if(indSel)indSel.setAttribute('onchange',`onPersonaIndustryChange(${i})`);
  });
  updatePersonaAddBtn();
}

function updatePersonaAddBtn(){
  const count=document.querySelectorAll('.persona-row').length;
  const btn=document.getElementById('persona-add-btn');
  if(btn)btn.style.display=count>=3?'none':'';
}

function savePersona(){
  const rows=document.querySelectorAll('.persona-row');
  const personas=[];
  rows.forEach(row=>{
    const industry=row.querySelector('.persona-industry-sel')?.value||'';
    const role=row.querySelector('.persona-role-sel')?.value||'';
    if(industry&&role)personas.push({industry,role});
  });
  const tenure=document.getElementById('persona-tenure')?.value||'';
  st.personas=personas;
  st.tenure=tenure;
  try{
    localStorage.setItem(PERSONA_KEY,JSON.stringify({personas,tenure}));
  }catch(e){}
  updatePersonaBadge();
  closePersonaModal();
  showToast(L[st.lang].personaSavedMsg||'ペルソナ設定を保存しました ✓');
}

function clearPersona(){
  st.personas=[];
  st.tenure='';
  try{localStorage.removeItem(PERSONA_KEY);}catch(e){}
  renderPersonaRows();
  renderTenureSelect();
  updatePersonaBadge();
  showToast(L[st.lang].personaClearedMsg||'ペルソナ設定をクリアしました');
}

function loadPersona(){
  try{
    const raw=localStorage.getItem(PERSONA_KEY);
    if(!raw)return;
    const data=JSON.parse(raw);
    st.personas=data.personas||[];
    st.tenure=data.tenure||'';
  }catch(e){}
  updatePersonaBadge();
}

function updatePersonaBadge(){
  const badge=document.getElementById('persona-active-badge');
  if(!badge)return;
  const hasPersona=st.personas.length>0||st.tenure;
  badge.style.display=hasPersona?'':'none';
  const l=L[st.lang];
  badge.textContent=l.personaActiveLabel||'設定中';
}

function buildPersonaPromptNote(isEN){
  if(!st.personas.length&&!st.tenure)return '';
  const lang=isEN?'en':'ja';
  const tenureOptions=PERSONA_TENURE_OPTIONS[lang];
  const tenureLabel=tenureOptions.find(o=>o.value===st.tenure)?.label||'';
  const personaLines=st.personas.map(p=>`${p.industry}・${p.role}`).join('、');
  if(isEN){
    const lines=[];
    if(personaLines)lines.push(`Industry/Role: ${personaLines}`);
    if(tenureLabel)lines.push(`Years of experience: ${tenureLabel}`);
    if(!lines.length)return '';
    return `\n\n[Respondent background]\n${lines.join('\n')}\nGenerate the problem using topics and examples that fit this background. Do NOT change the difficulty level or scoring criteria based on this background.`;
  }
  const lines=[];
  if(personaLines)lines.push(`業界・職種：${personaLines}`);
  if(tenureLabel)lines.push(`勤続年数：${tenureLabel}`);
  if(!lines.length)return '';
  return `\n\n【回答者のバックグラウンド】\n${lines.join('\n')}\nこのバックグラウンドに沿った題材・事例・表現レベルで問題を生成すること。難易度・採点基準はバックグラウンドによって変えないこと。`;
}

function resetUIOnLangSwitch(){
  st.fill=null;
  st.summary=null;
  st.critique=null;
  st.ame=null;
  st.kibari=null;
  ['fill-result','summary-result','critique-result','ame-result','kibari-result'].forEach(id=>{
    const el=document.getElementById(id);
    if(el)el.style.display='none';
  });
  ['f-fb','s-fb','c-fb','a-fb','kb-fb'].forEach(id=>{
    const el=document.getElementById(id);
    if(el)el.innerHTML='';
  });
  ['f-copy-bar','s-copy-bar'].forEach(id=>{
    const el=document.getElementById(id);
    if(el)el.style.display='none';
  });
  const fs1=document.getElementById('fs1'),fs2=document.getElementById('fs2'),fs3=document.getElementById('fs3');
  if(fs1)fs1.className='step done';
  if(fs2)fs2.className='step active';
  if(fs3)fs3.className='step';
  const ss1=document.getElementById('ss1'),ss2=document.getElementById('ss2'),ss3=document.getElementById('ss3');
  if(ss1)ss1.className='step done';
  if(ss2)ss2.className='step active';
  if(ss3)ss3.className='step';
  const fpa=document.getElementById('f-pa-btn'),spa=document.getElementById('s-pa-btn');
  if(fpa)fpa.style.display='none';
  if(spa)spa.style.display='none';
  const fpq=document.getElementById('f-print-area'),spq=document.getElementById('s-print-area');
  if(fpq)fpq.style.display='none';
  if(spq)spq.style.display='none';
  const spt=document.getElementById('s-problem-text'),sq=document.getElementById('s-questions');
  if(spt)spt.innerHTML='';
  if(sq)sq.innerHTML='';
  const cs1=document.getElementById('cs1'),cs2=document.getElementById('cs2'),cs3=document.getElementById('cs3');
  if(cs1)cs1.className='step done';
  if(cs2)cs2.className='step active';
  if(cs3)cs3.className='step';
  const cpa=document.getElementById('c-pa-btn');
  if(cpa)cpa.style.display='none';
  const as1=document.getElementById('as1'),as2=document.getElementById('as2'),as3=document.getElementById('as3');
  if(as1)as1.className='step done';
  if(as2)as2.className='step active';
  if(as3)as3.className='step';
  const apa=document.getElementById('a-pa-btn');
  if(apa)apa.style.display='none';
  const kbEl=document.getElementById('kibari-result');
  if(kbEl)kbEl.style.display='none';
  const kbRounds=document.getElementById('kb-rounds');
  if(kbRounds)kbRounds.innerHTML='';
  const kbSubmitBar=document.getElementById('kb-submit-bar');
  if(kbSubmitBar)kbSubmitBar.style.display='none';
  const kbpa=document.getElementById('kb-pa-btn');
  if(kbpa)kbpa.style.display='none';
  const kbs1=document.getElementById('kbs1'),kbs2=document.getElementById('kbs2'),kbs3=document.getElementById('kbs3');
  if(kbs1)kbs1.className='step done';
  if(kbs2)kbs2.className='step active';
  if(kbs3)kbs3.className='step';
  const kbPreviewOverlay=document.getElementById('kb-preview-overlay');
  if(kbPreviewOverlay)kbPreviewOverlay.classList.remove('show');
  document.removeEventListener('keydown',onKibariPreviewKeyDown);
  ['f','s','c','a','kb'].forEach(m=>updateThemeUI(m));
  updateIndustryUI();
  updateApiKeyUI();
}
function setLang(lang){
  if(isBusy())return;
  st.lang=lang;
  localStorage.setItem(LANG_KEY,lang);
  resetUIOnLangSwitch();
  Object.keys(_guideCache).forEach(k=>delete _guideCache[k]);
  applyLang();
  if(document.getElementById('guide-overlay')?.classList.contains('show'))switchGuideTab(_guideCurrentTab);
  if(document.getElementById('fill-sub-past')?.classList.contains('active'))renderPL('fill');
  if(document.getElementById('summary-sub-past')?.classList.contains('active'))renderPL('summary');
  if(document.getElementById('critique-sub-past')?.classList.contains('active'))renderPL('critique');
  if(document.getElementById('ame-sub-past')?.classList.contains('active'))renderPL('ame');
}
function setVolume(v){
  if(isBusy())return;
  st.sVolume=v;
  document.querySelectorAll('#s-volume-selector .vol-btn').forEach(b=>b.classList.toggle('active',!!v&&b.dataset.v===v));
}
function setDiff(m,d){
  if(isBusy())return;
  if(m==='f')st.fDiff=d;
  else if(m==='s')st.sDiff=d;
  else if(m==='c')st.cDiff=d;
  else if(m==='kb')st.kibariDiff=d;
  else st.aDiff=d;
  const cur=themeValueFor(m);
  if(cur){
    const p=themeListFor(m).find(x=>x.value===cur);
    if(p&&p.minDiff>d)st[themeStKey(m)]='';
  }
  updateDiffUI(m);
}
function switchSub(mode,sub){
  if(isBusy())return;
  document.getElementById(mode+'-sub-new').classList.toggle('active',sub==='new');
  document.getElementById(mode+'-sub-past').classList.toggle('active',sub==='past');
  const newArea=document.getElementById(mode+'-new-area');
  const pastArea=document.getElementById(mode+'-past-area');
  if(newArea)newArea.style.display=sub==='new'?'':'none';
  if(pastArea)pastArea.style.display=sub==='past'?'':'none';
  if(sub==='past')loadPast(mode);
}
function switchTab(name){
  if(isBusy())return;
  ['fill','summary','critique','ame','kibari'].forEach((n,i)=>{
    document.querySelectorAll('.tab')[i].classList.toggle('active',n===name);
    document.getElementById(n+'-panel').classList.toggle('active',n===name);
  });
  if(name==='fill')switchSub('fill','new');
  if(name==='summary')switchSub('summary','new');
  if(name==='critique')switchSub('critique','new');
  if(name==='ame')switchSub('ame','new');
  if(name==='kibari')switchSub('kibari','new');
}

