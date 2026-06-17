const fs = require('fs');

const path = 'c:/Users/gesse/Downloads/clubaris/clubaris-game/src/data/teams.json';
const data = fs.readFileSync(path, 'utf8');
const teams = JSON.parse(data);

const firstNames = ["Gabriel", "Lucas", "Matheus", "Pedro", "João", "Felipe", "Guilherme", "Rafael", "Thiago", "Victor", "Bruno", "Leonardo", "Eduardo", "Marcos", "Rodrigo"];
const lastNames = ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Gomes", "Costa", "Ribeiro", "Martins", "Carvalho", "Almeida"];

function generateSquad(baseRating) {
  const positions = ["GK", "RB", "CB", "CB", "LB", "CDM", "CM", "CAM", "RW", "ST", "LW", "ST", "CM", "CB", "GK"];
  return positions.map((pos, index) => {
    const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return {
      id: `p_${Math.random().toString(36).substr(2, 9)}`,
      name: `${fName} ${lName}`,
      position: pos,
      rating: baseRating + Math.floor(Math.random() * 5) - 2,
      number: index + 1 === 15 ? 12 : index + 1
    };
  });
}

function overrideSquad(squad, realPlayers) {
  realPlayers.forEach((rp, i) => {
    if (squad[i]) {
      squad[i].name = rp.name;
      squad[i].position = rp.position;
      squad[i].rating = rp.rating;
    }
  });
  return squad;
}

