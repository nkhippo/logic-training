/* Past */
// ══════════════════════════════════════════════════════════
// 過去問共通
// ══════════════════════════════════════════════════════════
function filterPast(mode,f){
  if(mode==='fill')st.fFilter=f;
  else if(mode==='summary')st.sFilter=f;
  else if(mode==='critique')st.cFilter=f;
  else st.aFilter=f;
  document.querySelectorAll('#'+pastPrefix(mode)+'-tabs .pf-tab').forEach(b=>b.classList.toggle('active',b.dataset.f===f));
  renderPL(mode);
}
async function loadPast(mode){
  setSync(mode,'spin',L[st.lang].syncLoading);
  try{
    if(!await ensureGasV3()){setSync(mode,'err',L[st.lang].syncFailed);return;}
    assignPastStore(mode,await gasGetPast(mode));
    setSync(mode,'ok',pastSyncCount(mode)+L[st.lang].syncItems);
    renderPL(mode);
  }
  catch(e){setSync(mode,'err',L[st.lang].syncFailed);document.getElementById(pastPrefix(mode)+'-list').innerHTML=`<div class="pempty">${esc(e.message)}</div>`;}
}
function renderPL(mode){
  const all=pastList(mode);
  const f=mode==='fill'?st.fFilter:mode==='summary'?st.sFilter:mode==='critique'?st.cFilter:st.aFilter;
  const byDiff=f==='all'?all:all.filter(p=>String(p.diff)===f);
  const list=byDiff.filter(p=>(p.lang||'ja')===st.lang);
  const c=document.getElementById(pastPrefix(mode)+'-list');
  if(!list.length){c.innerHTML=`<div class="pempty"><i class="ti ti-inbox" style="font-size:26px;display:block;margin-bottom:.4rem;"></i>${L[st.lang].noData}</div>`;return;}
  c.innerHTML=list.map(p=>`
    <div class="pcard" onclick="openPast('${mode}','${p.id}')">
      <div class="pc-h"><div class="pc-t">${esc(p.theme)}</div>
        <div class="pc-m"><span class="badge ${BADGE[p.diff]||'b3'}">${dlabel(p.diff)}</span></div></div>
      <div class="pc-pre">${esc((mode==='fill'?p.text:mode==='summary'?normSummaryProb(p).text:mode==='ame'?String(p.article||''):critiquePreviewText(p)).replace(/【_\d+_】/g,'[  ]').substring(0,80))}</div>
      <div class="pc-date">${fmtDate(p.date)}${p.lang?' · '+p.lang.toUpperCase():''}</div>
    </div>`).join('');
}
function randomPast(mode){
  const all=pastList(mode);
  const f=mode==='fill'?st.fFilter:mode==='summary'?st.sFilter:mode==='critique'?st.cFilter:st.aFilter;
  const byDiff=f==='all'?all:all.filter(p=>String(p.diff)===f);
  const pool=byDiff.filter(p=>(p.lang||'ja')===st.lang);
  if(!pool.length){alert(L[st.lang].noData);return;}
  openPast(mode,pool[Math.floor(Math.random()*pool.length)].id);
}

