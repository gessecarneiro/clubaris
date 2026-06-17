const fs = require('fs');

const path = 'c:/Users/gesse/Downloads/clubaris/clubaris-game/src/data/teams.json';
const data = fs.readFileSync(path, 'utf8');
const teams = JSON.parse(data);

const newTeams = [
  // BRASILEIRÃO SÉRIE A
  {
    id: "corinthians",
    name: "Corinthians",
    leagueId: "brazil",
    badgeUrl: "https://upload.wikimedia.org/wikipedia/en/5/5a/Sport_Club_Corinthians_Paulista_crest.svg",
    rating: 76,
    squad: [
      { id: "cassio", name: "Cássio", position: "GK", rating: 78, number: 12 },
      { id: "fagner", name: "Fagner", position: "RB", rating: 76, number: 23 },
      { id: "f_torres", name: "Félix Torres", position: "CB", rating: 76, number: 3 },
      { id: "g_henrique", name: "Gustavo Henrique", position: "CB", rating: 74, number: 4 },
      { id: "h_palacios", name: "Hugo", position: "LB", rating: 73, number: 46 },
      { id: "raniele", name: "Raniele", position: "CDM", rating: 76, number: 14 },
      { id: "b_bidon", name: "Breno Bidon", position: "CM", rating: 73, number: 27 },
      { id: "r_garro", name: "Rodrigo Garro", position: "CAM", rating: 79, number: 10 },
      { id: "y_alberto", name: "Yuri Alberto", position: "ST", rating: 76, number: 9 },
      { id: "w_esley", name: "Wesley", position: "LW", rating: 75, number: 36 },
      { id: "a_romero", name: "Ángel Romero", position: "RW", rating: 76, number: 11 },
      { id: "i_coronado", name: "Igor Coronado", position: "CAM", rating: 77, number: 77 },
      { id: "p_raul", name: "Pedro Raul", position: "ST", rating: 74, number: 20 },
      { id: "fausto_v", name: "Fausto Vera", position: "CDM", rating: 75, number: 5 },
      { id: "c_miguel", name: "Carlos Miguel", position: "GK", rating: 75, number: 22 }
    ]
  },
  {
    id: "gremio",
    name: "Grêmio",
    leagueId: "brazil",
    badgeUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ed/Gremio_Logo.svg",
    rating: 76,
    squad: [
      { id: "marchesin", name: "Agustín Marchesín", position: "GK", rating: 77, number: 1 },
      { id: "j_pedro", name: "João Pedro", position: "RB", rating: 75, number: 18 },
      { id: "geromel", name: "Pedro Geromel", position: "CB", rating: 77, number: 3 },
      { id: "kannemann", name: "Walter Kannemann", position: "CB", rating: 76, number: 4 },
      { id: "reinaldo", name: "Reinaldo", position: "LB", rating: 75, number: 6 },
      { id: "villasanti", name: "Mathías Villasanti", position: "CDM", rating: 79, number: 20 },
      { id: "pepe", name: "Pepê", position: "CM", rating: 76, number: 23 },
      { id: "cristaldo", name: "Franco Cristaldo", position: "CAM", rating: 78, number: 10 },
      { id: "pavon", name: "Cristian Pavón", position: "RW", rating: 77, number: 21 },
      { id: "soteldo", name: "Yeferson Soteldo", position: "LW", rating: 78, number: 7 },
      { id: "d_costa", name: "Diego Costa", position: "ST", rating: 78, number: 19 },
      { id: "jp_galvao", name: "João Pedro Galvão", position: "ST", rating: 74, number: 11 },
      { id: "d_queiroz", name: "Du Queiroz", position: "CM", rating: 74, number: 37 },
      { id: "ely", name: "Rodrigo Ely", position: "CB", rating: 74, number: 5 },
      { id: "nathan", name: "Nathan Fernandes", position: "LW", rating: 73, number: 32 }
    ]
  },
  {
    id: "cruzeiro",
    name: "Cruzeiro",
    leagueId: "brazil",
    badgeUrl: "https://upload.wikimedia.org/wikipedia/commons/9/90/Cruzeiro_Esporte_Clube_%28logo%29.svg",
    rating: 75,
    squad: [
      { id: "rafael_c", name: "Rafael Cabral", position: "GK", rating: 75, number: 1 },
      { id: "william", name: "William", position: "RB", rating: 76, number: 12 },
      { id: "ze_ivaldo", name: "Zé Ivaldo", position: "CB", rating: 75, number: 5 },
      { id: "neris", name: "Neris", position: "CB", rating: 74, number: 27 },
      { id: "marlon", name: "Marlon", position: "LB", rating: 77, number: 3 },
      { id: "l_romero", name: "Lucas Romero", position: "CDM", rating: 76, number: 29 },
      { id: "l_silva", name: "Lucas Silva", position: "CM", rating: 75, number: 16 },
      { id: "m_pereira", name: "Matheus Pereira", position: "CAM", rating: 79, number: 10 },
      { id: "arthur_g", name: "Arthur Gomes", position: "LW", rating: 75, number: 11 },
      { id: "dinenno", name: "Juan Dinenno", position: "ST", rating: 76, number: 9 },
      { id: "r_papagaio", name: "Rafael Elias", position: "ST", rating: 73, number: 19 },
      { id: "barreal", name: "Álvaro Barreal", position: "LW", rating: 75, number: 21 },
      { id: "ramiro", name: "Ramiro", position: "CM", rating: 74, number: 17 },
      { id: "m_vital", name: "Mateus Vital", position: "CAM", rating: 74, number: 7 },
      { id: "j_marcelo", name: "João Marcelo", position: "CB", rating: 73, number: 43 }
    ]
  },
  {
    id: "vasco",
    name: "Vasco da Gama",
    leagueId: "brazil",
    badgeUrl: "https://upload.wikimedia.org/wikipedia/en/1/1a/Club_de_Regatas_Vasco_da_Gama_crest.svg",
    rating: 74,
    squad: [
      { id: "leo_jardim", name: "Léo Jardim", position: "GK", rating: 77, number: 1 },
      { id: "p_rodriguez", name: "Puma Rodríguez", position: "RB", rating: 74, number: 2 },
      { id: "medél", name: "Gary Medel", position: "CB", rating: 76, number: 17 },
      { id: "leo", name: "Léo", position: "CB", rating: 74, number: 3 },
      { id: "l_piton", name: "Lucas Piton", position: "LB", rating: 76, number: 6 },
      { id: "ze_gabriel", name: "Zé Gabriel", position: "CDM", rating: 73, number: 23 },
      { id: "sforza", name: "Juan Sforza", position: "CM", rating: 74, number: 20 },
      { id: "payet", name: "Dimitri Payet", position: "CAM", rating: 79, number: 10 },
      { id: "adson", name: "Adson", position: "RW", rating: 75, number: 28 },
      { id: "vegetti", name: "Pablo Vegetti", position: "ST", rating: 77, number: 99 },
      { id: "d_david", name: "David", position: "LW", rating: 74, number: 7 },
      { id: "p_garcia", name: "Pablo Galdames", position: "CM", rating: 74, number: 27 },
      { id: "maicon", name: "Maicon", position: "CB", rating: 73, number: 4 },
      { id: "j_victor", name: "João Victor", position: "CB", rating: 74, number: 38 },
      { id: "rayan", name: "Rayan", position: "ST", rating: 72, number: 77 }
    ]
  },

  // BRASILEIRÃO SÉRIE B
  {
    id: "santos",
    name: "Santos",
    leagueId: "brazil_b",
    badgeUrl: "https://upload.wikimedia.org/wikipedia/commons/1/15/Santos_Logo.png",
    rating: 74,
    squad: [
      { id: "j_paulo", name: "João Paulo", position: "GK", rating: 77, number: 1 },
      { id: "aderlan", name: "Aderlan", position: "RB", rating: 74, number: 4 },
      { id: "gil", name: "Gil", position: "CB", rating: 75, number: 2 },
      { id: "j_basso", name: "Joaquim", position: "CB", rating: 76, number: 6 },
      { id: "escobar", name: "Gonzalo Escobar", position: "LB", rating: 73, number: 31 },
      { id: "j_schmidt", name: "João Schmidt", position: "CDM", rating: 75, number: 5 },
      { id: "pituca", name: "Diego Pituca", position: "CM", rating: 75, number: 21 },
      { id: "giuliano", name: "Giuliano", position: "CAM", rating: 76, number: 10 },
      { id: "otero", name: "Rómulo Otero", position: "RW", rating: 75, number: 22 },
      { id: "furch", name: "Julio Furch", position: "ST", rating: 75, number: 9 },
      { id: "guilherme", name: "Guilherme", position: "LW", rating: 76, number: 11 },
      { id: "bigode", name: "Willian Bigode", position: "ST", rating: 73, number: 27 },
      { id: "rincon", name: "Tomás Rincón", position: "CDM", rating: 74, number: 8 },
      { id: "pedrinho", name: "Pedrinho", position: "LW", rating: 72, number: 7 },
      { id: "messias", name: "Messias", position: "CB", rating: 72, number: 3 }
    ]
  },
  {
    id: "sport_recife",
    name: "Sport Recife",
    leagueId: "brazil_b",
    badgeUrl: "https://upload.wikimedia.org/wikipedia/pt/2/22/Sport_Club_do_Recife.png",
    rating: 72,
    squad: [
      { id: "caique_f", name: "Caíque França", position: "GK", rating: 71, number: 1 },
      { id: "p_lima", name: "Pedro Lima", position: "RB", rating: 72, number: 2 },
      { id: "rafael_t", name: "Rafael Thyere", position: "CB", rating: 73, number: 15 },
      { id: "luciano_c", name: "Luciano Castán", position: "CB", rating: 72, number: 4 },
      { id: "felipinho", name: "Felipinho", position: "LB", rating: 71, number: 16 },
      { id: "felipe", name: "Felipe", position: "CDM", rating: 71, number: 5 },
      { id: "fabricio_d", name: "Fabrício Domínguez", position: "CM", rating: 70, number: 8 },
      { id: "lucas_l", name: "Lucas Lima", position: "CAM", rating: 74, number: 19 },
      { id: "barletta", name: "Chrystian Barletta", position: "RW", rating: 72, number: 30 },
      { id: "gustavo_c", name: "Gustavo Coutinho", position: "ST", rating: 73, number: 9 },
      { id: "romarinho", name: "Romarinho", position: "LW", rating: 72, number: 11 },
      { id: "alan_r", name: "Alan Ruiz", position: "CAM", rating: 72, number: 10 },
      { id: "ze_roberto", name: "Zé Roberto", position: "ST", rating: 70, number: 99 },
      { id: "r_cruz", name: "Roberto Rosales", position: "RB", rating: 71, number: 18 },
      { id: "allyson", name: "Alisson Cassiano", position: "CB", rating: 69, number: 33 }
    ]
  },
  {
    id: "ceara",
    name: "Ceará",
    leagueId: "brazil_b",
    badgeUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Cear%C3%A1_Sporting_Club_logo.svg",
    rating: 71,
    squad: [
      { id: "richard", name: "Richard", position: "GK", rating: 72, number: 1 },
      { id: "rai_ramos", name: "Raí Ramos", position: "RB", rating: 70, number: 2 },
      { id: "m_victor", name: "Matheus Felipe", position: "CB", rating: 70, number: 3 },
      { id: "d_menezes", name: "David Ricardo", position: "CB", rating: 69, number: 4 },
      { id: "matheus_b", name: "Matheus Bahia", position: "LB", rating: 71, number: 6 },
      { id: "richard_c", name: "Richardson", position: "CDM", rating: 72, number: 7 },
      { id: "l_mugni", name: "Lucas Mugni", position: "CM", rating: 72, number: 10 },
      { id: "castilho", name: "Guilherme Castilho", position: "CAM", rating: 73, number: 99 },
      { id: "erick_p", name: "Erick Pulga", position: "LW", rating: 74, number: 16 },
      { id: "saulo_m", name: "Saulo Mineiro", position: "ST", rating: 71, number: 73 },
      { id: "facundo", name: "Facundo Barceló", position: "ST", rating: 71, number: 31 },
      { id: "jean_i", name: "Jean Irmer", position: "CDM", rating: 70, number: 5 },
      { id: "b_araujo", name: "Bruninho", position: "CAM", rating: 70, number: 27 },
      { id: "j_receba", name: "Janderson", position: "RW", rating: 70, number: 11 },
      { id: "jonathan", name: "Jonathan", position: "CB", rating: 68, number: 13 }
    ]
  },

  // LA LIGA
  {
    id: "atletico_madrid",
    name: "Atlético Madrid",
    leagueId: "spain",
    badgeUrl: "https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg",
    rating: 84,
    squad: [
      { id: "j_oblak", name: "Jan Oblak", position: "GK", rating: 88, number: 13 },
      { id: "n_molina", name: "Nahuel Molina", position: "RWB", rating: 82, number: 16 },
      { id: "j_gimenez", name: "José Giménez", position: "CB", rating: 83, number: 2 },
      { id: "m_hermoso", name: "Mario Hermoso", position: "CB", rating: 82, number: 22 },
      { id: "s_savic", name: "Stefan Savić", position: "CB", rating: 82, number: 15 },
      { id: "s_lino", name: "Samuel Lino", position: "LWB", rating: 81, number: 12 },
      { id: "koke", name: "Koke", position: "CM", rating: 84, number: 6 },
      { id: "r_depaul", name: "Rodrigo De Paul", position: "CM", rating: 84, number: 5 },
      { id: "m_llorente", name: "Marcos Llorente", position: "RM", rating: 84, number: 14 },
      { id: "a_griezmann", name: "Antoine Griezmann", position: "CF", rating: 88, number: 7 },
      { id: "a_morata", name: "Álvaro Morata", position: "ST", rating: 83, number: 19 },
      { id: "a_correa", name: "Ángel Correa", position: "ST", rating: 82, number: 10 },
      { id: "r_riquelme", name: "Rodrigo Riquelme", position: "LM", rating: 80, number: 17 },
      { id: "p_barrios", name: "Pablo Barrios", position: "CM", rating: 79, number: 24 },
      { id: "w_witsel", name: "Axel Witsel", position: "CB", rating: 81, number: 20 }
    ]
  },
  {
    id: "athletic_bilbao",
    name: "Athletic Bilbao",
    leagueId: "spain",
    badgeUrl: "https://upload.wikimedia.org/wikipedia/en/9/9a/Athletic_Club_logo.svg",
    rating: 81,
    squad: [
      { id: "u_simon", name: "Unai Simón", position: "GK", rating: 84, number: 1 },
      { id: "o_demarcos", name: "Óscar de Marcos", position: "RB", rating: 79, number: 18 },
      { id: "d_vivian", name: "Dani Vivian", position: "CB", rating: 80, number: 3 },
      { id: "a_paredes", name: "Aitor Paredes", position: "CB", rating: 78, number: 4 },
      { id: "y_berchiche", name: "Yuri Berchiche", position: "LB", rating: 80, number: 17 },
      { id: "m_vesga", name: "Mikel Vesga", position: "CDM", rating: 79, number: 6 },
      { id: "i_ruiz", name: "Iñigo Ruiz de Galarreta", position: "CM", rating: 80, number: 16 },
      { id: "o_sancet", name: "Oihan Sancet", position: "CAM", rating: 81, number: 8 },
      { id: "i_williams", name: "Iñaki Williams", position: "RW", rating: 82, number: 9 },
      { id: "g_guruzeta", name: "Gorka Guruzeta", position: "ST", rating: 79, number: 12 },
      { id: "n_williams", name: "Nico Williams", position: "LW", rating: 83, number: 11 },
      { id: "a_berenguer", name: "Álex Berenguer", position: "LW", rating: 79, number: 7 },
      { id: "a_herrera", name: "Ander Herrera", position: "CM", rating: 78, number: 21 },
      { id: "i_muniain", name: "Iker Muniain", position: "CAM", rating: 79, number: 10 },
      { id: "y_alvarez", name: "Yeray Álvarez", position: "CB", rating: 80, number: 5 }
    ]
  }
];

teams.push(...newTeams);

fs.writeFileSync(path, JSON.stringify(teams, null, 2), 'utf8');
console.log('Successfully added ' + newTeams.length + ' teams!');
