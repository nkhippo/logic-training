/* Kibari */
// ── 気配り ─────────────────────────────────────────────
function setKibariScene(scene,silent=false){
  if(!silent&&isBusy())return;
  setTheme('kb',scene);
}
function normKibariProb(prob){
  let readers=prob.readers;
  if(typeof readers==='string'){try{readers=JSON.parse(readers);}catch{readers=[];}}
  if(!Array.isArray(readers))readers=[];
  let points=prob.points;
  if(typeof points==='string'){try{points=JSON.parse(points);}catch{points=[];}}
  if(!Array.isArray(points))points=[];
  return{
    ...prob,
    readers,
    points,
    industry:prob.industry||'',
    situation:prob.situation||'',
    writeInstruction:prob.writeInstruction||'',
    rewriteInstruction:prob.rewriteInstruction||'',
    openingPhrase:prob.openingPhrase||'',
    closingPhrase:prob.closingPhrase||'',
    rounds:prob.rounds||[],
  };
}
function kibariBoilerplate(prob){
  const isEN=(prob.lang||st.lang)==='en';
  let open=(prob.openingPhrase||'').trim();
  let close=(prob.closingPhrase||'').trim();
  if(!open&&!close){
    const reader=prob.readers?.[0];
    if(isEN){
      open=reader?`Dear ${reader},\n\n`:'';
      close='Best regards';
    }else{
      open=reader?`${reader}様\n\n`:'';
      close='以上、よろしくお願いいたします。';
    }
  }
  return{open,close,has:!!(open||close)};
}
function kibariRoundCoreText(scope,roundIndex){
  return document.getElementById(`${scope}-ans-${roundIndex}`)?.value.trim()||'';
}
function kibariRoundFullText(prob,core){
  const {open,close}=kibariBoilerplate(prob);
  const parts=[];
  if(open)parts.push(open);
  if(core)parts.push(core);
  if(close)parts.push(close);
  return parts.join('\n\n').trim();
}
function parseKibariCharLimit(constraint){
  if(!constraint)return null;
  const range=constraint.match(/(\d+)\s*[〜~\-－]\s*(\d+)/);
  if(range)return{min:+range[1],max:+range[2]};
  const maxOnly=constraint.match(/(\d+)\s*字/);
  if(maxOnly)return{max:+maxOnly[1]};
  const enRange=constraint.match(/(\d+)\s*[-–]\s*(\d+)\s*char/i);
  if(enRange)return{min:+enRange[1],max:+enRange[2]};
  const enMax=constraint.match(/(\d+)\s*char/i);
  if(enMax)return{max:+enMax[1]};
  return null;
}
function updateKibariCoreCount(scope,roundIndex){
  const prob=kibariState(scope);
  const el=document.getElementById(`${scope}-cc-${roundIndex}`);
  const ta=document.getElementById(`${scope}-ans-${roundIndex}`);
  if(!el||!ta||!prob)return;
  const len=ta.value.length;
  const lim=parseKibariCharLimit(prob.constraint);
  const isEN=(prob.lang||st.lang)==='en';
  if(!lim){el.textContent='';return;}
  let txt;
  if(lim.min!=null&&lim.max!=null){
    txt=isEN?`${len} / ${lim.min}–${lim.max} chars (body)`: `本文 ${len} / ${lim.min}〜${lim.max}字`;
  }else{
    txt=isEN?`${len} / ${lim.max} chars (body)`: `本文 ${len} / ${lim.max}字`;
  }
  const over=lim.max!=null&&len>lim.max;
  const under=lim.min!=null&&len>0&&len<lim.min;
  el.textContent=txt;
  el.className='cc no-print'+(over||under?' over':len>= (lim.min||0)&&len<= (lim.max||1e9)?' ok2':'');
  ta.classList.toggle('overlimit',over);
}
function buildKibariComposeHtml(prob,roundIndex,scope){
  const l=L[prob.lang||st.lang];
  const {open,close,has}=kibariBoilerplate(prob);
  const noteHtml=has?`<p class="kibari-boilerplate-note no-print">${esc(l.kbBoilerplateNote||'')}</p>`:'';
  const openBlk=open?`<div class="kibari-boilerplate kibari-boilerplate-open"><div class="kibari-boilerplate-lbl">${esc(l.kbBoilerplateOpenLbl||'')}</div>${esc(open)}</div>`:'';
  const closeBlk=close?`<div class="kibari-boilerplate kibari-boilerplate-close"><div class="kibari-boilerplate-lbl">${esc(l.kbBoilerplateCloseLbl||'')}</div>${esc(close)}</div>`:'';
  return`${noteHtml}
    <div class="kibari-compose">
      ${openBlk}
      <textarea class="kibari-core-ta sum-ta" id="${scope}-ans-${roundIndex}" style="min-height:120px;" placeholder="" oninput="updateKibariCoreCount('${scope}',${roundIndex})"></textarea>
      ${closeBlk}
    </div>
    <div class="cc no-print" id="${scope}-cc-${roundIndex}"></div>`;
}
function kibariState(scope='kb'){
  return scope==='kbp'?st.kibariPast:st.kibari;
}
function pastKibariToPlayable(prob){
  const p=normKibariProb(prob);
  const diff=+(p.diff||3);
  return{
    ...p,
    maxRounds:KB_MAX_ROUNDS[diff]||1,
    rounds:[],
    photos:[],
    currentRound:0,
    lang:p.lang||st.lang,
  };
}
function kibariFallbackWriteInstruction(prob,l){
  const isEN=(prob.lang||st.lang)==='en';
  const scene=prob.scene||'report';
  const preset=KIBARI_PRESETS[isEN?'en':'ja'].find(x=>x.value===scene);
  const sceneLabel=preset?.label||(isEN?'situation':'場面');
  const action=getKibariSceneActionHint(scene,isEN);
  const readers=prob.readers?.length
    ?prob.readers.join(isEN?', ':'、')
    :(isEN?'the reader(s)':'読み手');
  return isEN
    ?`For this ${sceneLabel} situation, write a message to ${readers} to ${action}. Follow the situation above (when, who, what, where).`
    :`この${sceneLabel}の場面で、${readers}に${action}するメッセージを書いてください（状況文の期限・手段・内容に沿ってください）。`;
}
function kibariFallbackRewriteInstruction(prob,l){
  const isEN=(prob.lang||st.lang)==='en';
  return isEN
    ?'Revise your message using the reader\'s feedback; keep the same when, who, what, and where.'
    :'読み手の反応を踏まえ、同じ期限・相手・内容・手段を保ちつつ不足を補って書き直してください。';
}
function kibariWriteLabel(prob,roundIndex,l){
  if(roundIndex===0){
    return prob.writeInstruction||kibariFallbackWriteInstruction(prob,l);
  }
  return prob.rewriteInstruction||kibariFallbackRewriteInstruction(prob,l);
}
function getKibariSceneActionHint(scene,isEN){
  const ja={report:'共有または報告',request:'依頼または指示',proposal:'提案または説明',self:'自己紹介または自己表現'};
  const en={report:'share or report',request:'request or instruct',proposal:'propose or explain',self:'introduce yourself or express yourself'};
  return(isEN?en:ja)[scene]||(isEN?'communicate':'伝える');
}
function getKibariInstructionGuide(diff,scene,sceneLabel,isEN){
  const action=getKibariSceneActionHint(scene,isEN);
  const explicit=diff<=2;
  if(!isEN)return`
【状況文の要件】
- 状況説明（situation）に、いつまでに（When）・誰に（Who）・何を（What）・どの手段・場で（Where）が読み取れるように書く（括弧でラベル付けしなくてよい）
- Why（なぜ伝えるか）は状況文に含め、作業指示では繰り返さない

【作業指示の要件】
- writeInstruction：初回回答欄の見出し用。回答者が「何を書けばよいか」が一目でわかる具体的な一文（50〜120字程度）
  - 場面「${sceneLabel}」に合い、${action}するメッセージを書くよう促す
  - ${explicit?'When・Who・What・Where を可能な限り明示する（例：本日中に／営業部長とPMに／この情報を／社内チャットで）':'状況文と整合するよう When・Who・What・Where を簡潔に含める'}
  - 「メッセージを書いてください」のような漠然とした表現は禁止
- rewriteInstruction：2回目以降用。読み手の反応を踏まえ不足を補う書き直し。同じ When/Who/What/Where を維持する

【定型文（冒頭・結び）】
- openingPhrase：状況・読み手に合った冒頭の挨拶・名乗り（1〜2文）。学習者は入力しない参考表示
- closingPhrase：状況に合った結びの定型文（1文程度）。同上
- constraint の文字数は**本文のみ**に適用（冒頭・結びは含めない）
`.trim();
  return`
[Situation text]
- The situation field must let the learner infer When, Who, What, and Where (labels in parentheses are optional)
- Include Why in the situation only; do not repeat Why in writeInstruction

[Task instructions]
- writeInstruction: heading for the first answer box (50-120 chars). Must be specific, not vague like "Write your message"
  - Match scene "${sceneLabel}"; ask for a message to ${action}
  - ${explicit?'Spell out When, Who, What, Where as clearly as possible':'Keep When/Who/What/Where concise but actionable, consistent with the situation'}
- rewriteInstruction: for revision rounds after reader feedback; same When/Who/What/Where, ask to fix gaps

[Opening / closing phrases]
- openingPhrase: greeting/self-intro matching the situation and readers (1-2 sentences); shown as fixed reference, not typed by learner
- closingPhrase: polite closing matching the situation (about one sentence); same
- Character limits in constraint apply to the body only, not opening/closing
`.trim();
}
function getKibariDiffPrompt(diff,scene,sceneLabel,isEN){
  const maxRounds=KB_MAX_ROUNDS[diff];
  const instrGuide=getKibariInstructionGuide(diff,scene,sceneLabel,isEN);
  if(!isEN)return`
テーマ：${sceneLabel}
難易度${diff}・最大往復回数：${maxRounds}回

以下の条件で状況を生成してください：
- 読み手の数：${diff<=2?'1人':diff<=4?'2〜3人':'複数人'}
- 利害関係：${diff===1?'なし':diff===2?'軽微':diff===3?'立場の違いあり':diff===4?'対立する利害関係あり':'複雑・感情への配慮が必要'}
- 盛り込むべき観点の数：${diff<=2?'2〜3個':diff===3?'3〜4個':'4〜5個'}
- 制約条件：${diff<=2?'文字数制限（200〜300字）':diff<=4?'文字数制限（250〜350字）':'文字数制限（300〜400字）'}
- 状況は実際のビジネス現場で起こりうるリアルなものにすること
- 書き手が「読み手が次に何を知りたいか・何をすべきか」を先回りして書く必要がある状況にすること

${instrGuide}
`.trim();
  return`
Theme: ${sceneLabel}
Difficulty ${diff} · Maximum exchanges: ${maxRounds}

Generate a situation with the following conditions:
- Number of readers: ${diff<=2?'1 person':diff<=4?'2-3 people':'multiple people'}
- Conflict level: ${diff===1?'none':diff===2?'minor':diff===3?'different perspectives':diff===4?'conflicting interests':'complex, emotional consideration needed'}
- Key points to cover: ${diff<=2?'2-3 points':diff===3?'3-4 points':'4-5 points'}
- Constraint: ${diff<=2?'character limit (200-300 chars)':diff<=4?'character limit (250-350 chars)':'character limit (300-400 chars)'}
- The situation must be realistic and occur in an actual business context
- The writer must proactively address what the reader needs to know or do next

${instrGuide}
`.trim();
}
async function generateKibari(){
  if(isBusy())return;
  if(!validateBeforeGen('kb'))return;
  const diff=st.kibariDiff;
  const scene=st.kibariScene;
  const isEN=st.lang==='en';
  const maxRounds=KB_MAX_ROUNDS[diff]||1;
  const preset=KIBARI_PRESETS[isEN?'en':'ja'].find(p=>p.value===scene);
  const sceneLabel=preset?.label||scene;
  const themeIn=buildThemeInFromTheme('kb',isEN);
  document.getElementById('kibari-result').style.display='none';
  if(!beginGen('kibari'))return;
  const sys=isEN
    ?'You are an expert in business communication education. Generate a realistic business situation for a writing practice problem. The situation must embed When/Who/What/Where; also provide a specific writeInstruction (learner-facing task) and rewriteInstruction. The writer must proactively address what readers need to know or do. Respond ONLY in valid JSON. No markdown fences, no explanation before or after.'
    :'あなたはビジネスコミュニケーション教育の専門家です。文章作成の練習問題として、リアルなビジネス状況を生成してください。状況文にWhen・Who・What・Whereが読み取れるようにし、回答者向けの具体的な作業指示（writeInstruction・rewriteInstruction）も生成してください。書き手が「読み手が次に何を知りたいか・何をすべきか」を先回りして伝えることが求められる状況にしてください。必ず指定されたJSON形式のみで返答してください。JSONの前後に説明文や```などを一切含めないでください。';
  const diffPrompt=getKibariDiffPrompt(diff,scene,sceneLabel,isEN);
  const industrySuffix=st.lang==='en'?INDUSTRY_CONSTRAINT.en:INDUSTRY_CONSTRAINT.ja;
  const jsonSchema=isEN
    ?`Return ONLY this JSON:\n{"theme":"situation title in 15 chars","situation":"situation description 150-200 chars (include When/Who/What/Where)","readers":["reader1 role","reader2 role"],"points":["key point 1","key point 2"],"constraint":"e.g. body 250-350 chars (opening/closing not included)","openingPhrase":"e.g. Dear Ms. Tanaka,\\n\\nThis is Sato from IT.","closingPhrase":"e.g. Thank you for your review.","writeInstruction":"Specific first-draft task for the learner (When/Who/What/Where, not vague)","rewriteInstruction":"Revision task after reader feedback, same channel/audience"}`
    :`返答はJSONのみ：\n{"theme":"状況タイトル15文字以内","situation":"状況説明150〜200字（When・Who・What・Whereが読み取れること）","readers":["読み手1の立場","読み手2の立場"],"points":["盛り込むべき観点1","観点2"],"constraint":"本文の文字数制限（例：本文250〜350字。冒頭・結びは含めない）","openingPhrase":"状況・読み手に合った冒頭（例：山田部長、お疲れ様です。IT部の佐藤です。）","closingPhrase":"状況に合った結び（例：以上、ご確認のほどよろしくお願いいたします。）","writeInstruction":"初回回答用の具体的な作業指示（例：本日中に、〇〇と△△に、この情報を社内チャットで共有するメッセージを記載してください。）","rewriteInstruction":"読み手の反応を踏まえ、同じ条件で不足を補う改訂メッセージを記載してください。"}`;
  const themeLine=isEN?`Theme: ${themeIn}\n\n`:`テーマ：${themeIn}\n\n`;
  const prompt=`${themeLine}${diffPrompt}${industrySuffix}\n${jsonSchema}`;
  try{
    const raw=await callClaude(prompt,sys,1500,0.9);
    if(!raw)return;
    const p=safeJSON(raw);
    if(!p.situation)throw new Error('Invalid JSON structure');
    st.kibari={
      id:Date.now(),
      theme:p.theme||sceneLabel,
      diff,
      scene,
      industry:genIndustrySnapshot(),
      date:new Date().toISOString(),
      situation:p.situation,
      readers:p.readers||[],
      points:p.points||[],
      constraint:p.constraint||'',
      openingPhrase:p.openingPhrase||'',
      closingPhrase:p.closingPhrase||'',
      writeInstruction:p.writeInstruction||'',
      rewriteInstruction:p.rewriteInstruction||'',
      rounds:[],
      currentRound:0,
      maxRounds,
      feedback:null,
      lang:st.lang,
    };
    renderKibari(st.kibari);
    resetGenConditions();
    try{await syncPastOnGen('kibari',st.kibari);}
    catch(syncErr){setSync('kibari','err',L[st.lang].syncFailed);showToast('Error: '+syncErr.message,4000);}
  }catch(e){alert(L[st.lang].kbGenFailed+'\n'+e.message);}
  finally{endGen('kibari');}
}
function buildKibariRoundHtml(prob,roundIndex,scope='kb'){
  const l=L[prob.lang||st.lang];
  const isLastRound=roundIndex===prob.maxRounds-1;
  const labelWrite=kibariWriteLabel(prob,roundIndex,l);
  const bodyNote=kibariBoilerplate(prob).has?(l.kbConstraintBodyNote||'（本文のみ）'):'';
  const constraintNote=prob.constraint?`<span style="font-size:11px;color:var(--amber);margin-left:6px;">${esc(prob.constraint)}${esc(bodyNote)}</span>`:'';
  const prevRv=roundIndex>0&&prob.rounds[roundIndex-1]?.rv
    ?`<div class="kibari-rv-box"><p class="slabel no-print">${esc(l.kbRvLbl||'読み手からの反応')}</p><div class="problem-box" style="background:var(--bg2);">${esc(prob.rounds[roundIndex-1].rv)}</div></div>`
    :'';
  const photoArea=isLastRound?`
    <div class="kibari-photo-area no-print" style="margin-top:10px;">
      <p class="slabel" style="margin-bottom:6px;">${esc(l.kbPhotoLbl||'画像を添付する（任意・最大2枚）')}</p>
      <label class="upload-zone" id="${scope}-upload-zone-${roundIndex}" for="${scope}-photo-input-${roundIndex}" style="padding:12px;cursor:pointer;display:block;">
        <i class="ti ti-camera-plus" aria-hidden="true" style="font-size:22px;display:block;margin-bottom:4px;opacity:.5;"></i>
        <span style="font-size:13px;">${esc(l.kbUploadHint||'タップして画像を選ぶ')}</span>
        <div style="font-size:11px;color:var(--text2);margin-top:2px;">${esc(l.kbUploadNote||'JPEG / PNG / HEIC・最大2枚')}</div>
      </label>
      <input type="file" id="${scope}-photo-input-${roundIndex}" accept="${IMAGE_ACCEPT}" multiple
        style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;"
        onchange="handleKibariPhotoUpload(event,${roundIndex},'${scope}')"/>
      <div class="photo-preview" id="${scope}-photo-preview-${roundIndex}" style="margin-top:8px;"></div>
      <p style="font-size:11px;color:var(--text2);margin-top:6px;">${esc(l.kbExtraNote||'※ 画像による情報整理が優れている場合は加点されます')}</p>
    </div>`:'';
  return`${prevRv}<div class="kibari-write-block">
    <p class="slabel no-print">${esc(labelWrite)}${constraintNote}</p>
    ${buildKibariComposeHtml(prob,roundIndex,scope)}
    <div class="action-bar no-print" style="margin-top:6px;gap:8px;display:flex;flex-wrap:wrap;">
      <button class="btn btn-icon btn-sm" type="button" onclick="openKibariPreview(${roundIndex},'${scope}')">
        <i class="ti ti-eye" aria-hidden="true"></i>
        <span>${esc(l.kbPreviewBtn||'プレビュー')}</span>
      </button>
    </div>
    ${photoArea}
    <div class="action-bar no-print" style="margin-top:8px;" id="${scope}-rv-bar-${roundIndex}">
      <button class="btn" onclick="requestKibariRv(${roundIndex},'${scope}')">
        <span>${esc(l.kbRvBtn||'読み手の反応を見る')}</span>
      </button>
    </div>
    <div id="${scope}-rv-loading-${roundIndex}" style="display:none;" class="gen-loading">
      <span class="spinner" aria-hidden="true"></span>
      <span>${esc(l.kbRvLoading||'読み手の反応を生成中...')}</span>
    </div>
  </div>`;
}
function openKibariPreview(roundIndex,scope='kb'){
  const prob=kibariState(scope);
  const core=prob?kibariRoundCoreText(scope,roundIndex):'';
  const text=prob?kibariRoundFullText(prob,core):'';
  const body=document.getElementById('kb-preview-body');
  const title=document.getElementById('kb-preview-title');
  const l=L[st.lang];
  const emptyMsg=st.lang==='en'?'(No text entered yet)':'（まだ入力されていません）';
  if(title)title.textContent=l.kbPreviewTitle||'メッセージのプレビュー';
  if(body)body.innerHTML=text?md2h(text):`<p style="color:var(--text2);font-size:13px;">${esc(emptyMsg)}</p>`;
  const overlay=document.getElementById('kb-preview-overlay');
  if(overlay)overlay.classList.add('show');
  document.addEventListener('keydown',onKibariPreviewKeyDown);
}
function closeKibariPreview(){
  const overlay=document.getElementById('kb-preview-overlay');
  if(overlay)overlay.classList.remove('show');
  document.removeEventListener('keydown',onKibariPreviewKeyDown);
}
function onKibariPreviewKeyDown(e){
  if(e.key==='Escape')closeKibariPreview();
}
function renderKibariPhotoPreview(roundIndex,scope='kb'){
  const previewEl=document.getElementById(`${scope}-photo-preview-${roundIndex}`);
  const zone=document.getElementById(`${scope}-upload-zone-${roundIndex}`);
  const prob=kibariState(scope);
  if(!previewEl||!prob)return;
  const photos=prob.photos||[];
  previewEl.innerHTML=photos.map((p,i)=>`
    <div class="photo-thumb">
      <img src="${p.dataUrl}" alt="添付画像${i+1}"/>
      <button type="button" class="photo-del" onclick="removeKibariPhoto(${roundIndex},${i},'${scope}')">✕</button>
    </div>
  `).join('');
  if(zone)zone.style.display=photos.length>=2?'none':'';
}
function removeKibariPhoto(roundIndex,idx,scope='kb'){
  const prob=kibariState(scope);
  if(!prob?.photos)return;
  prob.photos.splice(idx,1);
  renderKibariPhotoPreview(roundIndex,scope);
}
async function handleKibariPhotoUpload(event,roundIndex,scope='kb'){
  if(isBusy())return;
  const input=event.target;
  const files=Array.from(input?.files||[]).filter(isImageFile).slice(0,2);
  const previewEl=document.getElementById(`${scope}-photo-preview-${roundIndex}`);
  const prob=kibariState(scope);
  if(!previewEl||!prob)return;
  if(!files.length){
    alert(L[st.lang].photoFormatError);
    if(input)input.value='';
    return;
  }
  previewEl.innerHTML=`<p class="loading-state"><span class="spinner" aria-hidden="true"></span>${esc(L[st.lang].photoLoading)}</p>`;
  prob.photos=[];
  const loaded=[];
  for(const file of files){
    try{
      const dataUrl=await processImageFile(file);
      loaded.push(photoPayloadFromDataUrl(dataUrl));
    }catch(e){
      alert(e.message||L[st.lang].photoDecodeError);
    }
  }
  prob.photos=loaded;
  renderKibariPhotoPreview(roundIndex,scope);
  if(input)input.value='';
}
function renderKibari(prob){
  prob.photos=[];
  renderProblemMeta('kb-theme-tag',prob);
  document.getElementById('kb-situation').textContent=prob.situation;
  document.getElementById('kb-rounds').innerHTML=buildKibariRoundHtml(prob,0);
  updateKibariCoreCount('kb',0);
  document.getElementById('kb-fb').innerHTML='';
  document.getElementById('kb-pa-btn').style.display='none';
  document.getElementById('kb-submit-bar').style.display='none';
  document.getElementById('kibari-result').style.display='block';
  document.getElementById('kbs1').className='step done';
  document.getElementById('kbs2').className='step active';
  document.getElementById('kbs3').className='step';
  updateApiKeyUI();
}
async function requestKibariRv(roundIndex,scope='kb'){
  if(isBusy())return;
  const prob=kibariState(scope);if(!prob)return;
  const core=kibariRoundCoreText(scope,roundIndex);
  if(!core){alert(L[st.lang].kbEmptyAnswer);return;}
  const userAnswer=kibariRoundFullText(prob,core);
  if(!beginAppBusy('grade','kibari-rv',L[st.lang].busyOverlayKibariRv||L[st.lang].kbGenLoading))return;
  const rvBar=document.getElementById(`${scope}-rv-bar-${roundIndex}`);
  const rvLoading=document.getElementById(`${scope}-rv-loading-${roundIndex}`);
  if(rvBar)rvBar.style.display='none';
  if(rvLoading)rvLoading.style.display='flex';
  const isEN=(prob.lang||st.lang)==='en';
  const sys=isEN
    ?'You are playing the role of a business reader responding to a message. React naturally as someone who received this message — ask about unclear points, missing information, or things you need to decide. Keep your response concise (2-3 sentences). Do not provide feedback or coaching. Just respond as a reader would.'
    :'あなたはビジネスの読み手として、受け取ったメッセージに反応する役割を担います。このメッセージを受け取った人として自然に反応してください。不明な点・足りていない情報・判断に必要なことを質問してください。返答は簡潔に（2〜3文）。フィードバックやアドバイスは不要です。読み手として自然に反応するだけでよいです。';
  const situationSection=isEN?`[Situation]\n${prob.situation}\n\n`:`【状況】\n${prob.situation}\n\n`;
  const readersSection=prob.readers?.length
    ?(isEN?`[Readers] ${prob.readers.join(', ')}\n\n`:`【読み手】${prob.readers.join('、')}\n\n`)
    :'';
  const msgSection=isEN?`[Message received]\n${userAnswer}`:`【受け取ったメッセージ】\n${userAnswer}`;
  const prompt=`${situationSection}${readersSection}${msgSection}`;
  try{
    const rv=await callClaude(prompt,sys,400,0.9);
    if(!rv)return;
    if(!prob.rounds[roundIndex])prob.rounds[roundIndex]={};
    prob.rounds[roundIndex].answer=userAnswer;
    prob.rounds[roundIndex].core=core;
    prob.rounds[roundIndex].rv=rv;
    prob.currentRound=roundIndex+1;
    const roundsEl=document.getElementById(`${scope}-rounds`);
    if(roundIndex+1<prob.maxRounds){
      roundsEl.innerHTML+=buildKibariRoundHtml(prob,roundIndex+1,scope);
      updateKibariCoreCount(scope,roundIndex+1);
    }else{
      const rvHtml=`<div class="kibari-rv-box"><p class="slabel no-print">${esc(L[st.lang].kbRvLbl||'読み手からの反応')}</p><div class="problem-box" style="background:var(--bg2);">${esc(rv)}</div></div>`;
      roundsEl.innerHTML+=rvHtml;
      document.getElementById(`${scope}-submit-bar`).style.display='';
      if(scope==='kb')updateApiKeyUI();
    }
  }catch(e){
    if(rvBar)rvBar.style.display='';
    alert(L[st.lang].kbGradingErr+': '+e.message);
  }finally{
    if(rvLoading)rvLoading.style.display='none';
    endAppBusy('grade','kibari-rv');
  }
}
async function submitKibari(scope='kb'){
  if(isBusy())return;
  const prob=kibariState(scope);if(!prob)return;
  const lastIdx=prob.maxRounds-1;
  const lastCore=kibariRoundCoreText(scope,lastIdx);
  if(isBlankAnswer(lastCore)){
    alert(L[st.lang].kbAnswerRequired);
    return;
  }
  const lastAnswer=kibariRoundFullText(prob,lastCore);
  if(lastAnswer){
    if(!prob.rounds[lastIdx])prob.rounds[lastIdx]={};
    prob.rounds[lastIdx].answer=lastAnswer;
    prob.rounds[lastIdx].core=lastCore;
  }
  if(!beginGradeBusy(scope==='kbp'?'pp-kibari':'kibari'))return;
  const fb=document.getElementById(`${scope}-fb`);
  fb.innerHTML=`<p class="loading"><span class="dots">${L[st.lang].loading||'採点中...'}</span></p>`;
  try{
    const res=await gradeKibari(prob);if(!res)return;
    prob.feedback=res;
    fb.innerHTML=`<div class="feedback-box">${md2h(res)}</div>`;
    if(scope==='kb'){
      document.getElementById('kbs2').className='step done';
      document.getElementById('kbs3').className='step done';
      document.getElementById('kb-pa-btn').style.display='';
    }else{
      document.getElementById('kbp-s2').className='step done';
      document.getElementById('kbp-s3').className='step done';
    }
    try{await syncKibariPast(prob);}
    catch(syncErr){setSync('kibari','err',L[st.lang].syncFailed);showToast('Error: '+syncErr.message,4000);}
  }catch(e){fb.innerHTML=`<p class="err">${L[st.lang].kbGradingErr}: ${e.message}</p>`;}
  finally{endGradeBusy(scope==='kbp'?'pp-kibari':'kibari');}
}
async function gradeKibari(prob){
  const lang=prob.lang||st.lang;
  const isEN=lang==='en';
  const l=L[lang];
  const sys=isEN
    ?'You are an expert in business communication education. Evaluate the learner\'s business writing on three axes: (1) How many exchanges were needed to get the message across (fewer = better), (2) Whether the final message is clear and actionable for the reader, (3) Whether the information is well-structured and readable (appropriate use of bullet points, numbering, concise language, no colloquialisms). If images are provided, evaluate whether they effectively organize information visually — if the visual structure is excellent, award up to 20 extra points (base score 100). Provide specific feedback with an improved example. Use markdown for structured feedback.'
    :'あなたはビジネスコミュニケーション教育の専門家です。学習者のビジネス文章を以下の3軸で評価してください。(1) 何回のやり取りで読み手の疑問をゼロにできたか（少ないほど高評価）、(2) 最終的な文章が読み手にとって迷わず行動・判断できるものになっているか、(3) 情報が整理されて読みやすいか（箇条書き・番号・簡潔な表現・口語の排除など）。画像が添付されている場合は、画像による情報整理の優秀さも評価し、完璧な場合は最大20点の加点（基準点100点）を行ってください。改善例を示してください。マークダウンを使って構造的にフィードバックしてください。';
  const situationSection=isEN?`[Situation]\n${prob.situation}\n\n`:`【状況】\n${prob.situation}\n\n`;
  const readersSection=prob.readers?.length
    ?(isEN?`[Readers] ${prob.readers.join(', ')}\n\n`:`【読み手】${prob.readers.join('、')}\n\n`)
    :'';
  const pointsSection=prob.points?.length
    ?(isEN?`[Key points the writer should cover]\n${prob.points.map((p,i)=>`${i+1}. ${p}`).join('\n')}\n\n`:`【盛り込むべき観点】\n${prob.points.map((p,i)=>`${i+1}. ${p}`).join('\n')}\n\n`)
    :'';
  const roundsSection=(prob.rounds||[]).map((r,i)=>{
    const ans=r.answer||(isEN?'(No answer)':'（未回答）');
    const rv=r.rv?`\n${isEN?'Reader response':'読み手の反応'}:\n${r.rv}`:'';
    return isEN
      ?`[Round ${i+1}]\nWriter's message:\n${ans}${rv}`
      :`【${i+1}回目】\n書き手のメッセージ:\n${ans}${rv}`;
  }).join('\n\n---\n\n');
  const gradeInst=isEN
    ?`Please evaluate based on the three axes above and provide:\n## Per-Axis Evaluation\n### ${l.kbScoreAxis1}\n### ${l.kbScoreAxis2}\n### ${l.kbScoreAxis3}\n## Improved Example\n## Overall Feedback${prob.photos?.length?'\n## Image Evaluation':''}`
    :`上記3軸で評価し、以下の構成でフィードバックしてください。\n## 軸別評価\n### ${l.kbScoreAxis1}\n### ${l.kbScoreAxis2}\n### ${l.kbScoreAxis3}\n## 改善例\n## 総合講評${prob.photos?.length?'\n## 画像評価':''}`;
  const textPrompt=`${situationSection}${readersSection}${pointsSection}${roundsSection}\n\n${gradeInst}`;
  let content=textPrompt;
  if(prob.photos?.length){
    const imageContent=prob.photos.map(p=>({
      type:'image',
      source:{type:'base64',media_type:p.mediaType,data:p.base64},
    }));
    content=[...imageContent,{type:'text',text:textPrompt}];
  }
  return callClaudeMsg(sys,content,gradeMaxTokensByDiff(prob.diff),0.3);
}
function buildKibariEntry(prob){
  const r0=prob.rounds?.[0];
  const firstAnswer=r0?.answer||(r0?.core&&kibariRoundFullText(prob,r0.core))||'';
  return{
    id:prob.id||Date.now(),
    sheet:'kibari',
    theme:prob.theme||'—',
    diff:prob.diff,
    scene:prob.scene||'report',
    date:prob.date,
    industry:prob.industry||'',
    situation:prob.situation||'',
    readers:JSON.stringify(prob.readers||[]),
    points:JSON.stringify(prob.points||[]),
    constraint:prob.constraint||'',
    writeInstruction:prob.writeInstruction||'',
    rewriteInstruction:prob.rewriteInstruction||'',
    openingPhrase:prob.openingPhrase||'',
    closingPhrase:prob.closingPhrase||'',
    firstAnswer,
    feedback:prob.feedback||null,
    lang:prob.lang||st.lang,
  };
}
async function syncKibariPast(prob){
  if(!await ensureGasV3())return;
  const entry=buildKibariEntry(prob);
  entry.id=entry.id||Date.now();
  prob.id=entry.id;
  setSync('kibari','spin',L[st.lang].genPhaseProcess+'...');
  try{await gasPost({action:'delete',id:String(entry.id),sheet:'kibari'});}catch{}
  await gasPostEntry(entry);
  const idx=st.kbPast.findIndex(p=>String(p.id)===String(entry.id));
  if(idx>=0)st.kbPast[idx]=entry;
  else st.kbPast.unshift(entry);
  renderPL('kibari');
  setSync('kibari','ok',pastSyncCount('kibari')+L[st.lang].syncItems);
  showToast(L[st.lang].kbSavedOk);
}
