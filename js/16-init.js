/* Init */
// ── Init ─────────────────────────────────────────────────
function init(){
  const savedLang=localStorage.getItem(LANG_KEY);
  if(savedLang)st.lang=savedLang;
  applyLang();
  switchSub('fill','new');
  switchSub('summary','new');
  switchSub('critique','new');
  switchSub('ame','new');
  switchSub('kibari','new');
  ['f','s','c','a','kb'].forEach(m=>updateThemeUI(m));
  updateIndustryUI();
  ['f','s','c','a','kb'].forEach(m=>updateDiffUI(m));
  updateApiKeyUI();
}
init();
