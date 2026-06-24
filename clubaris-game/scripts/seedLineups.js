import fs from 'fs';
import path from 'path';

const API_KEY = 'd59adc246ba54880b1012ec5ef4261d1';
const TEAMS_FILE = path.join(process.cwd(), 'src', 'data', 'teams.json');

async function fetchFromAPI(endpoint) {
  const response = await fetch(`https://v3.football.api-sports.io/${endpoint}`, {
    method: 'GET',
    headers: {
      'x-apisports-key': API_KEY,
      'x-rapidapi-host': 'v3.football.api-sports.io'
    }
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

async function getApiFootballTeamId(teamName) {
  const cleanName = teamName.replace(' FC', '').replace(' CR', '').replace(' SE', '').replace(' SC', '');
  
  try {
    const data = await fetchFromAPI(`teams?search=${encodeURIComponent(cleanName)}`);
    if (data.response && data.response.length > 0) {
      return data.response[0].team.id;
    }
  } catch (e) {
    console.error(`Falha ao buscar ID para ${teamName}:`, e.message);
  }
  return null;
}

function normalizeName(name) {
  return name.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, '');
}

async function updateTeamsLineups() {
  console.log('Iniciando atualização de escalações reais...');
  
  const rawData = fs.readFileSync(TEAMS_FILE, 'utf8');
  let teamsData = JSON.parse(rawData);
  let updatedCount = 0;

  for (let team of teamsData) {
    console.log(`\nProcessando ${team.name}...`);
    
    const apiTeamId = await getApiFootballTeamId(team.name);
    if (!apiTeamId) {
      console.log(`ID não encontrado na API-Football para ${team.name}, pulando.`);
      continue;
    }
    console.log(`API-Football ID: ${apiTeamId}`);

    try {
      const fixturesData = await fetchFromAPI(`fixtures?team=${apiTeamId}&last=1`);
      
      if (!fixturesData.response || fixturesData.response.length === 0) {
        console.log(`Nenhuma partida encontrada para ${team.name}`);
        continue;
      }

      const lastFixture = fixturesData.response[0];
      const fixtureId = lastFixture.fixture.id;
      console.log(`Última Partida: ${lastFixture.teams.home.name} x ${lastFixture.teams.away.name} (ID: ${fixtureId})`);

      const lineupsData = await fetchFromAPI(`fixtures/lineups?fixture=${fixtureId}`);
      if (!lineupsData.response || lineupsData.response.length === 0) {
        console.log(`Escalação não disponível para esta partida.`);
        continue;
      }

      const teamLineup = lineupsData.response.find(l => l.team.id === apiTeamId);
      if (!teamLineup) {
        console.log(`Escalação do time ${team.name} não listada.`);
        continue;
      }

      console.log(`Formação: ${teamLineup.formation}`);
      team.realFormation = teamLineup.formation;
      
      team.squad.forEach(p => {
        p.isStarter = false;
        p.isBench = false;
      });

      const startXI = teamLineup.startXI;
      let matchedPlayers = 0;

      for (let slot of startXI) {
        const apiPlayerName = slot.player.name;
        const apiPlayerNum = slot.player.number;
        const normApiName = normalizeName(apiPlayerName);

        let matchedPlayer = team.squad.find(p => {
           const normDbName = normalizeName(p.name);
           if (normDbName.includes(normApiName) || normApiName.includes(normDbName)) return true;
           if (apiPlayerNum !== null && p.number === apiPlayerNum) return true;
           return false;
        });

        if (matchedPlayer && !matchedPlayer.isStarter) {
          matchedPlayer.isStarter = true;
          matchedPlayers++;
          console.log(`[+] Titular: ${matchedPlayer.name} (${matchedPlayer.position})`);
        } else {
          console.log(`[-] Não encontrado no banco: ${apiPlayerName}`);
        }
      }

      const substitutes = teamLineup.substitutes;
      for (let slot of substitutes) {
         const apiPlayerName = slot.player.name;
         const normApiName = normalizeName(apiPlayerName);
         
         let matchedPlayer = team.squad.find(p => p.isStarter !== true && p.isBench !== true && (normalizeName(p.name).includes(normApiName) || normApiName.includes(normalizeName(p.name))));
         if (matchedPlayer) {
           matchedPlayer.isBench = true;
           console.log(`[B] Reserva: ${matchedPlayer.name}`);
         }
      }

      console.log(`Mapeados ${matchedPlayers}/11 titulares.`);
      updatedCount++;
      
    } catch (err) {
      console.error(`Erro ao buscar escalação para ${team.name}:`, err.message);
    }
    
    await new Promise(r => setTimeout(r, 1000));
  }

  fs.writeFileSync(TEAMS_FILE, JSON.stringify(teamsData, null, 2), 'utf8');
  console.log(`\nAtualização concluída! ${updatedCount} times enriquecidos com escalações reais.`);
}

updateTeamsLineups();
