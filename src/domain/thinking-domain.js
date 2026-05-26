/* =====================================================
   思考トレーニング ドメイン定数
   thinking.html 専用
   ===================================================== */

'use strict';

// ── 問いの核心（10タイプ） ────────────────────────────
export const THINKING_CORES = {
  ja: [
    { value: 'feasibility',  label: '実現可否型',           desc: 'これはできるか？',                   types: [4, 1, 3] },
    { value: 'priority',     label: '優先順位型',           desc: 'どれを先にやるか？',                 types: [4, 1] },
    { value: 'alignment',    label: '合意形成型',           desc: 'どうすれば通るか？',                 types: [5, 1, 4] },
    { value: 'rootcause',    label: '原因分析＋ゴール定義型', desc: 'なぜ起きたか・何を目指すか？',       types: [2, 1, 4] },
    { value: 'risk',         label: 'リスク見積もり型',     desc: '何が起きうるか？',                   types: [3, 1, 4] },
    { value: 'value',        label: '価値の定義型',         desc: 'それは本当に良いことか？',           types: [6, 1, 2] },
    { value: 'pattern',      label: '構造の発見型',         desc: 'なぜ繰り返すのか？',                 types: [2, 1] },
    { value: 'reframe',      label: '視点の転換型',         desc: '別の立場から見るとどう見える？',     types: [5, 6] },
    { value: 'tradeoff',     label: 'トレードオフの明示型', desc: '何を諦めるか？',                     types: [4, 3, 6] },
    { value: 'assumption',   label: '前提の問い直し型',     desc: '当たり前は本当に正しいか？',         types: [6, 1] },
  ],
  en: [
    { value: 'feasibility',  label: 'Feasibility',          desc: 'Can this be done?',                    types: [4, 1, 3] },
    { value: 'priority',     label: 'Prioritization',       desc: 'What comes first?',                    types: [4, 1] },
    { value: 'alignment',    label: 'Alignment',            desc: 'How do we get buy-in?',                types: [5, 1, 4] },
    { value: 'rootcause',    label: 'Root Cause + Goal',    desc: 'Why did this happen? What do we aim for?', types: [2, 1, 4] },
    { value: 'risk',         label: 'Risk Assessment',      desc: 'What could go wrong?',                 types: [3, 1, 4] },
    { value: 'value',        label: 'Value Definition',     desc: 'Is this truly a good outcome?',        types: [6, 1, 2] },
    { value: 'pattern',      label: 'Pattern Discovery',    desc: 'Why does this keep happening?',        types: [2, 1] },
    { value: 'reframe',      label: 'Perspective Shift',    desc: 'How does it look from another angle?', types: [5, 6] },
    { value: 'tradeoff',     label: 'Trade-off',            desc: 'What are we giving up?',               types: [4, 3, 6] },
    { value: 'assumption',   label: 'Assumption Check',     desc: 'Is what we take for granted actually true?', types: [6, 1] },
  ]
};

// ── 6つの思考タイプ ───────────────────────────────────
export const THINKING_TYPES = {
  ja: [
    { id: 1, label: '①状況を整理する',   short: '状況の整理',   desc: '今何が起きているかを、事実・不確かな情報・矛盾に分けて読む' },
    { id: 2, label: '②原因を掘り下げる', short: '原因の掘り下げ', desc: 'なぜそうなったかを、表面の原因から根本まで掘り下げる' },
    { id: 3, label: '③先を読む',         short: '先読み',       desc: 'このまま進むとどうなるか、何が起きうるかを見積もる' },
    { id: 4, label: '④選択肢を比べる',   short: '選択肢の比較', desc: '何が最善かを、自分なりの基準を持って判断する' },
    { id: 5, label: '⑤相手を動かす',     short: '相手を動かす', desc: '誰がどう動くかを想定し、伝え方・順序を設計する' },
    { id: 6, label: '⑥問いを疑う',       short: '問いの見直し', desc: 'そもそも今解こうとしている問いが正しいかを立ち止まって確認する' },
  ],
  en: [
    { id: 1, label: '① Map the situation', short: 'Situation mapping', desc: 'Identify what is actually happening — distinguishing facts, uncertain info, and contradictions' },
    { id: 2, label: '② Dig into causes',   short: 'Causal analysis',   desc: 'Trace from surface causes down to root causes' },
    { id: 3, label: '③ Look ahead',        short: 'Forward thinking',  desc: 'Project what will happen next and what risks may emerge' },
    { id: 4, label: '④ Compare options',   short: 'Option evaluation', desc: 'Assess what the best choice is, using explicit criteria' },
    { id: 5, label: '⑤ Move others',       short: 'Stakeholder design', desc: 'Anticipate how people will react and design your approach accordingly' },
    { id: 6, label: '⑥ Question the question', short: 'Reframing', desc: 'Pause and verify whether the question you are solving is actually the right one' },
  ]
};

