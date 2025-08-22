// ==UserScript==
// @name         WPlace salvar localizações
// @namespace    https://wplace.live/
// @icon         https://wplace.live/favicon.ico
// @version      1.0
// @description  Permite adicionar, editar, ordenar (menu com 2 opções, alternando ordem), fechar painel, pesquisar, importar/exportar/limpar, com upload de imagem e exportação no formato dd-mm-yyyy_wplace.json (importa qualquer .json e grava em wplace_saves)
// @author       Vinicius Bortoluzzi
// @match        https://wplace.live/*
// @updateURL    https://raw.githubusercontent.com/Vinicius-BT/Script/main/WPlace salvar localizações.user.js
// @downloadURL  https://raw.githubusercontent.com/Vinicius-BT/Script/main/WPlace salvar localizações.user.js
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    const STORAGE_KEY = 'wplace_saves';
    let sortBy = 'date'; // 'title' ou 'date'
    let sortOrder = 'desc'; // 'asc' ou 'desc'

    // --- Toast (notificação leve) ---
    function showToast(msg) {
        let el = document.getElementById('wplace-toast');
        if (!el) {
            el = document.createElement('div');
            el.id = 'wplace-toast';
            document.body.appendChild(el);
        }
        el.textContent = msg;
        el.classList.add('show');
        setTimeout(() => el.classList.remove('show'), 2200);
    }

    // Carrega dados salvos com fallback
    function loadSaves() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return JSON.parse(data || '[]');
        } catch (e) {
            console.error('Erro ao carregar salvos:', e);
            localStorage.removeItem(STORAGE_KEY);
            return [];
        }
    }

    // Salva link, título e imagem
    function saveData(title, link, imgSrc = '', isEdit = false, oldLink = null) {
        if (!link || !title) {
            alert('Por favor, preencha o título e o link.');
            return false;
        }
        const saves = loadSaves();
        if (isEdit && oldLink) {
            const index = saves.findIndex(item => item.link === oldLink);
            if (index !== -1) {
                saves[index] = { title, link, img: imgSrc, time: new Date().toISOString() };
            } else {
                alert('Erro: Item a editar não encontrado.');
                return false;
            }
        } else if (!saves.some(item => item.link === link)) {
            saves.push({ title, link, img: imgSrc, time: new Date().toISOString() });
        } else {
            alert('Este link já está salvo.');
            return false;
        }
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
            renderPanel();
            showToast('✅ Link salvo');
            return true;
        } catch (e) {
            console.error('Erro ao salvar no localStorage:', e);
            alert('Erro ao salvar os dados. Pode ser que o localStorage esteja cheio.');
            return false;
        }
    }

    // Remove item da lista
    function removeItem(link) {
        const saves = loadSaves();
        const updatedSaves = saves.filter(item => item.link !== link);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSaves));
            renderPanel();
            showToast('🗑️ Item removido');
        } catch (e) {
            console.error('Erro ao remover item:', e);
            alert('Erro ao remover o item.');
        }
    }

    // Cria painel lateral (estrutura original preservada)
    const panel = document.createElement('div');
    panel.id = 'wplace-panel';
    panel.innerHTML = `
        <div class="wplace-header">
            <h2>📌 Links Salvos</h2>
            <button id="wplace-close-panel">✕</button>
        </div>
        <div class="wplace-import-export">
            <button id="wplace-export-btn" title="Exportar">📤 Exportar</button>
            <button id="wplace-import-btn" title="Importar">📥 Importar</button>
            <button id="wplace-clear" title="Limpar Tudo">🗑️</button>
            <input id="wplace-import-file" type="file" accept=".json" style="display: none;">
        </div>
        <input id="wplace-search" type="text" placeholder="Pesquisar por título ou link">
        <div class="wplace-controls">
            <button id="wplace-toggle-form">➕ Adicionar</button>
            <div class="wplace-sort-container">
                <button id="wplace-sort-btn">🔽</button>
                <div id="wplace-sort-menu" class="wplace-sort-menu" style="display: none;">
                    <button data-sort="title">⬆ Nome</button>
                    <button data-sort="date">⬆ Data</button>
                </div>
            </div>
        </div>
        <div id="wplace-form" style="display: none;">
            <input id="wplace-title-input" type="text" placeholder="Digite o título">
            <input id="wplace-link-input" type="text" placeholder="Cole o link aqui">
            <input id="wplace-img-input" type="text" placeholder="Cole o URL da imagem ou use Ctrl+V">
            <input id="wplace-img-upload" type="file" accept="image/*">
            <div id="wplace-img-preview" style="display: none;"><img id="wplace-img-preview-img"></div>
            <div class="wplace-form-buttons">
                <button id="wplace-save-btn">Salvar</button>
                <button id="wplace-cancel-btn">Cancelar</button>
            </div>
        </div>
        <div id="wplace-list"></div>
        <div id="wplace-modal" style="display: none;">
            <span id="wplace-modal-close">&times;</span>
            <img id="wplace-modal-img">
        </div>
    `;
    document.body.appendChild(panel);

    // Renderiza itens salvos com filtro e ordenação
    function renderPanel(filter = '') {
        const list = document.getElementById('wplace-list');
        if (!list) {
            alert('Erro: Elemento da lista não encontrado.');
            return;
        }
        list.innerHTML = '';
        const saves = loadSaves();
        const filteredSaves = filter
            ? saves.filter(item =>
                  item.title.toLowerCase().includes(filter.toLowerCase()) ||
                  item.link.toLowerCase().includes(filter.toLowerCase())
              )
            : saves;
        const sortedSaves = filteredSaves.sort((a, b) => {
            if (sortBy === 'title') {
                const comparison = a.title.localeCompare(b.title);
                return sortOrder === 'asc' ? comparison : -comparison;
            } else {
                const dateA = new Date(a.time);
                const dateB = new Date(b.time);
                if (isNaN(dateA) || isNaN(dateB)) return 0;
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            }
        });
        if (sortedSaves.length === 0 && filter) {
            list.innerHTML = '<p class="wplace-no-results">Nenhum resultado encontrado 😕</p>';
        } else {
            sortedSaves.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'wplace-item';
                itemDiv.innerHTML = `
                    <p>
                        <a href="${item.link}" target="_blank">${item.title}</a>
                        <button class="wplace-edit-btn" data-link="${item.link}">✎</button>
                        <button class="wplace-remove-btn" data-link="${item.link}">✕</button>
                        <br><small>${new Date(item.time).toLocaleString('pt-BR')}</small>
                    </p>
                    ${item.img ? `<img src="${item.img}" class="wplace-thumb">` : ''}
                `;
                if (item.img) {
                    itemDiv.querySelector('img').onclick = () => {
                        const modalImg = document.getElementById('wplace-modal-img');
                        modalImg.src = item.img;
                        modalImg.style.transform = 'scale(1)';
                        document.getElementById('wplace-modal').style.display = 'flex';
                    };
                }
                itemDiv.querySelector('.wplace-remove-btn').onclick = () => removeItem(item.link);
                itemDiv.querySelector('.wplace-edit-btn').onclick = () => {
                    document.getElementById('wplace-title-input').value = item.title;
                    document.getElementById('wplace-link-input').value = item.link;
                    document.getElementById('wplace-img-input').value = item.img || '';
                    document.getElementById('wplace-img-upload').value = '';
                    if (item.img) {
                        const previewImg = document.getElementById('wplace-img-preview-img');
                        previewImg.src = item.img;
                        document.getElementById('wplace-img-preview').style.display = 'block';
                    } else {
                        document.getElementById('wplace-img-preview').style.display = 'none';
                    }
                    document.getElementById('wplace-form').style.display = 'block';
                    document.getElementById('wplace-save-btn').dataset.editLink = item.link;
                };
                list.appendChild(itemDiv);
            });
        }
    }

    // Estilos CSS (inclui botão no lado direito)
    GM_addStyle(`
        #wplace-panel {
            position: fixed;
            top: 0;
            left: -450px;
            width: 450px;
            height: 100%;
            background: #f5f7fa;
            border-right: 2px solid #dfe6e9;
            z-index: 9999;
            padding: 20px;
            overflow-y: auto;
            transition: left 0.3s ease;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        #wplace-panel.open { left: 0; }
        .wplace-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        #wplace-panel h2 {
            margin: 0;
            font-size: 1.4em;
            color: #2d3436;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        #wplace-close-panel {
            background: #ff4d4f;
            color: white;
            border: none;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            cursor: pointer;
            font-size: 18px;
            line-height: 30px;
            text-align: center;
            transition: background 0.2s;
        }
        #wplace-close-panel:hover { background: #d9363e; }

        .wplace-import-export {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
        }
        #wplace-export-btn, #wplace-import-btn, #wplace-clear {
            background: #0084ff;
            color: white;
            border: none;
            padding: 8px;
            cursor: pointer;
            border-radius: 6px;
            font-size: 14px;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
        }
        #wplace-clear { background: #ff4d4f; }
        #wplace-export-btn:hover, #wplace-import-btn:hover { background: #0066cc; }
        #wplace-clear:hover { background: #d9363e; }

        #wplace-search {
            width: 100%;
            padding: 10px;
            border: 1px solid #dfe6e9;
            border-radius: 6px;
            font-size: 14px;
            background: #f8f9fa;
            margin-bottom: 15px;
            transition: border-color 0.2s;
        }
        #wplace-search:focus { border-color: #0084ff; outline: none; }

        .wplace-controls { display: flex; gap: 10px; margin-bottom: 15px; }
        #wplace-toggle-form {
            background: #0084ff; color: white; border: none; padding: 10px; cursor: pointer;
            border-radius: 6px; font-size: 14px; flex: 1; transition: background 0.2s;
        }
        #wplace-toggle-form:hover { background: #0066cc; }

        .wplace-sort-container { position: relative; width: 40px; }
        #wplace-sort-btn {
            background: #0084ff; color: white; border: none; padding: 8px; cursor: pointer;
            border-radius: 6px; font-size: 14px; width: 40px; height: 40px; display: flex;
            align-items: center; justify-content: center; transition: background 0.2s;
        }
        #wplace-sort-btn:hover { background: #0066cc; }
        .wplace-sort-menu {
            position: absolute; top: 45px; right: 0; background: #fff; border: 1px solid #dfe6e9;
            border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); z-index: 10000; width: 220px;
        }
        .wplace-sort-menu button {
            display: block; width: 100%; padding: 10px; border: none; background: none; text-align: left;
            font-size: 14px; color: #2d3436; cursor: pointer; transition: background 0.2s;
        }
        .wplace-sort-menu button:hover { background: #f8f9fa; }

        #wplace-form {
            margin-bottom: 20px; display: flex; flex-direction: column; gap: 10px; background: #fff;
            padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        #wplace-title-input, #wplace-link-input, #wplace-img-input, #wplace-img-upload {
            padding: 10px; border: 1px solid #dfe6e9; border-radius: 6px; font-size: 14px; background: #f8f9fa;
            transition: border-color 0.2s;
        }
        #wplace-title-input:focus, #wplace-link-input:focus, #wplace-img-input:focus, #wplace-img-upload:focus {
            border-color: #0084ff; outline: none;
        }
        #wplace-img-preview { margin-top: 10px; }
        #wplace-img-preview-img {
            max-width: 100%; max-height: 100px; border-radius: 6px; border: 1px solid #dfe6e9;
        }
        .wplace-form-buttons { display: flex; gap: 10px; }
        #wplace-save-btn, #wplace-cancel-btn {
            flex: 1; padding: 10px; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; transition: background 0.2s;
        }
        #wplace-save-btn { background: #0084ff; color: white; }
        #wplace-save-btn:hover { background: #0066cc; }
        #wplace-cancel-btn { background: #dfe6e9; color: #2d3436; }
        #wplace-cancel-btn:hover { background: #ced4da; }

        .wplace-item {
            margin-bottom: 15px; background: #fff; padding: 10px; border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05); position: relative;
        }
        .wplace-item a { color: #0084ff; text-decoration: none; font-weight: 500; }
        .wplace-item a:hover { text-decoration: underline; }
        .wplace-thumb { width: 80px; cursor: pointer; border: 1px solid #dfe6e9; border-radius: 6px; margin-top: 5px; }
        .wplace-remove-btn, .wplace-edit-btn {
            position: absolute; top: 10px; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer;
            font-size: 14px; line-height: 24px; text-align: center; transition: background 0.2s;
        }
        .wplace-remove-btn { right: 10px; background: #ff4d4f; color: white; }
        .wplace-remove-btn:hover { background: #d9363e; }
        .wplace-edit-btn { right: 40px; background: #ffaa00; color: white; }
        .wplace-edit-btn:hover { background: #cc8800; }

        /* 📌 Botão fixo no LADO DIREITO (centralizado verticalmente) */
        #wplace-btn {
            position: fixed;
            top: 50%;
            right: 12px;
            transform: translateY(-50%);
            width: 48px;
            height: 48px;
            background: #0084ff;
            color: white;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            font-size: 24px;
            z-index: 2147483646; /* bem acima */
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            transition: background 0.2s;
        }
        #wplace-btn:hover { background: #0066cc; }

        #wplace-modal {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex; align-items: center; justify-content: center; z-index: 10001;
        }
        #wplace-modal-img { max-width: 90%; max-height: 90%; border-radius: 8px; transition: transform 0.1s; }
        #wplace-modal-close {
            position: absolute; top: 20px; right: 30px; color: white; font-size: 36px; cursor: pointer; transition: color 0.2s;
        }
        #wplace-modal-close:hover { color: #dfe6e9; }

        .wplace-no-results { color: #2d3436; font-size: 14px; text-align: center; padding: 10px; }

        /* Toast */
        #wplace-toast {
            position: fixed; right: 70px; top: 20px; padding: 10px 14px; background: #111;
            color: #fff; border-radius: 8px; font-size: 14px; opacity: 0; pointer-events: none;
            transform: translateY(-8px); transition: opacity .2s, transform .2s; z-index: 2147483647;
        }
        #wplace-toast.show { opacity: 0.95; transform: translateY(0); }
    `);

    // Injeta botão 📌 (estrutura original preservada)
    function injectButton() {
        const target = document.querySelector(
            'nav:not([class*="dropdown"]), aside:not([class*="dropdown"]), [class*="sidebar"]:not([class*="dropdown"]), [class*="navigation"]:not([class*="dropdown"])'
        );
        if (target && !document.getElementById('wplace-btn')) {
            const btn = document.createElement('button');
            btn.id = 'wplace-btn';
            btn.innerText = '📌';
            btn.title = 'Abrir links salvos';
            btn.onclick = () => {
                panel.classList.toggle('open');
                renderPanel();
            };
            target.appendChild(btn);
        } else if (!target && !document.getElementById('wplace-btn')) {
            // Fallback: injeta no body (sem estilos inline para não sobrescrever o CSS fixo do lado direito)
            const btn = document.createElement('button');
            btn.id = 'wplace-btn';
            btn.innerText = '📌';
            btn.title = 'Abrir links salvos';
            btn.onclick = () => {
                panel.classList.toggle('open');
                renderPanel();
            };
            document.body.appendChild(btn);
        }
    }

    // Tenta injetar botão com fallback e observador de mutações
    function tryInjectButton() {
        injectButton();
        if (!document.getElementById('wplace-btn')) {
            setTimeout(injectButton, 3000);
        }
        const observer = new MutationObserver(() => {
            if (!document.getElementById('wplace-btn')) {
                injectButton();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        setInterval(() => {
            if (!document.getElementById('wplace-btn')) {
                injectButton();
            }
        }, 5000);
    }

    // Adiciona ou edita item
    function addItem(title, link, imgSrc, isEdit = false, oldLink = null) {
        if (imgSrc && imgSrc.startsWith('blob:')) {
            fetch(imgSrc)
                .then(response => {
                    if (!response.ok) throw new Error('Resposta inválida ao converter blob');
                    return response.blob();
                })
                .then(blob => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const dataUrl = reader.result;
                        if (saveData(title, link, dataUrl, isEdit, oldLink)) {
                            resetForm();
                        }
                    };
                    reader.onerror = () => {
                        alert('Erro ao processar a imagem. Salvando sem imagem.');
                        if (saveData(title, link, '', isEdit, oldLink)) {
                            resetForm();
                        }
                    };
                    reader.readAsDataURL(blob);
                })
                .catch(() => {
                    alert('Erro ao processar a imagem. Salvando sem imagem.');
                    if (saveData(title, link, '', isEdit, oldLink)) {
                        resetForm();
                    }
                });
        } else {
            if (saveData(title, link, imgSrc, isEdit, oldLink)) {
                resetForm();
            }
        }
    }

    // Reseta e esconde o formulário
    function resetForm() {
        const titleInput = document.getElementById('wplace-title-input');
        const linkInput = document.getElementById('wplace-link-input');
        const imgInput = document.getElementById('wplace-img-input');
        const imgUpload = document.getElementById('wplace-img-upload');
        const preview = document.getElementById('wplace-img-preview');
        const form = document.getElementById('wplace-form');
        const saveBtn = document.getElementById('wplace-save-btn');
        if (titleInput) titleInput.value = '';
        if (linkInput) linkInput.value = '';
        if (imgInput) imgInput.value = '';
        if (imgUpload) imgUpload.value = '';
        if (preview) preview.style.display = 'none';
        if (form) form.style.display = 'none';
        if (saveBtn) delete saveBtn.dataset.editLink;
    }

    // Manipula Ctrl+V para imagens
    const imgInput = document.getElementById('wplace-img-input');
    if (imgInput) {
        imgInput.addEventListener('paste', (event) => {
            const items = (event.clipboardData || event.originalEvent?.clipboardData)?.items || [];
            for (const item of items) {
                if (item.type && item.type.startsWith('image')) {
                    const blob = item.getAsFile();
                    if (blob.size > 2 * 1024 * 1024) {
                        alert('A imagem colada é muito grande (máximo 2 MB).');
                        return;
                    }
                    const reader = new FileReader();
                    reader.onload = () => {
                        const dataUrl = reader.result;
                        imgInput.value = dataUrl;
                        const previewImg = document.getElementById('wplace-img-preview-img');
                        if (previewImg) {
                            previewImg.src = dataUrl;
                            document.getElementById('wplace-img-preview').style.display = 'block';
                        }
                    };
                    reader.onerror = () => alert('Erro ao processar a imagem colada.');
                    reader.readAsDataURL(blob);
                    event.preventDefault();
                    break;
                }
            }
        });
    }

    // Manipula upload de imagem
    const imgUpload = document.getElementById('wplace-img-upload');
    if (imgUpload) {
        imgUpload.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file && file.type.startsWith('image/')) {
                if (file.size > 2 * 1024 * 1024) {
                    alert('A imagem é muito grande (máximo 2 MB).');
                    event.target.value = '';
                    return;
                }
                const reader = new FileReader();
                reader.onload = () => {
                    const dataUrl = reader.result;
                    document.getElementById('wplace-img-input').value = dataUrl;
                    const previewImg = document.getElementById('wplace-img-preview-img');
                    if (previewImg) {
                        previewImg.src = dataUrl;
                        document.getElementById('wplace-img-preview').style.display = 'block';
                    }
                };
                reader.onerror = () => alert('Erro ao carregar a imagem. Tente novamente.');
                reader.readAsDataURL(file);
            } else {
                alert('Por favor, selecione um arquivo de imagem válido.');
                event.target.value = '';
            }
        });
    }

    // Atualiza visualização da imagem ao digitar URL
    if (imgInput) {
        imgInput.addEventListener('input', () => {
            const val = imgInput.value.trim();
            const previewImg = document.getElementById('wplace-img-preview-img');
            if (val && previewImg) {
                previewImg.src = val;
                document.getElementById('wplace-img-preview').style.display = 'block';
            } else {
                const preview = document.getElementById('wplace-img-preview');
                if (preview) preview.style.display = 'none';
            }
        });
    }

    // Mostra/esconde formulário
    const toggleFormBtn = document.getElementById('wplace-toggle-form');
    if (toggleFormBtn) {
        toggleFormBtn.onclick = () => {
            const form = document.getElementById('wplace-form');
            if (form) {
                if (form.style.display === 'none') {
                    resetForm();
                    form.style.display = 'block';
                } else {
                    resetForm();
                }
            }
        };
    }

    // Salva ou edita item
    const saveBtn = document.getElementById('wplace-save-btn');
    if (saveBtn) {
        saveBtn.onclick = () => {
            const title = document.getElementById('wplace-title-input')?.value.trim();
            const link = document.getElementById('wplace-link-input')?.value.trim();
            const imgSrc = document.getElementById('wplace-img-input')?.value.trim();
            const isEdit = !!saveBtn.dataset.editLink;
            const oldLink = saveBtn.dataset.editLink;
            addItem(title, link, imgSrc, isEdit, oldLink);
        };
    }

    // Cancela e esconde formulário
    const cancelBtn = document.getElementById('wplace-cancel-btn');
    if (cancelBtn) {
        cancelBtn.onclick = () => resetForm();
    }

    // Fecha o painel
    const closePanelBtn = document.getElementById('wplace-close-panel');
    if (closePanelBtn) {
        closePanelBtn.onclick = () => panel.classList.remove('open');
    }

    // Mostra/esconde menu de ordenação
    const sortBtn = document.getElementById('wplace-sort-btn');
    if (sortBtn) {
        sortBtn.onclick = () => {
            const menu = document.getElementById('wplace-sort-menu');
            if (menu) menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        };
    }

    // Manipula seleção de ordenação
    document.querySelectorAll('.wplace-sort-menu button').forEach(button => {
        button.onclick = () => {
            const newSort = button.dataset.sort;
            if (newSort === sortBy) {
                sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
            } else {
                sortBy = newSort;
                sortOrder = 'asc';
            }
            button.innerText = `${sortOrder === 'asc' ? '⬆' : '⬇'} ${newSort === 'title' ? 'Nome' : 'Data'}`;
            document.querySelectorAll('.wplace-sort-menu button').forEach(btn => {
                if (btn.dataset.sort !== newSort) {
                    btn.innerText = `⬆ ${btn.dataset.sort === 'title' ? 'Nome' : 'Data'}`;
                }
            });
            const sortBtn = document.getElementById('wplace-sort-btn');
            if (sortBtn) sortBtn.innerText = sortOrder === 'asc' ? '⬆' : '⬇';
            const sortMenu = document.getElementById('wplace-sort-menu');
            if (sortMenu) sortMenu.style.display = 'none';
            renderPanel(document.getElementById('wplace-search')?.value.trim() || '');
        };
    });

    // Fecha menu de ordenação ao clicar fora
    document.addEventListener('click', (event) => {
        const sortContainer = document.querySelector('.wplace-sort-container');
        if (sortContainer && !sortContainer.contains(event.target)) {
            const sortMenu = document.getElementById('wplace-sort-menu');
            if (sortMenu) sortMenu.style.display = 'none';
        }
    });

    // Filtra itens com a barra de pesquisa
    const searchInput = document.getElementById('wplace-search');
    if (searchInput) {
        searchInput.addEventListener('input', (event) => {
            const filter = event.target.value.trim();
            renderPanel(filter);
        });
    }

    // Exporta dados como JSON com nome no formato dd-mm-yyyy_wplace.json (como no seu script)
    const exportBtn = document.getElementById('wplace-export-btn');
    if (exportBtn) {
        exportBtn.onclick = () => {
            try {
                const saves = loadSaves();
                const today = new Date();
                const dateStr = today.toLocaleDateString('pt-BR', {
                    day: '2-digit', month: '2-digit', year: 'numeric'
                }).split('/').join('-'); // Ex.: 22-08-2025
                const fileName = `${dateStr}_wplace.json`;
                const dataStr = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(saves, null, 2));
                const downloadAnchor = document.createElement('a');
                downloadAnchor.setAttribute('href', dataStr);
                downloadAnchor.setAttribute('download', fileName);
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                document.body.removeChild(downloadAnchor);
                showToast('📤 Exportado');
            } catch (e) {
                console.error('Erro ao exportar:', e);
                alert('Erro ao exportar dados.');
            }
        };
    }

    // Importa dados de um arquivo JSON — aceita qualquer .json e salva na chave wplace_saves
    const importBtn = document.getElementById('wplace-import-btn');
    const importFile = document.getElementById('wplace-import-file');
    if (importBtn && importFile) {
    importBtn.onclick = () => importFile.click();

    importFile.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.json')) {
            alert("Erro: Selecione um arquivo .json válido.");
            event.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (Array.isArray(importedData)) {
                    // Substitui diretamente a chave esperada
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(importedData));
                    renderPanel();
                    showToast('📥 Importado');
                } else {
                    alert('Erro: Arquivo JSON inválido.');
                }
            } catch (err) {
                console.error('Erro ao importar:', err);
                alert('Erro ao importar dados.');
            }
            event.target.value = '';
        };
        reader.readAsText(file);
    });
}

    // Limpa todos os salvos
    const clearBtn = document.getElementById('wplace-clear');
    if (clearBtn) {
        clearBtn.onclick = () => {
            if (confirm('Deseja apagar todos os links salvos?')) {
                localStorage.removeItem(STORAGE_KEY);
                renderPanel();
                showToast('🗑️ Tudo limpo');
            }
        };
    }

    // Fecha modal da imagem
    const modalClose = document.getElementById('wplace-modal-close');
    if (modalClose) {
        modalClose.onclick = () => {
            const modal = document.getElementById('wplace-modal');
            if (modal) modal.style.display = 'none';
        };
    }

    // Fecha modal ao clicar fora
    const modal = document.getElementById('wplace-modal');
    if (modal) {
        modal.onclick = (event) => {
            if (event.target.id === 'wplace-modal') {
                modal.style.display = 'none';
            }
        };
    }

    // Zoom com roda do mouse
    const modalImg = document.getElementById('wplace-modal-img');
    if (modalImg) {
        modalImg.addEventListener('wheel', (event) => {
            event.preventDefault();
            const img = event.target;
            const currentScale = parseFloat(img.style.transform.replace('scale(', '').replace(')', '') || '1');
            const delta = event.deltaY < 0 ? 0.1 : -0.1;
            const newScale = Math.min(Math.max(currentScale + delta, 0.5), 3);
            img.style.transform = `scale(${newScale})`;
        });
    }

    // Injeta botão 📌 e inicia
    tryInjectButton();
    renderPanel();
    console.log('WPlace Saver 1.17 iniciado:', new Date().toLocaleString('pt-BR'));
})();
