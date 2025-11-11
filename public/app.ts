import {Match, Player, PlayerModel} from "../models/my.model.js";

async function showLeagueStats() {

    const players = await loadPlayerModels();
    if (!players.length) return;
    const matchesRes = await fetch("/matches");
    const allMatches = await matchesRes.json();

    // Confrontation la plus répétée (entre 2 joueurs)
    let maxConfrontCount = 0;
    let maxConfrontPair: [Player, Player] = [players[0], players[0]];
    for (let i = 0; i < players.length; i++) {
        for (let j = i + 1; j < players.length; j++) {
            const id1 = players[i].id.toString();
            const id2 = players[j].id.toString();
            // Compter le nombre de matchs où id1 et id2 sont dans des équipes opposées
            const confrontCount = (allMatches as Match[])
                .filter((m: Match) =>
                    (m.team1.includes(id1) && m.team2.includes(id2)) ||
                    (m.team1.includes(id2) && m.team2.includes(id1))
                ).length;
            if (confrontCount > maxConfrontCount) {
                maxConfrontCount = confrontCount;
                maxConfrontPair = [players[i], players[j]];
            }
        }
    }

    // Trouver le joueur ayant joué le plus de matchs
    const mostPlayed = players.reduce((max, p) => p.matchesPlayed > max.matchesPlayed ? p : max, players[0]);


    // Fonction pour calculer la plus longue série de victoires d'un joueur
    function getMaxWinStreak(playerId: string) {
        const playerMatches = (allMatches as Match[])
            .filter((m: Match) => [...m.team1, ...m.team2].includes(playerId))
            .sort((a: Match, b: Match) => a.id - b.id);
        let maxStreak = 0, currentStreak = 0;
        for (const m of playerMatches) {
            if (m.winners && m.winners.includes(playerId) && m.score !== '1-1') {
                currentStreak++;
                maxStreak = Math.max(maxStreak, currentStreak);
            } else {
                currentStreak = 0;
            }
        }
        return maxStreak;
    }

    // Fonction pour calculer la plus longue série de défaites d'un joueur
    function getMaxLoseStreak(playerId: string) {
        const playerMatches = (allMatches as Match[])
            .filter((m: Match) => [...m.team1, ...m.team2].includes(playerId))
            .sort((a: Match, b: Match) => a.id - b.id);
        let maxStreak = 0, currentStreak = 0;
        for (const m of playerMatches) {
            // Défaite = le joueur n'est pas dans les winners et le score n'est pas nul
            if (m.winners && !m.winners.includes(playerId) && m.score !== '1-1') {
                currentStreak++;
                maxStreak = Math.max(maxStreak, currentStreak);
            } else {
                currentStreak = 0;
            }
        }
        return maxStreak;
    }


    // Calculer la plus longue série de victoires pour chaque joueur
    let bestStreak = 0;
    let bestPlayer = players[0];
    for (const p of players) {
        const streak = getMaxWinStreak(p.id.toString());
        if (streak > bestStreak) {
            bestStreak = streak;
            bestPlayer = p;
        }
    }

    // Calculer la plus longue série de défaites pour chaque joueur
    let worstStreak = 0;
    let worstPlayer = players[0];
    for (const p of players) {
        const streak = getMaxLoseStreak(p.id.toString());
        if (streak > worstStreak) {
            worstStreak = streak;
            worstPlayer = p;
        }
    }

    // Fonction pour calculer la plus longue série sans victoire d'un joueur (les nuls comptent)
    function getMaxWinlessStreak(playerId: string) {
        const playerMatches = (allMatches as Match[])
            .filter((m: Match) => [...m.team1, ...m.team2].includes(playerId))
            .sort((a: Match, b: Match) => a.id - b.id);
        let maxStreak = 0, currentStreak = 0;
        for (const m of playerMatches) {
            // victoire décisive -> reset
            if (m.winners && m.winners.includes(playerId) && m.score !== '1-1') {
                currentStreak = 0;
            } else {
                // nul ou défaite compte comme "sans victoire"
                currentStreak++;
                maxStreak = Math.max(maxStreak, currentStreak);
            }
        }
        return maxStreak;
    }

    // Calculer la pire série sans victoire pour chaque joueur
    let worstWinless = 0;
    let worstWinlessPlayer = players[0];
    for (const p of players) {
        const streak = getMaxWinlessStreak(p.id.toString());
        if (streak > worstWinless) {
            worstWinless = streak;
            worstWinlessPlayer = p;
        }
    }

    // Joueur ayant fait le plus de matchs nuls
    let mostDrawsPlayer = players[0];
    let mostDraws = players[0].draws || 0;
    for (const p of players) {
        if ((p.draws || 0) > mostDraws) {
            mostDraws = p.draws;
            mostDrawsPlayer = p;
        }
    }

        // Joueur ayant perdu le plus de matchs sur le score 2-0
    let mostLost20Player = players[0];
    let mostLost20 = 0;
    for (const p of players) {
        const lost20 = (allMatches as Match[])
            .filter((m: Match) => [...m.team1, ...m.team2].includes(p.id.toString()) && m.score === '2-0' && m.winners && !m.winners.includes(p.id.toString())).length;
        if (lost20 > mostLost20) {
            mostLost20 = lost20;
            mostLost20Player = p;
        }
    }

        // Joueur ayant gagné le plus de matchs sur le score 2-0
    let mostWin20Player = players[0];
    let mostWin20 = 0;
    for (const p of players) {
        const win20 = (allMatches as Match[])
            .filter((m: Match) => [...m.team1, ...m.team2].includes(p.id.toString()) && m.score === '2-0' && m.winners && m.winners.includes(p.id.toString())).length;
        if (win20 > mostWin20) {
            mostWin20 = win20;
            mostWin20Player = p;
        }
    }

        // Les deux joueurs ayant joué le plus de matchs ensemble
    let maxPairCount = 0;
    let maxPair: [Player, Player] = [players[0], players[0]];
    for (let i = 0; i < players.length; i++) {
        for (let j = i + 1; j < players.length; j++) {
            const id1 = players[i].id.toString();
            const id2 = players[j].id.toString();
            const togetherCount = (allMatches as Match[])
                .filter((m: Match) =>
                    (m.team1.includes(id1) && m.team1.includes(id2)) ||
                    (m.team2.includes(id1) && m.team2.includes(id2))
                ).length;
            if (togetherCount > maxPairCount) {
                maxPairCount = togetherCount;
                maxPair = [players[i], players[j]];
            }
        }
    }

    // Joueur ayant gagné le plus souvent contre le Boss
    // On cherche d'abord l'ID du Boss
    const bossPlayer = players.find(p => p.name === "Le Boss");
    const bossId = bossPlayer ? bossPlayer.id.toString() : null;

    let bestVsBossCount = 0;
    let bestVsBoss: Player | null = null;

    // NOUVEAU : meilleur écart (victoires - défaites) contre le Boss
    let bestVsBossDiff = -Infinity;
    let bestVsBossDiffPlayer: Player | null = null;
    let bestVsBossDiffStats: { wins: number; losses: number } | null = null;

    if (bossId) {
        for (const p of players) {
            if (p.id.toString() === bossId) continue;
            const playerId = p.id.toString();

            // matchs contre le Boss
            const matchesAgainstBoss = (allMatches as Match[]).filter((m: Match) =>
                (m.team1.includes(bossId) && m.team2.includes(playerId)) ||
                (m.team2.includes(bossId) && m.team1.includes(playerId))
            );

            // Ignorer les joueurs qui n'ont eu aucun duel contre le Boss
            if (matchesAgainstBoss.length === 0) continue;

            const winsAgainstBoss = matchesAgainstBoss
                .filter(m => m.winners && m.winners.includes(playerId) && m.score !== '1-1')
                .length;

            const lossesAgainstBoss = matchesAgainstBoss
                .filter(m => m.winners && m.winners.includes(bossId) && m.score !== '1-1')
                .length;

            // maj du compteur simple déjà présent
            if (winsAgainstBoss > bestVsBossCount) {
                bestVsBossCount = winsAgainstBoss;
                bestVsBoss = p;
            }

            // calcul du meilleur écart (wins - losses)
            const diff = winsAgainstBoss - lossesAgainstBoss;
            if (diff > bestVsBossDiff) {
                bestVsBossDiff = diff;
                bestVsBossDiffPlayer = p;
                bestVsBossDiffStats = { wins: winsAgainstBoss, losses: lossesAgainstBoss };
            }
        }
    }

    const statsDiv = document.getElementById("stats-content");
    if (statsDiv) {
    statsDiv.innerHTML = `
            <div class='league-stats-content'>
                <span class='league-stats-label'>Joueur le plus actif :</span> <span class='league-stats-player'>${mostPlayed.name}</span> <span class='league-stats-count'>(${mostPlayed.matchesPlayed} Matchs)</span>
            </div>
            <div class='league-stats-content'>
                <span class='league-stats-label'>Duel le plus fréquent :</span> <span class='league-stats-player'>${maxConfrontPair[0].name} vs ${maxConfrontPair[1].name}</span> <span class='league-stats-count'>(${maxConfrontCount})</span>
            </div>
            <div class='league-stats-content'>
                <span class='league-stats-label'>Duo inséparable :</span> <span class='league-stats-player'>${maxPair[0].name} & ${maxPair[1].name}</span> <span class='league-stats-count'>(${maxPairCount})</span>
            </div>
            <div class='league-stats-content'>
                <span class='league-stats-label'>Meilleure série de victoires :</span> <span class='league-stats-player'>${bestPlayer.name}</span> <span class='league-stats-count'>(${bestStreak})</span>
            </div>
            <div class='league-stats-content'>
                <span class='league-stats-label'>Pire série sans victoire :</span>
                <span class='league-stats-player'>${worstWinlessPlayer.name}</span>
                <span class='league-stats-count'>(${worstWinless})</span>
            </div>
            <div class='league-stats-content'>
                <span class='league-stats-label'>Roi du match nul :</span> <span class='league-stats-player'>${mostDrawsPlayer.name}</span> <span class='league-stats-count'>(${mostDraws})</span>
            </div>
            <div class='league-stats-content'>
                <span class='league-stats-label'>Recordman des victoires 2-0 :</span> <span class='league-stats-player'>${mostWin20Player.name}</span> <span class='league-stats-count'>(${mostWin20})</span>
            </div>
            <div class='league-stats-content'>
                <span class='league-stats-label'>Recordman des défaites 2-0 :</span> <span class='league-stats-player'>${mostLost20Player.name}</span> <span class='league-stats-count'>(${mostLost20})</span>
            </div>
            <div class='league-stats-content'>
                <span class='league-stats-label'>Meilleur en duel vs le Boss :</span>
                <span class='league-stats-player'>${bestVsBossDiffPlayer ? bestVsBossDiffPlayer.name : 'Aucun'}</span>
                <span class='league-stats-count'>${bestVsBossDiffStats ? (bestVsBossDiff > 0 ? '+' : '') + ' (' + bestVsBossDiffStats.wins + '-' + bestVsBossDiffStats.losses + ')' : ''}</span>
            </div>
        `;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    showLeagueStats();
});