// ── レベル定義 ────────────────────────────────────────
export const THINKING_LEVELS = {
  ja: [
    { id: 1, label: 'レベル1', desc: '設問が与えられた状態で解く。型の使い方を体感する段階。', minDiff: 1 },
    { id: 2, label: 'レベル2', desc: '使うタイプは指定されるが、何を確認するかは自分で決める。', minDiff: 3 },
    { id: 3, label: 'レベル3', desc: 'どのタイプをどの順序で使うかを自分で選ぶ。', minDiff: 3 },
    { id: 4, label: 'レベル4', desc: '断片的な状況だけが与えられ、問いを立てることから始まる。', minDiff: 3 },
  ],
  en: [
    { id: 1, label: 'Level 1', desc: 'Questions are provided. Get a feel for each thinking type.', minDiff: 1 },
    { id: 2, label: 'Level 2', desc: 'The types to use are specified, but you decide what to examine within each type.', minDiff: 3 },
    { id: 3, label: 'Level 3', desc: 'You choose which types to use and in what order.', minDiff: 3 },
    { id: 4, label: 'Level 4', desc: 'Only a vague situation is given. Start by defining the question.', minDiff: 3 },
  ]
};

// ── 問いの核心ごとのデフォルトuser_core ──────────────
export const THINKING_CORE_DEFAULT_USER_CORE = {
  ja: {
    feasibility:  'この取り組みを、与えられた制約の中で実現できるか判断する',
    priority:     '複数の選択肢の中から、今最も優先すべきものを選ぶ',
    alignment:    '関係者の合意を取り付けるために、何を・どう伝えるかを設計する',
    rootcause:    '問題の根本にある原因を特定し、何を目指して対処するかを決める',
    risk:         '起きうるリスクを見積もり、どう備えるかを決める',
    value:        'この判断・結果が本当に良いものかを評価する',
    pattern:      '繰り返す問題の構造的な原因を発見する',
    reframe:      '別の立場から状況を見直し、新たな判断を導く',
    tradeoff:     '両立できない要求の中で、何を優先するかを決める',
    assumption:   '当たり前とされている問いや前提を疑い、立て直す',
  },
  en: {
    feasibility:  'Determine whether this initiative can be realized within the given constraints',
    priority:     'Identify the highest-priority item among multiple options',
    alignment:    'Design what to communicate, to whom, and in what order to secure agreement',
    rootcause:    'Identify the root cause of the problem and define what to aim for',
    risk:         'Estimate potential risks and decide how to respond',
    value:        'Evaluate whether this decision or outcome is truly a good one',
    pattern:      'Discover the structural reason why this problem keeps recurring',
    reframe:      'Re-examine the situation from a different perspective to reach a better judgment',
    tradeoff:     'Decide what to prioritize when competing demands cannot all be met',
    assumption:   'Challenge the assumptions embedded in the question and reframe it',
  }
};

