// ==UserScript==
// @name         Deepnote Auto Click Delay
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Clica no botão "Delay shutdown by 60 minutes", mostra notificação e toca som do Verstappen (opcional)
// @match        https://deepnote.com/*
// @icon         https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://deepnote.com&size=64
// @updateURL    https://raw.githubusercontent.com/Vinicius-BT/Script/main/Deepnote.js
// @downloadURL  https://raw.githubusercontent.com/Vinicius-BT/Script/main/Deepnote.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function () {
    'use strict';

    // Solicita permissão para notificações
    if (Notification.permission !== 'granted') {
        Notification.requestPermission();
    }

    // Áudio do Verstappen
    const audioDing = new Audio("https://www.myinstants.com/media/sounds/max-verstappen-tututudu.mp3");

    // Estado do som (padrão: true)
    let soundEnabled = GM_getValue("soundEnabled", true);

    // Função para alternar o som via menu
    function toggleSound() {
        soundEnabled = !soundEnabled;
        GM_setValue("soundEnabled", soundEnabled);
        alert(`🔊 Som das notificações ${soundEnabled ? 'ativado' : 'desativado'}!`);
    }

    // Registra o comando no menu do Tampermonkey
    GM_registerMenuCommand(`🔈 ${soundEnabled ? 'Desativar' : 'Ativar'} som da notificação`, toggleSound);

    // Mostra a notificação
    function showNotification() {
        if (Notification.permission === 'granted') {
            new Notification("🕒 Deepnote", {
                body: "Botão 'Delay shutdown by 60 minutes' clicado!",
                icon: 'https://deepnote.com/favicon.ico'
            });
        }
    }

    // Clica no botão
    function clickDelayButton() {
        const buttons = document.querySelectorAll('button.chakra-button.css-vglqtv');
        for (const btn of buttons) {
            if (btn.textContent.trim() === 'Delay shutdown by 60 minutes') {
                console.log('✅ Botão encontrado e clicado.');
                btn.click();
                if (soundEnabled) {
                    playAudio();
                }
                showNotification();
            }
        }
    }

    // Toca o som
    function playAudio() {
        audioDing.play().catch(err => console.error("🔈 Erro ao tocar áudio:", err));
    }

    // Observador do DOM
    const observer = new MutationObserver(() => {
        clickDelayButton();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Verificação inicial
    window.addEventListener('load', () => {
        setTimeout(clickDelayButton, 1000);
    });
})();
