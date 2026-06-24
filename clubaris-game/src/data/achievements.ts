export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first_win", name: "Primeira Vitória", description: "Vença sua primeira partida no comando.", icon: "emoji_events" },
  { id: "first_signing", name: "Negociador", description: "Compre um jogador de outro clube.", icon: "handshake" },
  { id: "first_sale", name: "Fazendo Caixa", description: "Venda um jogador do seu elenco.", icon: "payments" },
  { id: "goleada", name: "Goleada", description: "Vença uma partida por 4 ou mais gols de diferença.", icon: "sports_score" },
  { id: "youth_promo", name: "Olho no Futuro", description: "Promova um jogador das categorias de base.", icon: "child_care" },
  { id: "fired", name: "Faz Parte", description: "Seja demitido pela primeira vez.", icon: "work_off" },
  { id: "champion", name: "Campeão!", description: "Conquiste seu primeiro troféu.", icon: "workspace_premium" },
  { id: "rich_club", name: "Clube Rico", description: "Acumule $100 milhões em caixa.", icon: "account_balance" },
  { id: "stadium_upgrade", name: "Casa Cheia", description: "Melhore o estádio do clube.", icon: "stadium" },
  { id: "loyal", name: "Fiel", description: "Complete uma temporada inteira no mesmo clube.", icon: "calendar_month" }
];
