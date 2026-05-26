/* Fill */
// ══════════════════════════════════════════════════════════
// 穴埋め
// ══════════════════════════════════════════════════════════

function autoResize(el){
  el.style.height='auto';
  el.style.height=el.scrollHeight+'px';
}
function buildThemeInst(themeIn,themeMode,length,isEN,forSummary){
  if(!themeIn){
    if(isEN){
      return forSummary
        ?`Choose a theme from: recent global economic topics, cutting-edge science and technology, or health and medicine. Create one reading passage of approximately ${length} characters.`
        :`Choose a theme from: recent global economic topics, cutting-edge science and technology, or health and medicine. Write a logical text of approximately ${length} characters.`;
    }
    return `テーマは以下のカテゴリから選んでください：最近の世界経済のトピック、科学技術の最前線、健康・医療に関するトピック。約${length}文字の${forSummary?'読解用文章（問題文）を1つ':'論理的な文章を'}作成してください。`;
  }
  if(themeMode==='keyword'){
    return isEN
      ?(forSummary?`Create one reading passage of about ${length} characters on the theme "${themeIn}".`:`Write a logical text of about ${length} characters on the theme "${themeIn}".`)
      :(forSummary?`テーマ「${themeIn}」について、約${length}文字の読解用文章（問題文）を1つ作成してください。`:`テーマ「${themeIn}」について、約${length}文字の論理的な文章を作成してください。`);
  }
  return isEN
    ?`The user has the following question or problem: "${themeIn}"
Write a logical argumentative text of about ${length} characters that explores and answers this question.
The text should naturally lead the reader toward understanding the answer through logical reasoning.
The answer to the question should be embedded within the text's argument, not stated directly as a simple conclusion.`
    :`ユーザーが気になっている課題・疑問：「${themeIn}」
この課題・疑問に対して論理的に展開した約${length}文字の文章を作成してください。
文章は課題への回答を直接述べるのではなく、論拠を積み重ねながら読者が自然に答えにたどり着けるよう構成してください。
問題文中では課題への言及は冒頭の文脈設定程度に留め、主に論理的な論証の展開を重視してください。`;
}
function autoThemeInst(length,isEN,forSummary){
  if(isEN){
    return `Choose a theme from the following categories:
recent global economic topics (inflation, monetary policy, industrial transformation, etc.),
cutting-edge science and technology (AI, quantum computing, space exploration, biotechnology, etc.),
or health and medicine (public health, mental health, aging society, etc.).
${forSummary?`Create one reading passage of approximately ${length} characters.`:`Write a logical text of approximately ${length} characters.`}`;
  }
  return `テーマは以下のカテゴリから適切なものを選んでください：
最近の世界経済のトピック（インフレ・金融政策・産業転換など）、
科学技術の最前線（AI・量子コンピュータ・宇宙開発・バイオテクノロジーなど）、
健康・医療に関するトピック（公衆衛生・精神健康・老齢化社会など）。
約${length}文字の${forSummary?'読解用文章（問題文）を1つ':'論理的な文章を'}作成してください。`;
}
function hasFillHint(h){return !!(h&&String(h).trim());}
function buildFillAnswerItem(i,hint,inputId,noPrint){
  const item=document.createElement('div');
  item.className='answer-item';
  const row=document.createElement('div');
  row.className='answer-row';
  const num=i+1;
  row.innerHTML=`<label>（${num}）</label><input type="text" id="${inputId}" placeholder=""
    oninput="syncBlank(${num}, this.value)"
    onblur="syncBlank(${num}, this.value)"/>`;
  item.appendChild(row);
  if(hasFillHint(hint)){
    const ht=document.createElement('div');
    ht.className='hint-text'+(noPrint?' no-print':'');
    ht.textContent=hint;
    item.appendChild(ht);
  }
  return item;
}
function syncBlank(num,value){
  const blankEl=document.getElementById(`blank-${num}`);
  if(!blankEl) return;
  blankEl.style.borderColor='';
  blankEl.style.background='';
  blankEl.style.color='';
  const v=value.trim();
  if(v===''){
    blankEl.textContent=`（${num}）`;
    blankEl.classList.remove('filled');
  }else{
    blankEl.textContent=v.length>5?v.slice(0,5)+'…':v;
    blankEl.classList.add('filled');
  }
}
function resetBlankStyles(){
  document.querySelectorAll('.blank').forEach(el=>{
    el.style.borderColor='';
    el.style.background='';
    el.style.color='';
    el.classList.remove('filled');
  });
}
function applyFillBlankGrade(prob){
  prob.answers.forEach((ans,i)=>{
    const blankEl=document.getElementById(`blank-${i+1}`);
    if(!blankEl) return;
    const userAns=prob.userAnswers?.[i]||'';
    const isCorrect=String(userAns).trim()===String(ans).trim();
    blankEl.style.borderColor=isCorrect?'var(--green)':'#c0453a';
    blankEl.style.background=isCorrect?'var(--green-bg)':'#fce8e8';
    blankEl.style.color=isCorrect?'var(--green-text)':'#701510';
  });
}
function getFillPrompts(){
  const l=st.lang;
  if(l==='ja') return addIndustryConstraintToPrompts({
    1:`難易度1（入門）:
- 文書タイプ：社内メール・業務連絡（ビジネス文書）
- 文字数：400〜500字
- 構造：「状況説明→1つの要点→まとめ・依頼」のシンプルな3段構成。
  各文が前の文を受けて自然につながること
- 接続詞：「しかし」「そのため」「また」「一方」「つまり」「なお」など
  ビジネスメールで日常的に使われる基本的なもののみ
- 穴抜き：2個
- ヒント：各空欄に「逆接」「順接」などの関係性を必ず明記すること`,
    2:`難易度2（基礎）:
- 文書タイプ：議事録・進捗報告（ビジネス文書）
- 文字数：400〜500字
- 構造：「現状説明→課題・論点2つ→対応方針」の構成。
  段落間のつながりが明確であること
- 接続詞：「ただし」「したがって」「なぜなら」「一方で」「これにより」など
  因果・逆接・補足を含むビジネス文書で標準的なもの
- 穴抜き：3個
- ヒント：前後の文脈から推測できる軽いヒントを付けること`,
    3:`難易度3（標準）:
- 文書タイプ：提案書・企画書の一節（ビジネス文書）
- 文字数：400〜500字
- 構造：「課題提起→根拠2〜3つ→反論への言及→提案・結論」の構成。
  対比・譲歩を含む構造であること。
  各段落が前段落の内容を受けて展開すること
- 接続詞：「もっとも」「ただし」「むしろ」「他方」「それでもなお」など
  似た意味の中から正確なものを選ぶ力が問われるもの
- 穴抜き：3個
- ヒント：なし（hintsはすべて空文字列）`,
    4:`難易度4（上級）:
- 文書タイプ：分析レポート・調査報告（ビジネス文書）
- 文字数：400〜500字
- 構造：「課題提起→根拠2〜3つ→反論処理→結論・提言」の2層構造。
  主張と反論処理が明確に区別されていること。
  接続詞を変えると論旨が崩れるよう文章を構成すること
- 接続詞：「しかしながら」「それゆえに」「のみならず」「ひいては」「翻って」など
  ビジネス文書の上位文体で使われる精密な接続詞。
  類似する接続詞との差異が問われるよう設計すること
- 穴抜き：4個
- ヒント：なし（hintsはすべて空文字列）`,
    5:`難易度5（超難問）:
- 文書タイプ：経営戦略文書・コンサルレポート（ビジネス文書）
- 文字数：400〜500字
- 構造：「課題提起→根拠3つ以上→留保・例外→反論処理→結論・提言」の3層構造。
  多層的な論証・留保・逆説的な展開を含むこと。
  各層が前の層の内容を受けて展開すること。
  接続詞を変えると論旨が崩れるよう緻密に設計すること
- 接続詞：「しかしながら」「それゆえ」「のみならず」「してみれば」「もとより」など
  経営・コンサル文書で使われる高度な接続表現。
  複数の解釈が成立しうる文脈に配置し
  正答が一意に定まるよう緻密に設計すること
- 穴抜き：5個
- ヒント：なし（hintsはすべて空文字列）`
  });
  return addIndustryConstraintToPrompts({
    1:`Difficulty 1 (Beginner):
- Document type: Internal email / business communication
- Length: 400-500 characters
- Structure: Simple 3-part structure (situation → one key point → summary/request).
  Each sentence should flow naturally from the previous one.
- Conjunctions: basic business email connectors only
  (however, therefore, also, in addition, in other words, please note that)
- Blanks: 2
- Hints: specify the logical relation (e.g. "contrast", "result") for each blank`,
    2:`Difficulty 2 (Basic):
- Document type: Meeting minutes / progress report
- Length: 400-500 characters
- Structure: Current situation → 2 issues/points → action plan.
  Logical connections between paragraphs must be clear.
- Conjunctions: standard business document connectors including causal, adversative, supplementary
  (however, therefore, because, on the other hand, as a result, that said)
- Blanks: 3
- Hints: light contextual hints`,
    3:`Difficulty 3 (Standard):
- Document type: Proposal / project plan excerpt
- Length: 400-500 characters
- Structure: Issue → 2-3 pieces of evidence → reference to counterargument → proposal/conclusion.
  Must include contrast and concession.
  Each paragraph must develop from the previous paragraph's content.
- Conjunctions: precise selection required among similar business document connectors
  (nonetheless, that said, rather, on the other hand, even so)
- Blanks: 3
- Hints: none (all hints must be empty strings)`,
    4:`Difficulty 4 (Advanced):
- Document type: Analysis report / research findings
- Length: 400-500 characters
- Structure: Issue → 2-3 pieces of evidence → counterargument handling → conclusion/recommendation (2-layer).
  Main argument and counterargument handling must be clearly distinguished.
  Design sentences so that substituting a conjunction collapses the argument.
- Conjunctions: precise upper-register business document connectors
  (nevertheless, consequently, not only that, by extension, on reflection)
  where substitution collapses the argument
- Blanks: 4
- Hints: none (all hints must be empty strings)`,
    5:`Difficulty 5 (Master):
- Document type: Management strategy document / consulting report
- Length: 400-500 characters
- Structure: Issue → 3+ pieces of evidence → reservation/exception → counterargument handling → conclusion/recommendation (3-layer).
  Must include multi-layer reasoning and reservations.
  Each layer must develop from the previous layer's content.
  Design so that substituting a conjunction definitively collapses the argument.
- Conjunctions: high-register strategy/consulting document connectors
  (nevertheless, consequently, not only that, upon reflection, to be sure)
  placed in contexts where only one connector is logically correct
- Blanks: 5
- Hints: none (all hints must be empty strings)`
  });
}
function getSumPrompts(){
  const l=st.lang;
  if(l==='ja') return addIndustryConstraintToPrompts({
    1:'難易度1（基礎）: 社内メール・業務連絡（ビジネス文書）。設問：主張のまとめ1問。約60%に圧縮できる内容。主張と根拠が明確で具体例を削ることで圧縮できる構造にすること。',
    2:'難易度2（標準）: 議事録・進捗報告（ビジネス文書）。設問：主張のまとめ・用語の説明の2問。約50%に圧縮できる内容。ビジネス用語や略語を1〜2個含めること。',
    3:'難易度3（応用）: 提案書・企画書の一節（ビジネス文書）。課題→根拠→提案の構造を持つこと。設問：用語の説明・主張のまとめ・理由の説明の3問。約40%に圧縮できる内容。',
    4:'難易度4（上級）: 分析レポート・調査報告（ビジネス文書）。データの解釈と複数の根拠を含む構造にすること。設問：用語の説明・主張のまとめ・理由の説明の3問。約30%に圧縮できる内容。',
    5:'難易度5（超難問）: 経営戦略文書・コンサルレポート（ビジネス文書）。多層的な論証と専門的なビジネス用語を含むこと。設問：用語の説明・主張のまとめ・理由の説明の3問。約20%に圧縮できる内容。'
  });
  return addIndustryConstraintToPrompts({
    1:'Difficulty 1 (Basic): Internal email / business communication. Question: Main claim summary only (1 question). Target: ~60% of original. Design so claims and evidence are clear and specific examples can be removed.',
    2:'Difficulty 2 (Standard): Meeting minutes / progress report. Questions: Main claim + Term explanation (2 questions). Target: ~50% of original. Include 1-2 business terms or abbreviations.',
    3:'Difficulty 3 (Advanced): Proposal / project plan excerpt. Must follow issue → evidence → proposal structure. Questions: Term explanation + Main claim + Reason (3 questions). Target: ~40% of original.',
    4:'Difficulty 4 (Expert): Analysis report / research findings. Include data interpretation and multiple pieces of evidence. Questions: Term explanation + Main claim + Reason (3 questions). Target: ~30% of original.',
    5:'Difficulty 5 (Master): Management strategy document / consulting report. Include multi-layer reasoning and specialized business terminology. Questions: Term explanation + Main claim + Reason (3 questions). Target: ~20% of original.'
  });
}

