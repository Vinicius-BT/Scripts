// ==UserScript==
// @name         Gravure Idol Video Blog (Sem Duplicados)
// @namespace    http://tampermonkey.net/
// @version      8.6
// @description  Correção de botões duplicados e melhoria na detecção de posts.
// @icon         https://baseec-img-mng.akamaized.net/images/user/logo/dde8cbaba8f25c311920bd2e0e13afd6.png
// @author       Gemini
// @match        *://ivworld.net/*
// @match        *://www.ivworld.net/*
// @match        *://xidol.net/*
// @match        *://x-idol.net/*
// @match        *://youiv.tv/*
// @grant        GM_setClipboard
// @grant        GM_openInTab
// @run-at       document-idle
// @updateURL    https://raw.githubusercontent.com/Vinicius-BT/Script/main/Gravure Idol Video Blog.user.js
// @downloadURL  https://raw.githubusercontent.com/Vinicius-BT/Script/main/Gravure Idol Video Blog.user.js
// ==/UserScript==

(function() {
    'use strict';

    const NYAA_BASE_URL = "https://nyaa.porn78.info/en/video/index?search=";
    const IVWORLD_SEARCH_URL = "https://ivworld.net/?s=";

    function copyTextToClipboard(text) {
        GM_setClipboard(text, 'text');
    }

    function createOriginalButton(text, icon, title, onClick) {
        const btn = document.createElement('button');
        btn.title = title;
        Object.assign(btn.style, {
            margin: '5px 8px 5px 0px',
            cursor: 'pointer',
            border: '2px solid #bbb',
            background: '#f8f9fa',
            borderRadius: '6px',
            padding: '12px 18px',
            fontSize: '14px',
            fontWeight: 'bold',
            verticalAlign: 'middle',
            minWidth: '130px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            color: '#333'
        });

        btn.innerHTML = `${icon} ${text}`;
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            onClick(btn);
        });
        return btn;
    }

    function addButtonToTitles() {
        // Seletores comuns de títulos
        const selectors = ['h1', 'h2.post-title', '.entry-title', '.post-title'];

        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                // Tenta encontrar o container do post para evitar duplicidade no mesmo bloco
                let entryWrapper = element.closest('article') || element.closest('.post') || element.closest('.entry') || element;
                
                if (entryWrapper.getAttribute('data-gm-processed')) return;
                if (element.closest('header') && selector === 'h1') return; // Ignora h1 do topo do site

                let originalTitle = element.innerText.trim();
                if (!originalTitle || originalTitle.length < 4) return;

                let cleanBase = originalTitle.replace(/^Permalink to\s*/i, '').trim();

                // --- LÓGICA DO CÓDIGO (ID) ---
                let searchId = "";
                const idMatch = cleanBase.match(/([A-Z0-9]+-[A-Z0-9]+)/i) || cleanBase.match(/([A-Z0-9]+-[0-9]+)/i);
                if (idMatch) searchId = idMatch[1].trim();

                // --- LÓGICA DA ATRIZ ---
                let actressName = "";
                let actressMatch = cleanBase.match(/(?:\]|\b)\s*([^–\-\/\[\(]+)\s*[–\-]/);
                if (actressMatch) actressName = actressMatch[1].trim();

                const container = document.createElement('div');
                container.className = "gm-button-container";
                container.style.cssText = 'display: block; margin: 15px 0; clear: both;';

                // 1. Botão Atriz
                if (actressName && actressName.length > 2) {
                    const btnActress = createOriginalButton('Atriz', '👤', `Copiar: ${actressName}`, (btn) => {
                        copyTextToClipboard(actressName);
                        btn.innerHTML = '✅ Copiado!';
                        setTimeout(() => { btn.innerHTML = '👤 Atriz'; }, 1200);
                    });
                    btnActress.style.background = '#e3f2fd';
                    container.appendChild(btnActress);
                }

                // 2. Botão Copiar Título
                container.appendChild(createOriginalButton('Copiar', '📋', 'Copiar título limpo', (btn) => {
                    let cleanedTitle = cleanBase.replace(/\s?\[(MP4|MKV|AVI|WMV)?\/?\d+(\.\d+)?\s?(GB|MB|px|p)\]$/i, '').trim();
                    copyTextToClipboard(cleanedTitle);
                    btn.innerHTML = '✅ Título!';
                    setTimeout(() => { btn.innerHTML = '📋 Copiar'; }, 1200);
                }));

                // 3. Botões de Busca
                if (searchId) {
                    const btnIV = createOriginalButton('IVWorld', '🔍', `Pesquisar ${searchId} no IVWorld`, () => {
                        GM_openInTab(`${IVWORLD_SEARCH_URL}${encodeURIComponent(searchId)}`);
                    });
                    btnIV.style.background = '#f1f8e9';
                    container.appendChild(btnIV);

                    const btnNyaa = createOriginalButton('Nyaa', '🔞', `Buscar ${searchId} no Nyaa`, () => {
                        GM_openInTab(`${NYAA_BASE_URL}${encodeURIComponent(searchId)}#gsc.tab=0`);
                    });
                    btnNyaa.style.background = '#ffebee';
                    container.appendChild(btnNyaa);
                }

                // Insere os botões e marca o WRAPPER como processado (bloqueia duplicatas)
                element.after(container);
                entryWrapper.setAttribute('data-gm-processed', 'true');
            });
        });
    }

    // Executa e observa mudanças na página
    addButtonToTitles();
    const observer = new MutationObserver(addButtonToTitles);
    observer.observe(document.body, { childList: true, subtree: true });

})();
