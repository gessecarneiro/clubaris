import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const teamsPath = path.join(__dirname, '..', 'src', 'data', 'teams.json');

const teamsData = JSON.parse(fs.readFileSync(teamsPath, 'utf8'));
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const teamColors = {
    'Santos': { c1: '#ffffff', c2: '#000000' },
    'Sport': { c1: '#cc0000', c2: '#000000' },
    'Ceará': { c1: '#000000', c2: '#ffffff' },
    'Goiás': { c1: '#006633', c2: '#ffffff' },
    'Coritiba': { c1: '#005533', c2: '#ffffff' },
    'Vila Nova': { c1: '#cc0000', c2: '#ffffff' },
    'Mirassol': { c1: '#ffcc00', c2: '#006600' },
    'Novorizontino': { c1: '#ffcc00', c2: '#000000' },
    'América-MG': { c1: '#006633', c2: '#000000' },
    'Operário': { c1: '#000000', c2: '#ffffff' },
    'Avaí': { c1: '#0055aa', c2: '#ffffff' },
    'Amazonas': { c1: '#ffcc00', c2: '#000000' },
    'CRB': { c1: '#cc0000', c2: '#ffffff' },
    'Ponte Preta': { c1: '#000000', c2: '#ffffff' },
    'Ituano': { c1: '#cc0000', c2: '#000000' },
    'Chapecoense': { c1: '#008855', c2: '#ffffff' },
    'Botafogo-SP': { c1: '#cc0000', c2: '#ffffff' },
    'Paysandu': { c1: '#0055aa', c2: '#ffffff' },
    'Guarani': { c1: '#006633', c2: '#ffffff' },
    'Brusque': { c1: '#ffcc00', c2: '#cc0000' },
    'Náutico': { c1: '#cc0000', c2: '#ffffff' },
    'Remo': { c1: '#000066', c2: '#ffffff' },
    'Figueirense': { c1: '#000000', c2: '#ffffff' },
    'CSA': { c1: '#0055aa', c2: '#ffffff' },
    'ABC': { c1: '#000000', c2: '#ffffff' },
    'Tombense': { c1: '#cc0000', c2: '#ffffff' },
    'Londrina': { c1: '#66ccff', c2: '#ffffff' },
    'Ypiranga': { c1: '#ffcc00', c2: '#006600' },
    'Ferroviária': { c1: '#660033', c2: '#ffffff' },
    'São Bernardo': { c1: '#ffcc00', c2: '#000000' },
    'Confiança': { c1: '#0055aa', c2: '#ffffff' },
    'Botafogo-PB': { c1: '#000000', c2: '#ffffff' },
    'Volta Redonda': { c1: '#ffcc00', c2: '#000000' },
    'Aparecidense': { c1: '#000066', c2: '#ffffff' },
    'Floresta': { c1: '#006633', c2: '#ffffff' },
    'São José': { c1: '#0055aa', c2: '#ffffff' },
    'Athletic': { c1: '#000000', c2: '#ffffff' },
    'Ferroviário': { c1: '#cc0000', c2: '#000000' },
    'Sampaio Corrêa': { c1: '#cc0000', c2: '#ffff00' },
    'Caxias': { c1: '#660033', c2: '#ffffff' },
    'XV de Piracicaba': { c1: '#000000', c2: '#ffffff' },
    'Santa Cruz': { c1: '#000000', c2: '#cc0000' },
    'Paraná Clube': { c1: '#cc0000', c2: '#0000aa' },
    'Joinville': { c1: '#cc0000', c2: '#000000' },
    'Portuguesa': { c1: '#cc0000', c2: '#006633' },
    'Juventus': { c1: '#660033', c2: '#ffffff' },
    'Paulista': { c1: '#cc0000', c2: '#000000' },
    'Bangu': { c1: '#cc0000', c2: '#ffffff' },
    'Madureira': { c1: '#ffff00', c2: '#0000aa' },
    'Campinense': { c1: '#cc0000', c2: '#000000' },
    'Treze': { c1: '#000000', c2: '#ffffff' },
    'Brasil de Pelotas': { c1: '#cc0000', c2: '#000000' }
};

