/* Shared industry + persona presets (logic + thinking) */
export const INDUSTRY_PRESETS={
  ja:[
    {value:'',label:'指定なし'},
    {value:'it',label:'IT・テクノロジー'},
    {value:'mfg',label:'製造業'},
    {value:'retail',label:'小売・EC'},
    {value:'finance',label:'金融・保険'},
    {value:'medical',label:'医療・ヘルスケア'},
  ],
  en:[
    {value:'',label:'Any industry'},
    {value:'it',label:'IT / Technology'},
    {value:'mfg',label:'Manufacturing'},
    {value:'retail',label:'Retail / E-commerce'},
    {value:'finance',label:'Finance / Insurance'},
    {value:'medical',label:'Healthcare / Medical'},
  ],
};
export const PERSONA_TENURE_OPTIONS={
  ja:[
    {value:'',label:'未設定'},
    {value:'lt1',label:'1年未満'},
    {value:'1to3',label:'1〜3年'},
    {value:'3to5',label:'3〜5年'},
    {value:'5to10',label:'5〜10年'},
    {value:'gt10',label:'10年以上'},
  ],
  en:[
    {value:'',label:'Not set'},
    {value:'lt1',label:'Less than 1 year'},
    {value:'1to3',label:'1–3 years'},
    {value:'3to5',label:'3–5 years'},
    {value:'5to10',label:'5–10 years'},
    {value:'gt10',label:'10+ years'},
  ],
};
export const PERSONA_TENURE_DESC={
  ja:{
    '':'',
    lt1:'基本的な業界用語は知っているが実務経験は浅い',
    '1to3':'日常業務の流れは把握しているが専門的判断は経験不足',
    '3to5':'専門知識を持ち、自律的に業務を遂行できる',
    '5to10':'チームや案件をリードできる経験を持つ',
    gt10:'マネジメント・意思決定の経験が豊富',
  },
  en:{
    '':'',
    lt1:'Familiar with basic industry terms but limited hands-on experience',
    '1to3':'Understands day-to-day workflow but still developing professional judgment',
    '3to5':'Has specialist knowledge and can work autonomously',
    '5to10':'Experienced in leading teams and projects',
    gt10:'Extensive management and decision-making experience',
  },
};
export const PERSONA_INDUSTRY_ROLES={
  ja:[
    {industry:'IT・テクノロジー',roles:['エンジニア（開発）','PM・プロダクトマネージャー','データアナリスト','インフラ・SRE','デザイナー（UX/UI）','セールスエンジニア','営業']},
    {industry:'製造業',roles:['生産管理','品質管理・QA','調達・購買','技術・研究開発','営業','ロジスティクス・物流','工場管理']},
    {industry:'小売・EC',roles:['マーチャンダイザー','バイヤー','ECサイト運営','マーケティング','店舗運営・スーパーバイザー','物流・在庫管理','営業']},
    {industry:'金融・保険',roles:['営業（法人・個人）','ファンドマネージャー','アナリスト','リスク管理・コンプライアンス','ファイナンシャルアドバイザー','システム・IT','企画・経営企画']},
    {industry:'医療・ヘルスケア',roles:['医師・医療専門職','看護師・コメディカル','医療事務・管理','MR（医薬情報担当者）','医療機器営業','病院経営・企画','IT・DX推進']},
    {industry:'コンサルティング',roles:['戦略コンサルタント','ITコンサルタント','業務改善コンサルタント','マネージャー・シニアコンサルタント','リサーチ・アナリスト','営業・ビジネス開発']},
    {industry:'人材・教育',roles:['キャリアアドバイザー','リクルーター','人事・採用担当','研修・ラーニング開発','教育コンテンツ制作','営業']},
    {industry:'広告・マーケティング',roles:['マーケター','デジタルマーケター','広告プランナー','PRプランナー','コンテンツマーケター','データアナリスト','営業・アカウント']},
  ],
  en:[
    {industry:'IT / Technology',roles:['Software Engineer','Product Manager','Data Analyst','Infrastructure / SRE','UX/UI Designer','Sales Engineer','Sales']},
    {industry:'Manufacturing',roles:['Production Management','Quality Assurance','Procurement','R&D / Engineering','Sales','Logistics','Plant Management']},
    {industry:'Retail / E-commerce',roles:['Merchandiser','Buyer','E-commerce Operations','Marketing','Store Operations / Supervisor','Logistics / Inventory','Sales']},
    {industry:'Finance / Insurance',roles:['Corporate / Retail Sales','Fund Manager','Analyst','Risk / Compliance','Financial Advisor','IT / Systems','Corporate Planning']},
    {industry:'Healthcare / Medical',roles:['Physician / Medical Professional','Nurse / Allied Health','Medical Administration','MR / Pharmaceutical Sales','Medical Device Sales','Hospital Management','IT / DX']},
    {industry:'Consulting',roles:['Strategy Consultant','IT Consultant','Operations Consultant','Manager / Senior Consultant','Research Analyst','Business Development']},
    {industry:'HR / Education',roles:['Career Advisor','Recruiter','HR / Talent Acquisition','L&D / Training','Content Development','Sales']},
    {industry:'Advertising / Marketing',roles:['Marketer','Digital Marketer','Ad Planner','PR Planner','Content Marketer','Data Analyst','Account / Sales']},
  ],
};
export const PERSONA_KEY='thinkgrindai_persona_v1';
