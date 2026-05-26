/* Persona modal (logic + thinking headers) */
function appIsBusy(){
  if(typeof thinkingSt!=='undefined'&&document.getElementById('thinking-app')&&thinkingSt.busy)return true;
  if(typeof isBusy==='function')return isBusy();
  return false;
}
function personaToast(msg){
  const thinkingToast=document.getElementById('thinking-toast');
  if(thinkingToast&&typeof showAppToast==='function')showAppToast('thinking-toast',msg);
  else if(typeof showToast==='function')showToast(msg);
}

function openPersonaModal(){
  if(appIsBusy())return;
  const lang=getAppLang();
  const l=L[lang];
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
  const lang=getAppLang()==='en'?'en':'ja';
  const options=PERSONA_TENURE_OPTIONS[lang];
  const sel=document.getElementById('persona-tenure');
  sel.innerHTML=options.map(o=>
    `<option value="${o.value}"${o.value===st.tenure?' selected':''}>${esc(o.label)}</option>`
  ).join('');
  updateTenureDesc();
}

function updateTenureDesc(){
  const lang=getAppLang()==='en'?'en':'ja';
  const val=document.getElementById('persona-tenure').value;
  const desc=PERSONA_TENURE_DESC[lang][val]||'';
  document.getElementById('persona-tenure-desc').textContent=desc;
}

function renderPersonaRows(){
  const lang=getAppLang()==='en'?'en':'ja';
  const l=L[getAppLang()];
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
  const lang=getAppLang()==='en'?'en':'ja';
  const l=L[getAppLang()];
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
  const lang=getAppLang()==='en'?'en':'ja';
  const l=L[getAppLang()];
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
  personaToast(L[getAppLang()].personaSavedMsg||'ペルソナ設定を保存しました ✓');
}

function clearPersona(){
  st.personas=[];
  st.tenure='';
  try{localStorage.removeItem(PERSONA_KEY);}catch(e){}
  renderPersonaRows();
  renderTenureSelect();
  updatePersonaBadge();
  personaToast(L[getAppLang()].personaClearedMsg||'ペルソナ設定をクリアしました');
}

function loadPersona(){
  loadPersonaIntoState();
  updatePersonaBadge();
}

function updatePersonaBadge(){
  const badge=document.getElementById('persona-active-badge');
  if(!badge)return;
  const hasPersona=st.personas.length>0||st.tenure;
  badge.style.display=hasPersona?'':'none';
  const l=L[getAppLang()];
  badge.textContent=l.personaActiveLabel||'設定中';
}
