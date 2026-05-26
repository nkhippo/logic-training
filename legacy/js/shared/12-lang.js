/* Language persistence + modal (both apps) */
function getSavedLang(fallback='ja'){
  return localStorage.getItem(LANG_KEY)||fallback;
}
function setSavedLang(lang){
  localStorage.setItem(LANG_KEY,lang);
}
function getAppLang(){
  if(typeof thinkingSt!=='undefined'&&document.getElementById('thinking-app'))return thinkingSt.lang||getSavedLang();
  if(typeof st!=='undefined')return st.lang||getSavedLang();
  return getSavedLang();
}
function updateLangHeaderUI(){
  const lang=getAppLang();
  const l=L[lang];
  const btn=document.getElementById('ui-lang-btn');
  if(btn)btn.textContent=l.langBtn||'言語';
  const profile=document.getElementById('ui-profile-btn');
  if(profile)profile.textContent=l.profileBtn||l.settingBtn||'プロフィール';
}
function openLangModal(){
  if(typeof appIsBusy==='function'&&appIsBusy())return;
  const lang=getAppLang();
  const l=L[lang];
  const title=document.getElementById('ui-lang-modal-title');
  const desc=document.getElementById('ui-lang-modal-desc');
  const jaBtn=document.getElementById('lang-choice-ja');
  const enBtn=document.getElementById('lang-choice-en');
  if(title)title.textContent=l.langModalTitle||'言語';
  if(desc)desc.textContent=l.langModalDesc||'表示言語を選択してください。';
  if(jaBtn){
    jaBtn.textContent=l.langChoiceJa||'日本語';
    jaBtn.classList.toggle('sel',lang==='ja');
    jaBtn.disabled=lang==='ja';
  }
  if(enBtn){
    enBtn.textContent=l.langChoiceEn||'English';
    enBtn.classList.toggle('sel',lang==='en');
    enBtn.disabled=lang==='en';
  }
  document.getElementById('lang-overlay')?.classList.add('show');
  document.addEventListener('keydown',onLangModalKeyDown);
}
function closeLangModal(){
  document.getElementById('lang-overlay')?.classList.remove('show');
  document.removeEventListener('keydown',onLangModalKeyDown);
}
function onLangModalKeyDown(e){
  if(e.key==='Escape')closeLangModal();
}
function selectLangFromModal(lang){
  if(getAppLang()===lang){closeLangModal();return;}
  closeLangModal();
  setLang(lang);
}
