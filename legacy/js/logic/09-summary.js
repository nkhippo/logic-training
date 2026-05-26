/* Summary */
// ══════════════════════════════════════════════════════════
// 要約
// ══════════════════════════════════════════════════════════
function resetAnswerPhotos(){
  answerPhotos=[];
  ['s','c','pp'].forEach(sc=>{
    const preview=document.getElementById(sc+'-photo-preview');
    if(preview)preview.innerHTML='';
    const memo=document.getElementById(sc+'-photo-memo');
    if(memo)memo.value='';
    const zone=document.getElementById(sc+'-upload-zone');
    if(zone)zone.style.display='';
    const input=document.getElementById(sc+'-photo-input');
    if(input)input.value='';
  });
}
function buildAnswerModeBar(scope){
  const l=L[st.lang];
  return`<div class="answer-mode-bar no-print" id="${scope}-answer-mode-bar"><span class="label">${esc(l.ansModeLbl)}</span><div class="answer-mode-toggle"><button type="button" class="amode-btn active" id="${scope}-amode-text" onclick="setAnswerMode('${scope}','text')"><i class="ti ti-keyboard" aria-hidden="true"></i> <span>${esc(l.amodeText)}</span></button><button type="button" class="amode-btn" id="${scope}-amode-photo" onclick="setAnswerMode('${scope}','photo')"><i class="ti ti-camera" aria-hidden="true"></i> <span>${esc(l.amodePhoto)}</span></button></div></div>`;
}
function buildPhotoArea(scope){
  const l=L[st.lang];
  return`<div id="${scope}-photo-area" class="no-print" style="display:none;margin-bottom:1rem;"><span class="label">${esc(l.photoLbl)}</span><label class="upload-zone" id="${scope}-upload-zone" for="${scope}-photo-input"><i class="ti ti-camera-plus" aria-hidden="true" style="font-size:28px;display:block;margin-bottom:.4rem;opacity:.5;"></i><span>${esc(l.uploadHint)}</span><div style="font-size:11px;color:var(--text2);margin-top:4px;">${esc(l.uploadNote)}</div></label><input type="file" id="${scope}-photo-input" accept="${IMAGE_ACCEPT}" multiple style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;" onchange="handlePhotoUpload(event,'${scope}')"/><div class="photo-preview" id="${scope}-photo-preview"></div><span class="label" style="margin-top:.5rem;display:block;">${esc(l.memoLbl)}</span><textarea id="${scope}-photo-memo" rows="2" style="resize:none;font-size:13px;"></textarea></div>`;
}
function setAnswerMode(scope,mode){
  st.answerMode=mode;
  st.answerScope=scope;
  document.getElementById(scope+'-amode-text')?.classList.toggle('active',mode==='text');
  document.getElementById(scope+'-amode-photo')?.classList.toggle('active',mode==='photo');
  const questions=document.getElementById(scope+'-questions');
  const photoArea=document.getElementById(scope+'-photo-area');
  if(questions)questions.style.display=mode==='text'?'':'none';
  if(photoArea)photoArea.style.display=mode==='photo'?'':'none';
  const owarnId=scope==='s'?'s-owarn':scope==='pp'?'pp-owarn':null;
  if(owarnId)document.getElementById(owarnId)?.classList.remove('show');
  const btnId=scope==='s'?'s-submit':scope==='c'?'c-submit':scope==='a'?'a-submit':null;
  if(scope==='pp'){
    const ppBtn=document.getElementById('pp-submit')||document.getElementById('pp-c-submit')||document.getElementById('pp-a-submit');
    if(ppBtn)ppBtn.disabled=false;
  }else{
    const btn=document.getElementById(btnId);
    if(btn)btn.disabled=false;
  }
}
const IMAGE_ACCEPT='image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif,.heic,.heif';
function isImageFile(file){
  if(!file)return false;
  if(file.type&&file.type.startsWith('image/'))return true;
  return /\.(jpe?g|png|gif|webp|heic|heif)$/i.test(file.name||'');
}
function canvasToJpegDataUrl(source,maxSize){
  const canvas=document.createElement('canvas');
  let w=source.width,h=source.height;
  if(w>maxSize||h>maxSize){
    if(w>h){h=Math.round(h*maxSize/w);w=maxSize;}
    else{w=Math.round(w*maxSize/h);h=maxSize;}
  }
  canvas.width=w;canvas.height=h;
  canvas.getContext('2d').drawImage(source,0,0,w,h);
  return canvas.toDataURL('image/jpeg',0.85);
}
function resizeImage(dataUrl,maxSize,callback,onError){
  const img=new Image();
  img.onload=()=>{
    try{callback(canvasToJpegDataUrl(img,maxSize));}
    catch(e){if(onError)onError(e);else alert(L[st.lang].photoDecodeError);}
  };
  img.onerror=()=>{if(onError)onError();else alert(L[st.lang].photoDecodeError);};
  img.src=dataUrl;
}
function readImageFileViaDataUrl(file,maxSize){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onerror=()=>reject(new Error(L[st.lang].photoDecodeError));
    reader.onload=(e)=>{
      resizeImage(e.target.result,maxSize,resolve,()=>reject(new Error(L[st.lang].photoDecodeError)));
    };
    reader.readAsDataURL(file);
  });
}
function processImageFile(file,maxSize=1000){
  if(!isImageFile(file))return Promise.reject(new Error(L[st.lang].photoFormatError));
  if(typeof createImageBitmap==='function'){
    return createImageBitmap(file)
      .then(bitmap=>{
        try{return canvasToJpegDataUrl(bitmap,maxSize);}
        finally{bitmap.close?.();}
      })
      .catch(()=>readImageFileViaDataUrl(file,maxSize));
  }
  return readImageFileViaDataUrl(file,maxSize);
}
function photoPayloadFromDataUrl(dataUrl){
  const [header,data]=dataUrl.split(',');
  return{base64:data,mediaType:'image/jpeg',dataUrl};
}
function renderPhotoPreview(scope){
  const preview=document.getElementById(scope+'-photo-preview');
  if(!preview)return;
  preview.innerHTML=answerPhotos.map((p,i)=>`
    <div class="photo-thumb">
      <img src="${p.dataUrl}" alt="回答写真${i+1}"/>
      <button type="button" class="photo-del" onclick="removePhoto(${i},'${scope}')">✕</button>
    </div>
  `).join('');
  const zone=document.getElementById(scope+'-upload-zone');
  if(zone)zone.style.display=answerPhotos.length>=2?'none':'';
}
function removePhoto(idx,scope){
  answerPhotos.splice(idx,1);
  renderPhotoPreview(scope);
}
async function handlePhotoUpload(event,scope){
  const input=event.target;
  const files=Array.from(input?.files||[]).filter(isImageFile);
  const remaining=2-answerPhotos.length;
  if(!files.length){
    alert(L[st.lang].photoFormatError);
    if(input)input.value='';
    return;
  }
  const batch=files.slice(0,remaining);
  for(const file of batch){
    try{
      const dataUrl=await processImageFile(file);
      answerPhotos.push(photoPayloadFromDataUrl(dataUrl));
      renderPhotoPreview(scope);
    }catch(e){
      alert(e.message||L[st.lang].photoDecodeError);
    }
  }
  if(input)input.value='';
}
function copyResult(mode){
  let md='';
  const l=L[st.lang];
  const dateStr=new Date().toLocaleDateString(st.lang==='ja'?'ja-JP':'en-US');
  if(mode==='fill'){
    const prob=st.fill;if(!prob)return;
    const answers=prob.answers||[];
    const ua=prob.userAnswers||[];
    const solvedText=answers.reduce((t,a,i)=>t.replace(`【_${i+1}_】`,`**[${a}]**`),prob.text||'');
    md=[
      `# 穴埋め問題｜${prob.theme||''}`,
      `**難易度：** ${l.dLabels?.[prob.diff-1]||prob.diff}　**日付：** ${dateStr}`,
      '',
      '## 問題文（正解入り）',
      solvedText,
      '',
      '## 回答結果',
      ...answers.map((a,i)=>{
        const u=ua[i]||'（未回答）';
        const mark=u===a?'✓':'✗';
        return `- （${i+1}）${mark} あなたの回答：「${u}」　正解：「${a}」`;
      }),
      '',
      '## 解説',
      prob.feedback||''
    ].join('\n');
  }else if(mode==='summary'){
    const prob=st.summary;if(!prob)return;
    const p=normSummaryProb(prob);
    md=[
      `# 要約問題｜${prob.theme||''}`,
      `**難易度：** ${l.dLabels?.[prob.diff-1]||prob.diff}　**日付：** ${dateStr}`,
      '',
      '## 問題文',
      p.text||'',
      '',
      '## 設問と回答',
      ...p.questions.map((q,i)=>{
        const ans=document.getElementById(`sans-${i}`)?.value||'（未回答）';
        return [
          `### 設問${q.id||i+1}（目標：${q.targetChars}文字以内）`,
          q.question||'',
          '',
          '**あなたの回答：**',
          ans
        ].join('\n');
      }),
      '',
      '## 解説・添削',
      prob.feedback||''
    ].join('\n\n');
  }
  const done=()=>showToast(l.copiedMsg);
  if(navigator.clipboard?.writeText){
    navigator.clipboard.writeText(md).then(done).catch(()=>{
      const el=document.createElement('textarea');
      el.value=md;document.body.appendChild(el);el.select();
      document.execCommand('copy');document.body.removeChild(el);done();
    });
  }else{
    const el=document.createElement('textarea');
    el.value=md;document.body.appendChild(el);el.select();
    document.execCommand('copy');document.body.removeChild(el);done();
  }
}
async function generateSummary(){
  if(isBusy())return;
  const isEN=st.lang==='en';
  if(!validateBeforeGen('s'))return;
  const themeIn=buildThemeInFromDocType('s',isEN);
  const diff=st.sDiff;
  let length;
  if(diff<=3){length=S_LENGTH_FIXED[diff];}
  else{const vol=st.sVolume||DEFAULT_S_VOLUME;length=S_LENGTH_VARIABLE[vol].chars;}
  const numQ=calcBlocks(diff);
  const ratio=S_RATIO[diff];
  document.getElementById('summary-result').style.display='none';
  const spa=document.getElementById('s-print-area');if(spa)spa.style.display='none';
  if(!beginGen('summary'))return;

  const sys=isEN
    ?'You are an expert in business writing and communication education. The educational goal of this tab is to train learners to compress business documents by retaining claims and evidence while cutting specific examples, and to answer only based on evidence from the document. Design the passage so it can be compressed by retaining the main argument and supporting evidence. Respond ONLY in valid JSON. No markdown fences, no explanation before or after.'
    :'あなたはビジネス文書の読解と論理的コミュニケーションの教育専門家です。このタブの教育目的は「ビジネス文書の主張と根拠を残しながら具体例を削る情報の取捨選択力」と「文書に書かれていることのみを根拠にして答える規律」を鍛えることです。問題文はビジネス現場で実際に使われる文書（議事録・報告書・提案書など）の文体で作成し、主張と根拠を残し具体例を削ることで圧縮できる構造にしてください。必ず指定されたJSON形式のみで返答してください。JSONの前後に説明文や```などを一切含めないでください。';
  const themeInst=buildThemeInst(themeIn,'keyword',length,isEN,true);
  const diffPrompt=getSumPrompts()[diff];
  const types=getSumQuestionTypes(diff);
  const typesList=types.join(isEN ? ', ' : '、');
  const typeGuide=isEN
    ?`Generate exactly ${numQ} questions about the passage. Choose types from: ${typesList}. Vary types when possible.\ntargetChars guide: 用語の説明 ~50, 主張のまとめ 80-150, 理由の説明 ~100. Use the Japanese type names in the "type" field.\nDesign the passage so that it can be compressed by retaining claims and evidence while removing specific examples.`
    :`設問はちょうど${numQ}問。タイプは次から選ぶ: ${typesList}。可能ならタイプを分散させる。\ntargetCharsの目安: 用語の説明50字、主張のまとめ80〜150字、理由の説明100字。\n文章は「主張と根拠を残し具体例を削ることで圧縮できる」構造にすること。`;
  const jsonInst=isEN
    ?`Return ONLY this JSON:\n{"theme":"topic in 10 chars or less","text":"full passage ~${length} chars","questions":[{"id":1,"type":"用語の説明","question":"...","targetChars":50}]}\nquestions must have exactly ${numQ} items. "text" is one unified business document passage.`
    :`返答はJSONのみ：\n{"theme":"テーマ10文字以内","text":"約${length}文字の問題文","questions":[{"id":1,"type":"用語の説明","question":"文書中の「〇〇」とは…50字以内で説明しなさい。","targetChars":50}]}\nquestionsは${numQ}要素。textは1つのビジネス文書（議事録・報告書・提案書など）。`;

  try{
    const genMaxTokens=length<=500?1200:length<=2000?3000:6000;
    const formatNote=isEN?SUM_FORMAT_NOTE_EN:SUM_FORMAT_NOTE_JA;
    const personaNote=buildPersonaPromptNote(isEN);
    const beProblemHolder={};
    const raw=await callClaude(`${themeInst}\n${diffPrompt}\n${typeGuide}\n${jsonInst}\n${formatNote}${personaNote}`,sys,genMaxTokens,0.9,{
      mode:'generate',service:'logic',tab:'summary',theme:themeIn||'auto',
      onProblemId:(id)=>{beProblemHolder.id=id;},
    });
    if(!raw)return;
    const p=safeJSON(raw);
    if(!p.text||!Array.isArray(p.questions)||p.questions.length===0)throw new Error('Invalid JSON structure');
    const questions=p.questions.map((q,i)=>({id:q.id||i+1,type:q.type||'主張のまとめ',question:q.question||'',targetChars:parseInt(q.targetChars)||50}));
    st.summary={id:Date.now(),beProblemId:beProblemHolder.id||null,theme:p.theme||(themeIn?themeIn.slice(0,20):''),diff,date:new Date().toISOString(),industry:genIndustrySnapshot(),text:p.text,questions,ratio,length,sVolume:diff>=4?(st.sVolume||DEFAULT_S_VOLUME):null,feedback:null,lang:st.lang};
    renderSummary(st.summary);
    resetGenConditions();
    try{await syncPastOnGen('summary',st.summary);}
    catch(syncErr){setSync('summary','err',L[st.lang].syncFailed);showToast('Error: '+syncErr.message,4000);}
  }catch(e){alert(L[st.lang].genFailed+'\n'+e.message);}
  finally{endGen('summary');}
}