const remainingSerieA = [
  {
    id: "fluminense", name: "Fluminense", leagueId: "brazil", badgeUrl: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Fluminense_FC_escudo.png", rating: 77,
    realPlayers: [
      {name: "Fábio", position: "GK", rating: 78}, {name: "Samuel Xavier", position: "RB", rating: 75},
      {name: "Thiago Silva", position: "CB", rating: 80}, {name: "Felipe Melo", position: "CB", rating: 75},
      {name: "Marcelo", position: "LB", rating: 78}, {name: "André", position: "CDM", rating: 80},
      {name: "Martinelli", position: "CM", rating: 76}, {name: "Ganso", position: "CAM", rating: 78},
      {name: "Jhon Arias", position: "RW", rating: 80}, {name: "Germán Cano", position: "ST", rating: 79},
      {name: "Keno", position: "LW", rating: 76}
    ]
  },
  {
    id: "internacional", name: "Internacional", leagueId: "brazil", badgeUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f1/Escudo_do_Sport_Club_Internacional.svg", rating: 77,
    realPlayers: [
      {name: "Rochet", position: "GK", rating: 79}, {name: "Bustos", position: "RB", rating: 76},
      {name: "Vitão", position: "CB", rating: 77}, {name: "Mercado", position: "CB", rating: 76},
      {name: "Renê", position: "LB", rating: 75}, {name: "Thiago Maia", position: "CDM", rating: 77},
      {name: "Aránguiz", position: "CM", rating: 78}, {name: "Alan Patrick", position: "CAM", rating: 80},
      {name: "Wanderson", position: "LW", rating: 77}, {name: "Enner Valencia", position: "ST", rating: 80},
      {name: "Borré", position: "ST", rating: 78}
    ]
  },
  {
    id: "atletico_mg", name: "Atlético Mineiro", leagueId: "brazil", badgeUrl: "https://upload.wikimedia.org/wikipedia/commons/2/27/Clube_Atl%C3%A9tico_Mineiro_logo.svg", rating: 78,
    realPlayers: [
      {name: "Everson", position: "GK", rating: 78}, {name: "Saravia", position: "RB", rating: 75},
      {name: "Jemerson", position: "CB", rating: 76}, {name: "Bruno Fuchs", position: "CB", rating: 75},
      {name: "Guilherme Arana", position: "LB", rating: 79}, {name: "Battaglia", position: "CDM", rating: 77},
      {name: "Zaracho", position: "CM", rating: 78}, {name: "Gustavo Scarpa", position: "CAM", rating: 79},
      {name: "Paulinho", position: "LW", rating: 80}, {name: "Hulk", position: "ST", rating: 81},
      {name: "Vargas", position: "ST", rating: 76}
    ]
  },
  {
    id: "athletico_pr", name: "Athletico Paranaense", leagueId: "brazil", badgeUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b3/CA_Athletico_Paranaense.svg", rating: 76,
    realPlayers: [
      {name: "Bento", position: "GK", rating: 80}, {name: "Madson", position: "RB", rating: 74},
      {name: "Thiago Heleno", position: "CB", rating: 76}, {name: "Gamarra", position: "CB", rating: 74},
      {name: "Esquivel", position: "LB", rating: 75}, {name: "Fernandinho", position: "CDM", rating: 79},
      {name: "Erick", position: "CM", rating: 76}, {name: "Zapelli", position: "CAM", rating: 75},
      {name: "Canobbio", position: "RW", rating: 76}, {name: "Mastriani", position: "ST", rating: 77},
      {name: "Cuello", position: "LW", rating: 74}
    ]
  },
  {
    id: "bahia", name: "Bahia", leagueId: "brazil", badgeUrl: "https://upload.wikimedia.org/wikipedia/en/2/2c/Esporte_Clube_Bahia_logo.svg", rating: 75,
    realPlayers: [
      {name: "Marcos Felipe", position: "GK", rating: 75}, {name: "Arias", position: "RB", rating: 76},
      {name: "Kanu", position: "CB", rating: 75}, {name: "Víctor Cuesta", position: "CB", rating: 74},
      {name: "Luciano Juba", position: "LB", rating: 75}, {name: "Jean Lucas", position: "CM", rating: 76},
      {name: "Caio Alexandre", position: "CDM", rating: 77}, {name: "Everton Ribeiro", position: "CAM", rating: 79},
      {name: "Cauly", position: "CAM", rating: 78}, {name: "Thaciano", position: "ST", rating: 75},
      {name: "Everaldo", position: "ST", rating: 74}
    ]
  },
  {
    id: "fortaleza", name: "Fortaleza", leagueId: "brazil", badgeUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ed/Escudo_do_Fortaleza_Esporte_Clube.svg", rating: 75,
    realPlayers: [
      {name: "João Ricardo", position: "GK", rating: 76}, {name: "Tinga", position: "RB", rating: 75},
      {name: "Brítez", position: "CB", rating: 75}, {name: "Titi", position: "CB", rating: 74},
      {name: "Bruno Pacheco", position: "LB", rating: 74}, {name: "Hércules", position: "CM", rating: 75},
      {name: "Zé Welison", position: "CDM", rating: 75}, {name: "Pochettino", position: "CAM", rating: 76},
      {name: "Yago Pikachu", position: "RW", rating: 76}, {name: "Moisés", position: "LW", rating: 75},
      {name: "Lucero", position: "ST", rating: 77}
    ]
  },
  {
    id: "bragantino", name: "Red Bull Bragantino", leagueId: "brazil", badgeUrl: "https://upload.wikimedia.org/wikipedia/pt/9/9e/RedBullBragantino.png", rating: 75,
    realPlayers: [
      {name: "Cleiton", position: "GK", rating: 76}, {name: "Nathan", position: "RB", rating: 73},
      {name: "Pedro Henrique", position: "CB", rating: 74}, {name: "Luan Cândido", position: "CB", rating: 75},
      {name: "Juninho Capixaba", position: "LB", rating: 76}, {name: "Jadsom", position: "CDM", rating: 75},
      {name: "Lucas Evangelista", position: "CM", rating: 76}, {name: "Lincoln", position: "CAM", rating: 75},
      {name: "Helinho", position: "RW", rating: 76}, {name: "Eduardo Sasha", position: "ST", rating: 75},
      {name: "Thiago Borbas", position: "ST", rating: 74}
    ]
  },
  {
    id: "vitoria", name: "Vitória", leagueId: "brazil", badgeUrl: "https://upload.wikimedia.org/wikipedia/commons/0/07/Esporte_Clube_Vit%C3%B3ria_logo.svg", rating: 71,
    realPlayers: [
      {name: "Lucas Arcanjo", position: "GK", rating: 72}, {name: "Zeca", position: "RB", rating: 71},
      {name: "Camutanga", position: "CB", rating: 71}, {name: "Wagner Leonardo", position: "CB", rating: 72},
      {name: "Patric Calmon", position: "LB", rating: 70}, {name: "Dudu", position: "CDM", rating: 71},
      {name: "Willian Oliveira", position: "CM", rating: 71}, {name: "Matheuzinho", position: "CAM", rating: 72},
      {name: "Osvaldo", position: "RW", rating: 71}, {name: "Mateus Gonçalves", position: "LW", rating: 70},
      {name: "Alerrandro", position: "ST", rating: 71}
    ]
  },
  {
    id: "juventude", name: "Juventude", leagueId: "brazil", badgeUrl: "https://upload.wikimedia.org/wikipedia/commons/a/af/Esporte_Clube_Juventude_logo.svg", rating: 71,
    realPlayers: [
      {name: "Gabriel", position: "GK", rating: 72}, {name: "João Lucas", position: "RB", rating: 71},
      {name: "Zé Marcos", position: "CB", rating: 71}, {name: "Danilo Boza", position: "CB", rating: 70},
      {name: "Alan Ruschel", position: "LB", rating: 71}, {name: "Caíque", position: "CDM", rating: 70},
      {name: "Jadson", position: "CM", rating: 71}, {name: "Jean Carlos", position: "CAM", rating: 72},
      {name: "Lucas Barbosa", position: "RW", rating: 71}, {name: "Erick Farias", position: "LW", rating: 70},
      {name: "Gilberto", position: "ST", rating: 72}
    ]
  },
  {
    id: "criciuma", name: "Criciúma", leagueId: "brazil", badgeUrl: "https://upload.wikimedia.org/wikipedia/commons/7/77/Crici%C3%BAma.svg", rating: 71,
    realPlayers: [
      {name: "Gustavo", position: "GK", rating: 71}, {name: "Claudinho", position: "RB", rating: 70},
      {name: "Rodrigo", position: "CB", rating: 71}, {name: "Wilker Ángel", position: "CB", rating: 71},
      {name: "Marcelo Hermes", position: "LB", rating: 71}, {name: "Barreto", position: "CDM", rating: 70},
      {name: "Fellipe Mateus", position: "CM", rating: 71}, {name: "Marquinhos Gabriel", position: "CAM", rating: 72},
      {name: "Éder", position: "ST", rating: 72}, {name: "Renato Kayzer", position: "ST", rating: 71},
      {name: "Arthur Caíke", position: "LW", rating: 70}
    ]
  },
  {
    id: "atletico_go", name: "Atlético Goianiense", leagueId: "brazil", badgeUrl: "https://upload.wikimedia.org/wikipedia/commons/8/87/Drag%C3%A3o.png", rating: 71,
    realPlayers: [
      {name: "Ronaldo", position: "GK", rating: 72}, {name: "Bruno Tubarão", position: "RB", rating: 70},
      {name: "Adriano Martins", position: "CB", rating: 70}, {name: "Alix Vinícius", position: "CB", rating: 71},
      {name: "Guilherme Romão", position: "LB", rating: 71}, {name: "Gabriel Baralhas", position: "CDM", rating: 71},
      {name: "Rhaldney", position: "CM", rating: 70}, {name: "Shaylon", position: "CAM", rating: 73},
      {name: "Alejo Cruz", position: "LW", rating: 71}, {name: "Luiz Fernando", position: "RW", rating: 72},
      {name: "Emiliano Rodríguez", position: "ST", rating: 70}
    ]
  },
  {
    id: "cuiaba", name: "Cuiabá", leagueId: "brazil", badgeUrl: "https://upload.wikimedia.org/wikipedia/en/9/9b/Cuiab%C3%A1_Esporte_Clube_logo.svg", rating: 72,
    realPlayers: [
      {name: "Walter", position: "GK", rating: 74}, {name: "Matheus Alexandre", position: "RB", rating: 72},
      {name: "Marllon", position: "CB", rating: 72}, {name: "Alan Empereur", position: "CB", rating: 73},
      {name: "Ramon", position: "LB", rating: 71}, {name: "Lucas Mineiro", position: "CDM", rating: 71},
      {name: "Fernando Sobral", position: "CM", rating: 72}, {name: "Max", position: "CAM", rating: 71},
      {name: "Clayson", position: "LW", rating: 73}, {name: "Derik Lacerda", position: "RW", rating: 71},
      {name: "Isidro Pitta", position: "ST", rating: 73}
    ]
  }
];