// ── 論理整合性チェックマップ ──────────────────────────
export const LOGIC_CHECK_MAP = {

  // 全問題共通チェック
  common: {
    ja: [
      '事実と自分の解釈・意見が混ざっていないか（事実として述べていることに根拠があるか）',
      '結論と根拠の間に飛躍がないか（AだからBと言えるか、間のステップが省かれていないか）',
      '原因と結果の向きが逆になっていないか（相関を因果として扱っていないか）',
    ],
    en: [
      'Are facts and interpretations clearly separated? (Is there evidence for what is stated as fact?)',
      'Is there a logical gap between conclusion and basis? (Are intermediate steps missing?)',
      'Is the causal direction correct? (Is correlation being treated as causation?)',
    ]
  },

  // 思考タイプ別チェック
  types: {
    1: { // 状況を整理する
      ja: [
        '事実・不確かな情報・矛盾の3つが区別されているか',
        '関係する人物・部門・組織の立場が漏れなく整理されているか',
        '矛盾や不整合が指摘されているか',
      ],
      en: [
        'Are facts, uncertain info, and contradictions clearly distinguished?',
        'Are all relevant stakeholders and their positions covered?',
        'Are contradictions or inconsistencies identified?',
      ]
    },
    2: { // 原因を掘り下げる
      ja: [
        '表面の原因で止まらず、根本まで掘り下げられているか（直接原因→中間原因→根本原因）',
        '根本原因の仮説が複数立てられているか（1つだけで止まっていないか）',
        '原因の仮説が事実から導かれているか（思い込みで結論に飛んでいないか）',
        '同じ問題が繰り返している場合、構造的な原因まで考えられているか',
      ],
      en: [
        'Is the root cause identified, not just the surface cause?',
        'Are multiple hypotheses for root cause considered?',
        'Are hypotheses grounded in facts, not assumptions?',
        'For recurring issues, is the structural cause considered?',
      ]
    },
    3: { // 先を読む
      ja: [
        '複数のシナリオが検討されているか（都合の良いシナリオだけになっていないか）',
        '最悪のケースが想定されているか',
        '起きやすさと影響の大きさが区別されているか',
        '予測の根拠が現在の事実から導かれているか',
      ],
      en: [
        'Are multiple scenarios considered, not just the optimistic one?',
        'Is a worst-case scenario identified?',
        'Are probability and impact distinguished?',
        'Is the prediction grounded in current facts?',
      ]
    },
    4: { // 選択肢を比べる
      ja: [
        '複数の選択肢が列挙されているか（1つだけで終わっていないか）',
        '何を基準に選んでいるか（評価の軸）が明示されているか',
        '何を諦めるかが意識されているか（トレードオフが見えているか）',
        '時間・コスト・リソースなどの制約が考慮されているか',
      ],
      en: [
        'Are multiple options listed?',
        'Are the evaluation criteria explicitly stated?',
        'Are trade-offs acknowledged?',
        'Are constraints (time, cost, resources) considered?',
      ]
    },
    5: { // 相手を動かす
      ja: [
        '関係者それぞれの懸念・動機が個別に整理されているか',
        '自分の論理を押しつけていないか（相手が動く条件から考えているか）',
        '伝える順序に根拠があるか',
        '反発が予想される相手への対処が考えられているか',
      ],
      en: [
        'Are each stakeholder\'s concerns and motivations identified?',
        'Is the approach based on what moves the other person, not just self-logic?',
        'Is the sequence of communication justified?',
        'Is resistance anticipated and addressed?',
      ]
    },
    6: { // 問いを疑う
      ja: [
        '今解こうとしている問いの中にある、暗黙の前提が特定されているか',
        '前提を疑う根拠が状況の事実から来ているか（恣意的に疑っていないか）',
        '問いを立て直した場合、新しい問いが具体的な行動につながるレベルになっているか',
      ],
      en: [
        'Are the implicit assumptions in the current question identified?',
        'Is the basis for questioning the premise grounded in facts?',
        'If reframed, is the new question actionable?',
      ]
    }
  },

  // 問いの核心別チェック
  cores: {
    feasibility: {
      ja: [
        '「できる／できない」の判断基準が明示されているか',
        '条件付きで実現できる場合、その条件が特定されているか',
        '大枠の段取りが実現可能かどうかが検証されているか',
      ],
      en: [
        'Are the criteria for feasibility explicitly stated?',
        'If conditionally feasible, are those conditions identified?',
        'Is the rough plan verified for feasibility?',
      ]
    },
    priority: {
      ja: [
        '重要な選択肢が漏れなく並んでいるか',
        '優先順位の根拠が複数の観点で説明されているか',
        '今回選ばなかったものへの言及があるか',
      ],
      en: [
        'Are all significant options covered?',
        'Is the priority justified from multiple angles?',
        'Are non-selected options addressed?',
      ]
    },
    alignment: {
      ja: [
        '主要な関係者全員が考慮されているか',
        '各関係者が動く条件が具体化されているか',
        '関係者間の影響力・順序が考慮されているか',
      ],
      en: [
        'Are all key stakeholders considered?',
        'Are specific conditions for each stakeholder\'s action identified?',
        'Are influence and sequencing among stakeholders considered?',
      ]
    },
    rootcause: {
      ja: [
        '根本原因まで掘り下げられているか（直接原因で止まっていないか）',
        'どこまで対処するか（直接・中間・根本）が意識的に選ばれているか',
        'ゴールの定義が根本原因と対応しているか',
      ],
      en: [
        'Is the root cause identified, not just surface causes?',
        'Is the depth of response consciously chosen?',
        'Does the goal definition correspond to the root cause?',
      ]
    },
    risk: {
      ja: [
        'リスクが網羅的に列挙されているか',
        '起きやすさと影響の大きさが区別されているか',
        '対処するコストと放置するコストが比較されているか',
      ],
      en: [
        'Are risks comprehensively listed?',
        'Are probability and impact distinguished?',
        'Are costs of action vs. inaction compared?',
      ]
    },
    value: {
      ja: [
        '「良い／悪い」の判断基準が明示されているか',
        '誰にとっての価値かが特定されているか',
        '状況によって価値の基準が変わりうることが意識されているか',
      ],
      en: [
        'Are the criteria for "good/bad" explicitly stated?',
        'Is it clear whose value is being evaluated?',
        'Is it recognized that value criteria may vary by context?',
      ]
    },
    pattern: {
      ja: [
        '単発の事象ではなくパターンに注目しているか',
        '繰り返す構造的な理由が特定されているか',
        '問い自体が「なぜ繰り返すのか」になっているか',
      ],
      en: [
        'Is the focus on patterns, not isolated events?',
        'Is the structural reason for recurrence identified?',
        'Is the question framed as "why does this keep happening?"',
      ]
    },
    reframe: {
      ja: [
        '自分の視点と相手の視点が明確に区別されているか',
        '相手の視点が事実・状況から推論されているか（思い込みでないか）',
        '視点を変えることで見えてきた新しい情報があるか',
      ],
      en: [
        'Are self-perspective and others\' perspectives clearly distinguished?',
        'Is the other\'s perspective inferred from facts, not assumed?',
        'Does the perspective shift reveal new information?',
      ]
    },
    tradeoff: {
      ja: [
        '両立できない要求が明示されているか',
        '何を優先し何を諦めるかが意識的に選ばれているか',
        '誰にどのような影響が及ぶかが考えられているか',
      ],
      en: [
        'Are conflicting requirements explicitly identified?',
        'Is the choice of what to prioritize and sacrifice conscious?',
        'Is it considered who is affected and how?',
      ]
    },
    assumption: {
      ja: [
        '疑うべき前提が「当たり前とされているもの」から来ているか',
        '前提を疑った後の問いが元の問いより本質的になっているか',
        '前提を変えた場合の影響範囲が考えられているか',
      ],
      en: [
        'Is the questioned premise one that is commonly taken for granted?',
        'Is the reframed question more fundamental than the original?',
        'Is the impact of changing the premise considered?',
      ]
    }
  }
};

