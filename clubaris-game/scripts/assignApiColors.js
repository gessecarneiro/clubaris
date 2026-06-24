import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'd59adc246ba54880b1012ec5ef4261d1';
const BASE_URL = 'https://api.football-data.org/v4';

const LEAGUES = [
  { apiCode: 'BSA' },
  { apiCode: 'PD' },
  { apiCode: 'SD' },
  { apiCode: 'PL' },
  { apiCode: 'ELC' },
  { apiCode: 'SA' },
  { apiCode: 'SB' },
  { apiCode: 'FL1' },
  { apiCode: 'BL1' },
  { apiCode: 'DED' },
  { apiCode: 'PPL' }
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const colorMap = {
    'red': '#e53e3e',
    'white': '#ffffff',
    'black': '#1a202c',
    'blue': '#3182ce',
    'yellow': '#ecc94b',
    'green': '#38a169',
    'orange': '#ed8936',
    'purple': '#805ad5',
    'maroon': '#742a2a',
    'claret': '#742a2a',
    'sky blue': '#63b3ed',
    'navy blue': '#2a4365',
    'navy': '#2a4365',
    'gold': '#d69e2e',
    'grey': '#718096',
    'gray': '#718096',
    'silver': '#a0aec0',
    'pink': '#d53f8c',
    'brown': '#7b341e',
    'royal blue': '#2b6cb0',
    'light blue': '#90cdf4',
    'dark blue': '#2c5282'
};

function parseColors(colorString) {
    if (!colorString) return { c1: '#ffffff', c2: '#000000' };
    
    // Example: "Red / White"
    const parts = colorString.split('/').map(s => s.trim().toLowerCase());
    
    let c1 = '#ffffff';
    let c2 = '#000000';
    
    if (parts.length > 0) {
        c1 = colorMap[parts[0]] || '#ffffff';
    }
    if (parts.length > 1) {
        c2 = colorMap[parts[1]] || '#000000';
    } else {
        // If only one color, pick a contrasting secondary color
        c2 = (c1 === '#ffffff' || c1 === '#ecc94b') ? '#1a202c' : '#ffffff';
    }
    
    return { c1, c2 };
}

async function main() {
    const teamsPath = path.join(__dirname, '..', 'src', 'data', 'teams.json');
    const teamsData = JSON.parse(fs.readFileSync(teamsPath, 'utf8'));

    // Create a dictionary from the API
    const apiColors = {};

    for (const league of LEAGUES) {
        console.log(`Fetching colors for ${league.apiCode}...`);
        const res = await fetch(`${BASE_URL}/competitions/${league.apiCode}/teams`, {
            headers: { 'X-Auth-Token': API_KEY }
        });
        
        if (res.status === 429) {
            console.log("Rate limit hit! Sleeping for 7 seconds...");
            await sleep(7000);
            // We just skip and try others, since 10/min might be strict.
            // Actually, wait 7 seconds and try again.
            continue;
        }

        const data = await res.json();
        if (data.teams) {
            for (const team of data.teams) {
                if (team.clubColors) {
                    apiColors[team.id.toString()] = parseColors(team.clubColors);
                }
            }
        }
        await sleep(6500); // polite delay
    }

    // Now update teams.json
    let updated = 0;
    for (const team of teamsData) {
        // Only update if it came from API (numeric ID) and doesn't have custom scraped colors
        if (!isNaN(team.id)) {
            const apiColor = apiColors[team.id];
            if (apiColor) {
                team.color1 = apiColor.c1;
                team.color2 = apiColor.c2;
                updated++;
            }
        }
    }

    fs.writeFileSync(teamsPath, JSON.stringify(teamsData, null, 2));
    console.log(`Updated colors for ${updated} API teams!`);
}

main().catch(console.error);
