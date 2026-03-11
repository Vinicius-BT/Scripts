// ==UserScript==
// @name         Gravure Idol Video Blog
// @namespace    http://tampermonkey.net/
// @version      8.5
// @description  Suporte para YouIV.tv + Pesquisa de código limpo no IVWorld e Nyaa.
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
        // Adicionado h1 para compatibilidade com youiv.tv
        const selectors = ['h1', 'h2.post-title a', '.entry-title', '.post-title'];

        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                // Evita processar o mesmo elemento ou elementos irrelevantes (como o logo)
                if (element.getAttribute('data-gm-processed')) return;
                if (element.closest('header') && selector === 'h1') return; 

                let originalTitle = element.innerText.trim();
                if (!originalTitle || originalTitle.length < 4) return;

                let cleanBase = originalTitle.replace(/^Permalink to\s*/i, '').trim();

                // --- LÓGICA DO CÓDIGO (ID) ---
                let searchId = "";
                // Regex melhorada para pegar códigos tipo OME-518 ou MMR-AZ015
                const idMatch = cleanBase.match(/([A-Z0-9]+-[A-Z0-9]+)/i) || cleanBase.match(/([A-Z0-9]+-[0-9]+)/i);

                if (idMatch) {
                    searchId = idMatch[1].trim();
                }

                // --- LÓGICA DA ATRIZ (Apenas se houver separador) ---
                let actressName = "";
                let actressMatch = cleanBase.match(/(?:\]|\b)\s*([^–\-\/\[\(]+)\s*[–\-]/);
                if (actressMatch) {
                    actressName = actressMatch[1].trim();
                }

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

                // 2. Botão Copiar Título (Útil em todos os sites)
                container.appendChild(createOriginalButton('Copiar', '📋', 'Copiar título limpo', (btn) => {
                    let cleanedTitle = cleanBase.replace(/\s?\[(MP4|MKV|AVI|WMV)?\/?\d+(\.\d+)?\s?(GB|MB|px|p)\]$/i, '').trim();
                    copyTextToClipboard(cleanedTitle);
                    btn.innerHTML = '✅ Título!';
                    setTimeout(() => { btn.innerHTML = '📋 Copiar'; }, 1200);
                }));

                // 3. Botões de Busca Baseados no Código
                if (searchId) {
                    // Botão para pesquisar no IVWorld (mesmo estando no YouIV)
                    const btnIV = createOriginalButton('IVWorld', '🔍', `Pesquisar ${searchId} no IVWorld`, () => {
                        GM_openInTab(`${IVWORLD_SEARCH_URL}${encodeURIComponent(searchId)}`);
                    });
                    btnIV.style.background = '#f1f8e9'; // Verde suave
                    btnIV.style.borderColor = '#c5e1a5';
                    container.appendChild(btnIV);

                    // Botão Nyaa
                    const btnNyaa = createOriginalButton('Nyaa', '🔞', `Buscar ${searchId} no Nyaa`, () => {
                        GM_openInTab(`${NYAA_BASE_URL}${encodeURIComponent(searchId)}#gsc.tab=0`);
                    });
                    btnNyaa.style.background = '#ffebee';
                    btnNyaa.style.borderColor = '#ef9a9a';
                    container.appendChild(btnNyaa);
                }

                element.parentNode.insertBefore(container, element.nextSibling);
                element.setAttribute('data-gm-processed', 'true');
            });
        });
    }

    addButtonToTitles();
    const observer = new MutationObserver(addButtonToTitles);
    observer.observe(document.body, { childList: true, subtree: true });

})();
