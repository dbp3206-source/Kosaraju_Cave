function getTheme() {
    return window.currentElementTheme || {
        primary: "#ffd700", edge: 0xffd700, reverseEdge: 0x5bc0de,
        safe: 0x2a4145, trap: 0x8b0000, item: 0x5bc0de
    };
}

function hexToNumber(hex) { return Number(`0x${hex.replace("#", "")}`); }

function getNodeTone(node) {
    const theme = getTheme();
    if (node.type === "trap") return theme.trap;
    if (node.type === "entrance") return theme.edge;
    if (node.type === "magic_door") return 0x9b59b6;
    if (node.type === "potion" || node.type === "item" || node.type === "treasure" || node.type === "shield" || node.type === "key") return theme.item;
    return theme.safe;
}

// Fixed per-type icon colors (theme-independent)
const NODE_ICON_COLORS = {
    entrance:   "#ffd700",
    key:        "#ffd700",
    item:       "#00bcd4",
    treasure:   "#ff8f00",
    shield:     "#90caf9",
    potion:     "#2ecc71",
    magic_door: "#ce93d8",
    safe:       "#d8d0bc",
    // trap subtypes
    "Fire":      "#e74c3c",
    "Poison":    "#9b59b6",
    "Lightning": "#f1c40f",
    "Tornado":   "#1abc9c",
    "Bandit":    "#e67e22",
    "Spikes":    "#bdc3c7"
};

function getNodeIconColor(node) {
    if (node.type === "trap") return NODE_ICON_COLORS[node.label] || "#e74c3c";
    return NODE_ICON_COLORS[node.type] || "#d8d0bc";
}

function getNodeIcon(node) {
    if (node.type === "entrance") return "🧙";
    if (node.type === "key") return "⚿";
    if (node.type === "item") return "◆";
    if (node.type === "treasure") return "⚱";
    if (node.type === "shield") return "⬟";
    if (node.type === "potion") return "✚";
    if (node.type === "magic_door") return "🚪";
    if (node.type === "trap") {
        if (node.label === "Poison")    return "☠";
        if (node.label === "Fire")      return "🔥";
        if (node.label === "Lightning") return "⚡";
        if (node.label === "Tornado")   return "◌";
        if (node.label === "Bandit")    return "♞";
        return "⚔";
    }
    return node.icon || "";
}

class GameScene extends Phaser.Scene {
    constructor() { super("GameScene"); }

    create() {
        window.gameScene = this;
        this.cx = (this.scale.width - 380) / 2;
        this.cy = this.scale.height / 2;
        this.displayScale = Math.min(0.92, Math.max(0.82, (this.scale.width - 430) / 960));
        try { this.cameras.main.postFX.addBloom(0xffffff, 1, 1, 1, 1.2); } catch(e) {}
        const tnEl = document.getElementById("total-nodes");
        if (tnEl) tnEl.innerText = levelData.nodes.length;

        this.graphicsLayer = this.add.graphics();
        this.reverseGraphicsLayer = this.add.graphics();
        this.texts = {}; this.circles = {}; this.halos = {};
        this.innerRings = {}; this.hitZones = {};

        this.drawEdges();
        this.drawNodes();

        const startNode = levelData.nodes[0];
        const startPos = this.getNodeScreenPosition(startNode);
        this.playerMarker = this.add.text(startPos.x, startPos.y - 2, "🧙", { fontSize: "31px" })
            .setOrigin(0.5).setDepth(12);
        this.playerMarker.setShadow(0, 0, getTheme().primary, 12, true, true);
        this.tweens.add({ targets: this.playerMarker, scaleX: 1.16, scaleY: 1.16, yoyo: true, repeat: -1, duration: 700 });

        this.input.keyboard.on("keydown-V", () => {
            if (gameState.inventory["Ancient Vision"] && !gameState.isDead) {
                gameState.visionMode = !gameState.visionMode;
                addLog(gameState.visionMode ? "Ancient Vision kích hoạt! Các đường rút lui đã hiện ra." : "Tắt Ancient Vision.", "log-system");
                this.drawEdges();
            }
        });
    }

    getNodeScreenPosition(node) {
        return { x: this.cx + node.x * this.displayScale, y: this.cy + node.y * this.displayScale };
    }

    updateThemeColors() {
        this.drawEdges();
        levelData.nodes.forEach(node => {
            const circle = this.circles[node.id];
            const halo = this.halos[node.id];
            const text = this.texts[`lbl_${node.id}`];
            const tone = getNodeTone(node);
            const fill = isLightMode ? 0x2b2418 : 0x071213;
            if (halo) halo.setFillStyle(tone, isLightMode ? 0.12 : 0.18);
            if (circle) circle.setFillStyle(fill).setStrokeStyle(3, tone, 0.95);
            if (text) text.setColor(isLightMode ? "#ffe7b0" : "#d8d0bc");
        });
        if (this.playerMarker) this.playerMarker.setShadow(0, 0, getTheme().primary, 12, true, true);
    }