async function generateFill(){
  if(isBusy())return;
  const isEN=st.lang==='en';
  if(!validateBeforeGen('f'))return;
  const themeIn=buildThemeInFromDocType('f',isEN);
  const diff=st.fDiff;
  const length=F_LENGTH;
  const blanks=calcBlanks(diff);
  document.getElementById('fill-result').style.display='none';
  const fpa=document.getElementById('f-print-area');if(fpa)fpa.style.display='none';
  if(!beginGen('fill'))return;

  const sys=isEN
    ?'You are an expert in business writing and logical communication. The educational goal of this tab is to train learners to precisely read the logical connections between sentences in business documents. Design the passage so that the choice of conjunction determines whether the argument holds — substituting the wrong conjunction must break the meaning. Respond ONLY in valid JSON format. No markdown, no explanation before or after the JSON.'
    :'あなたはビジネス文書の作成と論理的コミュニケーションの専門家です。このタブの教育目的は「ビジネス文書における文と文の間の論理的接続を精確に読み取る力を鍛えること」です。問題文はビジネス現場で実際に使われる文書（メール・報告書・提案書など）の文体で作成し、接続詞の選択が論旨の成否を左右する構造にしてください。正解以外の接続詞を入れると文意が崩れるよう設計してください。必ず指定されたJSON形式のみで返答してください。JSONの前後に説明文や```などを一切含めないでください。';
  const themeInst=buildThemeInst(themeIn,'keyword',length,isEN,false);
  const diffPrompt=getFillPrompts()[diff];
  let jsonInst=isEN
    ?`Replace ${blanks} conjunctions with placeholders [_1_][_2_]... Return ONLY this JSON:\n{"theme":"topic in 5 words or less","text":"problem text with placeholders","answers":["conj1","conj2"],"hints":["hint1","hint2"]}`
    :`その文章の中で接続詞のうち${blanks}個を選び、【_1_】【_2_】...のような番号付きプレースホルダーで置き換えてください。\n返答はJSON形式のみ：\n{"theme":"テーマを10文字以内で","text":"問題文","answers":["接続詞1"],"hints":["ヒント1"]}`;
  if(diff>=3) jsonInst+=isEN?FILL_HINT_NONE_NOTE_EN:FILL_HINT_NONE_NOTE_JA;

  try{
    const genMaxTokens=1200;
    const formatNote=isEN?FILL_FORMAT_NOTE_EN:FILL_FORMAT_NOTE_JA;
    const personaNote=buildPersonaPromptNote(isEN);
    const beProblemHolder={};
    const raw=await callClaude(`${themeInst}\n${diffPrompt}\n${jsonInst}\n${formatNote}${personaNote}`,sys,genMaxTokens,0.9,{
      mode:'generate',service:'logic',tab:'fill',theme:themeIn||'auto',
      onProblemId:(id)=>{beProblemHolder.id=id;},
    });
    if(!raw)return;
    const p=normalizeFillFromModel(parseModelJSON(raw));
    if(!p.text||!Array.isArray(p.answers)||p.answers.length===0)throw new Error('Invalid JSON structure: missing text or answers');
    if(isEN){
      let t=p.text;
      for(let i=1;i<=p.answers.length;i++) t=t.replace(`[_${i}_]`,`【_${i}_】`);
      p.text=t;
    }
    if(diff>=3) p.hints=(p.answers||[]).map(()=>'');
    st.fill={...p,id:Date.now(),beProblemId:beProblemHolder.id||null,theme:p.theme||(themeIn?themeIn.slice(0,20):''),diff,date:new Date().toISOString(),industry:genIndustrySnapshot(),blanks,feedback:null,userAnswers:null,lang:st.lang};
    renderFill(st.fill);
    resetGenConditions();
    try{await syncPastOnGen('fill',st.fill);}
    catch(syncErr){setSync('fill','err',L[st.lang].syncFailed);showToast('Error: '+syncErr.message,4000);}
  }catch(e){alert(L[st.lang].genFailed+'\n'+e.message);}
  finally{endGen('fill');}
}

