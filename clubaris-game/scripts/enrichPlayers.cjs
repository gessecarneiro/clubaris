const fs = require('fs');
const path = require('path');

const teamsPath = path.join(__dirname, '../src/data/teams.json');
let teamsData = JSON.parse(fs.readFileSync(teamsPath, 'utf8'));

const gkTraits = ["Reflexos", "Liderança", "Pegador de Pênaltis", "Jogo com os pés", "Líbero"];
const defTraits = ["Desarme", "Cabeceio Forte", "Velocidade", "Força Física", "Marcação Implacável", "Líder", "Carrinho preciso"];
const midTraits = ["Visão de Jogo", "Passe Longo", "Motorzinho", "Chute de Longe", "Batedor de Faltas", "Organizador", "Ritmo"];
const attTraits = ["Finalização Fria", "Faro de Gol", "Drible Curto", "Explosão", "Falso 9", "Cabeceio Forte", "Chute Colocado"];

function getRandomTraits(position, count = 2) {
    let pool = [];
    if (position === 'GK') pool = gkTraits;
    else if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(position)) pool = defTraits;
    else if (['CM', 'CDM', 'CAM', 'LM', 'RM'].includes(position)) pool = midTraits;
    else pool = attTraits;

    const shuffled = pool.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function getRandomAge(rating) {
    // Better players are usually in their prime
    if (rating >= 85) return Math.floor(Math.random() * (33 - 23 + 1)) + 23;
    if (rating < 70) return Math.floor(Math.random() * (22 - 17 + 1)) + 17; // youth
    return Math.floor(Math.random() * (36 - 18 + 1)) + 18;
}

teamsData = teamsData.map(team => {
    team.squad = team.squad.map(p => {
        // Only assign if they don't have it to avoid overwriting if we run again
        if (p.isWorldClass === undefined) {
            p.isWorldClass = p.rating >= 87;
        }
        if (p.age === undefined) {
            p.age = getRandomAge(p.rating);
        }
        if (p.preferredFoot === undefined) {
            p.preferredFoot = Math.random() < 0.25 ? 'Esquerdo' : 'Direito';
        }
        if (!p.traits || p.traits.length === 0) {
            p.traits = getRandomTraits(p.position);
        }
        return p;
    });
    return team;
});

fs.writeFileSync(teamsPath, JSON.stringify(teamsData, null, 2));
console.log("Players enriched successfully!");