    drawEdges() {
        this.graphicsLayer.clear();
        this.reverseGraphicsLayer.clear();
        levelData.edges.forEach(edge => {
            const from = levelData.nodes.find(n => n.id === edge.from);
            const to = levelData.nodes.find(n => n.id === edge.to);
            const fwColor = isLightMode ? hexToNumber(getTheme().primary) : getTheme().edge;
            this.drawSingleEdge(this.graphicsLayer, from, to, fwColor, false);
            if (gameState.visionMode) this.drawSingleEdge(this.reverseGraphicsLayer, to, from, getTheme().reverseEdge, true);
        });
    }

    drawSingleEdge(graphics, from, to, color, isDashed) {
        const fromPos = this.getNodeScreenPosition(from);
        const toPos = this.getNodeScreenPosition(to);
        const x1=fromPos.x, y1=fromPos.y, x2=toPos.x, y2=toPos.y;

        if (isDashed) {
            // Enhanced Vision Mode Edge (Escape Route)
            // Outer strong glow
            graphics.lineStyle(14, color, 0.4);
            graphics.beginPath(); graphics.moveTo(x1,y1); graphics.lineTo(x2,y2); graphics.strokePath();
            // Core solid line
            graphics.lineStyle(6, color, 1);
            graphics.beginPath(); graphics.moveTo(x1,y1); graphics.lineTo(x2,y2); graphics.strokePath();
            // Bright center line
            graphics.lineStyle(2, 0xffffff, 1);
            graphics.beginPath(); graphics.moveTo(x1,y1); graphics.lineTo(x2,y2); graphics.strokePath();

            // Directional arrow in the middle
            const angle = Math.atan2(y2 - y1, x2 - x1);
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            const arrowLength = 18;
            graphics.lineStyle(4, 0xffffff, 1);
            graphics.beginPath();
            graphics.moveTo(midX, midY);
            graphics.lineTo(midX - arrowLength * Math.cos(angle - Math.PI / 6), midY - arrowLength * Math.sin(angle - Math.PI / 6));
            graphics.moveTo(midX, midY);
            graphics.lineTo(midX - arrowLength * Math.cos(angle + Math.PI / 6), midY - arrowLength * Math.sin(angle + Math.PI / 6));
            graphics.strokePath();
        } else {
            // Normal Forward Edge
            const alpha = 0.86;
            graphics.lineStyle(10, color, 0.14);
            graphics.beginPath(); graphics.moveTo(x1,y1); graphics.lineTo(x2,y2); graphics.strokePath();
            
            graphics.lineStyle(4, color, alpha);
            graphics.beginPath(); graphics.moveTo(x1,y1); graphics.lineTo(x2,y2); graphics.strokePath();
            
            graphics.lineStyle(1, 0xfff3ba, 0.58);
            graphics.beginPath(); graphics.moveTo(x1,y1); graphics.lineTo(x2,y2); graphics.strokePath();

            // Normal arrow
            const angle = Math.atan2(y2-y1, x2-x1);
            const midX = x1+(x2-x1)*0.7, midY = y1+(y2-y1)*0.7;
            const arrowSize = 10;
            graphics.lineStyle(2, color, 0.92);
            graphics.beginPath();
            graphics.moveTo(midX,midY);
            graphics.lineTo(midX - arrowSize*Math.cos(angle-Math.PI/6), midY - arrowSize*Math.sin(angle-Math.PI/6));
            graphics.moveTo(midX,midY);
            graphics.lineTo(midX - arrowSize*Math.cos(angle+Math.PI/6), midY - arrowSize*Math.sin(angle+Math.PI/6));
            graphics.strokePath();
        }
    }

