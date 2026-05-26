const { getClaudeClient, MODEL } = require('../config/claude-config');
const {
  LOGIC_TAB_CONFIG,
  THINKING_TYPE_NAMES,
  THINKING_LEVEL_CONFIG,
  TEMPERATURE,
} = require('../config/constants');

/**
 * 問題生成（論理トレーニング）
 * @param {{ tab: string; theme: string }} params
 * @returns {Promise<string>}
 */
async function generateLogicProblem({
  tab,
  theme,
  systemPrompt: systemOverride,
  userPrompt: userOverride,
  maxTokens,
  temperature,
}) {
  const client = getClaudeClient();
  const tabConfig = LOGIC_TAB_CONFIG[tab];

  const systemPrompt = systemOverride || `あなたは論理トレーニングアプリの教育コンテンツ生成エージェントです。
ユーザーの学習に役立つ質の高い問題を作成してください。
問題文のみを出力してください。余計な説明・前置き・解説は不要です。`;

  const userPrompt = userOverride || `テーマ: ${theme}
タスク: ${tabConfig.prompt_instruction}`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens || tabConfig.max_tokens,
    temperature: temperature ?? TEMPERATURE.generation,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  return response.content[0].text;
}

/**
 * 問題生成（思考トレーニング）
 * @param {{ thinking_type: string; level: number; theme: string }} params
 * @returns {Promise<string>}
 */
async function generateThinkingProblem({
  thinking_type,
  level,
  theme,
  systemPrompt: systemOverride,
  userPrompt: userOverride,
  maxTokens,
  temperature,
}) {
  const client = getClaudeClient();
  const levelConfig = THINKING_LEVEL_CONFIG[level];
  const typeName = THINKING_TYPE_NAMES[thinking_type];

  const systemPrompt = systemOverride || `あなたは思考トレーニングアプリの教育コンテンツ生成エージェントです。
指定された思考フレームワークと難易度レベルに合わせた問題を作成してください。
問題文のみを出力してください。余計な説明・前置き・解説は不要です。`;

  const userPrompt = userOverride || `思考タイプ: ${typeName}
難易度: ${levelConfig.difficulty}
テーマ: ${theme}
タスク: ${levelConfig.prompt_instruction}`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens || levelConfig.max_tokens,
    temperature: temperature ?? TEMPERATURE.generation,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  return response.content[0].text;
}

/**
 * 採点・評価（論理トレーニング）
 * @param {{ tab: string; original_problem: string; user_answer: string }} params
 * @returns {Promise<object>}
 */
/**
 * FE 互換のカスタムプロンプトで採点（マークダウン等をそのまま返す）
 * @param {{ systemPrompt: string; userPrompt: string; maxTokens?: number; temperature?: number }} params
 * @returns {Promise<string>}
 */
async function scoreWithCustomPrompt({
  systemPrompt,
  userPrompt,
  maxTokens = 1000,
  temperature = TEMPERATURE.scoring,
}) {
  return completeWithPrompt({
    systemPrompt,
    userPrompt,
    maxTokens,
    temperature,
  });
}

/**
 * カスタム system / user プロンプト（テキストまたはマルチモーダル）で Claude を呼ぶ
 * @param {{ systemPrompt: string; userPrompt?: string; userContent?: unknown; maxTokens?: number; temperature?: number }} params
 * @returns {Promise<string>}
 */
async function completeWithPrompt({
  systemPrompt,
  userPrompt,
  userContent,
  maxTokens = 2500,
  temperature = TEMPERATURE.generation,
}) {
  const client = getClaudeClient();
  let messageContent = userPrompt;
  if (userContent !== undefined && userContent !== null) {
    messageContent = userContent;
  }
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    temperature,
    system: systemPrompt,
    messages: [{ role: 'user', content: messageContent }],
  });
  return response.content[0].text;
}

