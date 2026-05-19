/* ui.js */
let isLightMode = false;

const ELEMENT_THEMES = [
    {
        id: "metal", name: "Kim", title: "Thành Phố Kim Loại Zaofu", primary: "#d8d9d4", secondary: "#ffd700",
        symbol: "⚙", edge: 0xffd700, reverseEdge: 0xaee7ff, safe: 0x9aa0a6, trap: 0x6f7781, item: 0xffd700,
        story: "Chứa đầy những cỗ máy kim khí cổ xưa và bánh răng khổng lồ. Nếu bước sai nhịp, bạn sẽ bị những lưỡi đao kim loại sắc lẹm của Ngự Kim Sư lướt qua."
    },
    {
        id: "wood", name: "Mộc", title: "Đầm Lầy Sương Mù", primary: "#72b66f", secondary: "#c48a42",
        symbol: "🌳", edge: 0xcfa45b, reverseEdge: 0x72d987, safe: 0x4e7c48, trap: 0x3f2e19, item: 0x72d987,
        story: "Rừng rậm tâm linh u ám, nơi rễ cây ma thuật phát triển chằng chịt. Cạm bẫy ở đây là những dây leo sống động sẵn sàng siết chặt và phong bế hoàn toàn tầm nhìn."
    },
    {
        id: "water", name: "Thủy", title: "Hầm Băng Bắc Thủy Tộc", primary: "#9ee7ff", secondary: "#1aa4c8",
        symbol: "❄", edge: 0x9ee7ff, reverseEdge: 0xffffff, safe: 0x2f7289, trap: 0x1b3242, item: 0xbef4ff,
        story: "Những hang động pha lê băng giá lạnh buốt. Một bước đi sai sẽ kích hoạt bẫy nước, lập tức đóng băng toàn bộ màn hình khiến bạn mất phương hướng."
    },
    {
        id: "fire", name: "Hỏa", title: "Ngục Tối Hỏa Quốc", primary: "#ffbd66", secondary: "#8b0000",
        symbol: "🔥", edge: 0xffbd66, reverseEdge: 0xff5a3d, safe: 0x8b2f18, trap: 0xb10f0f, item: 0xffd166,
        story: "Nơi dòng dung nham cuộn chảy dưới chân và không khí hừng hực sát khí. Bẫy lửa kích hoạt sẽ thiêu rụi mọi thứ trong tầm mắt bằng những ngọn lửa rực rỡ."
    },
    {
        id: "earth", name: "Thổ", title: "Mộ Đạo Ba Sing Se", primary: "#c49b62", secondary: "#5f432c",
        symbol: "⛰", edge: 0xc49b62, reverseEdge: 0xe0c085, safe: 0x6f5638, trap: 0x3b2b1f, item: 0xd5a76b,
        story: "Các đường hầm bí mật vỡ vụn dưới lòng đất Thổ Quốc. Năng lượng địa chấn chực chờ bùng nổ, làm rung chuyển và nứt toác mặt đất mỗi khi bạn đạp trúng bẫy."
    }
];

// Victory items per element — 5 mảnh Ngũ Hành Phong Ấn
const VICTORY_ITEMS = {
    metal: { name: "Kim Ấn Thiết Kiếm", icon: "victory_item_metal.png", desc: "Mảnh phong ấn đúc từ thiên thạch, tỏa ra sát khí ngút trời. Vật phẩm cứng cáp vô song.", cssClass: "vitem-metal", color: "#ffd700" },
    wood:  { name: "Mộc Ấn Căn Cổ",    icon: "victory_item_wood.png",  desc: "Rễ cây Thiên Tuế ngàn năm hóa thạch. Mang trong mình sức sống mãnh liệt của đại ngàn, vẫn còn hơi ấm.", cssClass: "vitem-wood",  color: "#72d987" },
    water: { name: "Thủy Ấn Băng Lệ",   icon: "victory_item_water.png", desc: "Viên đá băng từ đỉnh Hàn Cực Sơn, vĩnh viễn không tan chảy. Tỏa ra luồng khí lạnh thấu xương.", cssClass: "vitem-water", color: "#9ee7ff" },
    fire:  { name: "Hỏa Ấn Long Nha",   icon: "victory_item_fire.png",  desc: "Nanh rồng lửa cổ đại, bốc cháy rực rỡ mà không hề thiêu rụi vạn vật xung quanh.", cssClass: "vitem-fire",  color: "#ff4500" },
    earth: { name: "Thổ Ấn Huyền Thạch", icon: "victory_item_earth.png", desc: "Khối đá huyền bí mang đậm sức mạnh của Đất Mẹ. Tương truyền ai nắm được sẽ làm rung chuyển trời đất.", cssClass: "vitem-earth", color: "#c49b62" }
};

