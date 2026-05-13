let isLightMode = false;

const ELEMENT_THEMES = [
    {
        id: "metal",
        name: "Kim",
        title: "Thiết Mạch Cổ Thành",
        primary: "#d8d9d4",
        secondary: "#ffd700",
        symbol: "⚙",
        edge: 0xffd700,
        reverseEdge: 0xaee7ff,
        safe: 0x9aa0a6,
        trap: 0x6f7781,
        item: 0xffd700,
        story: "Vòm hang mở vào một thành quách bằng sắt nguội. Tiếng bánh răng cổ vang lên dưới nền đá, như thể cả bản đồ đang chờ người đủ gan bước tới."
    },
    {
        id: "wood",
        name: "Mộc",
        title: "Lâm Động Rễ Sâu",
        primary: "#72b66f",
        secondary: "#c48a42",
        symbol: "🌳",
        edge: 0xcfa45b,
        reverseEdge: 0x72d987,
        safe: 0x4e7c48,
        trap: 0x3f2e19,
        item: 0x72d987,
        story: "Rễ cây già quấn quanh miệng hang, kéo hơi thở của rừng xuống tận lòng đất. Mỗi node sáng lên như một dấu vết còn ấm trên vỏ cây cổ."
    },
    {
        id: "water",
        name: "Thủy",
        title: "Băng Tuyết U Cốc",
        primary: "#9ee7ff",
        secondary: "#1aa4c8",
        symbol: "❄",
        edge: 0x9ee7ff,
        reverseEdge: 0xffffff,
        safe: 0x2f7289,
        trap: 0x1b3242,
        item: 0xbef4ff,
        story: "Tuyết lạnh quất qua lòng hang, phủ lên bản đồ một màn trắng mỏng và sắc. Dưới hơi băng, chỉ người đủ bình tĩnh mới đọc được lối đi."
    },
    {
        id: "fire",
        name: "Hỏa",
        title: "Hỏa Long Hắc Động",
        primary: "#ffbd66",
        secondary: "#8b0000",
        symbol: "🔥",
        edge: 0xffbd66,
        reverseEdge: 0xff5a3d,
        safe: 0x8b2f18,
        trap: 0xb10f0f,
        item: 0xffd166,
        story: "Nham thạch đỏ rực cháy trong khe đá như mạch máu của hang sâu. Bản đồ cháy lên từng nhịp, nhắc rằng một bước sai cũng đủ hóa tro."
    },
    {
        id: "earth",
        name: "Thổ",
        title: "Huyền Thổ Mộ Đạo",
        primary: "#c49b62",
        secondary: "#5f432c",
        symbol: "⛰",
        edge: 0xc49b62,
        reverseEdge: 0xe0c085,
        safe: 0x6f5638,
        trap: 0x3b2b1f,
        item: 0xd5a76b,
        story: "Đất đen ép xuống từ bốn phía, để lộ những đường khắc nâu sẫm trên nền cổ mộ. Kosaraju Caves ở hệ này chậm rãi, nặng nề và không tha thứ."
    }
];

function chooseElementTheme() {
    const forcedTheme = localStorage.getItem("kosaraju-forced-element");
    const directPick = ELEMENT_THEMES.find((theme) => theme.id === forcedTheme);
    if (directPick) {
        localStorage.removeItem("kosaraju-forced-element");
        localStorage.setItem("kosaraju-last-element", directPick.id);
        return directPick;
    }

    const lastTheme = localStorage.getItem("kosaraju-last-element");
    const themePool = ELEMENT_THEMES.filter((theme) => theme.id !== lastTheme);
    const selected = themePool[Math.floor(Math.random() * themePool.length)] || ELEMENT_THEMES[0];
    localStorage.setItem("kosaraju-last-element", selected.id);
    return selected;
}

window.currentElementTheme = chooseElementTheme();
document.body.dataset.element = window.currentElementTheme.id;

const shouldSkipIntro = sessionStorage.getItem("kosaraju-skip-intro") === "1";
if (shouldSkipIntro) {
    sessionStorage.removeItem("kosaraju-skip-intro");
}

function applyThemeText() {
    const theme = window.currentElementTheme;
    const gameTitle = document.getElementById("game-title");
    if (gameTitle) gameTitle.dataset.symbol = theme.symbol;
    document.getElementById("map-theme-name").innerText = `Map hệ ${theme.name}`;
    document.getElementById("map-theme-title").innerText = theme.title;
    document.getElementById("intro-theme-label").innerText = "Biên niên hang động";
}

function addLog(msg, type = "") {
    const logBox = document.getElementById("game-log");
    const entry = document.createElement("div");
    entry.className = `log-entry ${type}`;
    entry.innerText = `> ${msg}`;
    logBox.appendChild(entry);
    logBox.scrollTop = logBox.scrollHeight;
}

function triggerGameOver(reason) {
    gameState.isDead = true;
    document.getElementById("death-screen").style.display = "flex";
    document.getElementById("death-reason").innerText = reason;
}

function viewMapAfterDeath() {
    window.scrollTo(0, 0);
    document.getElementById("death-screen").style.display = "none";
}

