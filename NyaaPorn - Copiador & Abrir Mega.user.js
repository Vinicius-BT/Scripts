// ==UserScript==
// @name         Gravure Idols ferramentas unificadas
// @namespace    http://tampermonkey.net/
// @version      1.7
// @description  Botões Atriz, Título, Caminho e Buscas (Correção de exibição)
// @author       Gemini
// @icon https://baseec-img-mng.akamaized.net/images/user/logo/dde8cbaba8f25c311920bd2e0e13afd6.png
// @match        *://youiv.tv/*
// @match        *://ivworld.net/*
// @match        *://www.ivworld.net/*
// @match        *://xidol.net/*
// @match        *://x-idol.net/*
// @grant        GM_setClipboard
// @grant        GM_openInTab
// @run-at       document-idle
// @updateURL    https://raw.githubusercontent.com/Vinicius-BT/Scripts/main/Gravure Idol Video Blog sites.user.js
// @downloadURL  https://raw.githubusercontent.com/Vinicius-BT/Scripts/main/Gravure Idol Video Blog sites.user.js
// ==/UserScript==

(function() {
    'use strict';

    const NYAA_BASE_URL = "https://nyaa.porn78.info/en/video/index?search=";

    function copyTextToClipboard(text) {
        GM_setClipboard(text, 'text');
    }

    function createStyledButton(text, icon, title, bg, onClick) {
        const btn = document.createElement('button');
        btn.title = title;
        Object.assign(btn.style, {
            margin: '5px 8px 5px 0px',
            cursor: 'pointer',
            border: '2px solid #bbb',
            background: bg || '#f8f9fa',
            borderRadius: '6px',
            padding: '12px 18px',
            fontSize: '14px',
            fontWeight: 'bold',
            verticalAlign: 'middle',
            minWidth: '130px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            color: '#333',
            fontFamily: 'sans-serif',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
        });

        btn.innerHTML = icon ? `<span style="margin-right:8px">${icon}</span> ${text}` : text;
        btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            onClick(btn);
        };
        return btn;
    }

    function handleBlogs() {
        const selectors = ['h2.post-title a', '.entry-title', '.post-title', 'h1.entry-title'];
        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                // Evita duplicados
                if (element.hasAttribute('data-gm-processed') || element.parentElement.querySelector('.gm-container')) return;
                element.setAttribute('data-gm-processed', 'true');

                let originalTitle = element.innerText.trim();
                if (!originalTitle || originalTitle.length < 5) return;

                // --- LÓGICA DE LIMPEZA ---
                let cleanedTitle = originalTitle
                    .replace(/^Permalink to\s*/i, '')
                    .replace(/\//g, ' - ')
                    .replace(/\s?\[(MP4|MKV|AVI|WMV|720p|1080p|2160p|4K).{1,15}\]$/i, '') 
                    .trim();

                let searchId = "";
                const idMatch = originalTitle.match(/\[?([A-Z0-9]+-[A-Z0-9]+|(\d{5,}))\]?/i);
                if (idMatch) searchId = idMatch[1].trim();

                let actressName = "";
                let actressMatch = originalTitle.match(/\]\s*([^–\-\/\[\(]+)/);
                actressName = (actressMatch && actressMatch[1]) ? actressMatch[1].trim() : "Desconhecida";

                // Container dos botões
                const container = document.createElement('div');
                container.className = 'gm-container';
                container.style.cssText = 'display: flex; flex-wrap: wrap; margin: 15px 0; gap: 5px; clear: both;';

                // 1. Botão Atriz
                if (actressName !== "Desconhecida") {
                    container.appendChild(createStyledButton('Atriz', '👤', `Copiar: ${actressName}`, '#e3f2fd', (btn) => {
                        copyTextToClipboard(actressName);
                        btn.innerHTML = '✅ Copiado!';
                        setTimeout(() => { btn.innerHTML = '👤 Atriz'; }, 1200);
                    }));
                }

                // 2. Botão Título
                container.appendChild(createStyledButton('Copiar', '📋', 'Copiar título limpo', '#f8f9fa', (btn) => {
                    copyTextToClipboard(cleanedTitle);
                    btn.innerHTML = '✅ Título!';
                    setTimeout(() => { btn.innerHTML = '📋 Copiar'; }, 1200);
                }));

                // 3. Botão Caminho
                container.appendChild(createStyledButton('Caminho', '📂', 'Copiar caminho /work/Downloads/...', '#fff3e0', (btn) => {
                    const fullPath = `/work/Downloads/${actressName}/${cleanedTitle}`;
                    copyTextToClipboard(fullPath);
                    btn.innerHTML = '✅ Caminho!';
                    setTimeout(() => { btn.innerHTML = '📂 Caminho'; }, 1200);
                }));

                // 4. Botões de Busca
                if (searchId) {
                    container.appendChild(createStyledButton('Site', '🔍', `Buscar: ${searchId}`, null, () => {
                        window.open(`${window.location.origin}/?s=${encodeURIComponent(searchId)}`, '_blank');
                    }));
                    container.appendChild(createStyledButton('Nyaa', '🔞', `Nyaa: ${searchId}`, '#ffebee', () => {
                        GM_openInTab(`${NYAA_BASE_URL}${encodeURIComponent(searchId)}#gsc.tab=0`);
                    }));
                }

                // Insere logo após o título
                element.insertAdjacentElement('afterend', container);
            });
        });
    }

    // Inicialização
    function run() {
        handleBlogs();
    }

    run();
    // Observador para carregar em sites com scroll infinito ou carregamento dinâmico
    const observer = new MutationObserver(() => run());
    observer.observe(document.body, { childList: true, subtree: true });

})();