const $ = (id: string) => document.getElementById(id) as HTMLElement;
const $select = (id: string) => document.getElementById(id) as HTMLSelectElement;


window.onload = () => {
    console.log(" window.onload executed");
    loadPlayers();
};


$select('match-result-global').addEventListener("change", () => {
    const value = $select('match-result-global').value;

    switch (value) {
        case "1-1":
            $("team1").textContent = "Equipe 1";
            $("team2").textContent = "Equipe 2";
            break;
        default:
            $("team1").textContent = "Equipe Gagnante";
            $("team2").textContent = "Equipe Perdante";
    }
});

async function loadPlayerModels(): Promise<PlayerModel[]> {
  const res = await fetch("/players");
    let players: Player[] = await res.json();
    players = players.filter(p => p.isLocal);

    // Charger tous les matchs
    const matchesRes = await fetch("/matches");
    const allMatches: Match[] = await matchesRes.json();

    // Construire/mettre à jour les stats locales des players à partir des matchs
    return players.map(p => {
        // initialiser player à partir de p pour éviter l'utilisation d'une variable non assignée
        const player: PlayerModel = p as unknown as PlayerModel;
        const pid = p.id.toString();

        // init counters
        let matchesPlayed = 0;
        let wins = 0;
        let losses = 0;
        let draws = 0;
        let setsWon = 0;
        let setsLost = 0;
        let points = 0;

        // tous les matchs où le joueur a participé
        const pMatches = (allMatches as Match[]).filter(m => m.team1.includes(pid) || m.team2.includes(pid));

        matchesPlayed = pMatches.length;

        for (const m of pMatches) {
            const score = m.score;
            const playerWon = !!(m.winners && m.winners.includes(pid));

            if (score === '1-1') {
                // match nul
                draws++;
                points += 0.5;
                // chaque équipe obtient 1 set
                setsWon += 1;
                setsLost += 1;
            } else if (score === '2-0') {
                if (playerWon) {
                    wins++;
                    points += 2;
                    setsWon += 2;
                    setsLost += 0;
                } else {
                    losses++;
                    points += 0;
                    setsWon += 0;
                    setsLost += 2;
                }
            } else if (score === '2-1') {
                if (playerWon) {
                    wins++;
                    points += 1;
                    setsWon += 2;
                    setsLost += 1;
                } else {
                    losses++;
                    points += 0.25;
                    setsWon += 1;
                    setsLost += 2;
                }
            }
        }

        // appliquer les résultats au player model
        player.matchesPlayed = matchesPlayed;
        player.wins = wins;
        player.losses = losses;
        player.draws = draws;
        player.setsWon = setsWon;
        player.setsLost = setsLost;
        player.points = points;

        return player;
    });
}