function renderSummary(prob){
  resetAnswerPhotos();
  const copyBar=document.getElementById('s-copy-bar');
  if(copyBar)copyBar.style.display='none';
  setAnswerMode('s','text');
  const l=L[st.lang];
  const p=normSummaryProb(prob);
  renderProblemMeta('s-theme-tag',p);
  document.getElementById('s-ph').innerHTML=`<h2>${l.appTitle} — ${l.tabSum}</h2><p>${l.theme}${esc(p.theme||'—')}　${l.diff}${dlabel(p.diff)}　${fmtDate(p.date)}</p><p style="font-size:10pt;margin-top:.4rem;">${l.sPrintInst}</p>`;
  document.getElementById('s-problem-text').innerHTML=esc(p.text);
  document.getElementById('s-questions').innerHTML=p.questions.map((q,i)=>buildSummaryQuestionHtml(q,i,p.lang||st.lang,'live')).join('');
  document.getElementById('s-fb').innerHTML='';
  document.getElementById('s-pa-btn').style.display='none';
  document.getElementById('s-owarn').classList.remove('show');
  document.getElementById('s-submit').disabled=false;
  document.getElementById('s-print-area').style.display='flex';
  document.getElementById('summary-result').style.display='block';
  document.getElementById('ss1').className='step done';
  document.getElementById('ss2').className='step active';
  document.getElementById('ss3').className='step';
}

