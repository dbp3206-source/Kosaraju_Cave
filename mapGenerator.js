function generateDungeonMap(numNodes = 16) {
    let nodes = [];
    let edges = [];
    const tiers = 5;
    const nodePerTier = { 0: [], 1: [], 2: [], 3: [], 4: [] };

    let tierPool = [1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4];
    tierPool.sort(() => Math.random() - 0.5);

    const mapWidth = 850;
    const mapHeight = 550;
    const colWidth = mapWidth / (tiers - 1);

    for (let i = 0; i < numNodes; i++) {
        let tier = 0;
        if (i === 0) tier = 0;
        else if (i === 1) tier = 2;
        else if (i === 2) tier = 3;
        else if (i === 3) tier = 4;
        else tier = tierPool.pop();

        let nodeObj = { id: i, tier: tier, x: 0, y: 0, type: "safe", icon: "", label: `Cave ${i}` };
        nodes.push(nodeObj);
        nodePerTier[tier].push(nodeObj);
    }

    for (let t = 0; t < tiers; t++) {
        let currentTierNodes = nodePerTier[t];
        let count = currentTierNodes.length;
        if (count === 0) continue;

        currentTierNodes.sort(() => Math.random() - 0.5);
        let spacingY = mapHeight / count;

        currentTierNodes.forEach((node, index) => {
            let baseX = -420 + (node.tier * colWidth);
            let xJitter = (node.tier > 0 && node.tier < 4) ? (Math.random() - 0.5) * 120 : 0;
            node.x = baseX + xJitter;

            let baseY = -275 + (spacingY * index) + (spacingY / 2);
            let yJitter = (Math.random() - 0.5) * (spacingY * 0.6);
            node.y = baseY + yJitter;

            if (node.id === 0) { node.x = -420; node.y = 0; }
        });
    }

    nodes[0].type = "entrance"; nodes[0].icon = "🧙"; nodes[0].label = "Entrance";
    nodes[1].type = "key"; nodes[1].icon = "⚿"; nodes[1].label = "Master Key";
    nodes[2].type = "item"; nodes[2].item = "Ancient Vision"; nodes[2].icon = "◆"; nodes[2].label = "Crystal";
    nodes[3].type = "treasure"; nodes[3].icon = "⚱"; nodes[3].label = "Ancient Relic";

    // ── Trap types — damage balanced to 30–50 ──
    let trapTypes = [
        { t: "Spikes",    d: 30, i: "⚔" },
        { t: "Poison",    d: 30, i: "☠" },
        { t: "Fire",      d: 45, i: "🔥" },
        { t: "Bandit",    d: 40, i: "♞" },
        { t: "Tornado",   d: 40, i: "◌" },
        { t: "Lightning", d: 50, i: "⚡" }
    ];

    // ── Assign types to non-fixed nodes ──
    // Reserve two indices for Magic Door pair (pick indices 4 and 5 from pool)
    let magicDoorA = -1, magicDoorB = -1;
    let doorAssigned = 0;

    for (let i = 4; i < numNodes; i++) {
        // First two eligible nodes become the Magic Door pair
        if (doorAssigned === 0) {
            magicDoorA = i;
            doorAssigned++;
            continue; // assign type after we know both ids
        }
        if (doorAssigned === 1) {
            magicDoorB = i;
            doorAssigned++;
            continue;
        }

        let rand = Math.random();
        if (rand < 0.40) {
            let tr = trapTypes[Math.floor(Math.random() * trapTypes.length)];
            nodes[i].type = "trap"; nodes[i].damage = tr.d; nodes[i].icon = tr.i; nodes[i].label = tr.t;
        } else if (rand < 0.55) {
            nodes[i].type = "potion"; nodes[i].icon = "✚"; nodes[i].label = "Potion";
        } else if (rand < 0.65) {
            nodes[i].type = "shield"; nodes[i].icon = "⬟"; nodes[i].label = "Shield";
        }
    }

    // ── Guarantee at least 1 Potion among non-fixed nodes ──
    const hasPotion = nodes.slice(6).some(n => n.type === "potion");
    if (!hasPotion) {
        // Find a safe node to convert to potion
        const safeNodes = nodes.slice(6).filter(n => n.type === "safe");
        if (safeNodes.length > 0) {
            const pick = safeNodes[Math.floor(Math.random() * safeNodes.length)];
            pick.type = "potion"; pick.icon = "✚"; pick.label = "Potion";
        }
    }

    // Finalize Magic Door pair
    if (magicDoorA >= 0 && magicDoorB >= 0) {
        nodes[magicDoorA].type = "magic_door";
        nodes[magicDoorA].icon = "🚪";
        nodes[magicDoorA].label = "Magic Door";
        nodes[magicDoorA].linkedDoor = magicDoorB;

        nodes[magicDoorB].type = "magic_door";
        nodes[magicDoorB].icon = "🚪";
        nodes[magicDoorB].label = "Magic Door";
        nodes[magicDoorB].linkedDoor = magicDoorA;
    }

    let t1_node = nodePerTier[1][Math.floor(Math.random() * nodePerTier[1].length)].id;
    edges.push({ from: 0, to: t1_node });
    edges.push({ from: t1_node, to: 1 });

    let t3_node = nodePerTier[3][Math.floor(Math.random() * nodePerTier[3].length)].id;
    edges.push({ from: 1, to: t3_node });
    edges.push({ from: t3_node, to: 3 });

    let bwd_t3 = nodePerTier[3][Math.floor(Math.random() * nodePerTier[3].length)].id;
    let bwd_t2 = nodePerTier[2][Math.floor(Math.random() * nodePerTier[2].length)].id;
    let bwd_t1 = nodePerTier[1][Math.floor(Math.random() * nodePerTier[1].length)].id;
    edges.push({ from: 3, to: bwd_t3 });
    edges.push({ from: bwd_t3, to: bwd_t2 });
    edges.push({ from: bwd_t2, to: bwd_t1 });
    edges.push({ from: bwd_t1, to: 0 });

    for (let t = 0; t < tiers - 1; t++) {
        let current = nodePerTier[t], next = nodePerTier[t + 1];
        if (current.length > 0 && next.length > 0) {
            let u = current[Math.floor(Math.random() * current.length)].id;
            let v = next[Math.floor(Math.random() * next.length)].id;
            if (!edges.some(e => e.from === u && e.to === v) && !edges.some(e => e.from === v && e.to === u)) edges.push({ from: u, to: v });
        }
    }
    for (let t = tiers - 1; t > 0; t--) {
        let current = nodePerTier[t], prev = nodePerTier[t - 1];
        if (current.length > 0 && prev.length > 0) {
            let u = current[Math.floor(Math.random() * current.length)].id;
            let v = prev[Math.floor(Math.random() * prev.length)].id;
            if (!edges.some(e => e.from === u && e.to === v) && !edges.some(e => e.from === v && e.to === u)) edges.push({ from: u, to: v });
        }
    }

    return { nodes, edges };
}


