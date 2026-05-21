/* State */
// ── State ─────────────────────────────────────────────────
const st={lang:'ja',fDiff:0,sDiff:0,cDiff:0,sVolume:'',fDocType:'',sDocType:'',cDocType:'',aDocType:'',industry:'',personas:[],tenure:'',answerMode:'text',answerScope:'s',fFilter:'all',sFilter:'all',cFilter:'all',aFilter:'all',kbFilter:'all',fPast:[],sPast:[],cPast:[],fill:null,summary:null,critique:null,ame:null,aPast:[],aDiff:0,kibariDiff:0,kibariScene:'',kibari:null,kibariPast:null,kbPast:[],genBusy:null,genPhase:null,gradeBusy:null,gradePhase:null};
const DEFAULT_S_VOLUME='short';
let answerPhotos=[];
let _appLockedEls=[];
function isBusy(){return st.genBusy||st.gradeBusy;}
function setAppBusyClass(){document.querySelector('.app').classList.toggle('is-busy',!!isBusy());}