    drawNodes() {
        const fillCol = isLightMode ? 0x2b2418 : 0x071213;

        levelData.nodes.forEach(node => {
            const nodePos = this.getNodeScreenPosition(node);
            const nx = nodePos.x, ny = nodePos.y;
            const tone = getNodeTone(node);
            const iconColor = getNodeIconColor(node);

            const halo = this.add.circle(nx, ny, 40, tone, 0.16).setDepth(5);
            halo.setBlendMode(Phaser.BlendModes.ADD);
            this.halos[node.id] = halo;

            const ring = this.add.circle(nx, ny, 28, fillCol).setStrokeStyle(3, tone, 0.95).setDepth(7);
            this.circles[node.id] = ring;

            const innerRing = this.add.circle(nx, ny, 21, tone, 0.1).setStrokeStyle(1, 0xfff0b0, 0.32).setDepth(8);
            innerRing.setBlendMode(Phaser.BlendModes.ADD);
            this.innerRings[node.id] = innerRing;

            const iconText = this.add.text(nx, ny - 1, getNodeIcon(node), {
                fontSize: "25px", fontFamily: "Georgia"
            }).setOrigin(0.5).setDepth(9);
            iconText.setColor(iconColor);
            iconText.setShadow(0, 0, iconColor, 10, true, true);
            this.texts[`ico_${node.id}`] = iconText;

            const textCol = isLightMode ? "#ffe7b0" : "#d8d0bc";
            const lblText = this.add.text(nx, ny + 38, node.label, {
                fontFamily: "Times New Roman, Georgia, serif", fontSize: "13px",
                color: textCol, backgroundColor: "rgba(8,7,5,0.72)", padding: { x: 7, y: 3 }
            }).setOrigin(0.5).setDepth(9);
            lblText.setShadow(0, 1, "#000000", 3, true, true);
            this.texts[`lbl_${node.id}`] = lblText;

            const hitZone = this.add.circle(nx, ny, 32, 0xffffff, 0.001).setDepth(11).setInteractive({ cursor: "grab" });
            hitZone.wasDragged = false;
            hitZone.on("pointerup", () => {
                if (hitZone.wasDragged) { hitZone.wasDragged = false; return; }
                this.handleNodeClick(node);
            });
            hitZone.on("dragstart", () => { hitZone.wasDragged = false; });
            hitZone.on("drag", (_, dragX, dragY) => {
                hitZone.wasDragged = true;
                this.repositionNode(node, dragX, dragY);
            });
            this.input.setDraggable(hitZone);
            this.hitZones[node.id] = hitZone;
        });
    }

    repositionNode(node, screenX, screenY) {
        node.x = (screenX - this.cx) / this.displayScale;
        node.y = (screenY - this.cy) / this.displayScale;
        this.updateNodeVisual(node);
        this.drawEdges();
        if (gameState.currentNode === node.id && !gameState.isMoving && this.playerMarker) {
            this.playerMarker.setPosition(screenX, screenY - 2);
        }
    }

    setNodeToSafe(nodeId) {
        const theme = getTheme();
        const fill = isLightMode ? 0x2b2418 : 0x071213;
        if (this.circles[nodeId])   this.circles[nodeId].setFillStyle(fill).setStrokeStyle(3, theme.safe, 0.95);
        if (this.halos[nodeId])     this.halos[nodeId].setFillStyle(theme.safe, 0.10);
        if (this.innerRings[nodeId]) this.innerRings[nodeId].setFillStyle(theme.safe, 0.05);
        if (this.texts[`ico_${nodeId}`]) this.texts[`ico_${nodeId}`].setColor("#6d6a62").setShadow(0,0,"#6d6a62",4,true,true);
    }

    updateNodeVisual(node) {
        const { x, y } = this.getNodeScreenPosition(node);
        if (this.halos[node.id]) this.halos[node.id].setPosition(x, y);
        if (this.circles[node.id]) this.circles[node.id].setPosition(x, y);
        if (this.innerRings[node.id]) this.innerRings[node.id].setPosition(x, y);
        if (this.texts[`ico_${node.id}`]) this.texts[`ico_${node.id}`].setPosition(x, y - 1);
        if (this.texts[`lbl_${node.id}`]) this.texts[`lbl_${node.id}`].setPosition(x, y + 38);
        if (this.hitZones[node.id]) this.hitZones[node.id].setPosition(x, y);
    }

    handleNodeClick(targetNode) {
        if (gameState.isMoving || gameState.hp <= 0 || gameState.isDead) return;

        let isValidPath = levelData.edges.some(e => e.from === gameState.currentNode && e.to === targetNode.id);
        if (!isValidPath && gameState.visionMode) {
            isValidPath = levelData.edges.some(e => e.to === gameState.currentNode && e.from === targetNode.id);
        }
        if (!isValidPath) {
            addLog("Tường đá chắn ngang! Bạn chỉ có thể đi xuôi theo chiều mũi tên.", "log-danger");
            this.cameras.main.shake(150, 0.005);
            return;
        }

        gameState.isMoving = true;
        gameState.currentNode = targetNode.id;
        gameState.visitedNodes.add(targetNode.id);

        this.tweens.add({
            targets: this.playerMarker,
            x: this.getNodeScreenPosition(targetNode).x,
            y: this.getNodeScreenPosition(targetNode).y - 2,
            duration: 400, ease: "Sine.easeInOut",
            onComplete: () => { gameState.isMoving = false; this.processNodeEvent(targetNode); }
        });
    }

