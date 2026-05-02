// ==UserScript==
// @name         Gravure Idols ferramentas unificadas
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  Botões de cópia (Atriz, Título, Caminho) e buscas integradas
// @author       Gemini
// @icon         https://baseec-img-mng.akamaized.net/images/user/logo/dde8cbaba8f25c311920bd2e0e13afd6.png
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
            fontFamily: 'sans-serif'
        });

        btn.innerHTML = icon ? `${icon} ${text}` : text;
        btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            onClick(btn);
        };
        return btn;
    }

    function handleYouIV() {
        const titleElement = document.querySelector('h1.ts') ||
                             document.querySelector('#thread_subject') ||
                             document.querySelector('.vwth h1') ||
                             document.querySelector('h1');

        if (titleElement && !titleElement.getAttribute('data-processed')) {
            const titleText = titleElement.innerText;
            const codeMatch = titleText.match(/([A-Z0-9]+-[A-Z0-9]+|(\d{5,}))/i);

            if (codeMatch && codeMatch[0]) {
                const code = codeMatch[0].toUpperCase();
                const container = document.createElement('div');
                container.style.cssText = 'display: block; margin: 15px 0; clear: both;';

                container.appendChild(createStyledButton('IVWorld', '🔍', `Pesquisar ${code}`, 'rgb(241, 248, 233)', () => {
                    window.open(`https://ivworld.net/?s=${encodeURIComponent(code)}`, '_blank');
                }));

                container.appendChild(createStyledButton('Nyaa', '🔞', `Buscar ${code}`, 'rgb(255, 235, 238)', () => {
                    GM_openInTab(`${NYAA_BASE_URL}${encodeURIComponent(code)}#gsc.tab=0`);
                }));

                titleElement.insertAdjacentElement('afterend', container);
                titleElement.setAttribute('data-processed', 'true');
            }
        }
    }

    function handleBlogs() {
        const selectors = ['h2.post-title a', '.entry-title', '.post-title'];
        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                let entryWrapper = element.closest('.entry.clearfix') || element.closest('.post, .entry');
                if (entryWrapper && entryWrapper.getAttribute('data-gm-processed')) return;

                let targetElement = element.tagName === 'A' ? element : element.querySelector('a') || element;
                let originalTitle = targetElement.innerText.trim();
                if (!originalTitle || originalTitle.length < 5) return;

                // --- LÓGICA DE LIMPEZA ---
                let cleanedTitle = originalTitle
                    .replace(/^Permalink to\s*/i, '')
                    .replace(/\//g, ' - ') // Troca barra por traço
                    .replace(/\s?\[(MP4|MKV|AVI|WMV|720p|1080p|2160p|4K).{1,15}\]$/i, '') 
                    .trim();

                let searchId = "";
                const idMatch = originalTitle.match(/\[?([A-Z0-9]+-[A-Z0-9]+|(\d{5,}))\]?/i);
                if (idMatch) searchId = idMatch[1].trim();

                let actressName = "";
                let actressMatch = originalTitle.match(/\]\s*([^–\-\/\[\(]+)/);
                if (actressMatch && actressMatch[1]) {
                    actressName = actressMatch[1].trim();
                } else {
                    actressName = "Desconhecida";
                }

                const container = document.createElement('div');
                container.style.cssText = 'display: block; margin: 15px 0; clear: both;';

                // Botão: Atriz
                if (actressName !== "Desconhecida") {
                    container.appendChild(createStyledButton('Atriz', '👤', `Copiar: ${actressName}`, '#e3f2fd', (btn) => {
                        copyTextToClipboard(actressName);
                        btn.innerHTML = '✅ Copiado!';
                        setTimeout(() => { btn.innerHTML = '👤 Atriz'; }, 1200);
                    }));
                }

                // Botão: Título
                container.appendChild(createStyledButton('Copiar', '📋', 'Copiar título limpo', '#f8f9fa', (btn) => {
                    copyTextToClipboard(cleanedTitle);
                    btn.innerHTML = '✅ Título!';
                    setTimeout(() => { btn.innerHTML = '📋 Copiar'; }, 1200);
                }));

                // Botão: Caminho (NOVO)
                container.appendChild(createStyledButton('Caminho', '📂', 'Copiar caminho de download', '#fff3e0', (btn) => {
                    const fullPath = `/work/Downloads/${actressName}/${cleanedTitle}`;
                    copyTextToClipboard(fullPath);
                    btn.innerHTML = '✅ Caminho!';
                    setTimeout(() => { btn.innerHTML = '📂 Caminho'; }, 1200);
                }));

                // Botões de Busca
                if (searchId) {
                    container.appendChild(createStyledButton('Site', '🔍', `Pesquisar código: ${searchId}`, null, () => {
                        window.open(`${window.location.origin}/?s=${encodeURIComponent(searchId)}`, '_blank');
                    }));

                    container.appendChild(createStyledButton('Nyaa', '🔞', `Buscar no Nyaa: ${searchId}`, '#ffebee', () => {
                        GM_openInTab(`${NYAA_BASE_URL}${encodeURIComponent(searchId)}#gsc.tab=0`);
                    }));
                }

                targetElement.parentNode.insertBefore(container, targetElement.nextSibling);
                if (entryWrapper) entryWrapper.setAttribute('data-gm-processed', 'true');
            });
        });
    }

    function init() {
        if (window.location.hostname.includes('youiv.tv')) {
            handleYouIV();
        } else {
            handleBlogs();
        }
    }

    init();
    const observer = new MutationObserver(init);
    observer.observe(document.body, { childList: true, subtree: true });

})();
