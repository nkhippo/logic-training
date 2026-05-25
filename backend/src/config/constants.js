const LOGIC_TABS = ['fill', 'summary', 'critique', 'ame'];

const LOGIC_TAB_CONFIG = {
  fill: {
    max_tokens: 500,
    prompt_instruction: '論述の中から重要な語句を1〜3箇所選び、「___」に置き換えた穴埋め問題を1問作成してください。穴埋め問題の本文のみを出力し、解答は含めないでください。',
  },
  summary: {
    max_tokens: 800,
    prompt_instruction: '以下のテーマについて200〜300字程度の論述を作成し、末尾に「この文章を50字以内で要約してください。」という指示文を付けてください。',
  },
  critique: {
    max_tokens: 1000,
    prompt_instruction: '以下のテーマについて、主張とその根拠を含む150〜250字の論述を作成し、末尾に「この主張の根拠は十分ですか？問題点があれば指摘してください。」という問いを付けてください。',
  },
  ame: {
    max_tokens: 1200,
    prompt_instruction: '以下のテーマについて、具体的な状況・数値・背景を含む200〜300字の状況説明を作成し、末尾に「この状況から、どのようなアクションを取るべきですか？空・雨・傘の形式で答えてください。」という問いを付けてください。',
  },
};

const THINKING_TYPES = ['type1', 'type2', 'type3', 'type4', 'type5', 'type6'];

const THINKING_TYPE_NAMES = {
  type1: 'ロジカルシンキング（MECE・ピラミッド構造）',
  type2: 'クリティカルシンキング（根拠検証・論理矛盾指摘）',
  type3: 'システムシンキング（相互関係・因果関係）',
  type4: 'デザインシンキング（問題定義・創造性）',
  type5: 'シナリオプランニング（未来予測・戦略立案）',
  type6: 'メタ認知（思考プロセスの自己観察）',
};

const THINKING_LEVELS = [1, 2, 3, 4];

const THINKING_LEVEL_CONFIG = {
  1: {
    max_tokens: 500,
    difficulty: '基礎（定義・型を学ぶ）',
    prompt_instruction: 'フレームワークの定義や基本概念を問う基礎的な問題を1問作成してください。',
  },
  2: {
    max_tokens: 800,
    difficulty: '応用（型を使う）',
    prompt_instruction: '具体的な事例を提示し、フレームワークを用いた分析を求める問題を1問作成してください。',
  },
  3: {
    max_tokens: 1200,
    difficulty: '発展（型を組み合わせる）',
    prompt_instruction: '複数のフレームワークを組み合わせた複合的な分析を求める問題を1問作成してください。',
  },
  4: {
    max_tokens: 2000,
    difficulty: '実践（ビジネスに応用）',
    prompt_instruction: '実際のビジネス課題を想定し、フレームワークを実務に適用した改善案の提示を求める問題を1問作成してください。',
  },
};

const TEMPERATURE = {
  generation: 0.9,
  scoring: 0.3,
};

module.exports = {
  LOGIC_TABS,
  LOGIC_TAB_CONFIG,
  THINKING_TYPES,
  THINKING_TYPE_NAMES,
  THINKING_LEVELS,
  THINKING_LEVEL_CONFIG,
  TEMPERATURE,
};
