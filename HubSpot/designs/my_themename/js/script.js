{# 標準ライブラリinclude、イニシャライズ、全ページ共通処理用 #}
{%- include './vendor/jquery.js' -%}
{%- include './vendor/smooth-scroll.polyfills.js' -%}
const scroll = new SmoothScroll('a[href*="#"]', {});
