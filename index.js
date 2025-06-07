import TournamentSimulator from "./tournament-simulator.js";

const retirementConfig = {
  fighters: [
    { name: 'Dusk', level: 3 },
    { name: 'Fang', level: 2 },
    { name: 'Corsi', level: 2 },
    { name: 'Possum', level: 1 },
    { name: 'Synergy', level: 3 },
    { name: 'Aqua', level: 2 },
    { name: 'Silver', level: 3 },
    { name: 'Elysnn', level: 2 },
    { name: 'Tot', level: 1 },
    { name: 'Skitafit', level: 1 },
    { name: 'Quill', level: 1 },
  ],
  numberOfPits: 2,
  roundDurationMinutes: 10,
  skillMultiplier: 3.0,
  fatigueMultiplier: 0.001,
  useShortestQueue: false,
  baseSimulChance: 0.15,
  simulReductionPerLevel: 0.015,
  averageFightDurationSeconds: 30,
  fightDurationVariance: 10,
  restPeriodSeconds: 30,
  retirementStreakLength: null,
  maxRetirements: 3,
};

function runTournamentExample(config) {

  const simulator = new TournamentSimulator(config);
  const results = simulator.runRound();

  console.log('\n=== ROUND RESULTS ===');
  
  // Show retirement results if applicable
  if (config.retirementStreakLength) {
    console.log(`\n🏆 TOP ${config.maxRetirements} RETIREMENT RACE RESULTS (Target: ${config.retirementStreakLength} wins):`);
    if (results.retiredFighters.length > 0) {
      results.retiredFighters
        .sort((a, b) => a.retiredAt - b.retiredAt) // Sort by retirement time
        .forEach((retired, index) => {
          const place = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
          console.log(`  ${place} ${retired.name} (Level ${retired.level}) - Retired at ${retired.retiredAt.toFixed(1)}min after ${retired.retiredAfterFights} fights`);
        });
    } else {
      console.log(`  No fighters reached the target streak of ${config.retirementStreakLength}`);
    }
    
    // Show fighters who reached the streak but couldn't retire
    const blockedRetirements = results.fighterStats.filter(f => 
      !f.isRetired && f.longestStreak >= config.retirementStreakLength
    );
    
    if (blockedRetirements.length > 0) {
      console.log(`\n⚠️  BLOCKED RETIREMENTS (reached ${config.retirementStreakLength} wins but cap was full):`);
      blockedRetirements.forEach(fighter => {
        console.log(`  ${fighter.name} (Level ${fighter.level}) - ${fighter.longestStreak} win streak, ${fighter.totalFights} total fights`);
      });
    }
  }
  
  // Show pit results
  results.pitResults.forEach((pitResult) => {
    console.log(`\nPit ${pitResult.pitId}:`);
    if (pitResult.champion) {
      console.log(`  Last Winner: ${pitResult.champion.name} (Level ${pitResult.champion.level})`);
    } else {
      console.log(`  No champion (no fights occurred or last fight was simul)`);
    }
    console.log(`  Total Fights: ${pitResult.totalFights}`);
    console.log(`  Total Simuls: ${pitResult.totalSimuls}`);
    console.log(`  Pit Duration: ${pitResult.duration.toFixed(1)} minutes`);
  });

  // Show overall winner
  if (results.overallWinner) {
    if (config.retirementStreakLength) {
      console.log(`\n🏆 TOURNAMENT WINNER: ${results.overallWinner.name} (Level ${results.overallWinner.level})`);
      console.log(`   🏁 First to reach ${config.retirementStreakLength} wins!`);
      console.log(`   ⏱️  Retirement Time: ${results.overallWinner.retiredAt.toFixed(1)} minutes`);
      console.log(`   ⚔️  Fights to Victory: ${results.overallWinner.retiredAfterFights}`);
      console.log(`   📊 Final Stats: ${results.overallWinner.totalWins}W/${results.overallWinner.totalLosses}L/${results.overallWinner.totalSimuls}S`);
    } else {
      console.log(`\n🏆 ROUND WINNER: ${results.overallWinner.name} (Level ${results.overallWinner.level})`);
      console.log(`   Longest Streak: ${results.overallWinner.longestStreak}`);
      console.log(`   Total Wins: ${results.overallWinner.totalWins}`);
      console.log(`   Total Losses: ${results.overallWinner.totalLosses}`);
      console.log(`   Total Simuls: ${results.overallWinner.totalSimuls}`);
      console.log(`   Time Fighting: ${results.overallWinner.timeInPit.toFixed(1)} minutes`);
    }
  }
  
  console.log(`\nRound Statistics:`);
  console.log(`  Total Fights: ${results.totalFights}`);
  console.log(`  Total Simuls: ${results.totalSimuls} (${(results.totalSimuls / results.totalFights * 100).toFixed(1)}%)`);
  console.log(`  Round Duration: ${results.roundDuration} minutes`);
  if (config.retirementStreakLength) {
    console.log(`  Retired Fighters: ${results.retiredCount}/${config.maxRetirements} (retirement slots filled)`);
  } else {
    console.log(`  Active Fighters: ${config.fighters.length} (traditional mode)`);
  }
  
  // NEW: Show top 4 fighters for fairness analysis
  console.log(`\n🏅 TOP 4 FIGHTERS:`);
  results.topFourFighters.forEach((fighter, index) => {
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';
    const retiredInfo = fighter.isRetired ? ` [RETIRED@${fighter.retiredAt.toFixed(1)}m]` : '';
    const efficiencyInfo = fighter.efficiency !== null ? ` (Eff: ${fighter.efficiency.toFixed(1)}${fighter.isRetired ? '% streak/fight' : '% win rate'})` : '';
    const awardInfo = fighter.earnedAward ? ' 🏆' : '';
    
    console.log(`  ${medal} ${fighter.rank}. ${fighter.name} (Level ${fighter.level})${awardInfo}`);
    console.log(`      Streak: ${fighter.longestStreak} | W/L/S: ${fighter.totalWins}/${fighter.totalLosses}/${fighter.totalSimuls} | Fights: ${fighter.totalFights}`);
    console.log(`      Win Rate: ${fighter.winRate.toFixed(1)}% | Unlucky: ${fighter.unluckyPercentage.toFixed(1)}% | Time: ${fighter.timeInPit.toFixed(1)}m${retiredInfo}${efficiencyInfo}`);
    
    // NEW: Show award elimination stats if relevant
    if (fighter.eliminatedByAwardWinner > 0 || fighter.eliminationsWhileAwardWinner > 0) {
      console.log(`      📊 Award Impact: Eliminated by award winners ${fighter.eliminatedByAwardWinner} times (${fighter.eliminationByAwardWinnerRate.toFixed(1)}%), ` +
                 `eliminated others while award winner ${fighter.eliminationsWhileAwardWinner} times`);
    }
  });
  
  // NEW: Show award analysis if available
  if (results.awardAnalysis) {
    console.log(`\n🏆 AWARD SYSTEM ANALYSIS:`);
    console.log(`  Award Eligibility: ${results.awardAnalysis.eligibleFighters}/${results.awardAnalysis.totalFighters} fighters eligible (${results.awardAnalysis.eligibilityRate.toFixed(1)}%)`);
    console.log(`  Award Winners: ${results.awardAnalysis.awardWinners} fighters earned awards (${results.awardAnalysis.awardSuccessRate.toFixed(1)}% success rate)`);
    console.log(`  Eliminations by Award Winners: ${results.awardAnalysis.eliminationsByAwardWinners}/${results.awardAnalysis.totalEliminations} (${results.awardAnalysis.awardWinnerEliminationRate.toFixed(1)}%)`);
    
    if (results.awardAnalysis.mostAffectedFighters.length > 0) {
      console.log(`\n  Most Affected by Award Winners:`);
      results.awardAnalysis.mostAffectedFighters.forEach((fighter, index) => {
        console.log(`    ${index + 1}. ${fighter.name} (Level ${fighter.level}) - ${fighter.eliminatedByAwardWinner}/${fighter.totalEliminations} eliminations (${fighter.eliminationRate.toFixed(1)}%)`);
      });
    }
    
    // Show level-based patterns
    console.log(`\n  Elimination Rates by Level:`);
    Object.entries(results.awardAnalysis.eliminationsByLevel)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .forEach(([level, data]) => {
        console.log(`    Level ${level}: ${data.eliminationsByAwardWinners}/${data.totalEliminations} eliminations by award winners (${data.eliminationRate.toFixed(1)}%)`);
      });
  }
  
  // Show top performers (existing display)
  const topPerformers = config.retirementStreakLength ? 
    // In retirement mode, sort by retirement order first, then by streak
    results.fighterStats.sort((a, b) => {
      if (a.isRetired && !b.isRetired) return -1;
      if (!a.isRetired && b.isRetired) return 1;
      if (a.isRetired && b.isRetired) return a.retiredAt - b.retiredAt;
      return b.longestStreak - a.longestStreak;
    }) :
    // Traditional mode
    results.fighterStats.sort((a, b) => b.longestStreak - a.longestStreak);

  console.log(`\nAll Performers:`);
  topPerformers.forEach((fighter, index) => {
    const retiredInfo = fighter.isRetired ? ` 🏁(${fighter.retiredAfterFights}F@${fighter.retiredAt.toFixed(1)}m)` : '';
    const blockedInfo = !fighter.isRetired && config.retirementStreakLength && fighter.longestStreak >= config.retirementStreakLength ? ' ⚠️(blocked)' : '';
    const awardInfo = fighter.earnedAward ? ' 🏆' : '';
    console.log(`  ${index + 1}. ${fighter.name} (Level ${fighter.level}) - Streak: ${fighter.longestStreak}, ` +
      `W/L/S: ${fighter.totalWins}/${fighter.totalLosses}/${fighter.totalSimuls}${retiredInfo}${blockedInfo}${awardInfo} ` +
      `Unlucky: ${fighter.unluckyPercentage}% Total Fights: ${fighter.totalFights}`);
  });
  
  return results;
}

runTournamentExample(retirementConfig);
// runTournamentExample(traditionalConfig, "TRADITIONAL TOURNAMENT (15-Minute Duration)");