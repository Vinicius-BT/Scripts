// ==UserScript==
// @name         Deepnote Auto Click Delay 🖱
// @icon         https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://deepnote.com&size=64
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Clica no botão "Delay shutdown by 60 minutes", mostra notificação e toca som do Verstappen
// @match        https://deepnote.com/*
// @updateURL    https://raw.githubusercontent.com/Vinicius-BT/Script/refs/heads/main/Deepnote.js?token=GHSAT0AAAAAADDEJRXBMAYHLI5AFN5QP47A2AT7CGA
// @downloadURL  https://raw.githubusercontent.com/Vinicius-BT/Script/main/Deepnote.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Solicita permissão para notificações
    if (Notification.permission !== 'granted') {
        Notification.requestPermission();
    }

    // Áudio do Verstappen "tututudu"
    const audioDing = new Audio("https://www.myinstants.com/media/sounds/max-verstappen-tututudu.mp3");

    // Mostra notificação
    function showNotification() {
        if (Notification.permission === 'granted') {
            new Notification("🕒 Deepnote", {
                body: "Botão 'Delay shutdown by 60 minutes' clicado!",
                icon: 'https://deepnote.com/favicon.ico'
            });
        }
    }

    function clickDelayButton() {
        const buttons = document.querySelectorAll('button.chakra-button.css-vglqtv');
        for (const btn of buttons) {
            if (btn.textContent.trim() === 'Delay shutdown by 60 minutes') {
                console.log('Botão encontrado e clicado.');
                btn.click();
                audioDing.play().catch(err => console.error("Erro ao tocar áudio:", err));
                showNotification();
            }
        }
    }

    // Observa o DOM por mudanças
    const observer = new MutationObserver(() => {
        clickDelayButton();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Verifica também no carregamento inicial
    window.addEventListener('load', () => {
        setTimeout(clickDelayButton, 1000);
    });
})();
