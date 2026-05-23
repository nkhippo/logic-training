/* GAS past-list helpers */
async function gasLoadSheetRows(sheetName){
  if(!await ensureGasV3())return null;
  try{
    const raw=await gasGet(sheetName);
    return Array.isArray(raw)?raw:[];
  }catch(e){
    return null;
  }
}

function setPastSyncUI(dotId,lblId,cls,msg){
  const dot=document.getElementById(dotId);
  const lbl=document.getElementById(lblId);
  if(dot)dot.className='sdot'+(cls?' '+cls:'');
  if(lbl)lbl.textContent=msg;
}

function showAppToast(toastId,msg,ms=3000){
  const el=document.getElementById(toastId);
  if(!el)return;
  el.textContent=msg;
  el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'),ms);
}
