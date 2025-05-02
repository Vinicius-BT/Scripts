// ==UserScript==
// @name         Deepnote Auto Click Delay + Notification
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Clica no botão "Delay shutdown by 60 minutes" e mostra notificação
// @match        https://deepnote.com/*
// @icon         https://deepnote.com/favicon.ico
// @updateURL    https://raw.githubusercontent.com/Vinicius-BT/Script/main/Deepnote.js
// @downloadURL  https://raw.githubusercontent.com/Vinicius-BT/Script/main/Deepnote.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Solicita permissão para notificações
    if (Notification.permission !== 'granted') {
        Notification.requestPermission();
    }

    // Mostra notificação
    function showNotification() {
        if (Notification.permission === 'granted') {
            new Notification("🕒 Deepnote", {
                body: "Botão 'Delay shutdown by 60 minutes' clicado!",
                icon: 'https://deepnote.com/favicon.ico'
            });
        }
    }

    // Clica no botão de delay
    function clickDelayButton() {
        const buttons = document.querySelectorAll('button.chakra-button.css-vglqtv');
        for (const btn of buttons) {
            if (btn.textContent.trim() === 'Delay shutdown by 60 minutes') {
                console.log('✅ Botão encontrado e clicado.');
                btn.click();
                showNotification();
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
