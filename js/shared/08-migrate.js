/* localStorage key migration (both apps) */
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
