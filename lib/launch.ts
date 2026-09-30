'use client';

import type { Game } from './games';
import { pushRecent } from './storage';

/**
 * Always-new-tab fullscreen launcher. MUST be called synchronously inside the
 * click handler — any await before window.open loses the gesture and the
 * popup blocker kills it.
 */

const CLOAK_TITLE = 'Google Docs';
const CLOAK_ICON = '/icons/canvas.png';
const PANIC_URL = 'https://classroom.google.com/';

function esc(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
}

function shellHead(title: string): string {
  return `<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">`
    + `<title>${CLOAK_TITLE}</title><link rel="icon" href="${CLOAK_ICON}">`
    + `<style>html,body{margin:0;padding:0;height:100%;background:#000;overflow:hidden}`
    + `#stage{position:fixed;inset:0}#stage iframe,#stage embed,#stage object{width:100%;height:100vh;border:0;display:block}`
    + `#gate{position:fixed;inset:0;display:flex;flex-direction:column;gap:16px;align-items:center;justify-content:center;background:#070A0F;color:#E8EAF0;font-family:Inter,system-ui,sans-serif;z-index:10}`
    + `#gate button{background:#22D3EE;color:#04121A;border:0;border-radius:8px;padding:14px 34px;font-size:17px;font-weight:700;cursor:pointer}`
    + `#bar{position:fixed;top:10px;right:10px;display:flex;gap:8px;z-index:20;opacity:1;animation:barfade .5s ease 4s forwards}`
    + `body:hover #bar{opacity:1;animation:none}#bar button{background:rgba(13,17,23,.85);color:#E8EAF0;border:1px solid rgba(176,199,217,.25);border-radius:8px;padding:7px 11px;font-size:13px;cursor:pointer}`
    + `@keyframes barfade{to{opacity:0}}`
    + `#err{display:none;position:fixed;inset:0;align-items:center;justify-content:center;background:#070A0F;color:#E8EAF0;z-index:30;text-align:center;padding:24px;font-family:Inter,system-ui,sans-serif}</style>`;
}

function shellFoot(title: string, siteUrl: string): string {
  void title;
  return `<script>
var ERR=document.getElementById('err'),DONE=false;
function fs(){var el=document.documentElement;if(el.requestFullscreen){el.requestFullscreen().catch(function(){});} }
['click','keydown','touchstart'].forEach(function(ev){document.addEventListener(ev,function(){if(!DONE){DONE=true;fs();}});});
setTimeout(function(){var f=document.querySelector('#stage iframe');if(f){try{f.focus();}catch(e){}}},600);
document.addEventListener('keydown',function(e){if(e.key==='\`'||e.key==='Escape'){location.replace('${PANIC_URL}');}});
setTimeout(function(){var f=document.querySelector('#stage iframe');if(!f||!f.contentWindow||f.contentWindow.length===0){}},15000);
setTimeout(function(){
  try{
    var f=document.querySelector('#stage iframe');
    if(f&&f.dataset.loaded!=='1'){ERR.style.display='flex';}
  }catch(e){ERR.style.display='flex';}
},20000);
<\/script>`;
}

function errHtml(title: string, siteUrl: string): string {
  return `<div id="err"><div><div style="font-size:40px">◢</div>`
    + `<div style="font-size:20px;font-weight:700;margin:8px 0">${esc(title)} failed to load</div>`
    + `<div style="color:#9AA3B2;font-size:14px">The source did not respond. Reload, or open it on the site.</div>`
    + `<div style="margin-top:14px;display:flex;gap:8px;justify-content:center">`
    + `<button onclick="location.reload()" style="background:#22D3EE;color:#04121A;border:0;border-radius:8px;padding:10px 20px;font-weight:700;cursor:pointer">Reload</button>`
    + `<a href="${siteUrl}" style="border:1px solid rgba(176,199,217,.25);color:#E8EAF0;border-radius:8px;padding:10px 20px;font-weight:700;text-decoration:none">Open on site</a>`
    + `</div></div></div>`;
}

function toolbarHtml(siteUrl: string): string {
  return `<div id="bar"><button onclick="location.href='${siteUrl}'" title="Back to site">← Site</button>`
    + `<button onclick="var f=document.querySelector('#stage iframe');if(f)f.src=f.src;" title="Reload">⟳</button>`
    + `<button onclick="var el=document.documentElement;if(document.fullscreenElement){document.exitFullscreen();}else if(el.requestFullscreen){el.requestFullscreen();}" title="Fullscreen">⛶</button>`
    + `<button onclick="window.close()" title="Close">✕</button></div>`;
}

function playerFor(game: { kind: string; iframeUrl?: string; swfUrl?: string; ejsGameUrl?: string; ejsCore?: string; title: string }): string {
  if (game.kind === 'ruffle' && game.swfUrl) {
    return `<script src="https://unpkg.com/@ruffle-rs/ruffle"><\/script>`
      + `<object data="${game.swfUrl}" type="application/x-shockwave-flash" style="width:100%;height:100vh"><embed src="${game.swfUrl}" width="100%" height="100%"></object>`;
  }
  if (game.kind === 'ejs' && game.ejsGameUrl) {
    const core = game.ejsCore?.includes('melon') ? 'melonds' : 'gba';
    return `<div id="game" style="width:100%;height:100vh"></div>`
      + `<script>window.EJS_player='#game';window.EJS_core='${core}';window.EJS_pathtodata='https://cdn.emulatorjs.org/stable/data/';window.EJS_gameUrl='${game.ejsGameUrl}';<\/script>`
      + `<script src="https://cdn.emulatorjs.org/stable/data/loader.js"><\/script>`;
  }
  const src = game.iframeUrl || '';
  return `<iframe src="${src}" onload="this.dataset.loaded='1'" allowfullscreen allow="fullscreen; autoplay; gamepad; pointer-lock; clipboard-write" sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-modals allow-popups allow-popups-to-escape-sandbox allow-downloads"></iframe>`;
}

export function buildShell(game: { title: string; slug: string; kind: string; iframeUrl?: string; swfUrl?: string; ejsGameUrl?: string; ejsCore?: string }): string {
  const siteUrl = `${location.origin}/play/${game.slug}`;
  return `<!DOCTYPE html><html><head>${shellHead(game.title)}</head><body>`
    + `<div id="stage">${playerFor(game)}</div>`
    + toolbarHtml(siteUrl)
    + errHtml(game.title, siteUrl)
    + shellFoot(game.title, siteUrl)
    + `</body></html>`;
}

/**
 * Launch a game in a fullscreen about:blank tab. Returns false when the
 * popup was blocked (caller should fall back to /play inline).
 */
export function launchGame(game: Game): boolean {
  try {
    pushRecent(game.slug);
  } catch {}
  const win = window.open('about:blank', '_blank');
  if (!win) return false;
  try {
    win.document.open();
    win.document.write(buildShell(game));
    win.document.close();
    win.focus();
    try {
      win.opener = null;
    } catch {}
    return true;
  } catch {
    try {
      win.close();
    } catch {}
    return false;
  }
}