// ── Theme selection ───────────────────────────────────────────────────────────
function chooseElementTheme() {
    const forcedTheme = localStorage.getItem("kosaraju-forced-element");
    const directPick = ELEMENT_THEMES.find(t => t.id === forcedTheme);
    if (directPick) {
        localStorage.removeItem("kosaraju-forced-element");
        localStorage.setItem("kosaraju-last-element", directPick.id);
        return directPick;
    }
    const lastTheme = localStorage.getItem("kosaraju-last-element");
    const themePool = ELEMENT_THEMES.filter(t => t.id !== lastTheme);
    const selected = themePool[Math.floor(Math.random() * themePool.length)] || ELEMENT_THEMES[0];
    localStorage.setItem("kosaraju-last-element", selected.id);
    return selected;
}

window.currentElementTheme = chooseElementTheme();
document.body.dataset.element = window.currentElementTheme.id;

const shouldSkipIntro = sessionStorage.getItem("kosaraju-skip-intro") === "1";
if (shouldSkipIntro) sessionStorage.removeItem("kosaraju-skip-intro");

// ── Trophy State ──────────────────────────────────────────────────────────────
window.trophyState = JSON.parse(localStorage.getItem("kosaraju-trophies") || "{}");

function saveTrophy(elementId) {
    window.trophyState[elementId] = true;
    localStorage.setItem("kosaraju-trophies", JSON.stringify(window.trophyState));
    renderTrophyBar();
}

function renderTrophyBar() {
    const bar = document.getElementById("trophy-bar");
    if (!bar) return;
    const order = ["metal","wood","water","fire","earth"];
    const colorMap = { metal:"#ffd700", wood:"#72d987", water:"#9ee7ff", fire:"#ff4500", earth:"#c49b62" };
    bar.innerHTML = order.map(id => {
        const claimed = window.trophyState[id];
        return `<div class="trophy-slot ${claimed ? "trophy-slot--claimed" : ""}" title="${VICTORY_ITEMS[id]?.name || id}" style="${claimed ? "--trophy-color:"+colorMap[id] : ""}">
            ${claimed ? `<img src="${VICTORY_ITEMS[id].icon}" class="trophy-icon-img" alt="trophy">` : `<span class="trophy-empty">❌</span>`}
        </div>`;
    }).join("");
}

function checkUltimateWin() {
    const order = ["metal","wood","water","fire","earth"];
    if (order.every(id => window.trophyState[id])) {
        setTimeout(() => triggerUltimateWin(), 600);
    }
}

function triggerUltimateWin() {
    const overlay = document.getElementById("ultimate-win-screen");
    const fwCanvas = document.getElementById("fireworks-canvas");
    if (overlay) overlay.style.display = "flex";
    if (fwCanvas) {
        // Step 1: Dragon transform animation
        if (typeof triggerDragonTransform === "function") {
            triggerDragonTransform(fwCanvas, () => {
                // Step 2: After dragon, run fireworks & looping dragon in background
                if (typeof triggerUltimateFireworks === "function") {
                    triggerUltimateFireworks(fwCanvas, 9999999);
                }
            });
        } else if (typeof triggerUltimateFireworks === "function") {
            triggerUltimateFireworks(fwCanvas, 9999999);
        }
    }
}

