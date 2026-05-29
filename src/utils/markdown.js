/* Markdown */
// ── Helpers ───────────────────────────────────────────────
export function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
export function calcFillScore(answers,ua){
  const total=answers.length;
  let correct=0;
  answers.forEach((ans,i)=>{if(String(ua[i]||'').trim()===String(ans).trim())correct++;});
  const pct=total?Math.round(correct/total*100):0;
  return {correct,total,pct};
}
/**
 * 生スコアを100点満点に換算する（穴埋め Summary 表の Total 行用）
 * @param {number} raw
 * @param {number} max
 * @returns {number}
 */
export function scoreRawTo100(raw,max){
  if(!max||max<=0)return 0;
  return Math.round((raw/max)*100);
}
/**
 * "54/60" 形式の文字列をパースする
 * @param {string} cell
 * @returns {{ raw: number, max: number }|null}
 */
function parseFractionCell(cell){
  const m=String(cell||'').replace(/\*\*/g,'').match(/(\d+)\s*\/\s*(\d+)/);
  if(!m)return null;
  return {raw:+m[1],max:+m[2]};
}
/**
 * マークダウン表の Total / 合計 行から生スコア合計を取得する
 * @param {string} text
 * @returns {{ raw: number, max: number }|null}
 */
function parseFillTotalFraction(text){
  const lines=String(text||'').split('\n');
  for(const line of lines){
    if(!/\|/.test(line))continue;
    if(!/(?:\bTotal\b|合計)/i.test(line))continue;
    const cells=line.split('|').map((c)=>c.trim()).filter(Boolean);
    const fracs=cells.map(parseFractionCell).filter(Boolean);
    const rawCell=fracs.find((f)=>f.max!==100);
    if(rawCell)return rawCell;
  }
  const arrow=text.match(/(\d+)\s*\/\s*(\d+)\s*→\s*(\d+)\s*\/\s*100/);
  if(arrow&&+arrow[2]!==100)return {raw:+arrow[1],max:+arrow[2]};
  return null;
}
/**
 * 穴埋め採点フィードバック内の100点換算を修正する（LLMが Total 行で加算する誤りを補正）
 * @param {string} feedback
 * @returns {string}
 */
