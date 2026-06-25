const fs = require('fs');
const https = require('https');
const path = require('path');

const TEAMS_FILE = path.join(__dirname, '../src/data/teams.json');
const CSV_URL = 'https://raw.githubusercontent.com/reh1548/FIFA-24-Player-Dataset/main/player_stats.csv';

// Normalize string for fuzzy matching
function normalize(str) {
    if (!str) return '';
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function fetchCSV() {
    return new Promise((resolve, reject) => {
        console.log("Baixando player_stats.csv...");
        https.get(CSV_URL, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function parseCSV(csvText) {
    const lines = csvText.split('\n');
    if (lines.length < 2) return [];
    
    // Headers: Name, Full Name, Age, Height, Weight, Nationality, Overall, Potential, Team, Best Position, etc...
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const nameIdx = headers.findIndex(h => h.includes('Name'));
    const fullNameIdx = headers.findIndex(h => h.includes('Full Name'));
    const posIdx = headers.findIndex(h => h.includes('Position') || h.includes('Best Position'));
    
    const playersMap = new Map();
    
    for (let i = 1; i < lines.length; i++) {
        const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if (!row) continue;
        
        let cols = row.map(c => c.replace(/"/g, '').trim());
        if (cols.length > Math.max(nameIdx, posIdx)) {
            const name = cols[nameIdx] || '';
            const fullName = fullNameIdx !== -1 ? cols[fullNameIdx] : '';
            const pos = cols[posIdx] || '';
            
            if (name && pos) {
                playersMap.set(normalize(name), pos);
                if (fullName) {
                    playersMap.set(normalize(fullName), pos);
                }
            }
        }
    }
    return playersMap;
}

function mapEAPosition(eaPos) {
    const p = eaPos.toUpperCase();
    if (p.includes('GK')) return 'GK';
    if (p.includes('CB')) return 'CB';
    if (p.includes('LB') || p.includes('LWB')) return 'LB';
    if (p.includes('RB') || p.includes('RWB')) return 'RB';
    if (p.includes('CDM')) return 'CDM';
    if (p.includes('CAM')) return 'CAM';
    if (p.includes('CM')) return 'CM';
    if (p.includes('LM')) return 'LM';
    if (p.includes('RM')) return 'RM';
    if (p.includes('LW')) return 'LW';
    if (p.includes('RW')) return 'RW';
    if (p.includes('CF')) return 'CF';
    if (p.includes('ST')) return 'ST';
    
    return null;
}

// Smart heuristic for players not found in DB
function spreadHeuristic(player, teamStats) {
    const pos = player.position; 
    const foot = player.preferredFoot || 'Direito';
    
    if (pos === 'GK') return 'GK';
    
    if (pos === 'CB') {
        if (foot === 'Esquerdo' && teamStats.LB < 1) { teamStats.LB++; return 'LB'; }
        if (foot === 'Direito' && teamStats.RB < 1) { teamStats.RB++; return 'RB'; }
        if (teamStats.CB < 2) { teamStats.CB++; return 'CB'; }
        if (foot === 'Esquerdo' && teamStats.LB < 2) { teamStats.LB++; return 'LB'; }
        if (foot === 'Direito' && teamStats.RB < 2) { teamStats.RB++; return 'RB'; }
        teamStats.CB++; return 'CB';
    }
    
    if (pos === 'CM') {
        if (teamStats.CDM < 1) { teamStats.CDM++; return 'CDM'; }
        if (teamStats.CM < 1) { teamStats.CM++; return 'CM'; }
        if (foot === 'Esquerdo' && teamStats.LM < 1) { teamStats.LM++; return 'LM'; }
        if (foot === 'Direito' && teamStats.RM < 1) { teamStats.RM++; return 'RM'; }
        if (teamStats.CAM < 1) { teamStats.CAM++; return 'CAM'; }
        if (teamStats.CDM < 2) { teamStats.CDM++; return 'CDM'; }
        teamStats.CM++; return 'CM';
    }
    
    if (pos === 'ST') {
        if (teamStats.ST < 1) { teamStats.ST++; return 'ST'; }
        if (foot === 'Direito' && teamStats.LW < 1) { teamStats.LW++; return 'LW'; } // Inverted winger logic (right foot plays left wing)
        if (foot === 'Esquerdo' && teamStats.RW < 1) { teamStats.RW++; return 'RW'; }
        if (teamStats.CF < 1) { teamStats.CF++; return 'CF'; }
        if (foot === 'Esquerdo' && teamStats.LW < 1) { teamStats.LW++; return 'LW'; }
        if (foot === 'Direito' && teamStats.RW < 1) { teamStats.RW++; return 'RW'; }
        teamStats.ST++; return 'ST';
    }
    
    return pos;
}

async function main() {
    try {
        const csvData = await fetchCSV();
        console.log("CSV baixado com sucesso! Tamanho:", csvData.length, "bytes");
        
        const playersMap = parseCSV(csvData);
        console.log(`Extraidos ${playersMap.size} jogadores unicos do CSV.`);

        let teams = JSON.parse(fs.readFileSync(TEAMS_FILE, 'utf-8'));
        let foundCount = 0;
        let notFoundCount = 0;
        
        let positionStats = {};

        for (const team of teams) {
            const teamStats = { GK:0, CB:0, LB:0, RB:0, CDM:0, CM:0, CAM:0, LM:0, RM:0, LW:0, RW:0, CF:0, ST:0 };
            
            for (let p of team.squad) {
                const normName = normalize(p.name);
                
                let foundPos = null;
                if (playersMap.has(normName)) {
                    foundPos = playersMap.get(normName);
                } else {
                    if (normName.length > 4) {
                        for (const [k, v] of playersMap.entries()) {
                            if (k.includes(normName) || normName.includes(k)) {
                                foundPos = v;
                                break;
                            }
                        }
                    }
                }

                let newPos = null;
                if (foundPos) {
                    newPos = mapEAPosition(foundPos);
                }

                if (newPos) {
                    p.position = newPos;
                    foundCount++;
                    if (teamStats[newPos] !== undefined) teamStats[newPos]++;
                } else {
                    notFoundCount++;
                    p.position = spreadHeuristic(p, teamStats);
                }
                
                positionStats[p.position] = (positionStats[p.position] || 0) + 1;
            }
        }

        console.log(`Posicoes atualizadas! Matches exatos: ${foundCount} | Fallbacks heuristicos: ${notFoundCount}`);
        console.log("Distribuicao Final de Posicoes:");
        console.log(positionStats);

        fs.writeFileSync(TEAMS_FILE, JSON.stringify(teams, null, 2));
        console.log("teams.json salvo com sucesso!");

    } catch(err) {
        console.error("Erro:", err);
    }
}

main();
