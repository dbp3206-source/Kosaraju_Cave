class GameScene extends Phaser.Scene {
    constructor() { super('GameScene'); }

    create() {
        window.gameScene = this;
        this.cx = (this.scale.width - 380) / 2;
        this.cy = this.scale.height / 2;
        this.cameras.main.postFX.addBloom(0xffffff, 1, 1, 1, 1.2);

        this.graphicsLayer = this.add.graphics();
        this.reverseGraphicsLayer = this.add.graphics();
        this.texts = {};
        this.circles = {};

        this.drawEdges();
        this.drawNodes();

        const startNode = levelData.nodes[0];
        this.playerMarker = this.add.text(this.cx + startNode.x, this.cy + startNode.y, '🧙‍♂️', { fontSize: '32px' }).setOrigin(0.5).setDepth(10);
        this.tweens.add({ targets: this.playerMarker, scaleX: 1.2, scaleY: 1.2, yoyo: true, repeat: -1, duration: 600 });

        this.input.keyboard.on('keydown-V', () => {
            if (gameState.inventory["Ancient Vision"] && !gameState.isDead) {
                gameState.visionMode = !gameState.visionMode;
                addLog(gameState.visionMode ? "Ancient Vision kích hoạt! Hiện các đường rút lui." : "Tắt Ancient Vision.", "log-system");
                this.drawEdges();
            }
        });
    }

    updateThemeColors() {
        this.drawEdges();
        levelData.nodes.forEach(node => {
            let circle = this.circles[node.id];
            let text = this.texts[`lbl_${node.id}`];
            if (circle) circle.setFillStyle(isLightMode ? 0xe6e1d1 : 0x071213);
            if (text) text.setColor(isLightMode ? '#595247' : '#aaa');
        });
    }

    drawEdges() {
        this.graphicsLayer.clear();
        this.reverseGraphicsLayer.clear();

        levelData.edges.forEach(edge => {
            const from = levelData.nodes.find(n => n.id === edge.from);
            const to = levelData.nodes.find(n => n.id === edge.to);
            let fwColor = isLightMode ? 0x8c6a32 : 0xcba052;
            this.drawSingleEdge(this.graphicsLayer, from, to, fwColor, false);
            if (gameState.visionMode) this.drawSingleEdge(this.reverseGraphicsLayer, to, from, 0x5bc0de, true);
        });
    }

    drawSingleEdge(graphics, from, to, color, isDashed) {
        const x1 = this.cx + from.x, y1 = this.cy + from.y;
        const x2 = this.cx + to.x, y2 = this.cy + to.y;
        graphics.lineStyle(isDashed ? 2 : 3, color, isDashed ? 0.3 : 0.6);
        graphics.beginPath(); graphics.moveTo(x1, y1); graphics.lineTo(x2, y2); graphics.strokePath();

        const angle = Math.atan2(y2 - y1, x2 - x1);
        const midX = x1 + (x2 - x1) * 0.7, midY = y1 + (y2 - y1) * 0.7;
        graphics.beginPath();
        graphics.moveTo(midX, midY);
        graphics.lineTo(midX - 12 * Math.cos(angle - Math.PI / 6), midY - 12 * Math.sin(angle - Math.PI / 6));
        graphics.moveTo(midX, midY);
        graphics.lineTo(midX - 12 * Math.cos(angle + Math.PI / 6), midY - 12 * Math.sin(angle + Math.PI / 6));
        graphics.strokePath();
    }

    drawNodes() {
        let fillCol = isLightMode ? 0xe6e1d1 : 0x071213;
        let textCol = isLightMode ? '#595247' : '#aaa';

        levelData.nodes.forEach(node => {
            const nx = this.cx + node.x, ny = this.cy + node.y;
            let color = 0x2a4145;
            if (node.type === "trap") color = 0x8b0000;
            if (node.type === "entrance") color = 0xe8c988;
            if (node.type === "potion" || node.type === "item" || node.type === "treasure" || node.type === "shield") color = 0x5bc0de;

            let circle = this.add.circle(nx, ny, 25, fillCol).setStrokeStyle(3, color);
            this.circles[node.id] = circle;

            let iconText = this.add.text(nx, ny, node.icon, { fontSize: '24px' }).setOrigin(0.5);
            this.texts[`ico_${node.id}`] = iconText;

            let lblText = this.add.text(nx, ny + 35, node.label, { fontFamily: 'Nunito', fontSize: '11px', color: textCol, fontStyle: 'italic' }).setOrigin(0.5);
            this.texts[`lbl_${node.id}`] = lblText;

            const hitZone = this.add.circle(nx, ny, 30).setInteractive({ cursor: 'pointer' });
            hitZone.on('pointerdown', () => this.handleNodeClick(node));
        });
    }

    handleNodeClick(targetNode) {
        if (gameState.isMoving || gameState.hp <= 0 || gameState.isDead) return;

        let isValidPath = levelData.edges.some(e => e.from === gameState.currentNode && e.to === targetNode.id);
        if (!isValidPath && gameState.visionMode) isValidPath = levelData.edges.some(e => e.to === gameState.currentNode && e.from === targetNode.id);

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
            x: this.cx + targetNode.x, y: this.cy + targetNode.y,
            duration: 400, ease: 'Sine.easeInOut',
            onComplete: () => {
                gameState.isMoving = false;
                this.processNodeEvent(targetNode);
            }
        });
    }

    processNodeEvent(node) {
        if (node.id === 0) {
            if (gameState.inventory["Treasure"]) {
                document.getElementById('win-screen').style.display = 'flex';
                return;
            } else {
                addLog("Chưa lấy được Rương Kho Báu (Ancient Chest)! Đừng quay về tay không.", "log-system");
            }
        }
        else if (node.type === "treasure") {
            if (gameState.inventory["Master Key"]) {
                gameState.inventory["Treasure"] = true;
                addLog("BẠN ĐÃ TÌM THẤY CỔ VẬT NGÀN NĂM! Mau chóng thoát khỏi hang động!", "log-success");
                node.type = "safe"; this.texts[`ico_${node.id}`].setText("");
                this.cameras.main.flash(500, 203, 160, 82);
            } else {
                addLog("Rương bị khóa chặt! Cần tìm Master Key trước.", "log-danger");
            }
        }
        else if (node.type === "trap") {
            // Xử lý Khiên bảo vệ
            if (gameState.inventory["Shield"]) {
                gameState.inventory["Shield"] = false;
                addLog(`Dẫm phải ${node.label}, nhưng KHIÊN đã đỡ đòn và vỡ nát! Không mất HP.`, "log-system");
                this.cameras.main.shake(150, 0.01);
            } else {
                gameState.hp -= node.damage;
                addLog(`TRAP! Chịu sát thương từ ${node.label}, mất ${node.damage} HP!`, "log-danger");
                this.cameras.main.shake(250, 0.02);
            }
        }
        else if (node.type === "shield") {
            gameState.inventory["Shield"] = true;
            addLog("Tuyệt vời! Nhặt được Khiên, bảo vệ bạn khỏi 1 bẫy bất kỳ.", "log-success");
            node.type = "safe"; this.texts[`ico_${node.id}`].setText("");
        }
        else if (node.type === "potion") {
            gameState.hp = Math.min(100, gameState.hp + 30);
            addLog("Tìm thấy Potion, hồi 30 HP.", "log-success");
            node.type = "safe"; this.texts[`ico_${node.id}`].setText("");
        }
        else if (node.type === "key") {
            gameState.inventory["Master Key"] = true;
            addLog("Đã lấy Master Key! Bây giờ hãy tìm Ancient Chest.", "log-success");
            node.type = "safe"; this.texts[`ico_${node.id}`].setText("");
        }
        else if (node.type === "item") {
            gameState.inventory[node.item] = true;
            addLog(`Đã có ${node.item}. Bấm V để soi các đường lùi.`, "log-success");
            node.type = "safe"; this.texts[`ico_${node.id}`].setText("");
        }
        else {
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

const config = { type: Phaser.WEBGL, width: window.innerWidth, height: window.innerHeight, parent: 'phaser-game', transparent: true, scene: GameScene, scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH } };
const game = new Phaser.Game(config);

updateUI();