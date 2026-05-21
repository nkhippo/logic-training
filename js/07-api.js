/* API */
// ── APIキー（組み込み） ─────────────────────────────────────
function hasApiKey(){return !!getKey();}
function getKey(){return CLAUDE_API_KEY||'';}
function updateApiKeyUI(){
  const l=L[st.lang],busy=isBusy();
  const needProb=st.lang==='ja'?'先に問題を生成してください':'Generate a problem first';
  ['f-gen-btn','s-gen-btn','c-gen-btn','a-gen-btn','kb-gen-btn'].forEach(id=>{
    const b=document.getElementById(id);
    if(b)b.disabled=busy;
  });
  const sub=document.getElementById('f-submit');
  if(sub){
    sub.disabled=busy||!st.fill;
    sub.title=!st.fill&&!busy?needProb:'';
  }
  const csub=document.getElementById('c-submit');
  if(csub){
    csub.disabled=busy||!st.critique;
    csub.title=!st.critique&&!busy?needProb:'';
  }
  const asub=document.getElementById('a-submit');
  if(asub){
    asub.disabled=busy||!st.ame;
    asub.title=!st.ame&&!busy?needProb:'';
  }
  const kbsub=document.getElementById('kb-submit');
  if(kbsub){
    const canKb=!busy&&!!st.kibari&&document.getElementById('kb-submit-bar')?.style.display!=='none';
    kbsub.disabled=!canKb;
    kbsub.title=!st.kibari&&!busy?needProb:'';
  }
}

// ── Claude API ────────────────────────────────────────────
async function callClaude(prompt,sys,maxTok=2500,temperature=0.9){
  return callClaudeMsg(sys,prompt,maxTok,temperature);
}
async function callClaudeMsg(sys,content,maxTok=2500,temperature=0.9){
  const key=getKey();if(!key)return null;
  const res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',
    headers:{'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
    body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:maxTok,temperature,system:sys,messages:[{role:'user',content}]})});
  if(!res.ok){let m='API error '+res.status;try{const e=await res.json();m=e.error?.message||m;}catch{}throw new Error(m);}
  const d=await res.json();return d.content?.[0]?.text||'';
}
function fileToBase64(file){
  return new Promise((resolve,reject)=>{
    const r=new FileReader();
    r.onload=()=>resolve(String(r.result).split(',')[1]||'');
    r.onerror=()=>reject(new Error('Failed to read image'));
    r.readAsDataURL(file);
  });
}
function parseModelJSON(raw){
  const s=String(raw||'').trim();
  const tryParse=str=>{try{return JSON.parse(str);}catch{return null;}};
  const fenced=s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if(fenced){const p=tryParse(fenced[1].trim());if(p)return p;}
  const direct=tryParse(s);if(direct)return direct;
  const start=s.indexOf('{');
  if(start>=0){
    let depth=0,inStr=false,esc=false;
    for(let i=start;i<s.length;i++){
      const c=s[i];
      if(inStr){
        if(esc)esc=false;
        else if(c==='\\')esc=true;
        else if(c==='"')inStr=false;
        continue;
      }
      if(c==='"'){inStr=true;continue;}
      if(c==='{')depth++;
      else if(c==='}'){
        depth--;
        if(depth===0){
          const p=tryParse(s.slice(start,i+1));
          if(p)return p;
          break;
        }
      }
    }
  }
  const m=s.match(/\{[\s\S]*\}/);
  if(m){const p=tryParse(m[0]);if(p)return p;}
  throw new Error('JSON not found');
}
function safeJSON(raw){return parseModelJSON(raw);}
function normalizeFillFromModel(p){
  const root=p?.problem||p?.data||p||{};
  let text=String(root.text||root.passage||root.content||root.article||'').trim();
  let answers=root.answers;
  if(!Array.isArray(answers)&&Array.isArray(root.blanks)){
    answers=root.blanks.map(b=>typeof b==='string'?b:(b?.answer||b?.correct||b?.word||b?.value||''));
  }
  if(!Array.isArray(answers))answers=[];
  answers=answers.map(a=>typeof a==='string'?a:(a?.answer||a?.word||a?.text||'')).filter(Boolean);
  if(text&&/\{\{?\d+\}?\}/.test(text)){
    for(let i=0;i<answers.length;i++)text=text.replace(new RegExp(`\\{\\{?${i}\\}?\\}`,'g'),`【_${i+1}_】`);
  }
  let hints=root.hints;
  if(!Array.isArray(hints)&&Array.isArray(root.blanks))hints=root.blanks.map(b=>b?.hint||'');
  return{...root,text,answers,hints:Array.isArray(hints)?hints:[]};
}
function normalizeAmeFromModel(p){
  const root=p?.problem||p?.data||p?.result||p||{};
  const pick=(obj)=>{
    const article=String(obj.article||obj.text||obj.passage||obj.body||obj.content||obj.記事||'').trim();
    let questions=obj.questions||obj.設問||obj.items||obj.prompts;
    if(typeof questions==='string')questions=parseF(questions);
    if(!Array.isArray(questions)&&questions&&typeof questions==='object')questions=Object.values(questions);
    if(!Array.isArray(questions))questions=[];
    questions=questions.map((q,i)=>{
      if(typeof q==='string')return{id:i+1,type:'',question:q,targetChars:150};
      return{
        id:q.id||i+1,
        type:q.type||q.タイプ||'',
        question:q.question||q.q||q.prompt||q.設問||q.設問文||'',
        targetChars:parseInt(q.targetChars||q.chars||q.字数,10)||150,
      };
    });
    return{article,questions};
  };
  let{article,questions}=pick(root);
  if(!article||!questions.length){
    for(const v of Object.values(root)){
      if(!v||typeof v!=='object'||Array.isArray(v))continue;
      const nested=pick(v);
      if(nested.article&&nested.questions.length){article=nested.article;questions=nested.questions;break;}
    }
  }
  return{
    ...root,theme:root.theme,article,law:root.law||root.法則||null,
    constraint:root.constraint||root.制約||null,questions,
    form:root.form||root.type||root.形式||null,
  };
}

