/* Persona load + prompt note (logic modal + thinking generation) */
function loadPersonaIntoState(){
  try{
    const raw=localStorage.getItem(PERSONA_KEY);
    if(!raw)return;
    const data=JSON.parse(raw);
    st.personas=data.personas||[];
    st.tenure=data.tenure||'';
  }catch(e){}
}

function buildPersonaPromptNote(isEN){
  if(!st.personas.length&&!st.tenure)return '';
  const lang=isEN?'en':'ja';
  const tenureOptions=PERSONA_TENURE_OPTIONS[lang];
  const tenureLabel=tenureOptions.find(o=>o.value===st.tenure)?.label||'';
  const personaLines=st.personas.map(p=>`${p.industry}・${p.role}`).join('、');
  if(isEN){
    const lines=[];
    if(personaLines)lines.push(`Industry/Role: ${personaLines}`);
    if(tenureLabel)lines.push(`Years of experience: ${tenureLabel}`);
    if(!lines.length)return '';
    return `\n\n[Respondent background]\n${lines.join('\n')}\nGenerate the problem using topics and examples that fit this background. Do NOT change the difficulty level or scoring criteria based on this background.`;
  }
  const lines=[];
  if(personaLines)lines.push(`業界・職種：${personaLines}`);
  if(tenureLabel)lines.push(`勤続年数：${tenureLabel}`);
  if(!lines.length)return '';
  return `\n\n【回答者のバックグラウンド】\n${lines.join('\n')}\nこのバックグラウンドに沿った題材・事例・表現レベルで問題を生成すること。難易度・採点基準はバックグラウンドによって変えないこと。`;
}