function updateSumCC(i,mode){
  if(st.answerMode==='photo')return;
  const taId=mode==='pp'?`pp-sans-${i}`:`sans-${i}`;
  const lblId=mode==='pp'?`pp-lbl-${i}`:`slbl-${i}`;
  const warnId=mode==='pp'?`pp-warn-${i}`:`swarn-${i}`;
  const ta=document.getElementById(taId);if(!ta)return;
  const target=parseInt(ta.dataset.target)||0;
  const cnt=ta.value.replace(/\s/g,'').length;
  const lbl=document.getElementById(lblId);
  const warn=document.getElementById(warnId);
  const l=L[st.lang];
  if(lbl){lbl.textContent=cnt+' / '+target+l.charOf;lbl.className='cc '+(cnt>target?'over':'ok2');}
  ta.classList.toggle('overlimit',cnt>target);
  if(warn){warn.textContent=cnt>target?`⚠ ${cnt-target}${l.charOver}`:'';warn.classList.toggle('show',cnt>target);}
  const sel=mode==='pp'?'[id^="pp-sans-"]':'[id^="sans-"]';
  const anyOver=[...document.querySelectorAll(sel)].some(t=>t.value.replace(/\s/g,'').length>parseInt(t.dataset.target||0));
  const gw=document.getElementById(mode==='pp'?'pp-owarn':'s-owarn');
  if(gw){gw.textContent=anyOver?l.overWarn:'';gw.classList.toggle('show',anyOver);}
  const btn=document.getElementById(mode==='pp'?'pp-submit':'s-submit');
  if(btn)btn.disabled=anyOver;
}
function updateCC(i){updateSumCC(i,'live');}