function closeWinScreen() {
    window.scrollTo(0, 0);
    document.getElementById("win-screen").style.display = "none";
}

function setInventorySlot(slotId, isActive, content) {
    const slot = document.getElementById(slotId);
    slot.classList.toggle("inventory-slot--active", isActive);
    slot.innerHTML = content;
}

function updateUI() {
    document.getElementById("hp-text").innerText = `${gameState.hp} / ${gameState.maxHp}`;
    document.getElementById("hp-fill").style.width = `${Math.max(0, (gameState.hp / gameState.maxHp) * 100)}%`;

    if (gameState.hp <= 35) {
        document.getElementById("hp-fill").style.background = "linear-gradient(90deg, #3b0000, #d9534f, #3b0000)";
    } else {
        document.getElementById("hp-fill").style.background =
            "linear-gradient(180deg, rgba(255,255,255,0.34), transparent 48%), linear-gradient(90deg, #8b0000, #d32727 52%, #6b0000)";
    }

    document.getElementById("nodes-explored").innerText = gameState.visitedNodes.size;

    setInventorySlot(
        "inv-vision",
        gameState.inventory["Ancient Vision"],
        gameState.inventory["Ancient Vision"]
            ? `<span class="slot-icon">◉</span> Vision: <span class="highlight-text">Sẵn sàng (V)</span>`
            : `<span class="slot-icon">◉</span> Vision: <span class="locked-text">Chưa mở</span>`
    );

    setInventorySlot(
        "inv-key",
        gameState.inventory["Master Key"],
        gameState.inventory["Master Key"]
            ? `<span class="slot-icon">⚿</span> Master Key: <span class="highlight-text">Đã lấy</span>`
            : `<span class="slot-icon">⚿</span> Master Key: <span class="locked-text">Chưa có</span>`
    );

    setInventorySlot(
        "inv-treasure",
        gameState.inventory["Treasure"],
        gameState.inventory["Treasure"]
            ? `<span class="slot-icon">⚱</span> Relic: <span class="highlight-text">Đã lấy</span>`
            : `<span class="slot-icon">⚱</span> Relic: <span class="locked-text">Chưa tìm thấy</span>`
    );

    setInventorySlot(
        "inv-shield",
        gameState.inventory["Shield"],
        gameState.inventory["Shield"]
            ? `<span class="slot-icon">⬟</span> Shield: <span class="highlight-text">Đang có</span>`
            : `<span class="slot-icon">⬟</span> Shield: <span class="locked-text">Không có</span>`
    );

    if (gameState.hp <= 0 && !gameState.isDead) {
        triggerGameOver("Bạn đã gục ngã vì kiệt sức và mất máu.");
    }
}

function triggerTrapEffect() {
    const container = document.getElementById("trap-effect-container");
    if (!container) return;

    const element = document.body.dataset.element;
    container.className = `trap-effect-container active trap-effect-${element}`;

    setTimeout(() => {
        container.classList.remove("active");
        setTimeout(() => {
            container.className = "trap-effect-container";
        }, 400);
    }, 1200);
}

applyThemeText();

document.getElementById("btn-start").addEventListener("click", () => {
    window.scrollTo(0, 0);
    const tutorialScreen = document.getElementById("tutorial-screen");
    const mapSelectScreen = document.getElementById("map-select-screen");
    tutorialScreen.style.display = "none";
    mapSelectScreen.dataset.returnToIntro = "1";
    mapSelectScreen.style.display = "flex";
});

document.getElementById("theme-toggle-btn").addEventListener("click", () => {
    isLightMode = !isLightMode;
    document.body.classList.toggle("light-mode", isLightMode);
    document.getElementById("theme-toggle-btn").innerText = isLightMode ? "Đưa về bóng tối" : "Đổi ánh sáng";
    if (window.gameScene) window.gameScene.updateThemeColors();
});

const mapSelectBtn = document.getElementById("map-select-btn");
const mapSelectScreen = document.getElementById("map-select-screen");
const closeMapSelectBtn = document.getElementById("close-map-select");

if (mapSelectBtn && mapSelectScreen) {
    mapSelectBtn.addEventListener("click", () => {
        mapSelectScreen.dataset.returnToIntro = "0";
        mapSelectScreen.style.display = "flex";
    });
}

if (closeMapSelectBtn && mapSelectScreen) {
    closeMapSelectBtn.addEventListener("click", () => {
        mapSelectScreen.style.display = "none";
        if (mapSelectScreen.dataset.returnToIntro === "1") {
            document.getElementById("tutorial-screen").style.display = "flex";
        }
    });
}

document.querySelectorAll(".element-choice").forEach((button) => {
    button.addEventListener("click", () => {
        const mapId = button.dataset.map;
        if (!ELEMENT_THEMES.some((theme) => theme.id === mapId)) return;
        sessionStorage.setItem("kosaraju-skip-intro", "1");
        localStorage.setItem("kosaraju-forced-element", mapId);
        location.reload();
    });
});

if (shouldSkipIntro) {
    document.getElementById("tutorial-screen").style.display = "none";
    addLog("Cổng ngục tối đã mở. Hãy cẩn thận từng bước đi!", "log-system");
}
