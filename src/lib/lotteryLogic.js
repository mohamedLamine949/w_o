// Logique Métier EuroMillions & Loterie WinnerOne (Mali)

export const TICKET_PRICE = 200; // FCFA

/**
 * Génère un choix rapide (Flash Pick) : 5 numéros principaux (1..50) et 2 étoiles (1..12)
 */
export function generateFlashPick() {
  const mainNumbers = [];
  while (mainNumbers.length < 5) {
    const num = Math.floor(Math.random() * 50) + 1;
    if (!mainNumbers.includes(num)) {
      mainNumbers.push(num);
    }
  }
  mainNumbers.sort((a, b) => a - b);

  const starNumbers = [];
  while (starNumbers.length < 2) {
    const num = Math.floor(Math.random() * 12) + 1;
    if (!starNumbers.includes(num)) {
      starNumbers.push(num);
    }
  }
  starNumbers.sort((a, b) => a - b);

  return { mainNumbers, starNumbers };
}

/**
 * Évalue une combinaison jouée par rapport au tirage gagnant et retourne le Rang de gain
 * Rangs EuroMillions :
 * - Rang 1 : 5 Numéros + 2 Étoiles (JACKPOT)
 * - Rang 2 : 5 Numéros + 1 Étoile
 * - Rang 3 : 5 Numéros + 0 Étoile
 * - Rang 4 : 4 Numéros + 2 Étoiles OU 4 Numéros + 1 Étoile
 * - Rang 5 : 3 Numéros (tous étoiles) OU 2 Numéros + 2 Étoiles
 * - Rang 0 : Aucun gain
 */
export function evaluateTicketRank(ticketMain, ticketStar, winningMain, winningStar) {
  if (!winningMain || !winningStar || winningMain.length !== 5 || winningStar.length !== 2) {
    return { rank: 0, matchedMain: 0, matchedStar: 0, rankLabel: 'Non évalué' };
  }

  const matchedMain = ticketMain.filter((num) => winningMain.includes(num)).length;
  const matchedStar = ticketStar.filter((num) => winningStar.includes(num)).length;

  let rank = 0;
  let rankLabel = 'Pas de gain';

  if (matchedMain === 5 && matchedStar === 2) {
    rank = 1;
    rankLabel = 'RANG 1 (JACKPOT ! 5 Numéros + 2 Étoiles)';
  } else if (matchedMain === 5 && matchedStar === 1) {
    rank = 2;
    rankLabel = 'RANG 2 (5 Numéros + 1 Étoile)';
  } else if (matchedMain === 5 && matchedStar === 0) {
    rank = 3;
    rankLabel = 'RANG 3 (5 Numéros)';
  } else if (matchedMain === 4 && (matchedStar === 2 || matchedStar === 1)) {
    rank = 4;
    rankLabel = matchedStar === 2 ? 'RANG 4 (4 Numéros + 2 Étoiles)' : 'RANG 4 (4 Numéros + 1 Étoile)';
  } else if (matchedMain === 3 || (matchedMain === 2 && matchedStar === 2)) {
    rank = 5;
    rankLabel = matchedMain === 3 ? 'RANG 5 (3 Numéros)' : 'RANG 5 (2 Numéros + 2 Étoiles)';
  }

  return { rank, matchedMain, matchedStar, rankLabel };
}

/**
 * Calcule la ventilation des gains en FCFA pour un tirage donné
 * Cagnotte globale = 60% du total des ventes de tickets
 */
export function calculatePrizePoolDistribution(totalSalesPot) {
  const netPrizePool = totalSalesPot * 0.6; // 60% redistribué
  const reserveFund = totalSalesPot * 0.1;  // 10% fond de réserve
  const platformFee = totalSalesPot * 0.3;  // 30% plateforme & opérateur

  return {
    netPrizePool,
    reserveFund,
    platformFee,
    ranks: {
      rank1: netPrizePool * 0.50, // 50% du pool + jackpot accumulé
      rank2: netPrizePool * 0.15, // 15%
      rank3: netPrizePool * 0.10, // 10%
      rank4: netPrizePool * 0.10, // 10%
      rank5: netPrizePool * 0.15, // 15%
    },
  };
}

/**
 * Génère des numéros gagnants aléatoires pour un tirage (Simulateur / Admin)
 */
export function generateWinningNumbers() {
  return generateFlashPick();
}
