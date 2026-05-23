/* Config */
const GAS_URL='https://script.google.com/macros/s/AKfycbwBUJTIBsO8egwRgZVpNQSzgrfroubxTRSe-TlzUq-C-7KbEGz_oWIgkYz5YrnLaRE/exec';
// 本番: GitHub Actions が Secrets から注入。ローカル: js/01-config.local.js（gitignore）
let CLAUDE_API_KEY='';
const LANG_KEY='thinkgrindai_lang';
// 振り返り機能のON/OFF（falseにすると役割D1〜D3が無効化される）
const ENABLE_REFLECTION = true;