async function scoreLogicAnswer({
  tab,
  original_problem,
  user_answer,
  systemPrompt: systemOverride,
  userPrompt: userOverride,
  maxTokens,
  temperature,
}) {
  if (systemOverride && userOverride) {
    const text = await scoreWithCustomPrompt({
      systemPrompt: systemOverride,
      userPrompt: userOverride,
      maxTokens,
      temperature,
    });
    return {
      score: 0,
      score_detail: {},
      feedback: text,
      suggestions: [],
      raw_text: text,
    };
  }

  const client = getClaudeClient();

  const systemPrompt = `あなたは論理トレーニングアプリの採点・フィードバック生成エージェントです。
ユーザーの回答を以下の3観点で評価してください。

評価観点:
- 論理的明確性（logic_clarity）: 主張が明確か、根拠は示されているか（0〜100）
- 完全性（completeness）: 問題の要求を満たしているか、漏れはないか（0〜100）
- 正確性（accuracy）: ファクトは正確か、論理矛盾はないか（0〜100）

必ず以下のJSON形式のみで出力してください（他のテキストは不要）:
{
  "score": <3観点の平均値（整数）>,
  "score_detail": {
    "logic_clarity": <数値>,
    "completeness": <数値>,
    "accuracy": <数値>
  },
  "feedback": "<総合的なフィードバックコメント>",
  "suggestions": ["<改善提案1>", "<改善提案2>"]
}`;

  const userPrompt = `問題: ${original_problem}

ユーザーの回答: ${user_answer}

上記の回答を評価してください。`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1000,
    temperature: TEMPERATURE.scoring,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const raw = response.content[0].text.trim();
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Claude response is not valid JSON');
  }
  return JSON.parse(jsonMatch[0]);
}

/**
 * 採点・評価（思考トレーニング）
 * @param {{ thinking_type: string; level: number; original_problem: string; user_answer: string }} params
 * @returns {Promise<object>}
 */
async function scoreThinkingAnswer({
  thinking_type,
  level,
  original_problem,
  user_answer,
  systemPrompt: systemOverride,
  userPrompt: userOverride,
  maxTokens,
  temperature,
}) {
  if (systemOverride && userOverride) {
    const text = await scoreWithCustomPrompt({
      systemPrompt: systemOverride,
      userPrompt: userOverride,
      maxTokens,
      temperature,
    });
    return {
      score: 0,
      score_detail: {},
      feedback: text,
      suggestions: [],
      raw_text: text,
    };
  }

  const client = getClaudeClient();
  const typeName = THINKING_TYPE_NAMES[thinking_type];
  const levelConfig = THINKING_LEVEL_CONFIG[level];

  const systemPrompt = `あなたは思考トレーニングアプリの採点・フィードバック生成エージェントです。
ユーザーの回答を以下の4観点で評価してください。

評価観点:
- 論理的明確性（logic_clarity）: 主張が明確か、根拠は示されているか（0〜100）
- 完全性（completeness）: 問題の要求を満たしているか、漏れはないか（0〜100）
- 正確性（accuracy）: ファクトは正確か、論理矛盾はないか（0〜100）
- 創造性（creativity）: 新しい視点・工夫があるか（0〜100）

思考タイプ: ${typeName}
難易度: ${levelConfig.difficulty}

必ず以下のJSON形式のみで出力してください（他のテキストは不要）:
{
  "score": <4観点の平均値（整数）>,
  "score_detail": {
    "logic_clarity": <数値>,
    "completeness": <数値>,
    "accuracy": <数値>,
    "creativity": <数値>
  },
  "feedback": "<総合的なフィードバックコメント>",
  "suggestions": ["<改善提案1>", "<改善提案2>"]
}`;

  const userPrompt = `問題: ${original_problem}

ユーザーの回答: ${user_answer}

上記の回答を評価してください。`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1000,
    temperature: TEMPERATURE.scoring,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const raw = response.content[0].text.trim();
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Claude response is not valid JSON');
  }
  return JSON.parse(jsonMatch[0]);
}

module.exports = {
  generateLogicProblem,
  generateThinkingProblem,
  scoreLogicAnswer,
  scoreThinkingAnswer,
  scoreWithCustomPrompt,
  completeWithPrompt,
};