export function fixFillFeedbackScores(feedback){
  if(!feedback||typeof feedback!=='string')return feedback;
  const total=parseFillTotalFraction(feedback);
  if(!total||total.max<=0)return feedback;
  const normalized=scoreRawTo100(total.raw,total.max);
  let text=feedback;
  text=text.replace(
    /(\d+)\s*\/\s*(\d+)\s*→\s*(\d+)\s*\/\s*100/g,
    (match,raw,max)=>{
      if(+max===100)return match;
      return `${raw}/${max} → ${scoreRawTo100(+raw,+max)}/100`;
    }
  );
  text=text.split('\n').map((line)=>{
    if(!/\|/.test(line)||!/(?:\bTotal\b|合計)/i.test(line))return line;
    const fracs=[...line.matchAll(/(\d+)\s*\/\s*(\d+)/g)].map((m)=>({raw:+m[1],max:+m[2],index:m.index}));
    const rawFrac=fracs.find((f)=>f.max!==100);
    if(!rawFrac)return line;
    const hundredFrac=fracs.filter((f)=>f.max===100).pop();
    if(!hundredFrac||hundredFrac.raw===normalized)return line;
    const before=line.slice(0,hundredFrac.index);
    const after=line.slice(hundredFrac.index+hundredFrac.raw.toString().length+4);
    return `${before}${normalized}/100${after}`;
  }).join('\n');
  text=text.replace(/^【Score[：:]\s*\d+\/100】/im,`【Score: ${normalized}/100】`);
  text=text.replace(/^【スコア[：:]\s*\d+\/100】/m,`【スコア：${normalized}/100】`);
  return text;
}
export function fillScoreColor(pct){
  if(pct>=80)return 'var(--green)';
  if(pct>=60)return 'var(--amber)';
  return '#c0453a';
}
export function fillScoreHtml(correct,total,lang){
  const pct=total?Math.round(correct/total*100):0;
  const color=fillScoreColor(pct);
  const isJa=(lang ?? 'ja')==='ja';
  const text=isJa?`${correct} / ${total} 問正解（${pct}%）`:`${correct} / ${total} correct (${pct}%)`;
  return `<p class="fill-score" style="font-size:18px;font-weight:600;color:${color};margin:0 0 1rem;">${text}</p>`;
}
const SCORE100_NOTE_JA='\n\n最初の行に必ず【スコア：XX/100】の形式で100点満点の点数を記載してください。';
const SCORE100_NOTE_EN='\n\nStart with 【Score: XX/100】 on the very first line.';
const SUM_SCORE100_NOTE_JA='\n\n最初の行に必ず【スコア：XX/100】の形式で100点満点の点数を記載してください。\n採点基準：内容の正確さ（50点）・簡潔さ・文字数遵守（30点）・表現・論理性（20点）。';
const SUM_SCORE100_NOTE_EN='\n\nStart with 【Score: XX/100】 on the very first line.\nScoring: content accuracy (50pts), conciseness & word count (30pts), expression & logic (20pts).';
const FILL_SCORE100_NOTE_JA='\n\n最初の行に必ず【スコア：XX/100】の形式で100点満点の点数を記載してください。\n採点基準：各設問は均等配点（例：5問なら各20点）。正解は満点、部分的に正しい場合（意味が近い接続詞）は半点、不正解は0点。';
const FILL_SCORE100_NOTE_EN='\n\nStart with 【Score: XX/100】 on the very first line.\nEach question is worth equal points (e.g. 20pts each for 5 questions). Full marks for correct answer, half marks for close alternatives, 0 for incorrect.';
const REVIEW_SCORE100_NOTE_JA='\n\n最初の行に必ず【スコア：XX/100】の形式で100点満点の点数を記載してください。\n採点基準：接続詞の適切さ（40点）・論理的一貫性（40点）・表現の自然さ（20点）。';
const REVIEW_SCORE100_NOTE_EN='\n\nStart with 【Score: XX/100】 on the very first line.\nScoring: conjunction appropriateness (40pts), logical consistency (40pts), natural expression (20pts).';
export function score100Color(score){
  if(score>=80)return 'var(--green)';
  if(score>=60)return 'var(--amber)';
  return '#c0453a';
}
export function score100Html(n,isJa){
  const score=parseInt(n,10)||0;
  const suffix=isJa?'/100点':'/100';
  return `<div class="score-100" style="font-size:22px;font-weight:500;color:${score100Color(score)};margin-bottom:.75rem;">${score}<span style="font-size:14px;color:var(--text2);">${suffix}</span></div>`;
}
export function stripScore100Line(text){
  const t=String(text||'').trim();
  const mJa=t.match(/^【スコア[：:]\s*(\d+)\/100】\s*/);
  if(mJa)return {score:mJa[1],rest:t.slice(mJa[0].length).trim()};
  const mEn=t.match(/^【Score[：:]\s*(\d+)\/100】\s*/i);
  if(mEn)return {score:mEn[1],rest:t.slice(mEn[0].length).trim()};
  return {score:null,rest:t};
}
export function formatFeedback100(raw,lang){
  const {score,rest}=stripScore100Line(raw);
  const isJa=(lang ?? 'ja')==='ja';
  const head=score!=null?score100Html(score,isJa):'';
  return head+md2h(rest, isJa ? 'ja' : 'en');
}
/**
 * 穴埋めタブ用：100点換算補正後に HTML 化する
 * @param {string} raw
 * @param {string} [lang]
 * @returns {string}
 */
