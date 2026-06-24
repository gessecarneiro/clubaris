import { Player } from '../store/gameStore';

export function calculateMarketValue(player: Player): number {
    let baseValue = 1000000 + ((player.rating - 50) * 800000);
    if (player.rating >= 80) baseValue += (player.rating - 80) * 2000000;
    if (player.rating >= 85) baseValue += (player.rating - 85) * 5000000;
    if (player.rating >= 90) baseValue += (player.rating - 90) * 10000000;
    
    if (baseValue < 100000) baseValue = 100000;

    // Age modifier
    if (player.age) {
        if (player.age < 21) baseValue *= 1.5;
        else if (player.age < 24) baseValue *= 1.3;
        else if (player.age > 30) baseValue *= 0.8;
        else if (player.age > 33) baseValue *= 0.5;
    }

    // World Class modifier
    if (player.isWorldClass) {
        baseValue *= 1.5;
    }

    return baseValue;
}

export function translatePosition(pos: string, language: string): string {
    if (language !== 'pt') return pos;
    switch (pos) {
        case 'GK': return 'G';
        case 'RB':
        case 'RWB': return 'LD';
        case 'LB':
        case 'LWB': return 'LE';
        case 'CB': return 'ZG';
        case 'CDM': return 'VOL';
        case 'CM': return 'ML';
        case 'CAM': return 'MC';
        case 'ST':
        case 'CF': return 'CA';
        case 'LW': return 'PE';
        case 'RW': return 'PD';
        case 'LM': return 'ME';
        case 'RM': return 'MD';
        default: return pos;
    }
}