    processNodeEvent(node) {
        if (node.id === 0) {
            if (gameState.inventory["Treasure"]) {
                // Trigger victory sequence instead of old win screen
                triggerVictorySequence(window.currentElementTheme.id);
                return;
            }
            addLog("Chưa lấy được Ancient Relic. Đừng quay về tay không.", "log-system");

        } else if (node.type === "magic_door") {
            const destId = node.linkedDoor;
            const destNode = levelData.nodes.find(n => n.id === destId);
            if (destNode) {
                addLog("✨ Cánh Cửa Thần Kì! Bạn bị hút vào chiều không gian khác...", "log-system");
                gameState.isMoving = true; // lock input during warp
                triggerWarpVFX(() => {
                    gameState.currentNode = destNode.id;
                    gameState.visitedNodes.add(destNode.id);
                    const destPos = this.getNodeScreenPosition(destNode);
                    this.playerMarker.setPosition(destPos.x, destPos.y - 2);
                    addLog(`Bạn xuất hiện tại: ${destNode.label} (Node ${destNode.id})`, "log-system");
                    gameState.isMoving = false;
                    updateUI();
                    if (gameState.hp > 0 && destNode.id !== 0 && !gameState.isDead) {
                        if (!canReachEntrance(destNode.id)) {
                            triggerGameOver("Cổng thần kì đã đưa bạn vào ngõ cụt không lối thoát!");
                        }
                    }
                });
            }
            return;

        } else if (node.type === "treasure") {
            if (gameState.inventory["Master Key"]) {
                gameState.inventory["Treasure"] = true;
                addLog("Bạn đã tìm thấy cổ vật ngàn năm! Mau chóng thoát khỏi hang động.", "log-success");
                node.type = "safe";
                this.texts[`ico_${node.id}`].setText("");
                this.cameras.main.flash(500, 203, 160, 82);
            } else {
                addLog("Rương bị khóa chặt! Cần tìm Master Key trước.", "log-danger");
            }

        } else if (node.type === "trap") {
            if (gameState.inventory["Shield"]) {
                gameState.inventory["Shield"] = false;
                addLog(`Dẫm phải ${node.label}, nhưng khiên đã đỡ đòn và vỡ nát.`, "log-system");
                this.cameras.main.shake(150, 0.01);
                triggerTrapEffect(node.label);
            } else {
                gameState.hp -= node.damage;
                addLog(`BẪY! ${node.label} gây ${node.damage} sát thương!`, "log-danger");
                this.cameras.main.shake(250, 0.02);
                triggerTrapEffect(node.label);
                // Floating damage text
                if (typeof spawnFloatingText === "function") spawnFloatingText(`-${node.damage} HP`, "#e74c3c");
            }

        } else if (node.type === "shield") {
            gameState.inventory["Shield"] = true;
            addLog("Nhặt được Shield. Nó sẽ bảo vệ bạn khỏi một bẫy bất kỳ.", "log-success");
            node.type = "safe";
            this.setNodeToSafe(node.id);
            triggerPickupVFX("shield");

        } else if (node.type === "potion") {
            const heal = 25;
            gameState.hp = Math.min(gameState.maxHp, gameState.hp + heal);
            addLog(`Tìm thấy Potion, hồi ${heal} HP.`, "log-success");
            node.type = "safe";
            this.setNodeToSafe(node.id);
            triggerPickupVFX("heal");
            if (typeof spawnFloatingText === "function") spawnFloatingText(`+${heal} HP`, "#2ecc71");

        } else if (node.type === "key") {
            gameState.inventory["Master Key"] = true;
            addLog("Đã lấy Master Key. Bây giờ hãy tìm Ancient Relic.", "log-success");
            node.type = "safe";
            this.setNodeToSafe(node.id);
            triggerPickupVFX("key");

        } else if (node.type === "item") {
            gameState.inventory[node.item] = true;
            addLog(`Đã có ${node.item}. Bấm V để soi các đường lui.`, "log-success");
            node.type = "safe";
            this.setNodeToSafe(node.id);
            triggerPickupVFX("crystal");

        } else {
            addLog(`Tiến vào: ${node.label}`);
        }

        updateUI();

        if (gameState.hp > 0 && node.id !== 0 && !gameState.isDead) {
            if (!canReachEntrance(node.id)) {
                triggerGameOver("Cửa sập lại... Bạn đã lạc vào nhánh cụt không lối thoát. Bị kẹt vĩnh viễn!");
            }
        }
    }
}

const config = {
    type: Phaser.WEBGL,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: "phaser-game",
    transparent: true,
    scene: GameScene,
    scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH }
};

const game = new Phaser.Game(config);
updateUI();