async function loadRanking(): Promise<void> {
    const players = await loadPlayerModels();

    players.sort((a, b) => {
    const pointsAverageA = (a.points / a.matchesPlayed);
    const pointsAverageB = (b.points / b.matchesPlayed);

        if (pointsAverageB !== pointsAverageA) {
            return pointsAverageB - pointsAverageA;
        }
        const setDiffA = a.setsWon - a.setsLost;
        const setDiffB = b.setsWon - b.setsLost;
        if (setDiffB !== setDiffA) {
            return setDiffB - setDiffA;
        }
        return a.matchesPlayed - b.matchesPlayed;
    });
    const matchesRes = await fetch("/matches");
    const allMatches: Match[] = await matchesRes.json();

    // Génération du tableau HTML
    const container = document.getElementById("rankingTable");
    if (!container) return;

    let html = `
        <table border="1" cellpadding="5" cellspacing="0">
            <thead>
                <tr>
                    <th class="position">P</th>
                    <th class="player">Joueur</th>
                    <th class="P">Pts</th>
                    <th class="MJ">MJ</th>
                    <th class="V-N-D">V-D</th>
                    <th class="V-N-D">N</th>
                    <th class="SG">Sets</th>
                    <th class="winRate">Win%</th>
                    <th class="lastResults">Last3</th>
                </tr>
            </thead>
            <tbody>
    `;

    players.forEach((p, index) => {
        const pointsAverage = (p.points / p.matchesPlayed)*70;
        const draws = p.draws || 0;
        const effectivePlayed = Math.max(0, p.matchesPlayed - draws);
        const winRate = effectivePlayed > 0 ? ((p.wins / effectivePlayed) * 100).toFixed(0) : '0';

        // Récupérer les 3 derniers matchs du joueur
        const playerMatches = allMatches
            .filter(m => [...m.team1, ...m.team2].includes(p.id.toString()))
            .slice(-3);
        // Pour chaque match, déterminer le résultat
        const resultIcons = playerMatches.map(m => {
            if (m.score === '1-1') return '<span style="color:orange;font-size:0.8em;">&#x1F7E1;</span>'; // orange pour nul
            if (m.winners.includes(p.id.toString())) return '<span style="color:green;font-size:0.8em;">&#x2705;</span>'; // vert pour victoire
            return '<span style="color:red;font-size:0.8em;">&#x274C;</span>'; // rouge pour défaite
        }).join('');

        html += `
            <tr data-player-id="${p.id}" ${p.isLocal ? 'style="background-color:#d1ffd1"' : ""}>
                <td>${index + 1}</td>
                <td class="player">${p.name}</td>
                <td class="P">${pointsAverage.toFixed(1)}</td>
                <td class="J">${p.matchesPlayed}</td>
                <td class="V">${p.wins}-${p.losses}</td>
                <td class="SG">${p.draws}</td>
                <td class="SG">${p.setsWon}:${p.setsLost}</td>
                <td class="winRate">${winRate}</td>
                <td class="lastResults">${resultIcons}</td>
            </tr>
            `;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;

    // Attacher le handler click pour ouvrir la fiche joueur (plein écran)
    // chaque ligne possède maintenant data-player-id
    const rows = container.querySelectorAll("tr[data-player-id]");
    rows.forEach(row => {
        row.addEventListener("click", () => {
            const id = row.getAttribute("data-player-id");
            const pl = players.find(p => p.id.toString() === id);
            if (pl) {
                showPlayerProfile(pl, allMatches);
            }
        });
        // pointeur visuel
        (row as HTMLElement).style.cursor = "pointer";
    });

}

// Appel au chargement
window.addEventListener("load", loadRanking);

async function loadPlayers(): Promise<Player[]> {
    const res = await fetch("/players");
    return res.json();
}

async function populateSelects() {
    const players = await loadPlayers();

    const selects = [
        "team1Player1",
        "team1Player2",
        "team2Player1",
        "team2Player2",
    ];

    selects.forEach(id => {
        const select = document.getElementById(id) as HTMLSelectElement;

        // reset
        select.innerHTML = "";

        // option placeholder
        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.textContent = "-- Sélectionner un joueur --";
        placeholder.disabled = true;
        placeholder.selected = true;
        select.appendChild(placeholder);

        // ajouter les joueurs depuis la base
        players.forEach(player => {
            const option = document.createElement("option");
            option.value = player.id.toString();
            option.textContent = player.name;
            select.appendChild(option);
        });

        // ajouter l'option "Autre..."
        const otherOption = document.createElement("option");
        otherOption.value = "other";
        otherOption.textContent = "Autre...";
        select.appendChild(otherOption);

        // vérifier si un input custom existe déjà sinon le créer
        let customInput = document.getElementById(id + "_custom") as HTMLInputElement;
        if (!customInput) {
            customInput = document.createElement("input");
            customInput.type = "text";
            customInput.id = id + "_custom";
            customInput.placeholder = "Entrer un nom de joueur";
            customInput.style.display = "none"; // caché par défaut
            select.insertAdjacentElement("afterend", customInput);
        }

        const container = document.createElement("div");
        container.id = id + "_custom_container";
        select.parentNode!.insertBefore(container, select);

        container.appendChild(select);
        container.appendChild(customInput);

        // gérer l'affichage de l'input si "Autre..." est choisi
        select.addEventListener("change", () => {
            if (select.value === "other") {
                customInput.style.display = "block";
            } else {
                customInput.style.display = "none";
                customInput.value = "";
            }
        });
    });
    setupFormValidation();
}


async function recordMatch(match: Match): Promise<void> {
    const res = await fetch("/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(match)
    });

    if (!res.ok) {
        alert("Erreur lors de l'enregistrement");
        return;
    }

    const saved = await res.json();
    console.log("Match enregistré :", saved);
    alert("Match enregistré avec succès !");
    await loadRanking();
}

async function comparePlayers() {
    const select1 = $select("comparePlayer1") as HTMLSelectElement;
    const select2 = $select("comparePlayer2") as HTMLSelectElement;
    const resultDiv = $("compareResult") as HTMLElement;

    const id1 = select1.value;
    const id2 = select2.value;

    if (!id1 || !id2 || id1 === id2) {
        resultDiv.textContent = "Sélectionnez deux joueurs différents.";
        return;
    }

    const res = await fetch("/matches");
    const matches: Match[] = await res.json();

    // Filtre les matchs où les deux joueurs sont adversaires
    const confrontations = matches.filter(m =>
        (
            (m.team1.includes(id1) && m.team2.includes(id2)) ||
            (m.team1.includes(id2) && m.team2.includes(id1))
        )
    );

    if (confrontations.length === 0) {
        resultDiv.textContent = "Aucune confrontation trouvée.";
        return;
    }

    let wins1 = 0, wins2 = 0, draws = 0;
    confrontations.forEach(m => {
        if (m.score === "1-1") {
            draws++;
        } else if (m.winners.includes(id1)) {
            wins1++;
        } else if (m.winners.includes(id2)) {
            wins2++;
        }
    });

    // Affichage des confrontations ligne par ligne
    const players = await loadPlayers();
    function getPlayerNames(ids: string[]) {
        return ids.map(id => {
            if (typeof id === 'string' && id.endsWith('_custom')) {
                return id.replace('_custom', '');
            }
            const player = players.find(p => p.id.toString() == id);
            if (player) {
                if (player.name === 'Le Boss') return 'Boss';
                return player.name;
            }
            return id;
        }).join(',');
    }
    const total = wins1 + wins2 + draws;
    const confrontationList = confrontations.slice().reverse().map(m => {
        let leftTeam, rightTeam, score = m.score;
        let leftWinners;
        if (m.team1.includes(id1) && m.team2.includes(id2)) {
            leftTeam = getPlayerNames(m.team1);
            rightTeam = getPlayerNames(m.team2);
            leftWinners = m.winners.some(w => m.team1.includes(w));
        } else {
            leftTeam = getPlayerNames(m.team2);
            rightTeam = getPlayerNames(m.team1);
            leftWinners = m.winners.some(w => m.team2.includes(w));
        }
        let scoreDisplayed: string = score;
        // Inverser le score si la victoire est du côté droit
        if (!leftWinners && score !== '1-1') {
            if (score === '2-0') scoreDisplayed = '0-2';
            else if (score === '2-1') scoreDisplayed = '1-2';
        }
        return `<div class='confrontation-item'>
            <span class='confrontation-team'>${leftTeam}</span>
            <span class='confrontation-score'>${scoreDisplayed}</span>
            <span class='confrontation-team'>${rightTeam}</span>
        </div>`;
    }).join('');

    resultDiv.innerHTML = `
        <strong>Confrontations: ${confrontations.length}</strong><br>
        <div style='display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;'>
            <span style='font-weight:bold;'>${select1.selectedOptions[0].text}</span>
            <span style='font-weight:bold;'>${select2.selectedOptions[0].text}</span>
        </div>
        <div class='compare-bar'>
            <div class='bar1' style='width:${total ? (wins1/total)*100 : 0}%;'>${wins1 > 0 ? "🥇" : ""}</div>
            <div class='bar2' style='width:${total ? (wins2/total)*100 : 0}%;'>${wins2 > 0 ? "🥇" : ""}</div>
        </div>
        <div class='score-labels'>
            <span>${wins1}</span>
            <span>Nuls: ${draws}</span>
            <span>${wins2}</span>
        </div>
        <div class='confrontation-list'>${confrontationList}</div>
    `;
}

async function populateCompareSelects() {
    const players = await loadPlayers();
    const select1 = $select("comparePlayer1");
    const select2 = $select("comparePlayer2");

    [select1, select2].forEach(select => {
        select.innerHTML = "";
        // option placeholder
        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.textContent = "-- Sélectionner un joueur --";
        placeholder.disabled = true;
        select.appendChild(placeholder);
        players.forEach(player => {
            const option = document.createElement("option");
            option.value = player.id.toString();
            option.textContent = player.name;
            select.appendChild(option);
        });
    });

    // Sélection par défaut id=1 et id=5
    select1.value = "1"; // Le Boss
    select2.value = "5"; // Walid
}

function initForm() {
    const form = $("matchForm") as HTMLFormElement;
    const passwordInput = $("matchPassword") as HTMLInputElement;
    const CORRECT_PASSWORD = "Boss06";


    form.addEventListener("submit", async e => {
        e.preventDefault();

        if (passwordInput.value !== CORRECT_PASSWORD) {
            alert("Mot de passe incorrect !");
            passwordInput.value = "";
            passwordInput.focus();
            return;
        }

        const match: Match = {
            id: 0,
            team1: [
                $select("team1Player1").value === 'other' ?  $select("team1Player1_custom").value + '_custom' : $select("team1Player1").value,
                $select("team1Player2").value === 'other' ?  $select("team1Player2_custom").value + '_custom'    : $select("team1Player2").value
            ],
            team2: [
                $select("team2Player1").value === 'other' ?  $select("team2Player1_custom").value + '_custom' : $select("team2Player1").value,
                $select("team2Player2").value === 'other' ?  $select("team2Player2_custom").value + '_custom' : $select("team2Player2").value

            ],
            score: (document.getElementById("match-result-global") as HTMLInputElement).value as '2-1' | '2-0' | '1-1',
            winners: [
                $select("team1Player1").value === 'other' ?  $select("team1Player1_custom").value + '_custom' : $select("team1Player1").value,
                $select("team1Player2").value === 'other' ?  $select("team1Player2_custom").value + '_custom' : $select("team1Player2").value
            ],
            comment: ($("matchComment") as HTMLInputElement).value
        };

        await recordMatch(match);
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    await populateSelects();
    await populateCompareSelects();
    initForm();
    $("compareBtn")?.addEventListener("click", comparePlayers);
});

function setupFormValidation() {
    const form = document.getElementById("matchForm") as HTMLFormElement;
    const selects = form.querySelectorAll("select");
    const submitBtn = document.getElementById("submitBtn") as HTMLButtonElement;

    function validate() {
        // Vérifie que tous les selects ont une valeur non vide
        const allFilled = Array.from(selects).every(s => (s as HTMLSelectElement).value !== "");
        submitBtn.disabled = !allFilled;
    }

    // On déclenche la validation au changement de chaque select
    selects.forEach(select => {
        select.addEventListener("change", validate);
    });

    // Validation initiale
    validate();
}

function getPlayerNames(ids: (number | string)[], players: Player[]): string[] {
    return ids
        // .filter(id => typeof id == 'number')
        .map(id => {
            if (typeof id === 'string' && id.endsWith("_custom")) {
                return id.replace("_custom", "");
            } else {
                const player = players.find(p => p.id == id);
                return player ? player.name : 'inconnu';
            }
        });
}

async function loadMatches(): Promise<void> {
    const res = await fetch("/matches");
    const matches: Match[] = await res.json();

    const players = await loadPlayers();

    const container = document.getElementById("matchesList");
    if (!container) return;

    container.innerHTML = ""; // reset

    if (matches.length === 0) {
        container.textContent = "Aucun match enregistré.";
        return;
    }

    $("matches-list-title").innerHTML = `Liste des matchs (${matches.length})`;

    matches.slice().reverse().forEach(match => {
        const div = document.createElement("div");
        div.className = "match-item";

        const namesTeam1 = getPlayerNames(match.team1 , players).join(", ");
        const namesTeam2 = getPlayerNames(match.team2, players).join(", ");


        // Si une vidéo est disponible côté match (match.videoUrl) ou dans le mapping local, créer l'iframe
        const videoUrl = match.videoUrl;
        let videoHtml = "";
        if (videoUrl) {
            console.log('videoUrl', videoUrl);
            const src = getYouTubeEmbedSrc(videoUrl);
            // iframe responsif simple (max-width:100% pour s'adapter)
            videoHtml = `
                <div style="margin-top:8px;">
                    <iframe
                        src="${src}"
                        frameborder="0"
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                        style="width:100%;max-width:700px;height:120px;border-radius:6px;">
                    </iframe>
                </div>
            `;
        }

        // Affichage simple : team1 vs team2 + vidéo si présente
        div.innerHTML = `
            <strong>J${match.id}</strong><br>
            ${videoHtml}
            [${namesTeam1}] ⚔️ [${namesTeam2}]<br>
            Score : ${match.score}<br>
            ${match.comment || ''}<br>
        `;

        container.appendChild(div);
    });
}

document.querySelectorAll(".panel-header").forEach(header => {
    header.addEventListener("click", () => {
        const content = header.nextElementSibling;
        content?.classList.toggle("open");
    });
});
// Charger les matchs dès que la page est prête

document.addEventListener("DOMContentLoaded", () => {
    loadMatches();
});

document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("showMatchFormBtn");
    const panel = document.getElementById("matchFormPanel");

    btn?.addEventListener("click", () => {
        if (panel) {
            panel.style.display = panel.style.display === "none" ? "block" : "none";
        }
    });
});