async function submitPhotoGrade(kind,prob,scope){
  if(isBusy())return;
  if(answerPhotos.length===0){alert(L[st.lang].noPhotoError);return;}
  const busyMode='photo-'+kind+(scope==='pp'?'-pp':'');
  if(!beginGradeBusy(busyMode))return;
  const btnId=scope==='pp'?(kind==='summary'?'pp-submit':kind==='ame'?'pp-a-submit':'pp-c-submit'):(kind==='summary'?'s-submit':kind==='ame'?'a-submit':'c-submit');
  const fbId=scope==='pp'?'pp-fb':(kind==='summary'?'s-fb':kind==='ame'?'a-fb':'c-fb');
  const btn=document.getElementById(btnId);
  const fb=document.getElementById(fbId);
  const l=L[prob.lang||st.lang];
  fb.innerHTML=`<p class="loading"><span class="dots">${l.photoGrading}</span></p>`;
  const isEN=(prob.lang||st.lang)==='en';
  const memo=document.getElementById(scope+'-photo-memo')?.value.trim()||'';
  const imageContents=answerPhotos.map(ph=>({type:'image',source:{type:'base64',media_type:ph.mediaType,data:ph.base64}}));
  try{
    let sys,content,gradeMaxTokens=GRADE_MAX_TOKENS.default;
    if(kind==='summary'){
      const p=normSummaryProb(prob);
      const totalTargetChars=p.questions.reduce((s,q)=>s+(q.targetChars||0),0);
      const qBlock=p.questions.map((q,i)=>isEN
        ?`[Question ${q.id||i+1}] Target: ${q.targetChars} chars or less\n${q.question}`
        :`【設問${q.id||i+1}】目標：${q.targetChars}文字以内\n${q.question}`).join('\n\n');
      const textPrompt=isEN
        ?`The following is the summarization problem the learner was given.\n\nProblem text:\n${p.text}\n\nQuestions:\n${qBlock}\n\nThe learner has submitted handwritten answers in the attached image(s).\n${memo?`Learner's note: ${memo}`:''}\n\nPlease:\n1. Read the handwritten text from the image(s).\n2. If the total handwritten answer appears to exceed 1.5× the total target character count (${Math.round(totalTargetChars*1.5)} chars), respond with 【Score: 0/100】 and state the reason clearly.\n3. Otherwise, grade each answer on content accuracy, conciseness, and expression.\n4. Give a total score out of 100 at the very top in the format: 【Score: XX/100】\n5. Provide block-by-block feedback and an overall comment.${SUM_SCORE100_NOTE_EN}`
        :`以下は学習者が取り組んだ要約問題です。\n\n問題文：\n${p.text}\n\n${qBlock}\n\n学習者は添付画像に手書きで回答しています。\n${memo?`学習者のメモ：${memo}`:''}\n\n以下の手順で採点してください。\n1. 画像から手書きのテキストを読み取ってください。\n2. 回答の総文字量が目標合計文字数の1.5倍（${Math.round(totalTargetChars*1.5)}文字）を大幅に超えていると判断される場合は、「文字数が大幅に超過しているため採点できません」として【スコア：0/100】としてください。\n3. それ以外の場合は、内容の正確さ・簡潔さ・表現を評価してください。\n4. 最初の行に必ず【スコア：XX/100】の形式で100点満点の点数を記載してください。\n5. 設問別フィードバックと総合コメントを記載してください。${SUM_SCORE100_NOTE_JA}`;
      sys=isEN
        ?'You are an expert writing teacher for business document comprehension. The goal of feedback is to evaluate whether the learner bases answers solely on the document, and whether they retain the main argument and evidence while cutting specific examples. Explicitly point out any interpretation or outside knowledge not grounded in the document. Give structured feedback in English using markdown.'
        :'あなたはビジネス文書の読解と記述指導の教育専門家です。フィードバックの目的は「文書に書かれていることのみを根拠にし、主張と根拠を残しながら具体例を削る情報の取捨選択ができているか」を評価することです。文書外の自分の解釈や知識を持ち込んでいる箇所があれば具体的に指摘してください。マークダウンを使って構造的に日本語でフィードバックしてください。';
      content=[...imageContents,{type:'text',text:textPrompt}];
      const diff=prob.diff||st.sDiff;
      const length=prob.length||(diff<=3?S_LENGTH_FIXED[diff]:S_LENGTH_VARIABLE[(prob.sVolume||st.sVolume||DEFAULT_S_VOLUME)].chars);
      gradeMaxTokens=gradeMaxTokensBySummaryLength(length);
    }else if(kind==='ame'){
      const p=normAmeProb(prob);
      const lawSection=p.law?(isEN?`[Law/Principle]\n${p.law}\n\n`:`【法則・前提】\n${p.law}\n\n`):'';
      const constraintSection=p.constraint?(isEN?`[Umbrella Constraint]\n${p.constraint}\n\n`:`【傘の制約条件】\n${p.constraint}\n\n`):'';
      const articleSection=isEN?`[Article]\n${p.article}\n\n`:`【記事】\n${p.article}\n\n`;
      const qBlock=p.questions.map((q,i)=>isEN
        ?`[Q${q.id||i+1}] ${q.type}\n${q.question}\nTarget: within ${q.targetChars} chars`
        :`【設問${q.id||i+1}】${q.type}\n${q.question}\n目標: ${q.targetChars}字以内`).join('\n\n---\n\n');
      const gradeInst=isEN
        ?`The learner submitted handwritten answers in the attached image(s).\n${memo?`Learner's note: ${memo}`:''}\n\nRead the handwriting, then grade each question on factual grounding from business data, logical gaps, constraint compliance for Umbrella, and alternative interpretations. Provide an improved example within the character limit for each question.\n\n## Per-Question Feedback\n## Overall Feedback`
        :`学習者は添付画像に手書きで回答しています。\n${memo?`学習者のメモ：${memo}`:''}\n\n手書きを読み取り、各設問をビジネスデータとの整合性・飛躍の有無・制約条件の遵守・別の読み取りの可能性の観点で採点し、改善例を示してください。\n\n## 設問別フィードバック\n## 総合講評`;
      const textPrompt=`${lawSection}${articleSection}${constraintSection}${qBlock}\n\n${gradeInst}`;
      sys=isEN
        ?'You are an expert in business reasoning and Sky-Rain-Umbrella framework education. The goal of feedback is to evaluate: whether the interpretation is logically derived from the business facts without gaps, whether the action logically follows from the interpretation and respects any constraints, and whether the learner is aware that alternative interpretations are possible from the same data. Point out specific gaps, present one alternative interpretation, then provide an improved example. Give structured feedback in English using markdown.'
        :'あなたはビジネス推論と空雨傘フレームワークの教育専門家です。フィードバックの目的は「ビジネスデータから読み取りへの飛躍がないか」「読み取りから行動への論理的なつながりがあるか（制約条件を守っているか）」「同じデータから別の読み取りが導ける可能性に気づいているか」を評価することです。飛躍を具体的に指摘し、別の読み取りを1つ示した上で改善例を提示してください。マークダウンを使って構造的に日本語でフィードバックしてください。';
      content=[...imageContents,{type:'text',text:textPrompt}];
      gradeMaxTokens=gradeMaxTokensByDiff(p.diff);
    }else{
      const p=normCritiqueProb(prob);
      const passageSection=(p.form==='A'&&p.text)
        ?(isEN?`[Passage]\n${p.text}\n\n`:`【問題文】\n${p.text}\n\n`)
        :'';
      const qBlock=p.questions.map((q,i)=>{
        const argPart=(p.form==='B'&&q.argument)?(isEN?`[Argument]\n${q.argument}\n`:`【論証】\n${q.argument}\n`):'';
        return isEN
          ?`[Q${q.id||i+1}] Type: ${q.type}\n${argPart}${q.question}\nTarget: within ${q.targetChars} chars`
          :`【設問${q.id||i+1}】タイプ: ${q.type}\n${argPart}${q.question}\n目標: ${q.targetChars}字以内`;
      }).join('\n\n---\n\n');
      const gradeInst=isEN
        ?`The learner submitted handwritten answers in the attached image(s).\n${memo?`Learner's note: ${memo}`:''}\n\nRead the handwriting, then grade each question on:\n- Accuracy of gap/condition/flow/stakeholder identification\n- Logical validity of reasoning in a business context\n- Quality of written response (clarity, conciseness, plain business language)\nProvide an improved example within the character limit for each question.\n\n## Per-Question Feedback\n## Overall Feedback`
        :`学習者は添付画像に手書きで回答しています。\n${memo?`学習者のメモ：${memo}`:''}\n\n手書きを読み取り、各設問を以下の軸で採点してください。\n- 論理の弱点・前提の欠如・立場による疑問の特定の正確さ\n- 学習者の推論の論理的妥当性（ビジネス文脈）\n- 記述の質（明確さ・簡潔さ・平易なビジネス表現）\n各設問の末尾に、文字数以内の改善例を示してください。\n\n## 設問別フィードバック\n## 総合講評`;
      const textPrompt=`${passageSection}${qBlock}\n\n${gradeInst}`;
      sys=isEN
        ?'You are an expert in business communication and logical thinking education. The goal of feedback is to evaluate how accurately the learner identified logical gaps, missing conditions, or stakeholder objections in business contexts, and how clearly they expressed their findings in plain business language. Evaluate accuracy of identification, logical validity, and clarity of expression. Provide improved example answers. Give structured feedback in English using markdown.'
        :'あなたはビジネスコミュニケーションと論理的思考の教育専門家です。フィードバックの目的は「ビジネス文書における論理の弱点・前提の欠如・立場による疑問をどれだけ正確に特定し、ビジネスの平易な言葉で応答文として表現できているか」を評価することです。特定の正確さ・論理的妥当性・記述の明確さを具体的に評価し、改善例を示してください。マークダウンを使って構造的に日本語でフィードバックしてください。';
      content=[...imageContents,{type:'text',text:textPrompt}];
      gradeMaxTokens=gradeMaxTokensByDiff(p.diff);
    }
    const res=await callClaudeMsg(sys,content,gradeMaxTokens,0.3);if(!res)return;
    if(kind==='summary'){
      fb.innerHTML=`<div class="feedback-box">${formatFeedback100(res,prob.lang||st.lang)}</div>`;
      prob.feedback=res;
      prob.answerMode='photo';
      if(scope==='s'){
        document.getElementById('ss2').className='step done';
        document.getElementById('ss3').className='step done';
        document.getElementById('s-pa-btn').style.display='';
        showCopyBar('summary');
      }else{
        document.getElementById('pp-s2').className='step done';
        document.getElementById('pp-s3').className='step done';
      }
    }else if(kind==='ame'){
      fb.innerHTML=`<div class="feedback-box">${md2h(res)}</div>`;
      prob.feedback=res;
      if(scope==='a'){
        document.getElementById('as2').className='step done';
        document.getElementById('as3').className='step done';
        document.getElementById('a-pa-btn').style.display='';
        try{await syncAmePast(prob);}
        catch(syncErr){setSync('ame','err',L[st.lang].syncFailed);showToast('Error: '+syncErr.message,4000);}
      }else{
        document.getElementById('pp-s2').className='step done';
        document.getElementById('pp-s3').className='step done';
        try{await syncAmePast(prob);}
        catch(syncErr){setSync('ame','err',L[st.lang].syncFailed);showToast('Error: '+syncErr.message,4000);}
      }
    }else{
      fb.innerHTML=`<div class="feedback-box">${md2h(res)}</div>`;
      prob.feedback=res;
      if(scope==='c'){
        document.getElementById('cs2').className='step done';
        document.getElementById('cs3').className='step done';
        document.getElementById('c-pa-btn').style.display='';
        try{await syncCritiquePast(prob);}
        catch(syncErr){setSync('critique','err',L[st.lang].syncFailed);showToast('Error: '+syncErr.message,4000);}
      }else{
        document.getElementById('pp-s2').className='step done';
        document.getElementById('pp-s3').className='step done';
        try{await syncCritiquePast(prob);}
        catch(syncErr){setSync('critique','err',L[st.lang].syncFailed);showToast('Error: '+syncErr.message,4000);}
      }
    }
  }catch(e){
    const errLbl=kind==='summary'?l.gradingErr:kind==='ame'?l.aGradingErr:l.cGradingErr;
    fb.innerHTML=`<p class="err">${errLbl}: ${e.message}</p>`;
  }finally{
    endGradeBusy(busyMode);
  }
}