const remainingSerieB = [
  { id: "goias", name: "Goiás", badgeUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Goi%C3%A1s_Esporte_Clube_logo.svg", rating: 71 },
  { id: "coritiba", name: "Coritiba", badgeUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b2/Coritiba_FBC_logo.svg", rating: 71 },
  { id: "america_mg", name: "América Mineiro", badgeUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Am%C3%A9rica_Futebol_Clube_%28MG%29_logo.svg", rating: 71 },
  { id: "vila_nova", name: "Vila Nova", badgeUrl: "https://upload.wikimedia.org/wikipedia/commons/a/aa/Escudo_do_Vila_Nova_Futebol_Clube.svg", rating: 70 },
  { id: "novorizontino", name: "Novorizontino", badgeUrl: "https://upload.wikimedia.org/wikipedia/pt/b/b1/Gremio_Novorizontino.png", rating: 70 },
  { id: "mirassol", name: "Mirassol", badgeUrl: "https://upload.wikimedia.org/wikipedia/pt/4/4c/Mirassol_Futebol_Clube.png", rating: 69 },
  { id: "operario_pr", name: "Operário-PR", badgeUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8c/Oper%C3%A1rio_Ferrovi%C3%A1rio_Esporte_Clube_logo.svg", rating: 69 },
  { id: "avai", name: "Avaí", badgeUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Avai_FC_logo.svg", rating: 70 },
  { id: "amazonas", name: "Amazonas", badgeUrl: "https://upload.wikimedia.org/wikipedia/commons/f/fb/Amazonas_Futebol_Clube_logo.svg", rating: 68 },
  { id: "crb", name: "CRB", badgeUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a7/Clube_de_Regatas_Brasil_logo.svg", rating: 69 },
  { id: "paysandu", name: "Paysandu", badgeUrl: "https://upload.wikimedia.org/wikipedia/commons/d/da/Paysandu_Sport_Club_logo.svg", rating: 69 },
  { id: "ponte_preta", name: "Ponte Preta", badgeUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8e/Associa%C3%A7%C3%A3o_Atl%C3%A9tica_Ponte_Preta_logo.svg", rating: 69 },
  { id: "chapecoense", name: "Chapecoense", badgeUrl: "https://upload.wikimedia.org/wikipedia/commons/5/52/Associa%C3%A7%C3%A3o_Chapecoense_de_Futebol_logo.svg", rating: 69 },
  { id: "botafogo_sp", name: "Botafogo-SP", badgeUrl: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Botafogo_FC_Ribeir%C3%A3o_Preto_logo.svg", rating: 68 },
  { id: "ituano", name: "Ituano", badgeUrl: "https://upload.wikimedia.org/wikipedia/pt/e/ee/Ituano_Futebol_Clube.png", rating: 68 },
  { id: "brusque", name: "Brusque", badgeUrl: "https://upload.wikimedia.org/wikipedia/commons/9/91/Brusque_Futebol_Clube_logo.svg", rating: 67 },
  { id: "guarani", name: "Guarani", badgeUrl: "https://upload.wikimedia.org/wikipedia/commons/8/81/Guarani_Futebol_Clube_logo.svg", rating: 68 }
];

remainingSerieA.forEach(teamData => {
  const newTeam = {
    id: teamData.id,
    name: teamData.name,
    leagueId: teamData.leagueId,
    badgeUrl: teamData.badgeUrl,
    rating: teamData.rating,
    squad: overrideSquad(generateSquad(teamData.rating), teamData.realPlayers)
  };
  teams.push(newTeam);
});

remainingSerieB.forEach(teamData => {
  const newTeam = {
    id: teamData.id,
    name: teamData.name,
    leagueId: "brazil_b",
    badgeUrl: teamData.badgeUrl,
    rating: teamData.rating,
    squad: generateSquad(teamData.rating) // Fully generated squads for minor Serie B teams to save space
  };
  teams.push(newTeam);
});

fs.writeFileSync(path, JSON.stringify(teams, null, 2), 'utf8');
console.log(`Successfully added ${remainingSerieA.length + remainingSerieB.length} more teams! Total is now ${teams.length}.`);