// ── GAS ──────────────────────────────────────────────────
async function gasGet(sheet){const r=await fetch(GAS_URL+'?sheet='+sheet+'&t='+Date.now());if(!r.ok)throw new Error('Load failed '+r.status);return r.json();}
async function gasPost(data){const r=await fetch(GAS_URL,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify(data)});if(!r.ok)throw new Error('Write failed '+r.status);return r.json();}
let gasV3Ok=null;
async function gasPing(){
  try{
    const r=await fetch(GAS_URL+'?ping=1&t='+Date.now(),{redirect:'follow'});
    if(r.status>=400)return null;
    const text=await r.text();
    if(!text)return null;
    try{return JSON.parse(text);}catch{
      const m=text.match(/\{[\s\S]*\}/);
      return m?JSON.parse(m[0]):null;
    }
  }catch{return null;}
}
function isGasV3Payload(p){
  return !!(p&&(Number(p.version)===3
    ||(Array.isArray(p.critiqueCols)&&p.critiqueCols.includes('questions'))
    ||(Array.isArray(p.ameCols)&&p.ameCols.includes('article'))
    ||(Array.isArray(p.kibariCols)&&p.kibariCols.includes('situation'))
    ||(Array.isArray(p.summaryCols)&&p.summaryCols.includes('text'))));
}
function rowLooksLikeFill(r){
  return !!(r&&r.answers!==undefined&&r.answers!==null&&String(r.answers)!=='');
}
function rowLooksLikeSummary(r){
  return !!(r&&r.ratio!==undefined&&String(r.ratio)!=='');
}
function rowLooksLikeCritique(r){
  if(!r||rowLooksLikeFill(r)||rowLooksLikeAme(r)||rowLooksLikeSummary(r))return false;
  const hasForm=r.form!==undefined&&String(r.form).trim()!=='';
  const q=String(r.questions||'').trim();
  return hasForm||(q.length>2&&(q.startsWith('[')||q.startsWith('{')));
}
function rowLooksLikeAme(r){
  return !!(r&&r.article!==undefined&&String(r.article).trim()!=='');
}
function rowLooksLikeKibari(r){
  return !!(r&&r.situation!==undefined&&String(r.situation).trim()!=='');
}
function filterPastRowsByMode(mode,rows){
  const list=Array.isArray(rows)?rows:[];
  if(mode==='fill')return list.filter(rowLooksLikeFill);
  if(mode==='summary')return list.filter(rowLooksLikeSummary);
  if(mode==='critique')return list.filter(rowLooksLikeCritique);
  if(mode==='ame')return list.filter(rowLooksLikeAme);
  if(mode==='kibari')return list.filter(rowLooksLikeKibari);
  return list;
}
async function gasGetPast(mode){
  const raw=await gasGet(mode);
  const rows=filterPastRowsByMode(mode,raw);
  if(mode!=='fill'&&Array.isArray(raw)&&raw.length>0&&rows.length===0&&raw.some(rowLooksLikeFill)){
    throw new Error(st.lang==='ja'
      ?'GASが古いデプロイの可能性があります。gas-script-v3.js を「新しいデプロイ」し、GAS_URLを更新してください。'
      :'GAS may be an old deployment. Redeploy gas-script-v3.js and update GAS_URL.');
  }
  return rows;
}
function assignPastStore(mode,rows){
  if(mode==='fill')st.fPast=rows;
  else if(mode==='summary')st.sPast=rows;
  else if(mode==='critique')st.cPast=rows;
  else if(mode==='kibari')st.kbPast=rows;
  else st.aPast=rows;
}
function pastSyncCount(mode){
  return pastList(mode).length;
}
async function ensureGasV3(){
  if(gasV3Ok===true)return true;
  const p=await gasPing();
  if(isGasV3Payload(p)){gasV3Ok=true;return true;}
  if(p===null){
    // ping が CORS/リダイレクトで失敗しても POST は通ることがある → 保存は試す
    return true;
  }
  gasV3Ok=false;
  const msg=st.lang==='ja'
    ?'GASがv3ではありません。Apps Scriptに gas-script-v3.js を貼り「新しいデプロイ」し、index.html の GAS_URL を新URLに合わせてください。'
    :'GAS is not v3. Redeploy gas-script-v3.js and set GAS_URL to the new web app URL.';
  alert(msg);
  return false;
}

// ── 印刷 ─────────────────────────────────────────────────
function doPrint(mode,part){
  if(part==='a'){
    const fbId=mode==='fill'?'f-fb':mode==='summary'?'s-fb':mode==='critique'?'c-fb':mode==='kibari'?'kb-fb':'a-fb';
    const fb=document.getElementById(fbId);
    if(!fb||fb.innerHTML.trim()===''){alert(st.lang==='ja'?'先に添削を実行してください。':'Please grade first.');return;}
  }
  window.print();
}
