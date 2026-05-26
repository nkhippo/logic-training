/* Preset button rows (thinking + reusable elsewhere) */
function mountPresetRow(rowEl, items, options){
  const attrName=options.attrName||'value';
  const selected=options.selectedValue??'';
  const labelKey=options.labelKey||'label';
  const titleKey=options.titleKey||'desc';
  if(!rowEl)return;
  rowEl.innerHTML=items.map(item=>{
    const v=item.value??item.id??'';
    const sel=v===selected?' sel':'';
    const title=item[titleKey]?` title="${esc(item[titleKey])}"`:'';
    return `<button type="button" class="preset-btn${sel}" data-${attrName}="${esc(String(v))}"${title}>${esc(item[labelKey]||String(v))}</button>`;
  }).join('');
  rowEl.onclick=e=>{
    const btn=e.target.closest('.preset-btn');
    if(!btn||!options.onSelect)return;
    const raw=btn.getAttribute(`data-${attrName}`);
    options.onSelect(raw===null?'':raw);
  };
}

function highlightPresetRow(rowEl, attrName, selectedValue){
  if(!rowEl)return;
  rowEl.querySelectorAll('.preset-btn').forEach(b=>{
    const v=b.getAttribute(`data-${attrName}`);
    b.classList.toggle('sel',(v??'')===selectedValue);
  });
}