// ── 80点評価基準 ──────────────────────────────────────
export const THINKING_SCORE_CRITERIA = {

  // レベル1：設問への回答
  level1: {
    ja: {
      required: [
        '設問が問うていることに正面から答えているか（的外れでないか）',
        '主張の根拠が具体的な情報・事実から導かれているか',
        '論理的な飛躍や矛盾がないか',
      ],
      bonus: [
        '問いの核心に対して、典型的な答え以上の視点が含まれているか',
        '複数の解釈の可能性を意識した回答になっているか',
      ]
    },
    en: {
      required: [
        'Does the answer directly address what the question is asking?',
        'Is the reasoning grounded in concrete information or facts?',
        'Are there no logical gaps or contradictions?',
      ],
      bonus: [
        'Does the answer go beyond the typical response for this question type?',
        'Does the answer acknowledge multiple possible interpretations?',
      ]
    }
  },

  // レベル2：切り口の定義
  level2: {
    ja: {
      required: [
        '定義した切り口が、指定されたタイプの本質と整合しているか',
        '何を確認するかが、具体的な行動レベルで述べられているか',
        '題材の状況に対して過不足なく設計されているか',
      ],
      bonus: [
        'この状況ならではの視点が含まれているか（典型的な切り口に加えて）',
        '切り口同士の論理的なつながりが意識されているか',
      ]
    },
    en: {
      required: [
        'Is the defined approach consistent with the essence of the specified type?',
        'Is what to examine described at a concrete, actionable level?',
        'Is the approach appropriate for this specific situation?',
      ],
      bonus: [
        'Does it include a perspective unique to this situation?',
        'Is there a logical connection between the defined approaches?',
      ]
    }
  },

  // レベル3：タイプ選択と順序
  level3: {
    ja: {
      required: [
        '問いの核心に対応するタイプが含まれているか',
        '順序に論理的な根拠があるか（①を先に置くなど自然な流れになっているか）',
        '選択の理由が状況の特徴と結びついているか',
      ],
      bonus: [
        '典型的でない選択をしており、その理由がこの状況を正確に読んだ独自の判断になっているか',
      ]
    },
    en: {
      required: [
        'Does the selection include the type(s) that correspond to the question\'s core?',
        'Is the sequence logically justified?',
        'Is the reason for the selection tied to the specific features of the situation?',
      ],
      bonus: [
        'Is an unconventional selection made, with a reason grounded in an accurate reading of the situation?',
      ]
    }
  },

  // レベル4：問いの定義
  level4: {
    ja: {
      required: [
        '定義した問いが題材の状況から導ける範囲にあるか',
        '具体的な行動につながる粒度の問いになっているか',
        '題材の曖昧さや断片的な情報を踏まえた問いになっているか',
      ],
      bonus: [
        '与えられた問いの前提を疑い、より本質的な問いに変換できているか',
      ]
    },
    en: {
      required: [
        'Is the defined question within the range derivable from the situation?',
        'Is the question specific enough to lead to concrete action?',
        'Does the question account for the ambiguity and fragmentary nature of the situation?',
      ],
      bonus: [
        'Does it challenge the premise of the given question and reframe it more fundamentally?',
      ]
    }
  }
};

