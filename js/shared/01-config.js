/* Config */
const GAS_URL='https://script.google.com/macros/s/AKfycbwhhe__vijEOW9uO5KVWOH6tEFt_IJKX9geh0rwUS6vyU8UTTkT_eZ6k7zWyAatVWjf/exec';
// 本番: GitHub Actions が Secrets から注入。ローカル: js/shared/01-config.local.js（gitignore）
let CLAUDE_API_KEY='';
const LANG_KEY='thinkgrindai_lang';
// 振り返り機能のON/OFF（falseにすると役割D1〜D3が無効化される）
const ENABLE_REFLECTION = true;
