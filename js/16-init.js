/* Init */
// ── Init ─────────────────────────────────────────────────
function migrateLocalStorageKeys(){
  const migrations=[
    ['logic_v10_apikey','thinkgrindai_apikey'],
    ['logic_v10_lang','thinkgrindai_lang'],
    ['logic_persona_v1','thinkgrindai_persona_v1'],
  ];
  migrations.forEach(([oldKey,newKey])=>{
    const val=localStorage.getItem(oldKey);
    if(val!==null&&localStorage.getItem(newKey)===null){
      localStorage.setItem(newKey,val);
      localStorage.removeItem(oldKey);
    }
  });
}
function init(){
  migrateLocalStorageKeys();
  const savedLang=localStorage.getItem(LANG_KEY);
  if(savedLang)st.lang=savedLang;
  applyLang();
  switchSub('fill','new');
  switchSub('summary','new');
  switchSub('critique','new');
  switchSub('ame','new');
  switchSub('tsumiaage','new');
  ['f','s','c','a','kb','ta'].forEach(m=>updateThemeUI(m));
  updateIndustryUI();
  ['f','s','c','a','kb','ta'].forEach(m=>updateDiffUI(m));
  updateApiKeyUI();
  loadPersona();
}
init();