// ── 最終問い（つまり、どういうこと？）の評価基準 ──────
export const THINKING_FINAL_Q_CRITERIA = {
  ja: {
    required: [
      '問いの核心に対する回答になっているか（その核心で解くべきことに答えているか）',
      '「なぜそう判断したか」の根拠がここまでの分析から導かれているか',
      'ネクストアクションが具体的な行動レベルになっているか',
    ],
    bonus: [
      '本質と行動の間の論理的なつながりが明確か',
    ]
  },
  en: {
    required: [
      'Does the answer address the core question of this problem?',
      'Is the reasoning drawn from the analysis done so far?',
      'Is the next action described at a concrete, actionable level?',
    ],
    bonus: [
      'Is there a clear logical connection between the insight and the action?',
    ]
  }
};

// ── 問い返しパターン（役割B） ─────────────────────────
export const THINKING_FOLLOWUP_PATTERNS = {
  1: { // 状況を整理する
    ja: '状況の整理が表面的にとどまっています。「{specific}」という点について、事実として確認できることと、まだ不確かなことを分けてみてください。',
    en: 'The situation mapping stays at the surface. Regarding "{specific}", try separating what can be confirmed as fact from what is still uncertain.',
  },
  2: { // 原因を掘り下げる
    ja: '原因の掘り下げが表面の原因で止まっています。「{specific}」はなぜ起きたのか、もう1段階深く考えてみてください。',
    en: 'The causal analysis stops at the surface. Ask yourself: why did "{specific}" happen? Try going one level deeper.',
  },
  3: { // 先を読む
    ja: 'このまま進んだ場合のシナリオが1つしか考えられていません。「{specific}」という選択をした場合、3ヶ月後にどんな状況が起きうるか、もう1つのシナリオを考えてみてください。',
    en: 'Only one scenario is considered. If you go with "{specific}", what other situation could unfold in 3 months?',
  },
  4: { // 選択肢を比べる
    ja: '判断の基準が明示されていません。「{specific}」を選ぶ理由として、何を基準に他の選択肢と比べましたか？',
    en: 'The evaluation criteria are not stated. What standard did you use to compare "{specific}" against other options?',
  },
  5: { // 相手を動かす
    ja: '関係者への伝え方が考慮されていません。「{specific}」に対して、相手はどんな懸念を持つと思いますか？',
    en: 'Stakeholder communication is not considered. What concerns might "{specific}" have?',
  },
  6: { // 問いを疑う
    ja: '今解こうとしている問い自体を一度立ち止まって確認してください。「{specific}」を解くことは、本当に今最も重要なことでしょうか？',
    en: 'Pause and check the question itself. Is solving "{specific}" truly the most important thing right now?',
  }
};