function openPast(mode,id){
  const all=pastList(mode);
  const prob=all.find(p=>String(p.id)===String(id));if(!prob)return;
  const pLang=prob.lang||'ja';const l=L[pLang];
  const pfx=pastPrefix(mode);
  document.getElementById(pfx+'-list-view').style.display='none';
  document.getElementById(pfx+'-play').style.display='block';
  const cnt=document.getElementById(pfx+'-play-content');

  if(mode==='fill'){
    const answers=parseF(prob.answers);const hints=parseF(prob.hints);
    let html=esc(prob.text);
    for(let i=1;i<=answers.length;i++) html=html.replace(`【_${i}_】`,`<span class="blank" id="blank-${i}">（${i}）</span>`);
    cnt.innerHTML=`
      ${buildProblemMetaHtml(prob,pLang)}
      <div class="step-bar"><div class="step done"></div><div class="step active" id="pp-s2"></div><div class="step" id="pp-s3"></div></div>
      <div class="problem-box">${html}</div>
      <div class="answer-section" id="pp-inputs" style="margin-top:1rem;margin-bottom:1rem;"></div>
      <div class="divider"></div>
      <button class="btn" id="pp-api-btn" onclick="ppAPI('${id}')" style="margin-top:.5rem;">
        <i class="ti ti-sparkles" aria-hidden="true"></i>
        <span>${l.apiBtn}</span>
      </button>
      <div class="action-bar" style="margin-top:8px;">
        <button class="btn btn-icon btn-sm" onclick="window.print()">
          <i class="ti ti-printer"></i>
          <span>${l.pq}</span>
        </button>
      </div>
      <div id="pp-fb" style="margin-top:.5rem;"></div>
      <div id="pp-ow-bar" class="action-bar" style="display:none;margin-top:.5rem;">
        <button class="btn btn-icon btn-sm" onclick="ppOverwrite('${id}')"><i class="ti ti-cloud-upload"></i> ${l.overwriteBtn}</button>
      </div>`;
    const sec=document.getElementById('pp-inputs');sec.innerHTML=`<p class="slabel">${l.answerBox}</p>`;
    const noHints=(prob.diff||1)>=3;
    answers.forEach((_,i)=>{
      sec.appendChild(buildFillAnswerItem(i,noHints?'':hints[i],`ppans-${i}`,false));
    });
  } else if(mode==='summary'){
    const p=normSummaryProb(prob);
    const qHtml=p.questions.map((q,i)=>buildSummaryQuestionHtml(q,i,pLang,'pp')).join('');
    cnt.innerHTML=`
      ${buildProblemMetaHtml(prob,pLang)}
      <div class="step-bar"><div class="step done"></div><div class="step active" id="pp-s2"></div><div class="step" id="pp-s3"></div></div>
      <p class="slabel">${l.sInst}</p>
      <div class="problem-box">${esc(p.text)}</div>
      ${buildAnswerModeBar('pp')}
      <div id="pp-questions">${qHtml}</div>
      ${buildPhotoArea('pp')}
      <div id="pp-owarn" class="owarn" style="margin-bottom:.5rem;"></div>
      <button class="btn" id="pp-submit" onclick="ppSummary('${id}')"><span>${l.sSubmit}</span></button>
      <div class="action-bar" style="margin-top:8px;">
        <button class="btn btn-icon btn-sm" onclick="window.print()">
          <i class="ti ti-printer"></i>
          <span>${l.pq}</span>
        </button>
      </div>
      <div id="pp-fb"></div>`;
    resetAnswerPhotos();
    setAnswerMode('pp','text');
  } else if(mode==='critique'){
    const p=normCritiqueProb(prob);
    if(!p.questions.length){alert(L[st.lang].cGenFailed);closePP('critique');return;}
    const qHtml=p.questions.map((q,i)=>buildCritiqueQuestionHtml(q,i,pLang,p.form,'pp')).join('');
    cnt.innerHTML=`
      ${buildProblemMetaHtml(prob,pLang)}
      <div class="step-bar"><div class="step done"></div><div class="step active" id="pp-s2"></div><div class="step" id="pp-s3"></div></div>
      <p class="slabel">${l.cInst}</p>
      ${p.form==='A'&&p.text?`<div class="problem-box">${esc(p.text)}</div>`:''}
      ${buildAnswerModeBar('pp')}
      <div id="pp-questions">${qHtml}</div>
      ${buildPhotoArea('pp')}
      <button class="btn" id="pp-c-submit" onclick="ppCritique('${id}')"><span>${l.cSubmit}</span></button>
      <div class="action-bar" style="margin-top:8px;">
        <button class="btn btn-icon btn-sm" onclick="window.print()">
          <i class="ti ti-printer"></i>
          <span>${l.pq}</span>
        </button>
      </div>
      <div id="pp-fb">${prob.feedback?`<div class="feedback-box">${md2h(prob.feedback)}</div>`:''}</div>`;
    resetAnswerPhotos();
    setAnswerMode('pp','text');
    const qq=document.getElementById('pp-questions');
    if(qq)qq.style.display='';
  } else if(mode==='ame'){
    const p=normAmeProb(prob);
    const lawHtml=p.law
      ?`<p class="slabel">${l.aLawLbl}</p><div class="mode-bar">${esc(p.law)}</div>`
      :'';
    const qHtml=buildAmeQuestionsHtml(p,'pp');
    cnt.innerHTML=`
      ${buildProblemMetaHtml(prob,pLang)}
      <div class="step-bar"><div class="step done"></div><div class="step active" id="pp-s2"></div><div class="step" id="pp-s3"></div></div>
      <p class="slabel">${l.aArticleLbl}</p>
      <div class="problem-box">${esc(p.article)}</div>
      ${lawHtml}
      ${buildAnswerModeBar('pp')}
      <div id="pp-questions">${qHtml}</div>
      ${buildPhotoArea('pp')}
      <button class="btn" id="pp-a-submit" onclick="ppAme('${id}')"><span>${l.aSubmit}</span></button>
      <div class="action-bar" style="margin-top:8px;">
        <button class="btn btn-icon btn-sm" onclick="window.print()">
          <i class="ti ti-printer"></i>
          <span>${l.pq}</span>
        </button>
      </div>
      <div id="pp-fb"></div>`;
    resetAnswerPhotos();
    setAnswerMode('pp','text');
  }
}

function ppCC(i){updateSumCC(i,'pp');}