// ── UI Text ───────────────────────────────────────────────────────────────────
function applyThemeText() {
    const theme = window.currentElementTheme;
    const gameTitle = document.getElementById("game-title");
    if (gameTitle) gameTitle.dataset.symbol = theme.symbol;
    document.getElementById("map-theme-name").innerText = `Bí cảnh hệ ${theme.name}`;
    document.getElementById("map-theme-title").innerText = theme.title;
    document.getElementById("intro-theme-label").innerText = `Cổ Vật Ngự Thuật — Hệ ${theme.name}`;
    const storyEl = document.getElementById("story-text");
    if (storyEl && theme.story) storyEl.innerText = theme.story;
}

// ── Logging ───────────────────────────────────────────────────────────────────
function addLog(msg, type = "") {
    const logBox = document.getElementById("game-log");
    const entry = document.createElement("div");
    entry.className = `log-entry ${type}`;
    entry.innerText = `> ${msg}`;
    logBox.appendChild(entry);
    logBox.scrollTop = logBox.scrollHeight;
}

// ── Cave Collapse + Game Over ─────────────────────────────────────────────────
function triggerGameOver(reason) {
    if (gameState.isDead) return;
    gameState.isDead = true;
    const collapseCanvas = document.getElementById("collapse-canvas");
    if (collapseCanvas && typeof triggerCollapseCanvas === "function") {
        triggerCollapseCanvas(collapseCanvas, () => showDeathScreen(reason));
    } else {
        showDeathScreen(reason);
    }
}

function showDeathScreen(reason) {
    const screen = document.getElementById("death-screen");
    document.getElementById("death-reason").innerText = reason;
    screen.style.display = "flex";
    // trigger CSS shake on death box
    const box = screen.querySelector(".overlay-box");
    if (box) { box.classList.add("death-appear"); }
}

function viewMapAfterDeath() {
    window.scrollTo(0, 0);
    document.getElementById("death-screen").style.display = "none";
}

// ── Victory Sequence ──────────────────────────────────────────────────────────
function triggerVictorySequence(elementId) {
    gameState.isDead = true; // freeze input
    const overlay = document.getElementById("victory-overlay");
    const vfxCanvas = document.getElementById("victory-vfx-canvas");
    const itemPanel = document.getElementById("victory-item-panel");
    if (!overlay || !vfxCanvas || !itemPanel) return;

    overlay.style.display = "flex";
    itemPanel.style.display = "none";
    vfxCanvas.style.display = "block";

    if (typeof triggerVictoryCanvasVFX === "function") {
        triggerVictoryCanvasVFX(elementId, vfxCanvas, () => {
            vfxCanvas.style.display = "none";
            showVictoryItem(elementId, itemPanel);
        });
    } else {
        vfxCanvas.style.display = "none";
        showVictoryItem(elementId, itemPanel);
    }
}

function showVictoryItem(elementId, panel) {
    const item = VICTORY_ITEMS[elementId];
    if (!item) return;
    panel.style.display = "flex";
    panel.innerHTML = `
        <div class="vitem-container ${item.cssClass}">
            <div class="vitem-glow-ring"></div>
            <div class="vitem-icon-wrap">
                <img src="${item.icon}" class="vitem-image" alt="${item.name}">
            </div>
            <div class="vitem-orbits"></div>
        </div>
        <h2 class="vitem-name">${item.name}</h2>
        <p class="vitem-desc">${item.desc}</p>
        <button id="claim-victory-btn" class="claim-btn">✦ Nhận Lấy ✦</button>
    `;
    requestAnimationFrame(() => panel.classList.add("victory-item-visible"));

    document.getElementById("claim-victory-btn").addEventListener("click", () => {
        if (window.trophyState[elementId]) {
            // already claimed, just close
            document.getElementById("victory-overlay").style.display = "none";
            return;
        }
        panel.classList.add("claim-fly-out");
        setTimeout(() => {
            saveTrophy(elementId);
            document.getElementById("victory-overlay").style.display = "none";
            panel.classList.remove("claim-fly-out","victory-item-visible");
            checkUltimateWin();
        }, 700);
    });
}

// ── Win / Close ───────────────────────────────────────────────────────────────
function closeWinScreen() {
    window.scrollTo(0, 0);
    document.getElementById("win-screen").style.display = "none";
}

