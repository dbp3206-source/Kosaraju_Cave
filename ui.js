let isLightMode = false;

document.getElementById('btn-start').addEventListener('click', () => {
    document.getElementById('tutorial-screen').style.display = 'none';
    addLog('Cổng ngục tối đã mở. Hãy cẩn thận bước đi!', 'log-system');
});

document.getElementById('theme-toggle-btn').addEventListener('click', () => {
    isLightMode = !isLightMode;
    document.body.classList.toggle('light-mode', isLightMode);
    document.getElementById('theme-toggle-btn').innerText = isLightMode ? "🌙 BẬT DARK MODE" : "☀️ BẬT LIGHT MODE";
    if (window.gameScene) window.gameScene.updateThemeColors();
});

function addLog(msg, type = "") {
    const logBox = document.getElementById('game-log');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.innerText = `> ${msg}`;
    logBox.appendChild(entry);
    logBox.scrollTop = logBox.scrollHeight;
}

function triggerGameOver(reason) {
    gameState.isDead = true;
    document.getElementById('death-screen').style.display = 'flex';
    document.getElementById('death-reason').innerText = reason;
}

function viewMapAfterDeath() {
    document.getElementById('death-screen').style.display = 'none';
    document.getElementById('floating-restart').style.display = 'block';
}

function updateUI() {
    document.getElementById('hp-text').innerText = `${gameState.hp} / ${gameState.maxHp}`;
    document.getElementById('hp-fill').style.width = `${Math.max(0, (gameState.hp / gameState.maxHp) * 100)}%`;
    if (gameState.hp <= 35) document.getElementById('hp-fill').style.background = "#d9534f";
    else document.getElementById('hp-fill').style.background = "#b33939";

    document.getElementById('nodes-explored').innerText = gameState.visitedNodes.size;

    if (gameState.inventory["Ancient Vision"]) document.getElementById('inv-vision').innerHTML = `👁️ Vision: <span class="highlight-text">Ready (V)</span>`;
    if (gameState.inventory["Master Key"]) document.getElementById('inv-key').innerHTML = `🗝️ Master Key: <span class="highlight-text">Obtained</span>`;
    if (gameState.inventory["Treasure"]) {
        document.getElementById('inv-treasure').innerHTML = `🏺 Relic: <span class="highlight-text">Đã lấy</span>`;
    } else {
        document.getElementById('inv-treasure').innerHTML = `🏺 Relic: <span class="locked-text">Chưa tìm thấy</span>`;
    }

    // Cập nhật Shield
    if (gameState.inventory["Shield"]) document.getElementById('inv-shield').innerHTML = `🛡️ Shield: <span class="highlight-text" style="color:#5bc0de">Active</span>`;
    else document.getElementById('inv-shield').innerHTML = `🛡️ Shield: <span class="locked-text">None</span>`;

    if (gameState.hp <= 0 && !gameState.isDead) {
        triggerGameOver("Bạn đã gục ngã vì kiệt sức và mất máu.");
    }
}