async function ppAPI(id){
  if(isBusy())return;
  const prob=st.fPast.find(p=>String(p.id)===String(id));if(!prob)return;
  const pLang=prob.lang||'ja';const l=L[pLang];
  const answers=parseF(prob.answers);
  const ua=answers.map((_,i)=>document.getElementById(`ppans-${i}`)?.value.trim()||'—');
  if(!beginGradeBusy('pp-fill'))return;
  const fbEl=document.getElementById('pp-fb');
  fbEl.innerHTML=`<p class="loading"><span class="dots">${l.loading}</span></p>`;
  try{
    const res=await gradeFill({...prob,answers,lang:pLang},ua);if(!res)return;
    fbEl.innerHTML=`<div class="feedback-box">${formatFeedback100(res,pLang)}</div>`;
    const owBar=document.getElementById('pp-ow-bar');
    if(owBar){owBar.style.display='flex';owBar.dataset.feedback=res;owBar.dataset.ua=JSON.stringify(ua);}
    document.getElementById('pp-s2').className='step done';
    document.getElementById('pp-s3').className='step done';
  }catch(e){fbEl.innerHTML=`<p class="err">${l.gradingErr}: ${e.message}</p>`;}
  finally{endGradeBusy('pp-fill');}
}

async function ppOverwrite(id){
  const owBar=document.getElementById('pp-ow-bar');if(!owBar)return;
  const newFb=owBar.dataset.feedback;const newUA=JSON.parse(owBar.dataset.ua||'[]');
  if(!newFb)return;
  const prob=st.fPast.find(p=>String(p.id)===String(id));if(!prob)return;
  setSync('fill','spin',L[st.lang].loading+'...');
  try{
    await gasPost({action:'delete',id:String(id),sheet:'fill'});
    const updated={...prob,answers:parseF(prob.answers),hints:parseF(prob.hints),feedback:newFb,userAnswers:newUA,sheet:'fill'};
    await gasPost(updated);
    const idx=st.fPast.findIndex(p=>String(p.id)===String(id));
    if(idx>=0)st.fPast[idx]={...st.fPast[idx],feedback:newFb,userAnswers:newUA};
    setSync('fill','ok',L[st.lang].overwriteOk);
    showToast(L[st.lang].overwriteOk);
    owBar.style.display='none';
  }catch(e){setSync('fill','err',L[st.lang].syncFailed);showToast('Error: '+e.message,4000);}
}

async function ppSummary(id){
  if(isBusy())return;
  const prob=st.sPast.find(p=>String(p.id)===String(id));if(!prob)return;
  const pLang=prob.lang||'ja';const l=L[pLang];
  if(st.answerMode==='photo'&&st.answerScope==='pp'){await submitPhotoGrade('summary',prob,'pp');return;}
  const anyOver=[...document.querySelectorAll('[id^="pp-sans-"]')].some(t=>t.value.replace(/\s/g,'').length>parseInt(t.dataset.target||0));
  if(anyOver){alert(l.overWarn);return;}
  const userTexts=collectSummaryAnswers(prob,'pp');
  if(!beginGradeBusy('pp-summary'))return;
  const fb=document.getElementById('pp-fb');
  fb.innerHTML=`<p class="loading"><span class="dots">${l.loading}</span></p>`;
  const isEN=pLang==='en';
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
    fb.innerHTML=`<div class="feedback-box">${formatSummaryFeedback(res,pLang)}</div>`;
    document.getElementById('pp-s2').className='step done';
    document.getElementById('pp-s3').className='step done';
  }catch(e){fb.innerHTML=`<p class="err">${l.gradingErr}: ${e.message}</p>`;}
  finally{endGradeBusy('pp-summary');}
}


function closePP(mode){
  const pfx=pastPrefix(mode);
  document.getElementById(pfx+'-list-view').style.display='';
  document.getElementById(pfx+'-play').style.display='none';
  document.getElementById(pfx+'-play-content').innerHTML='';
  resetAnswerPhotos();
}
async function deletePast(mode,id){
  if(!confirm(L[st.lang].delConfirm))return;
  setSync(mode,'spin',L[st.lang].loading+'...');
  try{
    await gasPost({action:'delete',id:String(id),sheet:mode});
    if(mode==='fill')st.fPast=st.fPast.filter(p=>String(p.id)!==String(id));
    else if(mode==='summary')st.sPast=st.sPast.filter(p=>String(p.id)!==String(id));
    else if(mode==='critique')st.cPast=st.cPast.filter(p=>String(p.id)!==String(id));
    else st.aPast=st.aPast.filter(p=>String(p.id)!==String(id));
    const n=pastList(mode).length;
    setSync(mode,'ok',n+L[st.lang].syncItems);renderPL(mode);showToast(L[st.lang].deletedOk);
  }catch(e){setSync(mode,'err',L[st.lang].syncFailed);showToast('Error: '+e.message,4000);}
}
