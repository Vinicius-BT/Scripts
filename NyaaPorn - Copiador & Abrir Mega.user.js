// ==UserScript==
// @name         NyaaPorn - Copiador & Abrir Mega (Inverso + Delay)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Copia dados e abre links Mega do último para o primeiro com intervalo de 3s
// @author       Gemini
// @match        https://nyaa.porn78.info/*
// @grant        GM_setClipboard
// @grant        GM_openInTab
// @updateURL    https://raw.githubusercontent.com/Vinicius-BT/Script/main/NyaaPorn - Copiador & Abrir Mega.user.js
// @downloadURL  https://raw.githubusercontent.com/Vinicius-BT/Script/main/NyaaPorn - Copiador & Abrir Mega.user.js
// ==/UserScript==

(function() {
    'use strict';

    function addButtons() {
        const titleElement = document.querySelector('h1, h2, h3.font-weight-bold') || document.querySelector('.title h2');
        if (!titleElement || document.getElementById('copy-btn-container')) return;

        const fullTitle = titleElement.innerText.trim();
        const cleanTitle = fullTitle.replace(/\s*\[[A-Z0-9.\/ _-]+\]\s*$/i, '').trim();

        let actressName = "";
        const nameMatch = fullTitle.match(/\]\s*(.*?)\s*[–-]/);
        if (nameMatch && nameMatch[1]) {
            actressName = nameMatch[1].trim();
        } else {
            const fallbackMatch = fullTitle.match(/\]\s*([^\s]+ [^\s]+)/);
            actressName = fallbackMatch ? fallbackMatch[1].trim() : "Nome não identificado";
        }

        // Função para abrir links em ordem inversa com delay
        async function openMegaLinks() {
            const megaLinks = document.querySelectorAll('a[class^="mega"]');

            if (megaLinks.length > 0) {
                // Pega as URLs, remove duplicados e INVERTE a ordem (.reverse())
                let urls = [...new Set(Array.from(megaLinks).map(a => a.href))];
                urls.reverse();

                const btn = document.getElementById('btn-mega-abrir');

                btn.disabled = true;
                btn.style.opacity = '0.5';

                for (let i = 0; i < urls.length; i++) {
                    const count = i + 1;
                    btn.innerText = `⏳ Inverso: ${count}/${urls.length}...`;

                    GM_openInTab(urls[i], { active: false, insert: true });

                    if (i < urls.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 3000));
                    }
                }

                btn.innerText = "✅ Todos Abertos!";
                btn.style.opacity = '1';
                btn.disabled = false;
                setTimeout(() => btn.innerText = "🚀 Abrir Todos Mega", 3000);

            } else {
                alert("Nenhum link com classe 'mega' encontrado.");
            }
        }

        const container = document.createElement('div');
        container.id = 'copy-btn-container';
        container.style.cssText = 'margin: 15px 0; display: flex; justify-content: center; align-items: center; gap: 15px; width: 100%; flex-wrap: wrap;';

        function createButton(text, color, onClickAction, id = "") {
            const btn = document.createElement('button');
            if(id) btn.id = id;
            btn.innerText = text;
            btn.style.cssText = `padding: 10px 20px; cursor: pointer; background-color: ${color}; color: white; border: none; border-radius: 6px; font-weight: bold; font-family: sans-serif; font-size: 13px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: transform 0.1s;`;
            btn.onclick = onClickAction;
            return btn;
        }

        container.appendChild(createButton("📋 Copiar Título", "#007bff", function() {
            GM_setClipboard(cleanTitle);
            this.innerText = "✅ Copiado!";
            setTimeout(() => this.innerText = "📋 Copiar Título", 1200);
        }));

        container.appendChild(createButton("👤 Copiar Atriz", "#28a745", function() {
            GM_setClipboard(actressName);
            this.innerText = "✅ Copiado!";
            setTimeout(() => this.innerText = "👤 Copiar Atriz", 1200);
        }));

        container.appendChild(createButton("🚀 Abrir Todos Mega", "#ff5722", openMegaLinks, "btn-mega-abrir"));

        titleElement.after(container);
    }

    window.addEventListener('load', addButtons);
    setTimeout(addButtons, 1500);
})();
