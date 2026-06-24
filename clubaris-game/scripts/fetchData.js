import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'd59adc246ba54880b1012ec5ef4261d1';
const HEADERS = {
  'X-Auth-Token': API_KEY
};
const BASE_URL = 'https://api.football-data.org/v4';

const LEAGUES = [
  { id: 'brazil_a', name: 'Brasileirão - Série A', folder: 'Brasil', apiCode: 'BSA' },
  { id: 'brazil_b', name: 'Brasileirão - Série B', folder: 'Brasil', apiCode: null, ratingBase: 68, fallbackTeams: ['Santos', 'Sport', 'Ceará', 'Goiás', 'Coritiba', 'Vila Nova', 'Mirassol', 'Novorizontino', 'América-MG', 'Operário', 'Avaí', 'Amazonas', 'CRB', 'Ponte Preta', 'Ituano', 'Chapecoense', 'Botafogo-SP', 'Paysandu', 'Guarani', 'Brusque'] },
  { id: 'brazil_c', name: 'Brasileirão - Série C', folder: 'Brasil', apiCode: null, ratingBase: 64, fallbackTeams: ['Náutico', 'Remo', 'Figueirense', 'CSA', 'ABC', 'Tombense', 'Londrina', 'Ypiranga', 'Ferroviária', 'São Bernardo', 'Confiança', 'Botafogo-PB', 'Volta Redonda', 'Aparecidense', 'Floresta', 'São José', 'Athletic', 'Ferroviário', 'Sampaio Corrêa', 'Caxias'] },
  { id: 'brazil_reg', name: 'Regionais', folder: 'Brasil', apiCode: null, ratingBase: 58, fallbackTeams: ['XV de Piracicaba', 'Santa Cruz', 'Paraná Clube', 'Joinville', 'Portuguesa', 'Juventus', 'Paulista', 'Bangu', 'Madureira', 'Campinense', 'Treze', 'Brasil de Pelotas'] },
  { id: 'spain_a', name: 'La Liga', folder: 'Espanha', apiCode: 'PD' },
  { id: 'spain_b', name: 'La Liga 2', folder: 'Espanha', apiCode: 'SD' },
  { id: 'england_a', name: 'Premier League', folder: 'Inglaterra', apiCode: 'PL' },
  { id: 'england_b', name: 'Championship', folder: 'Inglaterra', apiCode: 'ELC' },
  { id: 'italy_a', name: 'Serie A', folder: 'Itália', apiCode: 'SA' },
  { id: 'italy_b', name: 'Serie B', folder: 'Itália', apiCode: 'SB' },
  { id: 'intl_fra', name: 'Ligue 1', folder: 'Internacionais', apiCode: 'FL1' },
  { id: 'intl_ger', name: 'Bundesliga', folder: 'Internacionais', apiCode: 'BL1' },
  { id: 'intl_ned', name: 'Eredivisie', folder: 'Internacionais', apiCode: 'DED' },
  { id: 'intl_por', name: 'Primeira Liga', folder: 'Internacionais', apiCode: 'PPL' }
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function fetchAPI(endpoint) {
  console.log(`Fetching ${endpoint}...`);
  const response = await fetch(`${BASE_URL}${endpoint}`, { headers: HEADERS });
  if (response.status === 429) {
      console.warn("Rate limit hit, sleeping for 6.5 seconds...");
      await sleep(6500);
      return fetchAPI(endpoint); // Retry
  }
  const data = await response.json();
  if (data.errorCode) {
    console.error("API Error:", data.message);
  }
  
  // Rate limit: 10 per minute -> sleep 6.5s to be safe
  await sleep(6500);
  
  return data;
}

function mapPosition(apiPos) {
  if (!apiPos) return 'CM';
  const pos = apiPos.toLowerCase();
  if (pos.includes('goalkeeper')) return 'GK';
  if (pos.includes('back') || pos.includes('defence')) return 'CB';
  if (pos.includes('midfield')) return 'CM';
  if (pos.includes('wing') || pos.includes('forward') || pos.includes('offence') || pos.includes('striker')) return 'ST';
  return 'CM';
}

function generateRating(leagueId) {
    let base = 70;
    if (leagueId.includes('_a')) base = 75; // Top divisions
    if (leagueId.includes('england_a') || leagueId.includes('spain_a')) base = 78;
    if (leagueId.includes('_b')) base = 68; // Second divisions
    if (leagueId.includes('_c')) base = 64; 
    if (leagueId.includes('_reg')) base = 58;
    if (leagueId.includes('intl')) base = 74; // International top
    
    return base + Math.floor(Math.random() * 10);
}

const firstNames = ['João', 'Pedro', 'Lucas', 'Gabriel', 'Mateus', 'Tiago', 'Felipe', 'Bruno', 'Rafael', 'Rodrigo', 'Fernando', 'Carlos', 'Eduardo', 'André', 'Luiz', 'Gustavo', 'Marcelo', 'Leonardo'];
const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Costa', 'Pereira', 'Alves', 'Ribeiro', 'Carvalho', 'Almeida', 'Gomes', 'Martins', 'Barbosa', 'Ferreira', 'Rocha', 'Dias', 'Mendes', 'Nunes'];

function generateBrazilName() {
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

async function main() {
  const outLeagues = [];
  const outTeams = [];

  for (const league of LEAGUES) {
    outLeagues.push({
      id: league.id,
      name: league.name,
      folder: league.folder
    });

    if (league.apiCode) {
      // Fetch from API
      let data = await fetchAPI(`/competitions/${league.apiCode}/teams?season=2024`);
      
      // Fallback to 2023 if squads are empty or season not available
      let use2023 = false;
      if (!data.teams) {
          use2023 = true;
      } else if (data.teams.length > 0) {
          if (!data.teams[0].squad || data.teams[0].squad.length === 0) {
              use2023 = true;
          }
      }

      if (use2023) {
          console.log(`Squads empty or missing for 2024, falling back to 2023 for ${league.apiCode}...`);
          data = await fetchAPI(`/competitions/${league.apiCode}/teams?season=2023`);
      }

      if (!data.teams) continue;

      for (const team of data.teams) {
        console.log(`Processing ${team.name}...`);
        
        const teamObj = {
          id: team.id.toString(),
          name: team.name,
          leagueId: league.id,
          badgeUrl: team.crest,
          rating: generateRating(league.id) + 5,
          country: league.folder === 'Brasil' ? 'Brasil' : (league.folder === 'Internacionais' ? 'Variado' : league.folder),
          squad: []
        };

        if (team.squad && team.squad.length > 0) {
          teamObj.squad = team.squad.map(p => {
             // Map Nationality
             let nat = p.nationality;
             if (nat === 'Brazil') nat = 'Brasil';
             else if (nat === 'Spain') nat = 'Espanha';
             else if (nat === 'England') nat = 'Inglaterra';
             else if (nat === 'Italy') nat = 'Itália';

             return {
              id: `p_${p.id}`,
              name: p.name,
              position: mapPosition(p.position),
              number: p.shirtNumber || Math.floor(Math.random() * 99) + 1,
              rating: generateRating(league.id),
              nationality: nat || 'Desconhecida',
              photoUrl: "" 
             };
          });
        } else {
          // Fallback squad if still empty from API
          for(let i=1; i<=20; i++) {
             teamObj.squad.push({
               id: `p_${team.id}_${i}`,
               name: `Player ${i}`,
               position: i === 1 ? 'GK' : i < 6 ? 'CB' : i < 11 ? 'CM' : 'ST',
               number: i,
               rating: generateRating(league.id),
               nationality: league.folder === 'Brasil' ? 'Brasil' : 'Desconhecida',
               photoUrl: ""
             });
          }
        }

        outTeams.push(teamObj);
      }
    } else if (league.fallbackTeams) {
        // Generate fallback teams for non-API leagues
        console.log(`Generating fallback teams for ${league.name}...`);
        for (let idx = 0; idx < league.fallbackTeams.length; idx++) {
            const teamName = league.fallbackTeams[idx];
            const teamId = `${league.id}_${idx}`;
            
            const teamObj = {
                id: teamId,
                name: teamName,
                leagueId: league.id,
                badgeUrl: "", // No badge for generated
                rating: league.ratingBase + Math.floor(Math.random() * 5),
                country: 'Brasil', // Fallbacks are only for Brazil in our current logic
                squad: []
            };

            for(let i=1; i<=20; i++) {
                teamObj.squad.push({
                  id: `p_${teamId}_${i}`,
                  name: generateBrazilName(),
                  position: i === 1 ? 'GK' : i < 6 ? 'CB' : i < 11 ? 'CM' : 'ST',
                  number: i,
                  rating: league.ratingBase + Math.floor(Math.random() * 8),
                  nationality: 'Brasil',
                  photoUrl: ""
                });
             }
             outTeams.push(teamObj);
        }
    }
  }

  const dataDir = path.join(__dirname, '..', 'src', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(path.join(dataDir, 'leagues.json'), JSON.stringify(outLeagues, null, 2));
  fs.writeFileSync(path.join(dataDir, 'teams.json'), JSON.stringify(outTeams, null, 2));

  console.log('Successfully generated leagues.json and teams.json!');
}

main().catch(console.error);
