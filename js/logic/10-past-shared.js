/* Past shared */
function pastPrefix(mode){
  if(mode==='fill')return 'fp';
  if(mode==='summary')return 'sp';
  if(mode==='critique')return 'cp';
  if(mode==='kibari')return 'kbp';
  return 'ap';
}
function isAmePastListed(prob){
  return normAmeProb(prob).questions.length>0;
}
function pastList(mode){
  if(mode==='fill')return st.fPast;
  if(mode==='summary')return st.sPast;
  if(mode==='critique')return st.cPast.filter(isCritiquePastListed);
  if(mode==='kibari')return st.kbPast;
  if(mode==='ame')return st.aPast.filter(isAmePastListed);
  return st.aPast;
}