export function formatFillFeedback100(raw,lang){
  return formatFeedback100(fixFillFeedbackScores(raw),lang);
}
export function formatSummaryFeedback(raw,lang){return formatFeedback100(raw,lang);}
function showCopyBar(mode){
  const id=mode==='fill'?'f-copy-bar':mode==='summary'?'s-copy-bar':'r-copy-bar';
  const el=document.getElementById(id);
  if(el)el.style.display='flex';
}
export function fmtDate(s){if(!s)return'';const d=new Date(s);return`${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`;}
export function showToast(msg,ms=3500){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),ms);}
function setSync(mode,cls,msg){const pfx=pastPrefix(mode);document.getElementById(pfx+'-dot').className='sdot'+(cls?' '+cls:'');document.getElementById(pfx+'-lbl').textContent=msg;}
export function parseF(v){if(Array.isArray(v))return v;try{return JSON.parse(v);}catch{return[];}}

// ── md → HTML ─────────────────────────────────────────────
function styleCompletedConj(html){
  return html.replace(/(<div class="completed-text">)([\s\S]*?)(<\/div>)/g,(_,open,inner,close)=>{
    const s=inner.replace(/<strong>([^<]+)<\/strong>\[([^\]]+)\]/g,'<span class="conj"><strong>$1</strong><span class="conj-role">[$2]</span></span>');
    return open+s+close;
  });
}
export function mdInline(s){
  return String(s||'')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/✓/g,'<span class="ok">✓</span>')
    .replace(/✗/g,'<span class="ng">✗</span>');
}
function isTableSepRow(line){
  const cells=line.trim().replace(/^\|/,'').replace(/\|$/,'').split('|');
  return cells.length>0&&cells.every(c=>/^:?-{2,}:?$/.test(c.trim()));
}
function parseMdRow(line){
  return line.trim().replace(/^\|/,'').replace(/\|$/,'').split('|').map(c=>c.trim());
}
function renderMdTable(lines){
  const header=parseMdRow(lines[0]);
  const body=lines.slice(2).map(parseMdRow).filter(r=>r.some(c=>c.length));
  const mergeCol=0;
  const rowspan=new Array(body.length).fill(1);
  const skipMergeCell=new Array(body.length).fill(false);
  for(let i=0;i<body.length;){
    const label=body[i][mergeCol]||'';
    let j=i+1;
    while(j<body.length&&(body[j][mergeCol]||'')===label)j++;
    rowspan[i]=j-i;
    for(let k=i+1;k<j;k++)skipMergeCell[k]=true;
    i=j;
  }
  const isAppealTable=header[0]==='フェーズ'&&header[1]==='論理の要素';
  const tableCls='md-table'+(isAppealTable?' md-table-appeal':'');
  let h=`<table class="${tableCls}"><thead><tr>`;
  header.forEach(c=>{h+=`<th>${mdInline(c)}</th>`;});
  h+='</tr></thead><tbody>';
  body.forEach((row,ri)=>{
    h+='<tr>';
    for(let ci=0;ci<header.length;ci++){
      if(ci===mergeCol&&skipMergeCell[ri])continue;
      const cell=row[ci]??'';
      const centered=/^[○◎×]$/.test(String(cell).trim());
      if(ci===mergeCol&&rowspan[ri]>1){
        h+=`<td rowspan="${rowspan[ri]}" class="md-cell-merged">${mdInline(cell)}</td>`;
      }else{
        h+=`<td${centered?' class="center"':''}>${mdInline(cell)}</td>`;
      }
    }
    h+='</tr>';
  });
  return h+'</tbody></table>';
}
function parseMdTables(text){
  const lines=text.split('\n');
  const out=[];
  let i=0;
  while(i<lines.length){
    const tr=lines[i].trim();
    if(tr.startsWith('|')&&tr.endsWith('|')){
      const block=[];
      while(i<lines.length){
        const t=lines[i].trim();
        if(!t.startsWith('|')||!t.endsWith('|'))break;
        block.push(t);
        i++;
      }
      if(block.length>=2&&isTableSepRow(block[1])) out.push(renderMdTable(block));
      else out.push(...block);
      continue;
    }
    out.push(lines[i]);
    i++;
  }
  return out.join('\n');
}
function mdWrapTextBlocks(html){
  const re=/(<table[\s\S]*?<\/table>|<hr>|<h2>[\s\S]*?<\/h2>|<h3>[\s\S]*?<\/h3>|<h4>[\s\S]*?<\/h4>|<ul>[\s\S]*?<\/ul>|<div class="completed-text">[\s\S]*?<\/div>)/gi;
  return html.split(re).map(part=>{
    if(!part||/^<(table|hr|h[234]|ul|div)/i.test(part.trim()))return part;
    let p=part.trim();
    if(!p)return '';
    p=mdInline(p).replace(/\n{2,}/g,'</p><p>').replace(/\n/g,'<br>');
    if(p&&!p.startsWith('<p>'))p='<p>'+p;
    if(p&&!p.endsWith('</p>'))p+='</p>';
    return p;
  }).join('');
}
export function md2h(tx, lang = 'ja'){
  let raw=String(tx||'').trim();
  if(!raw)return '';
  const blockquotes=[];
  raw=raw.replace(/^> (.+)$/gm,(_,line)=>{
    blockquotes.push('<blockquote>'+esc(line)+'</blockquote>');
    return `\x01BQ${blockquotes.length-1}\x01`;
  });
  let h=esc(raw);
  blockquotes.forEach((bq,i)=>{h=h.replace(`\x01BQ${i}\x01`,bq);});
  h=h
    .replace(/【スコア[：:]\s*(\d+)\/100】/g,(_,n)=>score100Html(n,lang==='ja'))
    .replace(/【Score[：:]\s*(\d+)\/100】/gi,(_,n)=>score100Html(n,false));
  h=parseMdTables(h);
  h=h
    .replace(/^#### (.+)$/gm,(_,t)=>'<h4>'+mdInline(t)+'</h4>')
    .replace(/^### (.+)$/gm,(_,t)=>'<h3>'+mdInline(t)+'</h3>')
    .replace(/^## (.+)$/gm,(_,t)=>'<h2>'+mdInline(t)+'</h2>')
    .replace(/^# (.+)$/gm,(_,t)=>'<h2>'+mdInline(t)+'</h2>')
    .replace(/^---+?\s*$/gm,'<hr>')
    .replace(/^\d+\. (.+)$/gm,(_,t)=>'<li>'+mdInline(t)+'</li>')
    .replace(/^[-*・] (.+)$/gm,(_,t)=>'<li>'+mdInline(t)+'</li>')
    .replace(/((?:<li>[\s\S]*?<\/li>\s*)+)/g,'<ul>$1</ul>');
  h=h
    .replace(/採点後に「完全補完文」([\s\S]*?)(?=\n\n各設問)/g,(_,tail)=>{
      const body=String(tail||'').trim().replace(/\n/g,'<br>');
      return`<div class="completed-text"><p>採点後に<strong>「完全補完文」</strong>${mdInline(body)}</p></div>`;
    })
    .replace(/After grading, "Fully Supplemented Text"([\s\S]*?)(?=\n\nEach question|\n\n## |$)/gi,(_,tail)=>{
      const body=String(tail||'').trim().replace(/\n/g,'<br>');
      return`<div class="completed-text"><p>After grading, <strong>"Fully Supplemented Text"</strong>${mdInline(body)}</p></div>`;
    });
  h=mdWrapTextBlocks(h);
  const blockEnd='(?=<h[234]>|<table|<hr|<ul>|<div class="completed-text"|$)';
  h=h
    .replace(/<h3>完全補完文<\/h3>([\s\S]*?)(?=<h[234]>|<table|<hr|<ul>|$)/g,'<h3>完全補完文</h3><div class="completed-text">$1</div>')
    .replace(/<h3>Fully Supplemented Text<\/h3>([\s\S]*?)(?=<h[234]>|<table|<hr|<ul>|$)/g,'<h3>Fully Supplemented Text</h3><div class="completed-text">$1</div>');
  h=h.replace(/⁽(\d+)⁾/g,'<sup style="font-size:10px;color:var(--text2);">($1)</sup>');
  return styleCompletedConj(h);
}