// ── Generic BFS reachability ──────────────────────────────────────────────────

function canReachNode(fromId, toId, nodes, edges, undirected = false) {
    if (fromId === toId) return true;
    const queue = [fromId];
    const visited = new Set([fromId]);
    while (queue.length > 0) {
        const u = queue.shift();
        if (u === toId) return true;
        let rawNeighbors = edges.filter(e => e.from === u).map(e => e.to);
        if (undirected) {
            rawNeighbors = rawNeighbors.concat(edges.filter(e => e.to === u).map(e => e.from));
        }
        
        // --- Magic Door Teleportation Logic ---
        // Khi đi tới 1 node, nếu node đó là magic_door, người chơi bị dịch chuyển ngay tới linkedDoor.
        // Do đó, đích đến thực sự là linkedDoor chứ không phải chính node đó.
        let actualNeighbors = [];
        for (const v of rawNeighbors) {
            const nodeV = nodes.find(n => n.id === v);
            if (nodeV && nodeV.type === "magic_door" && nodeV.linkedDoor !== undefined) {
                actualNeighbors.push(nodeV.linkedDoor);
            } else {
                actualNeighbors.push(v);
            }
        }

        for (const v of actualNeighbors) {
            if (!visited.has(v)) { visited.add(v); queue.push(v); }
        }
    }
    return false;
}