function renderFill(prob){
  resetBlankStyles();
  const l=L[st.lang];
  renderProblemMeta('f-theme-tag',prob);
  document.getElementById('f-ph').innerHTML=`<h2>${l.appTitle} — ${l.tabFill}</h2><p>${l.theme}${esc(prob.theme||'—')}　${l.diff}${dlabel(prob.diff)}　${fmtDate(prob.date)}</p><p style="font-size:10pt;margin-top:.4rem;">${l.fPrintInst}</p>`;
  let html=esc(prob.text);
  for(let i=1;i<=prob.answers.length;i++) html=html.replace(`【_${i}_】`,`<span class="blank" id="blank-${i}">（${i}）</span>`);
  document.getElementById('f-problem').innerHTML=html;
  const sec=document.getElementById('f-answers');sec.innerHTML=`<p class="slabel no-print">${l.answerBox}</p>`;
  prob.answers.forEach((_,i)=>{
    sec.appendChild(buildFillAnswerItem(i,prob.hints?.[i],`fans-${i}`,true));
  });
  document.getElementById('f-fb').innerHTML='';
  const fCopy=document.getElementById('f-copy-bar');
  if(fCopy)fCopy.style.display='none';
  document.getElementById('f-pa-btn').style.display='none';
  document.getElementById('f-print-area').style.display='flex';
  document.getElementById('fill-result').style.display='block';
  document.getElementById('fs1').className='step done';
  document.getElementById('fs2').className='step active';
  document.getElementById('fs3').className='step';
  updateApiKeyUI();
}

