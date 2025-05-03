// ==UserScript==
// @name         Deepnote Auto Click Delay Shutdown Final
// @icon         https://deepnote.com/favicon.ico
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Clica automaticamente no botão "Delay shutdown by 60 minutes" no Deepnote toda vez que ele aparecer
// @match        https://deepnote.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function clickDelayButton() {
        const buttons = document.querySelectorAll('button.chakra-button.css-vglqtv');
        for (const btn of buttons) {
            if (btn.textContent.trim() === 'Delay shutdown by 60 minutes') {
                console.log('Botão encontrado e clicado.');
                btn.click();
            }
        }
    }

    // Observador permanente para lidar com recriações do botão
    const observer = new MutationObserver(() => {
        clickDelayButton();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Verifica também imediatamente ao carregar
    window.addEventListener('load', () => {
        setTimeout(clickDelayButton, 1000); // pequeno atraso para garantir que tudo carregou
    });
})();