// ── Legacy wrapper (kept for any external calls) ──────────────────────────────
function canReachEntrance(startNodeId, undirected = false) {
    return canReachNode(startNodeId, 0, levelData.nodes, levelData.edges, undirected);
}

// ── Map validation ────────────────────────────────────────────────────────────
function isMapWinnable(nodes, edges) {
    // Full win path: entrance(0) → key(1) → treasure(3) → entrance(0)
    return canReachNode(0, 1, nodes, edges, false) &&
           canReachNode(1, 3, nodes, edges, false) &&
           canReachNode(3, 0, nodes, edges, false);
}

function buildValidMap(numNodes = 16, maxAttempts = 20) {
    for (let i = 0; i < maxAttempts; i++) {
        const map = generateDungeonMap(numNodes);
        if (isMapWinnable(map.nodes, map.edges)) return map;
    }
    // Fallback: return last attempt regardless
    return generateDungeonMap(numNodes);
}

// ── Runtime state (declared after all functions are defined) ──────────────────
const levelData = buildValidMap();
let gameState = {
    currentNode: 0, hp: 60, maxHp: 60,
    inventory: { "Ancient Vision": false, "Master Key": false, "Treasure": false, "Shield": false },
    visitedNodes: new Set([0]), visionMode: false, isMoving: false, isDead: false
};

// ── Full win-condition reachability check ─────────────────────────────────────
function canCompleteGame(fromNodeId) {
    const undirected = gameState.visionMode;
    const edges = levelData.edges;
    const nodes = levelData.nodes;
    const hasKey      = gameState.inventory["Master Key"];
    const hasTreasure = gameState.inventory["Treasure"];

    if (hasTreasure) {
        // Only need to reach entrance
        return canReachNode(fromNodeId, 0, nodes, edges, undirected);
    }
    if (hasKey) {
        // Need: current → treasure(3) → entrance(0)
        if (!canReachNode(fromNodeId, 3, nodes, edges, undirected)) return false;
        return canReachNode(3, 0, nodes, edges, undirected);
    }
    // Need: current → key(1) → treasure(3) → entrance(0)
    if (!canReachNode(fromNodeId, 1, nodes, edges, undirected)) return false;
    if (!canReachNode(1, 3, nodes, edges, undirected)) return false;
    return canReachNode(3, 0, nodes, edges, undirected);
}

// ── Context-aware dead-end game over ─────────────────────────────────────────
function triggerDeadEndGameOver(fromNodeId) {
    const hasKey      = gameState.inventory["Master Key"];
    const hasTreasure = gameState.inventory["Treasure"];
    const undirected  = gameState.visionMode;
    const edges       = levelData.edges;
    const nodes       = levelData.nodes;
    let reason;

    if (!canReachNode(fromNodeId, 0, nodes, edges, undirected)) {
        reason = "Cửa sập lại... Bạn đã lạc vào nhánh cụt không lối thoát. Bị kẹt vĩnh viễn!";
    } else if (!hasTreasure && !hasKey && !canReachNode(fromNodeId, 1, nodes, edges, undirected)) {
        reason = "✏️ Đường đến Master Key đã bị chặn vĩnh viễn. Không còn cách nào thắng từ đây!";
    } else if (!hasTreasure && hasKey && !canReachNode(fromNodeId, 3, nodes, edges, undirected)) {
        reason = "🗝️ Chìa khóa trong tay nhưng đường đến Ancient Relic đã bị chặn. Hành trình kết thúc!";
    } else {
        reason = "Không còn đường nào dẫn đến chiến thắng. Hành trình kết thúc tại đây.";
    }
    triggerGameOver(reason);
}