async function submitFill(){
  if(isBusy())return;
  const prob=st.fill;if(!prob)return;
  const ua=prob.answers.map((_,i)=>document.getElementById(`fans-${i}`)?.value.trim()||'');
  if(ua.some(isBlankAnswer)){
    alert(L[st.lang].fillAnswerRequired);
    return;
  }
  if(!beginGrade())return;
  const fb=document.getElementById('f-fb');
  try{
    setGradePhase('llm');
    const res=await gradeFill(prob,ua);if(!res)return;
    setGradePhase('process');
    prob.feedback=res;prob.userAnswers=ua;
    applyFillBlankGrade(prob);
    fb.innerHTML=`<div class="feedback-box">${formatFeedback100(res,prob.lang)}</div>`;
    document.getElementById('fs2').className='step done';
    document.getElementById('fs3').className='step done';
    document.getElementById('f-pa-btn').style.display='';
    showCopyBar('fill');
  }catch(e){fb.innerHTML=`<p class="err">${L[st.lang].gradingErr}: ${e.message}</p>`;}
  finally{endGrade();}
}

async function gradeFill(prob,ua){
  const isEN=prob.lang==='en'||(prob.lang===undefined&&st.lang==='en');
  const sys=isEN
    ?'You are an expert educator in business writing. The goal of feedback is to help learners understand WHY a specific conjunction is logically necessary in the context of business documents — not just correct. Explain the logical relationship between adjacent sentences, the difference from alternative conjunctions, and how the conjunction fits the overall argument. Give structured feedback in English using markdown (## headings, **bold**, numbered lists).'
    :'あなたはビジネス文書の論理的表現に関する教育専門家です。フィードバックの目的は「なぜその接続詞でなければならないか」という論理的必然性を、ビジネス文書の文脈で学習者に理解させることです。前後の文の論理関係・代替接続詞との差異・文書全体の論証構造を踏まえて解説してください。マークダウン（**太字**、## 見出し、番号リスト）を使って構造的に日本語でフィードバックしてください。';
  const ct=prob.answers.reduce((t,a,i)=>t.replace(`【_${i+1}_】`,`[${a}]`),prob.text);
  const prompt=isEN?`${FILL_SCORE100_NOTE_EN}

Grade this fill-in-the-blank problem (Difficulty ${prob.diff}/5).

[Problem with correct answers]
${ct}

[Correct answers]
${prob.answers.map((a,i)=>`(${i+1}) ${a}`).join('\n')}

[Learner's answers]
${ua.map((a,i)=>`(${i+1}) ${a}`).join('\n')}

## Fully Supplemented Text
「Fully Supplemented Text」 — Rewrite the original text with ALL sentence boundaries supplemented with appropriate conjunctions (not just the blanks). Show every supplemented conjunction in **bold**.
For conjunctions that correspond to the fill-in-the-blank answers, add the question number as a superscript immediately after the conjunction. Example: "however⁽¹⁾"

## Individual Question Feedback
For each number, mark ✓ correct or ✗ incorrect. Explain why the conjunction is appropriate and the logical relationship between sentences. Suggest alternatives if any.
At the end of each question's explanation, provide the following two items:
① One short example sentence (20 words or less) using the correct conjunction in a plain everyday context.
② Show what would happen to the argument if a different conjunction were used in this passage, and explain why the correct conjunction is the only valid choice.`
  :`${FILL_SCORE100_NOTE_JA}

穴埋め問題（難易度${prob.diff}/5）の添削をしてください。

【問題文（正解入り）】${ct}
【正解】${prob.answers.map((a,i)=>`（${i+1}）${a}`).join('\n')}
【学習者の回答】${ua.map((a,i)=>`（${i+1}）${a}`).join('\n')}

## 完全補完文
「完全補完文」として、元の文章のすべての文と文の間（穴埋め箇所以外も含む）に接続詞を補完した、論理的に完全な文章を作成してください。
補完した接続詞はすべて**太字**で示してください。
穴埋め問題の空欄に対応する接続詞には、補完した接続詞の直後に上付き文字で設問番号を示してください。例：「しかるに⁽¹⁾」のように記述してください。

## 各設問の正誤と解説
各番号について ✓正解 または ✗不正解 を明示し、なぜその接続詞が適切か前後の論理関係を説明してください。代替接続詞があれば添えてください。
各設問の解説の末尾に以下の2つを示してください。
① 正解の接続詞を使った日常的な文脈の例文を1つ（20字以内・平易な内容）
② この問題文において、正解の接続詞の代わりに別の接続詞を使った場合に論旨がどう変わるかを1つ示し、なぜ正解の接続詞でなければならないかを説明してください。`;
  return callClaude(prompt,sys,gradeMaxTokensByDiff(prob.diff),0.3,{
    mode:'score',service:'logic',problem_id:prob.beProblemId||null,
    user_answer:ua.join('\n'),
    context:{original_problem:ct,tab:'fill'},
    markdownResponse:true,
  });
}

