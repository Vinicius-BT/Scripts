// ==UserScript==
// @name         Deepnote Auto Click Delay
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Clica no botão "Delay shutdown by 60 minutes"
// @match        https://deepnote.com/*
// @icon         https://deepnote.com/favicon.ico
// @updateURL    https://raw.githubusercontent.com/Vinicius-BT/Script/main/Deepnote.js
// @downloadURL  https://raw.githubusercontent.com/Vinicius-BT/Script/main/Deepnote.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Clica no botão de delay
    function clickDelayButton() {
        const buttons = document.querySelectorAll('button.chakra-button.css-vglqtv');
        for (const btn of buttons) {
            if (btn.textContent.trim() === 'Delay shutdown by 60 minutes') {
                console.log('✅ Botão encontrado e clicado.');
                btn.click();
            }
        }
    }

    // Observa mudanças no DOM
    const observer = new MutationObserver(() => {
        clickDelayButton();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Verifica também no carregamento da página
    window.addEventListener('load', () => {
        setTimeout(clickDelayButton, 1000);
    });
})();
