/* Language persistence (both apps) */
function getSavedLang(fallback='ja'){
  return localStorage.getItem(LANG_KEY)||fallback;
}
function setSavedLang(lang){
  localStorage.setItem(LANG_KEY,lang);
}
function updateLangButtonActive(lang){
  document.querySelectorAll('.lang-btn').forEach(b=>{
    const t=b.textContent.trim();
    b.classList.toggle('active',(lang==='ja'&&t==='日本語')||(lang==='en'&&t==='English'));
  });
}