// ── Inventory UI ──────────────────────────────────────────────────────────────
function setInventorySlot(slotId, isActive, content) {
    const slot = document.getElementById(slotId);
    slot.classList.toggle("inventory-slot--active", isActive);
    slot.innerHTML = content;
}

function updateUI() {
    document.getElementById("hp-text").innerText = `${Math.max(0,gameState.hp)} / ${gameState.maxHp}`;
    document.getElementById("hp-fill").style.width = `${Math.max(0, (gameState.hp / gameState.maxHp) * 100)}%`;

    if (gameState.hp <= 20) {
        document.getElementById("hp-fill").style.background = "linear-gradient(90deg, #3b0000, #d9534f, #3b0000)";
    } else {
        document.getElementById("hp-fill").style.background =
            "linear-gradient(180deg, rgba(255,255,255,0.34), transparent 48%), linear-gradient(90deg, #8b0000, #d32727 52%, #6b0000)";
    }

    document.getElementById("nodes-explored").innerText = gameState.visitedNodes.size;

    setInventorySlot("inv-vision", gameState.inventory["Ancient Vision"],
        gameState.inventory["Ancient Vision"]
            ? `<span class="slot-icon" style="color:#00bcd4">◉</span> Mảnh Vỡ Linh Khí: <span class="highlight-text">Sẵn sàng (V)</span>`
            : `<span class="slot-icon">◉</span> Mảnh Vỡ Linh Khí: <span class="locked-text">Chưa mở</span>`);

    setInventorySlot("inv-key", gameState.inventory["Master Key"],
        gameState.inventory["Master Key"]
            ? `<span class="slot-icon" style="color:#ffd700">⚿</span> Khóa Raava: <span class="highlight-text">Đã lấy</span>`
            : `<span class="slot-icon">⚿</span> Khóa Raava: <span class="locked-text">Chưa có</span>`);

    setInventorySlot("inv-treasure", gameState.inventory["Treasure"],
        gameState.inventory["Treasure"]
            ? `<span class="slot-icon" style="color:#ff8f00">⚱</span> Cổ Vật Ngự Thuật: <span class="highlight-text">Đã lấy</span>`
            : `<span class="slot-icon">⚱</span> Cổ Vật Ngự Thuật: <span class="locked-text">Chưa tìm thấy</span>`);

    setInventorySlot("inv-shield", gameState.inventory["Shield"],
        gameState.inventory["Shield"]
            ? `<span class="slot-icon" style="color:#607d8b">⬟</span> Khiên Chấn Động: <span class="highlight-text">Đang có</span>`
            : `<span class="slot-icon">⬟</span> Khiên Chấn Động: <span class="locked-text">Không có</span>`);

    if (gameState.hp <= 0 && !gameState.isDead) {
        triggerGameOver("Avatar gục ngã. Hành trình khôi phục sự cân bằng kết thúc tại đây.");
    }
}

// ── Trap VFX by trap label ────────────────────────────────────────────────────
function triggerTrapEffect(trapLabel) {
    const container = document.getElementById("trap-effect-container");
    if (!container) return;

    const labelMap = {
        "Fire":      "trap-vfx-fire",
        "Lightning": "trap-vfx-lightning",
        "Poison":    "trap-vfx-poison",
        "Spikes":    "trap-vfx-spikes",
        "Tornado":   "trap-vfx-tornado",
        "Bandit":    "trap-vfx-bandit"
    };
    const cls = labelMap[trapLabel] || "trap-vfx-generic";
    container.className = `trap-effect-container active ${cls}`;
    setTimeout(() => {
        container.classList.remove("active");
        setTimeout(() => { container.className = "trap-effect-container"; }, 400);
    }, 1200);
}

// ── Pickup VFX ────────────────────────────────────────────────────────────────
function triggerPickupVFX(type) {
    const container = document.getElementById("trap-effect-container");
    if (!container) return;
    const clsMap = { heal: "pickup-vfx-heal", key: "pickup-vfx-key", shield: "pickup-vfx-shield", crystal: "pickup-vfx-crystal" };
    const cls = clsMap[type] || "";
    if (!cls) return;
    container.className = `trap-effect-container active ${cls}`;
    setTimeout(() => {
        container.classList.remove("active");
        setTimeout(() => { container.className = "trap-effect-container"; }, 400);
    }, 1000);
}

