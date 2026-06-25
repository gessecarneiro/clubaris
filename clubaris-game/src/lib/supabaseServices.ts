import { supabase } from './supabase';
import teamsData from '../data/teams.json';

export const createNewSave = async (managerName: string, managerStyle: string, managerAvatar: string, teamName: string, playerTeamId: string) => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;

  // 1. Create Save
  const { data: saveData, error: saveError } = await supabase
    .from('saves')
    .insert([
      { 
        user_id: userId,
        manager_name: managerName, 
        manager_style: managerStyle,
        manager_avatar: managerAvatar,
        team_name: teamName, 
        player_team_id: playerTeamId,
        stadium_level: 1,
        training_level: 1,
        medical_level: 1,
        news_events: '[]'
      }
    ])
    .select()
    .single();

  if (saveError || !saveData) throw new Error(saveError?.message || 'Error creating save');

  const saveId = saveData.id;

  // 2. Insert Clubs
  const clubsToInsert = teamsData.map((t: any) => ({
    save_id: saveId,
    original_id: t.id,
    name: t.name,
    country: t.country || 'Unknown',
    league_id: t.leagueId,
    rating: t.rating
  }));

  const { data: insertedClubs, error: clubsError } = await supabase
    .from('clubs')
    .insert(clubsToInsert)
    .select();

  if (clubsError || !insertedClubs) throw new Error(clubsError?.message || 'Error inserting clubs');

  // Map original_id to new club UUID
  const clubIdMap: Record<string, string> = {};
  insertedClubs.forEach(c => {
    clubIdMap[c.original_id] = c.id;
  });

  // 3. Insert Players
  const playersToInsert: any[] = [];
  teamsData.forEach(team => {
    const newClubId = clubIdMap[team.id];
    team.squad.forEach((p: any) => {
      playersToInsert.push({
        save_id: saveId,
        club_id: newClubId,
        original_id: p.id,
        name: p.name,
        position: p.position,
        number: p.number,
        rating: p.rating,
        energy: 100,
        morale: 100,
        status: 'OK',
        matches_played: 0,
        goals: 0,
        assists: 0,
        yellow_cards: 0,
        red_cards: 0,
        nationality: team.country || (team.leagueId.includes('brazil') ? 'Brasil' : team.leagueId === 'spain' ? 'Espanha' : team.leagueId === 'england' ? 'Inglaterra' : 'Desconhecida'),
        age: Math.floor(Math.random() * (35 - 18 + 1)) + 18,
        contract_years: Math.floor(Math.random() * 4) + 1,
        contract_salary: Math.floor((p.rating * p.rating * 100) / 1000) * 1000
      });
    });
  });

  // Supabase bulk insert limit is typically 1000 or payload size limit.
  // We should chunk the players insert just in case.
  const chunkSize = 1000;
  for (let i = 0; i < playersToInsert.length; i += chunkSize) {
    const chunk = playersToInsert.slice(i, i + chunkSize);
    const { error: playersError } = await supabase.from('players').insert(chunk);
    if (playersError) throw new Error(playersError.message);
  }

  return saveId;
}

export async function loadSaveGame(saveId: string) {
  // Fetch save
  const { data: save, error: saveError } = await supabase
    .from('saves')
    .select('*')
    .eq('id', saveId)
    .single();

  if (saveError || !save) throw new Error('Save not found');

  // Fetch clubs
  const { data: clubs } = await supabase.from('clubs').select('*').eq('save_id', saveId);
  
  // Fetch players
  const { data: players } = await supabase.from('players').select('*').eq('save_id', saveId);

  // Patch aesthetic data to clubs
  const patchedClubs = clubs?.map((club: any) => {
    const originalTeam = teamsData.find((t: any) => t.id === club.original_id);
    if (originalTeam) {
      club.badgeUrl = originalTeam.badgeUrl;
      club.color1 = originalTeam.color1;
      club.color2 = originalTeam.color2;
    }
    return club;
  });

  return { save, clubs: patchedClubs, players };
}

export async function syncTransactionToCloud(saveId: string, playerId: string, newClubId: string, newBalance: number) {
  await supabase.from('saves').update({ balance: newBalance }).eq('id', saveId);
  await supabase.from('players').update({ club_id: newClubId }).eq('id', playerId);
}

export async function syncMatchToCloud(saveId: string, saveUpdates: any, playerUpdates: any[]) {
  // Update save (balance, confidence, date)
  await supabase.from('saves').update(saveUpdates).eq('id', saveId);

  // Bulk update players (energy, stats)
  await Promise.all(playerUpdates.map(p => 
    supabase.from('players').update({
      energy: p.energy,
      goals: p.goals,
      matches_played: p.matches_played
    }).eq('id', p.id)
  ));
}

export async function fetchClubs(saveId: string) {
  const { data, error } = await supabase.from('clubs').select('*').eq('save_id', saveId);
  if (error) throw new Error(error.message);
  
  // Patch aesthetic data that is not stored in the DB (badgeUrl, colors)
  const patchedData = data.map((club: any) => {
    const originalTeam = teamsData.find((t: any) => t.id === club.original_id);
    if (originalTeam) {
      club.badgeUrl = originalTeam.badgeUrl;
      club.color1 = originalTeam.color1;
      club.color2 = originalTeam.color2;
    }
    return club;
  });
  
  return patchedData;
}