// --- Nouveau : modal plein écran pour la fiche joueur ---
function ensurePlayerModal() {
	// n'ajoute qu'une seule fois
	if (document.getElementById("playerProfileModal")) return;
	const modal = document.createElement("div");
	modal.id = "playerProfileModal";
	modal.style.cssText = `
		position:fixed;top:0;left:0;width:100%;height:100%;
		background:rgba(0,0,0,0.85);color:#fff;z-index:9999;
		display:none;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;
	`;
	modal.innerHTML = `
		<div id="playerProfileContent" style="background:#0b0b0b;padding:24px;border-radius:6px;max-width:900px;width:100%;max-height:90%;overflow:auto;">
			<button id="playerProfileClose" style="float:right;background:#222;border:none;color:#fff;padding:6px 10px;border-radius:4px;cursor:pointer;">Fermer ✕</button>
			<div id="playerProfileBody"></div>
		</div>
	`;
	document.body.appendChild(modal);

	document.getElementById("playerProfileClose")!.addEventListener("click", () => {
		modal.style.display = "none";
	});
	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape") modal.style.display = "none";
	});
}

async function showPlayerProfile(player: PlayerModel, matches: Match[]) {
    ensurePlayerModal();
    const modal = document.getElementById("playerProfileModal") as HTMLElement;
    const body = document.getElementById("playerProfileBody") as HTMLElement;

    const players = await loadPlayerModels();

    // player basic info
    const playerMatches = matches
        .filter(m => [...m.team1, ...m.team2].includes(player.id.toString()))
        .slice(-10); // derniers 10 matchs

    // --- Nouveau : calcul du duel vs Le Boss (sans les nuls) ---
    const boss = players.find(p => p.name === "Le Boss");
    let duelHtml = '';
    if (boss && player.id.toString() !== boss.id.toString()) {
        const pid = player.id.toString();
        const bid = boss.id.toString();
        const duels = matches.filter(m =>
            (
                (m.team1.includes(bid) && m.team2.includes(pid)) ||
                (m.team2.includes(bid) && m.team1.includes(pid))
            )
            && m.score !== '1-1' // exclure les nuls
        );
        const winsAgainstBoss = duels.filter(m => m.winners && m.winners.includes(pid)).length;
        const lossesAgainstBoss = duels.filter(m => m.winners && m.winners.includes(bid)).length;
        const diff = winsAgainstBoss - lossesAgainstBoss;
        const color = diff > 0 ? '#6ee7b7' /* vert */ : (diff < 0 ? '#ff7b7b' /* rouge */ : 'orange' /* nul */);
        duelHtml = `
            <div style="margin-bottom:12px">
                <span style="margin:0 0 6px 0;font-size:1em">vs Boss:</span>
                <span style="font-size:0.95em">
                    <span style="color:${color};">${winsAgainstBoss}-${lossesAgainstBoss}</span>
                </span>
            </div>
        `;
    }
    // si c'est le Boss ou Boss introuvable, duelHtml reste vide

    // --- NOUVEAU: diagramme linéaire 5 parties (2-0, 2-1, 1-1, 1-2, 0-2) ---
    // Calculer les comptes sur l'ensemble des matchs du joueur
    const pid = player.id.toString();
    const allPlayerMatches = matches.filter(m => [...m.team1, ...m.team2].includes(pid));
    let win20 = 0, win21 = 0, draw11 = 0, lose12 = 0, lose02 = 0;
    for (const m of allPlayerMatches) {
        if (m.score === '1-1') {
            draw11++;
            continue;
        }
        const playerWon = !!(m.winners && m.winners.includes(pid));
        if (m.score === '2-0') {
            if (playerWon) win20++; else lose02++;
        } else if (m.score === '2-1') {
            if (playerWon) win21++; else lose12++;
        }
    }
    const total = win20 + win21 + draw11 + lose12 + lose02;

    // Couleurs demandées
    const c_win20 = '#0b6623'; // vert foncé
    const c_win21 = '#2e9b4d'; // vert moins foncé
    const c_draw11 = '#f4c542'; // jaune
    const c_lose12 = '#ff9a3c'; // orange
    const c_lose02 = '#c31212ff'; // rouge

    // Si aucun match, afficher 5 segments égaux en gris clair
    const emptyMode = total === 0;

    const f = (count: number) => emptyMode ? 1 : (count > 0 ? count : 0);
    const flex1 = f(win20);
    const flex2 = f(win21);
    const flex3 = f(draw11);
    const flex4 = f(lose12);
    const flex5 = f(lose02);

    const barOpacity = emptyMode ? '0.25' : '1';

    const diagramHtml = `
        <div style="margin-bottom:12px;">
            <div style="font-size:0.9em;margin-bottom:6px;color:#ddd">Répartition (2-0 / 2-1 / 1-1 / 1-2 / 0-2)</div>
            <div style="display:flex;border-radius:6px;overflow:hidden;height:12px;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.02); font-size:0.8em;">
                <div title="Victoires 2-0: ${win20}" style="flex:${flex1};background:${c_win20};opacity:${barOpacity};height:100%;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.95);font-weight:600;font-size:0.75em">${win20}</div>
                <div title="Victoires 2-1: ${win21}" style="flex:${flex2};background:${c_win21};opacity:${barOpacity};height:100%;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.95);font-weight:600;font-size:0.75em">${win21}</div>
                <div title="Nuls 1-1: ${draw11}" style="flex:${flex3};background:${c_draw11};opacity:${barOpacity};height:100%;display:flex;align-items:center;justify-content:center;color:rgba(0,0,0,0.85);font-weight:600;font-size:0.75em">${draw11}</div>
                <div title="Défaites 1-2: ${lose12}" style="flex:${flex4};background:${c_lose12};opacity:${barOpacity};height:100%;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.95);font-weight:600;font-size:0.75em">${lose12}</div>
                <div title="Défaites 0-2: ${lose02}" style="flex:${flex5};background:${c_lose02};opacity:${barOpacity};height:100%;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.95);font-weight:600;font-size:0.75em">${lose02}</div>
            </div>
        </div>
    `;
    // --- FIN diagramme ---

    const lastResultsHtml = playerMatches.slice().reverse().map(m => {
        const team1 = getPlayerNames(m.team1, players).join(", ");
        const team2 = getPlayerNames(m.team2, players).join(", ");
        let result = m.score;
        let winnerSide = m.winners && m.winners.some(w => m.team1.includes(w)) ? 1 : (m.winners && m.winners.some(w => m.team2.includes(w)) ? 2 : 0);
        // highlight player's side
        const playerSide = m.team1.includes(player.id.toString()) ? 1 : 2;
        const mark = m.score === '1-1' ? '<span style="color:orange">Nul</span>' : (winnerSide === playerSide ? '<span style="color:lightgreen">Victoire</span>' : '<span style="color:#ff7b7b">Défaite</span>');
        return `<div style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06)">
            <div style="font-size:0.95em">${team1} <strong style="margin:0 8px">${result}</strong> ${team2}</div>
            <div style="font-size:0.85em;color:#ddd">${mark} — détails: ${m.comment || '—'}</div>
        </div>`;
    }).join("");

    body.innerHTML = `
        <h2 style="margin:0 0 8px 0">${player.name}</h2>
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px">
            <div>Pts: <strong>${Math.floor(player.points)}</strong></div>
            <div>MJ: <strong>${player.matchesPlayed}</strong></div>
            <div>V-D: <strong>${player.wins}-${player.losses}</strong></div>
            <div>N: <strong>${player.draws || 0}</strong></div>
            <div>Sets: <strong>${player.setsWon}:${player.setsLost}</strong></div>
        </div>
        ${duelHtml}
        ${diagramHtml}
        <div style="margin-bottom:12px">
            <h3 style="margin:0 0 6px 0;font-size:1em">Derniers matchs</h3>
            <div style="font-size:0.95em">${lastResultsHtml || '<div>Aucun match</div>'}</div>
        </div>
    `;

    modal.style.display = "flex";
}



function getYouTubeEmbedSrc(urlOrId: string): string {
    if (!urlOrId) return '';
    // tenter d'extraire l'ID depuis une URL YouTube classique ou short link
    const m = urlOrId.match(/(?:v=|\/embed\/|youtu\.be\/|\/v\/)([A-Za-z0-9_-]{11})/) || urlOrId.match(/^([A-Za-z0-9_-]{11})$/);
    const id = m ? m[1] : urlOrId;
    return `https://www.youtube.com/embed/${id}`;
}