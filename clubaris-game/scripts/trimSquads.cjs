const fs = require('fs');
const path = require('path');

const TEAMS_FILE = path.join(__dirname, '../src/data/teams.json');

let teams = JSON.parse(fs.readFileSync(TEAMS_FILE, 'utf-8'));

const MAX_SQUAD_SIZE = 26; // MAX players
const MIN_SQUAD_SIZE = 16;

const isFake = (name) => {
    const lower = name.toLowerCase();
    return lower.includes('unknown') || lower.includes('fake') || lower.includes('player') || lower.match(/^player\s\d+/);
};

teams = teams.map(team => {
    let squad = team.squad;

    // Filter out fakes
    squad = squad.filter(p => !isFake(p.name));

    // Sort by rating descending to keep the best ones
    squad.sort((a, b) => b.rating - a.rating);

    // Group by positions
    const gks = squad.filter(p => p.position === 'GK');
    const defs = squad.filter(p => ['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(p.position));
    const mids = squad.filter(p => ['CM', 'CDM', 'CAM', 'RM', 'LM'].includes(p.position));
    const atks = squad.filter(p => ['ST', 'LW', 'RW', 'CF'].includes(p.position));

    let newSquad = [];
    
    // Core requirements
    const take = (arr, count) => arr.splice(0, count);

    newSquad.push(...take(gks, 2)); // 2 GKs
    newSquad.push(...take(defs, 6)); // 6 DEFs
    newSquad.push(...take(mids, 6)); // 6 MIDs
    newSquad.push(...take(atks, 4)); // 4 ATKs

    // Fill the rest up to MAX_SQUAD_SIZE with highest rated remaining players
    const remaining = [...gks, ...defs, ...mids, ...atks].sort((a, b) => b.rating - a.rating);
    const slotsLeft = MAX_SQUAD_SIZE - newSquad.length;
    
    if (slotsLeft > 0) {
        newSquad.push(...take(remaining, slotsLeft));
    }

    // Sort back by Position (GK, DEF, MID, ATK) then rating
    const posOrder = { 'GK': 1, 'CB': 2, 'LB': 2, 'RB': 2, 'LWB': 2, 'RWB': 2, 'CDM': 3, 'CM': 3, 'CAM': 3, 'LM': 3, 'RM': 3, 'RW': 4, 'LW': 4, 'CF': 4, 'ST': 4 };
    newSquad.sort((a, b) => {
        if (posOrder[a.position] !== posOrder[b.position]) {
            return posOrder[a.position] - posOrder[b.position];
        }
        return b.rating - a.rating;
    });

    team.squad = newSquad;
    return team;
});

fs.writeFileSync(TEAMS_FILE, JSON.stringify(teams, null, 2));
console.log('✅ Squads trimmed successfully! Max squad size is now 26, prioritized by rating, sorted by position.');

const squadLengths = teams.map(x => x.squad.length);
console.log('Total teams:', teams.length);
console.log('Max squad:', Math.max(...squadLengths), 'Min:', Math.min(...squadLengths), 'Avg:', squadLengths.reduce((a,b)=>a+b,0)/teams.length);