async function submitSummary(){
  if(isBusy())return;
  const prob=st.summary;if(!prob)return;
  if(st.answerMode==='photo'&&st.answerScope==='s'){await submitPhotoGrade('summary',prob,'s');return;}
  const anyOver=[...document.querySelectorAll('[id^="sans-"]')].some(t=>t.value.replace(/\s/g,'').length>parseInt(t.dataset.target||0));
  if(anyOver){alert(L[st.lang].overWarn);return;}
  const userTexts=collectSummaryAnswers(prob,'live');
  if(userTexts.some(isBlankAnswer)){
    alert(L[st.lang].summaryAnswerRequired);
    return;
  }
  if(!beginGradeBusy('summary'))return;
  const fb=document.getElementById('s-fb');
  fb.innerHTML=`<p class="loading"><span class="dots">${L[st.lang].loading}</span></p>`;
  const isEN=prob.lang==='en';
  const sys=isEN
    ?'You are an expert writing teacher for business document comprehension. The goal of feedback is to evaluate whether the learner bases answers solely on the document, and whether they retain the main argument and evidence while cutting specific examples. Explicitly point out any interpretation or outside knowledge not grounded in the document. Give structured feedback in English using markdown.'
    :'あなたはビジネス文書の読解と記述指導の教育専門家です。フィードバックの目的は「文書に書かれていることのみを根拠にし、主張と根拠を残しながら具体例を削る情報の取捨選択ができているか」を評価することです。文書外の自分の解釈や知識を持ち込んでいる箇所があれば具体的に指摘してください。マークダウンを使って構造的に日本語でフィードバックしてください。';
  const prompt=buildSummaryGradePrompt(prob,userTexts);
  try{
    const diff=prob.diff||st.sDiff;
    const length=prob.length||(diff<=3?S_LENGTH_FIXED[diff]:S_LENGTH_VARIABLE[(prob.sVolume||st.sVolume||DEFAULT_S_VOLUME)].chars);
    const res=await callClaude(prompt,sys,gradeMaxTokensBySummaryLength(length),0.3,{
      mode:'score',service:'logic',problem_id:prob.beProblemId||null,
      user_answer:userTexts.join('\n---\n'),
      context:{original_problem:prob.text,tab:'summary'},
      markdownResponse:true,
    });if(!res)return;
    fb.innerHTML=`<div class="feedback-box">${formatSummaryFeedback(res,prob.lang)}</div>`;
    prob.feedback=res;
    prob.answerMode='text';
    document.getElementById('ss2').className='step done';
    document.getElementById('ss3').className='step done';
    document.getElementById('s-pa-btn').style.display='';
    showCopyBar('summary');
  }catch(e){fb.innerHTML=`<p class="err">${L[st.lang].gradingErr}: ${e.message}</p>`;}
  finally{endGradeBusy('summary');}
}


