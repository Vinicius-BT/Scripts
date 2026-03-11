// ==UserScript==
// @name         Gravure Idol Video Blog
// @namespace    http://tampermonkey.net/
// @version      8.4
// @description  Pesquisa apenas o código (ex: MMR-AZ015) sem os colchetes [].
// @icon         https://baseec-img-mng.akamaized.net/images/user/logo/dde8cbaba8f25c311920bd2e0e13afd6.png
// @author       Gemini
// @match        *://ivworld.net/*
// @match        *://www.ivworld.net/*
// @match        *://xidol.net/*
// @match        *://x-idol.net/*
// @grant        GM_setClipboard
// @grant        GM_openInTab
// @run-at       document-idle
// @updateURL    https://raw.githubusercontent.com/Vinicius-BT/Script/main/Gravure Idol Video Blog.user.js
// @downloadURL  https://raw.githubusercontent.com/Vinicius-BT/Script/main/Gravure Idol Video Blog.user.js
// ==/UserScript==

(function() {
    'use strict';

    const NYAA_BASE_URL = "https://nyaa.porn78.info/en/video/index?search=";

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
        const selectors = ['h2.post-title a', '.entry-title', '.post-title'];

        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                let entryWrapper = element.closest('.entry.clearfix') || element.closest('.post, .entry');
                if (entryWrapper && entryWrapper.getAttribute('data-gm-processed')) return;

                let targetElement = element.tagName === 'A' ? element : element.querySelector('a') || element;
                let originalTitle = targetElement.innerText.trim();
                if (!originalTitle || originalTitle.length < 5) return;

                let cleanBase = originalTitle.replace(/^Permalink to\s*/i, '').trim();

                // --- LÓGICA DO CÓDIGO (ID) SEM COLCHETES ---
                // Esta regex procura especificamente o padrão dentro de [] ou solto, mas captura apenas o conteúdo interno
                let searchId = "";
                const idMatch = cleanBase.match(/\[?([A-Z0-9]+-[A-Z0-9]+)\]?/i) || cleanBase.match(/([A-Z0-9]+-[0-9]+)/i);

                if (idMatch) {
                    searchId = idMatch[1].trim(); // Pega apenas o grupo 1 (o que está dentro, sem os [])
                }

                // --- LÓGICA DA ATRIZ ---
                let actressName = "";
                let actressMatch = cleanBase.match(/\]\s*([^–\-\/\[\(]+)/);
                if (actressMatch && actressMatch[1]) {
                    actressName = actressMatch[1].trim();
                }

                // --- LIMPEZA DO TÍTULO ---
                let cleanedTitle = cleanBase.replace(/\s?\[(MP4|MKV|AVI|WMV)?\/?\d+(\.\d+)?\s?(GB|MB|px|p)\]$/i, '').trim();

                const container = document.createElement('div');
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
                container.appendChild(createOriginalButton('Copiar', '📋', 'Copiar título', (btn) => {
                    copyTextToClipboard(cleanedTitle);
                    btn.innerHTML = '✅ Título!';
                    setTimeout(() => { btn.innerHTML = '📋 Copiar'; }, 1200);
                }));

                // 3. Botões de Busca (Apenas se o Código for encontrado)
                if (searchId) {
                    const btnSite = createOriginalButton('Site', '🔍', `Pesquisar código: ${searchId}`, () => {
                        window.open(`${window.location.origin}/?s=${encodeURIComponent(searchId)}`, '_blank');
                    });
                    container.appendChild(btnSite);

                    const btnNyaa = createOriginalButton('Nyaa', '🔞', `Buscar código no Nyaa: ${searchId}`, () => {
                        GM_openInTab(`${NYAA_BASE_URL}${encodeURIComponent(searchId)}#gsc.tab=0`);
                    });
                    btnNyaa.style.background = '#ffebee';
                    container.appendChild(btnNyaa);
                }

                targetElement.parentNode.insertBefore(container, targetElement.nextSibling);
                if (entryWrapper) entryWrapper.setAttribute('data-gm-processed', 'true');
            });
        });
    }

    addButtonToTitles();
    const observer = new MutationObserver(addButtonToTitles);
    observer.observe(document.body, { childList: true, subtree: true });

})();