function formatWikiTitle(name) {
    let formatted = name.replace(/ /g, '_').replace(/'/g, '%27');
    const disambiguations = {
        'Santos': 'Santos_Futebol_Clube',
        'Sport': 'Sport_Club_do_Recife',
        'Ceará': 'Ceará_Sporting_Club',
        'Goiás': 'Goiás_Esporte_Clube',
        'Coritiba': 'Coritiba_Foot_Ball_Club',
        'Vila Nova': 'Vila_Nova_Futebol_Clube',
        'Mirassol': 'Mirassol_Futebol_Clube',
        'Novorizontino': 'Grêmio_Novorizontino',
        'América-MG': 'América_Futebol_Clube_(Belo_Horizonte)',
        'Operário': 'Operário_Ferroviário_Esporte_Clube',
        'Avaí': 'Avaí_Futebol_Clube',
        'Amazonas': 'Amazonas_Futebol_Clube',
        'CRB': 'Clube_de_Regatas_Brasil',
        'Ponte Preta': 'Associação_Atlética_Ponte_Preta',
        'Ituano': 'Ituano_Futebol_Clube',
        'Chapecoense': 'Associação_Chapecoense_de_Futebol',
        'Botafogo-SP': 'Botafogo_Futebol_Clube_(Ribeirão_Preto)',
        'Paysandu': 'Paysandu_Sport_Club',
        'Guarani': 'Guarani_Futebol_Clube',
        'Brusque': 'Brusque_Futebol_Clube',
        'Náutico': 'Clube_Náutico_Capibaribe',
        'Remo': 'Clube_do_Remo',
        'Figueirense': 'Figueirense_Futebol_Clube',
        'CSA': 'Centro_Sportivo_Alagoano',
        'ABC': 'ABC_Futebol_Clube',
        'Tombense': 'Tombense_Futebol_Clube',
        'Londrina': 'Londrina_Esporte_Clube',
        'Ypiranga': 'Ypiranga_Futebol_Clube_(Erechim)',
        'Ferroviária': 'Associação_Ferroviária_de_Esportes',
        'São Bernardo': 'São_Bernardo_Futebol_Clube',
        'Confiança': 'Associação_Desportiva_Confiança',
        'Botafogo-PB': 'Botafogo_Futebol_Clube_(João_Pessoa)',
        'Volta Redonda': 'Volta_Redonda_Futebol_Clube',
        'Aparecidense': 'Associação_Atlética_Aparecidense',
        'Floresta': 'Floresta_Esporte_Clube',
        'São José': 'Esporte_Clube_São_José',
        'Athletic': 'Athletic_Club_(Minas_Gerais)',
        'Ferroviário': 'Ferroviário_Atlético_Clube_(Ceará)',
        'Sampaio Corrêa': 'Sampaio_Corrêa_Futebol_Clube',
        'Caxias': 'Sociedade_Esportiva_e_Recreativa_Caxias_do_Sul',
        'XV de Piracicaba': 'Esporte_Clube_XV_de_Novembro_(Piracicaba)',
        'Santa Cruz': 'Santa_Cruz_Futebol_Clube',
        'Paraná Clube': 'Paraná_Clube',
        'Joinville': 'Joinville_Esporte_Clube',
        'Portuguesa': 'Associação_Portuguesa_de_Desportos',
        'Juventus': 'Clube_Atlético_Juventus',
        'Paulista': 'Paulista_Futebol_Clube',
        'Bangu': 'Bangu_Atlético_Clube',
        'Madureira': 'Madureira_Esporte_Clube',
        'Campinense': 'Campinense_Clube',
        'Treze': 'Treze_Futebol_Clube',
        'Brasil de Pelotas': 'Grêmio_Esportivo_Brasil'
    };
    return disambiguations[name] || formatted;
}

function parsePosition(posStr) {
    posStr = posStr.toLowerCase();
    if (posStr.includes('g') || posStr.includes('goleiro')) return 'GK';
    if (posStr.includes('z') || posStr.includes('zagueiro')) return 'CB';
    if (posStr.includes('l') || posStr.includes('lateral')) return 'RB';
    if (posStr.includes('v') || posStr.includes('volante')) return 'CDM';
    if (posStr.includes('m') || posStr.includes('meia')) return 'CM';
    if (posStr.includes('a') || posStr.includes('atacante') || posStr.includes('ponta')) return 'ST';
    return 'CM';
}

async function scrapeWikipedia(team) {
    const title = formatWikiTitle(team.name);
    const url = `https://pt.wikipedia.org/wiki/${title}`;
    console.log(`Scraping ${team.name}... (${url})`);
    
    // 1. Assign colors
    if (teamColors[team.name]) {
        team.color1 = teamColors[team.name].c1;
        team.color2 = teamColors[team.name].c2;
    } else {
        team.color1 = team.color1 || '#ffffff';
        team.color2 = team.color2 || '#000000';
    }
    
    try {
        const response = await fetch(url);
        if (!response.ok) return false;
        
        const html = await response.text();
        const $ = cheerio.load(html);
        
        let players = [];
        
        // Find "Elenco_atual" heading or table
        const heading = $('#Elenco_atual, #Elenco');
        let tables = [];
        if (heading.length > 0) {
            tables.push(heading.parent().nextAll('table').first());
        } else {
            $('table').each((i, el) => {
                const headerText = $(el).find('th').text().toLowerCase();
                if (headerText.includes('nome') && (headerText.includes('pos') || headerText.includes('nº') || headerText.includes('n.'))) {
                    tables.push($(el));
                }
            });
        }
        
        for (const table of tables) {
            if (!table || table.length === 0) continue;
            
            // Check headers to figure out column layout
            const headers = table.find('tr').first().find('th, td');
            let isMultiColumn = headers.length > 4; 
            let hasFlags = false;
            
            headers.each((i, th) => {
                if ($(th).text().toLowerCase().includes('país') || $(th).text().toLowerCase().includes('nac')) hasFlags = true;
            });
            
            table.find('tr').each((j, row) => {
                const cols = $(row).find('td');
                if (cols.length === 0) return;
                
                // Parse in chunks based on detected columns
                let chunkSize = 3;
                if (hasFlags) chunkSize = 4;
                
                for (let k = 0; k < cols.length; k += chunkSize) {
                    if (k + 2 >= cols.length) break;
                    
                    let numIdx = k;
                    let posIdx = hasFlags ? k + 2 : k + 1;
                    let nameIdx = hasFlags ? k + 3 : k + 2;
                    
                    const numText = $(cols[numIdx]).text().trim();
                    const number = parseInt(numText) || Math.floor(Math.random() * 99) + 1;
                    
                    const posText = $(cols[posIdx]).text().trim();
                    const position = parsePosition(posText);
                    
                    let name = $(cols[nameIdx]).text().trim();
                    name = name.replace(/\[.*?\]/g, '').trim(); // remove citations
                    name = name.replace(/\(.*\)/g, '').trim(); // remove parens like (emp)
                    
                    if (name && name.length > 2 && name.toLowerCase() !== 'nenhum') {
                        players.push({
                            id: `p_${team.id}_scraped_${players.length}`,
                            name: name,
                            position: position,
                            number: number,
                            rating: team.rating - 2 + Math.floor(Math.random() * 5),
                            nationality: 'Brasil',
                            photoUrl: ""
                        });
                    }
                }
            });
            
            if (players.length > 0) break; // found players
        }

        if (players.length >= 11) {
            console.log(`-> Found ${players.length} real players for ${team.name}!`);
            team.squad = players;
        } else {
            console.log(`-> Could not parse squad table for ${team.name} (found ${players.length}), keeping fallback.`);
        }

        return true;
    } catch (err) {
        console.error(`Error scraping ${team.name}:`, err.message);
        return false;
    }
}

async function main() {
    let scrapedCount = 0;
    for (const team of teamsData) {
        const isFallback = team.id.includes('_b_') || team.id.includes('_c_') || team.id.includes('_reg_');
        
        if (isFallback) {
             await scrapeWikipedia(team);
             scrapedCount++;
             await sleep(1000); // polite delay
        } else {
             if (!team.color1) {
                 team.color1 = teamColors[team.name]?.c1 || "#ffffff";
                 team.color2 = teamColors[team.name]?.c2 || "#000000";
             }
        }
    }
    fs.writeFileSync(teamsPath, JSON.stringify(teamsData, null, 2));
    console.log(`Finished scraping! Updated teams.json. Scraped ${scrapedCount} teams.`);
}

main().catch(console.error);