// ── 振り返り問いかけパターン（役割D1） ───────────────
export const THINKING_REFLECTION_PATTERNS = {
  X: { // 省略・混同への問いかけ
    ja: '{step}の回答で、{issue}という場面がありました。そのとき、何を根拠にその判断をしたか、振り返ってみてください。',
    en: 'In {step}, there was a moment where {issue}. Looking back, what was the basis for that judgment?',
  },
  Y: { // 自己批判の促し
    ja: '今回の回答全体を通じて、「本当にこれで良いか」と最も迷った場面はどこでしたか？',
    en: 'Looking back at your responses, which moment made you most uncertain about whether you were on the right track?',
  },
  Z: { // 思い込みへの問いかけ
    ja: '{step}で、{assumption}という前提を確認せずに進んだ場面がありました。なぜそこを疑わなかったと思いますか？',
    en: 'In {step}, you proceeded without checking the assumption that {assumption}. Why do you think you didn\'t question it?',
  }
};

// ── 難易度別の題材文パラメーター ─────────────────────
export const THINKING_SITUATION_PARAMS = {
  1: { minChars: 250, maxChars: 350, ambiguity: 'low',    extraInfo: false, numTypes: 2 },
  2: { minChars: 300, maxChars: 420, ambiguity: 'low',    extraInfo: false, numTypes: 2 },
  3: { minChars: 380, maxChars: 500, ambiguity: 'medium', extraInfo: true,  numTypes: 3 },
  4: { minChars: 450, maxChars: 580, ambiguity: 'high',   extraInfo: true,  numTypes: 4 },
  5: { minChars: 500, maxChars: 650, ambiguity: 'very_high', extraInfo: true, numTypes: '4-5' },
};

// ── GASカラム定義 ─────────────────────────────────────
export const THINKING_COLS = [
  'id', 'core', 'diff', 'level', 'date', 'industry',
  'situation', 'questions', 'user_core', 'theme',
  'persona_snapshot', 'lang'
];

export const THINKING_COLS_LEGACY = [
  'id', 'core', 'diff', 'level', 'date', 'industry',
  'situation', 'questions', 'lang'
];

function mapThinkingPastRow(row) {
  if (!Array.isArray(row)) return row;
  const cols = row.length >= THINKING_COLS.length ? THINKING_COLS : THINKING_COLS_LEGACY;
  const obj = {};
  cols.forEach((col, i) => { obj[col] = row[i] ?? ''; });
  return obj;
}