function buildFillEntry(prob){
  return {id:prob.id||Date.now(),sheet:'fill',theme:prob.theme||'—',diff:prob.diff,date:prob.date,industry:prob.industry||'',text:prob.text,answers:prob.answers,hints:prob.hints||[],feedback:prob.feedback||null,userAnswers:prob.userAnswers||[],lang:prob.lang||st.lang};
}
function buildSummaryEntry(prob){
  const questions=prob.questions;
  return {id:prob.id||Date.now(),sheet:'summary',theme:prob.theme||'—',diff:prob.diff,date:prob.date,industry:prob.industry||'',text:prob.text||'',questions:typeof questions==='string'?questions:JSON.stringify(questions||[]),ratio:prob.ratio,lang:prob.lang||st.lang};
}
async function gasPostEntry(entry){
  const res=await gasPost(entry);
  if(res&&res.error)throw new Error(res.error);
  if(res&&res.ok===false)throw new Error('Save failed');
  if(isGasV3Payload(res))gasV3Ok=true;
  return res;
}
async function syncPastOnGen(mode,prob){
  if(!await ensureGasV3())return;
  let entry;
  if(mode==='fill')entry=buildFillEntry(prob);
  else if(mode==='summary')entry=buildSummaryEntry(prob);
  else if(mode==='critique')entry=buildCritiqueEntry(prob);
  else entry=buildAmeEntry(prob);
  prob.id=entry.id;
  setSync(mode,'spin',L[st.lang].genPhaseProcess+'...');
  await gasPostEntry(entry);
  const store=mode==='fill'?st.fPast:mode==='summary'?st.sPast:mode==='critique'?st.cPast:st.aPast;
  const idx=store.findIndex(p=>String(p.id)===String(entry.id));
  if(idx>=0)store[idx]=entry;else store.unshift(entry);
  renderPL(mode);
  setSync(mode,'ok',pastSyncCount(mode)+L[st.lang].syncItems);
  if(mode==='fill')showToast(L[st.lang].savedOk);
  else if(mode==='summary')showToast(L[st.lang].sSavedOk);
}