export async function fetchSquad(clubId: string) {
  const { data, error } = await supabase.from('players').select('*').eq('club_id', clubId);
  if (error) throw new Error(error.message);
  return data;
}

export async function buyPlayerDb(saveId: string, playerId: string, fromClubId: string | null, toClubId: string, cost: number, newBalance: number) {
  // 1. Update Player
  const { error: pError } = await supabase.from('players').update({ club_id: toClubId }).eq('id', playerId);
  if (pError) throw new Error(pError.message);

  // 2. Update Save balance
  const { error: sError } = await supabase.from('saves').update({ balance: newBalance }).eq('id', saveId);
  if (sError) throw new Error(sError.message);

  // 3. Record Transaction
  await supabase.from('transactions').insert([{
    save_id: saveId,
    player_id: playerId,
    from_club_id: fromClubId,
    to_club_id: toClubId,
    transaction_type: 'buy',
    fee: cost
  }]);
}

export async function loanPlayerDb(saveId: string, playerId: string, fromClubId: string, toClubId: string, durationMonths: number, pct: number) {
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + durationMonths);
  
  const { error: pError } = await supabase.from('players').update({ 
    club_id: toClubId,
    loaned_from_club_id: fromClubId,
    loan_end_date: endDate.toISOString(),
    loan_salary_percentage: pct
  }).eq('id', playerId);
  if (pError) throw new Error(pError.message);

  await supabase.from('transactions').insert([{
    save_id: saveId,
    player_id: playerId,
    from_club_id: fromClubId,
    to_club_id: toClubId,
    transaction_type: 'loan',
    fee: 0
  }]);
}

export async function releasePlayerDb(saveId: string, playerId: string, clubId: string, penalty: number, newBalance: number) {
  const { error: pError } = await supabase.from('players').update({ club_id: null }).eq('id', playerId);
  if (pError) throw new Error(pError.message);

  const { error: sError } = await supabase.from('saves').update({ balance: newBalance }).eq('id', saveId);
  if (sError) throw new Error(sError.message);

  await supabase.from('transactions').insert([{
    save_id: saveId,
    player_id: playerId,
    from_club_id: clubId,
    to_club_id: null,
    transaction_type: 'release',
    fee: penalty
  }]);
}

export async function renewContractDb(playerId: string, addedYears: number, newSalary: number) {
  const { data: pData } = await supabase.from('players').select('contract_years').eq('id', playerId).single();
  const currentYears = pData?.contract_years || 0;
  
  const { error: pError } = await supabase.from('players').update({ 
    contract_years: currentYears + addedYears,
    contract_salary: newSalary
  }).eq('id', playerId);
  if (pError) throw new Error(pError.message);
}

export async function promoteYouthDb(saveId: string, clubId: string, position: string, rating: number, cost: number, newBalance: number) {
  // Insert new youth player
  const salary = Math.floor((rating * rating * 100) / 1000) * 1000;
  const newPlayer = {
    save_id: saveId,
    club_id: clubId,
    original_id: `youth_${Date.now()}`,
    name: `Youth ${Math.floor(Math.random() * 10000)}`,
    position: position,
    number: 99,
    rating: rating,
    energy: 100,
    morale: 100,
    age: Math.floor(Math.random() * 3) + 16, // 16 to 18
    contract_years: 3,
    contract_salary: salary
  };

  const { data: inserted, error } = await supabase.from('players').insert([newPlayer]).select().single();
  if (error) throw new Error(error.message);

  const { error: sError } = await supabase.from('saves').update({ balance: newBalance }).eq('id', saveId);
  if (sError) throw new Error(sError.message);

  await supabase.from('transactions').insert([{
    save_id: saveId,
    player_id: inserted.id,
    from_club_id: null,
    to_club_id: clubId,
    transaction_type: 'youth',
    fee: cost
  }]);
  
  return inserted;
}

export async function searchPlayersDb(saveId: string, filters: any) {
  let query = supabase.from('players').select('*, clubs(name, badgeUrl, rating)').eq('save_id', saveId);

  if (filters.name) {
    query = query.ilike('name', `%${filters.name}%`);
  }
  if (filters.position && filters.position !== 'Qualquer') {
    // In our DB, we might have specific positions, so we can do a LIKE or exact match
    if (filters.position === 'Goleiro') query = query.eq('position', 'GK');
    else if (filters.position === 'Defensor') query = query.in('position', ['CB', 'LB', 'RB', 'LWB', 'RWB']);
    else if (filters.position === 'Meio-Campo') query = query.in('position', ['CM', 'CDM', 'CAM', 'RM', 'LM']);
    else if (filters.position === 'Atacante') query = query.in('position', ['ST', 'LW', 'RW', 'CF']);
  }
  if (filters.minRating) query = query.gte('rating', filters.minRating);
  if (filters.maxRating) query = query.lte('rating', filters.maxRating);
  if (filters.minAge) query = query.gte('age', filters.minAge);
  if (filters.maxAge) query = query.lte('age', filters.maxAge);
  if (filters.nationality && filters.nationality !== 'Qualquer') query = query.eq('nationality', filters.nationality);

  const { data, error } = await query.limit(100);
  if (error) throw new Error(error.message);
  return data;
}

export const deleteSaveGame = async (saveId: string) => {
  const { error } = await supabase.from('saves').delete().eq('id', saveId);
  if (error) {
    console.error('Error deleting save:', error);
    throw error;
  }
  return true;
};