// ── Magic Door Warp VFX ───────────────────────────────────────────────────────
function triggerWarpVFX(onComplete) {
    const container = document.getElementById("trap-effect-container");
    if (!container) { if (onComplete) onComplete(); return; }
    container.className = "trap-effect-container active trap-vfx-warp";
    setTimeout(() => {
        container.classList.remove("active");
        setTimeout(() => { container.className = "trap-effect-container"; if (onComplete) onComplete(); }, 400);
    }, 900);
}

// ── Floating +HP text ─────────────────────────────────────────────────────────
function spawnFloatingText(text, color = "#2ecc71") {
    const el = document.createElement("div");
    el.className = "floating-text";
    el.textContent = text;
    el.style.cssText = `color:${color};left:${40+Math.random()*20}%;top:50%;`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1400);
}

// ── Apply theme on load ───────────────────────────────────────────────────────
applyThemeText();
renderTrophyBar();
setTimeout(() => {
    if (typeof initBackgroundCanvas === "function") {
        initBackgroundCanvas(window.currentElementTheme.id);
    }
}, 200);

// ── Event listeners ───────────────────────────────────────────────────────────
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

document.querySelectorAll(".element-choice").forEach(button => {
    button.addEventListener("click", () => {
        const mapId = button.dataset.map;
        if (!ELEMENT_THEMES.some(t => t.id === mapId)) return;
        sessionStorage.setItem("kosaraju-skip-intro", "1");
        localStorage.setItem("kosaraju-forced-element", mapId);
        location.reload();
    });
});

// Reset trophies button
const resetBtn = document.getElementById("reset-trophies-btn");
if (resetBtn) {
    resetBtn.addEventListener("click", () => {
        if (confirm("Xóa toàn bộ Cổ Vật đã thu thập? Sự mất cân bằng sẽ tiếp tục!")) {
            localStorage.removeItem("kosaraju-trophies");
            window.trophyState = {};
            renderTrophyBar();
        }
    });
}

// Ultimate win close
const uwClose = document.getElementById("ultimate-win-close");
if (uwClose) {
    uwClose.addEventListener("click", () => {
        if (!confirm("Bắt đầu lại hành trình? 5 Cổ Vật đã thu thập sẽ mất!")) return;
        document.getElementById("ultimate-win-screen").style.display = "none";
        localStorage.removeItem("kosaraju-trophies");
        window.trophyState = {};
        renderTrophyBar();
    });
}

if (shouldSkipIntro) {
    document.getElementById("tutorial-screen").style.display = "none";
    addLog("Cánh cửa đá khép lại phía sau — không còn đường lui.", "log-system");
}

// -- Algorithm Pop-up Logic --
const algoPopup = document.getElementById("algo-popup");
const hideAlgoCb = document.getElementById("hide-algo-cb");

if (algoPopup && hideAlgoCb) {
    if (localStorage.getItem("kosaraju-hide-algo-popup") === "true") {
        algoPopup.style.display = "none";
        hideAlgoCb.checked = true;
    }
    
    hideAlgoCb.addEventListener("change", (e) => {
        localStorage.setItem("kosaraju-hide-algo-popup", e.target.checked);
        if (e.target.checked) {
            // Optional: fade it out or hide immediately
            algoPopup.style.opacity = "0.5";
            algoPopup.style.pointerEvents = "none";
            setTimeout(() => { algoPopup.style.display = "none"; }, 400);
        }
    });
}

const btnShowAlgo = document.getElementById("btn-show-algo");
if (btnShowAlgo && algoPopup && hideAlgoCb) {
    btnShowAlgo.addEventListener("click", () => {
        algoPopup.style.display = "flex";
        algoPopup.style.opacity = "1";
        algoPopup.style.pointerEvents = "auto";
        hideAlgoCb.checked = false;
        localStorage.setItem("kosaraju-hide-algo-popup", "false");
    });
}
