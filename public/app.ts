import {Match, Player} from "../models/my.model.js";

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

async function loadRanking(): Promise<void> {
    const res = await fetch("/players");
    let players: Player[] = await res.json();
    players = players.filter(p => p.isLocal);

    // Charger tous les matchs
    const matchesRes = await fetch("/matches");
    const allMatches: Match[] = await matchesRes.json();

    players.sort((a, b) => {
        if (b.points !== a.points) {
            return b.points - a.points;
        }
        const setDiffA = a.setsWon - a.setsLost;
        const setDiffB = b.setsWon - b.setsLost;
        if (setDiffB !== setDiffA) {
            return setDiffB - setDiffA;
        }
        return a.matchesPlayed - b.matchesPlayed;
    });

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
                    <th class="lastResults">Derniers</th>
                </tr>
            </thead>
            <tbody>
    `;

    players.forEach((p, index) => {
        const winRate = p.matchesPlayed > 0 ? ((p.wins / p.matchesPlayed) * 100).toFixed(0) : '0';
        const setDifference = p.setsWon - p.setsLost;

        // Récupérer les 3 derniers matchs du joueur
        const playerMatches = allMatches
            .filter(m => [...m.team1, ...m.team2].includes(p.id.toString()))
            .slice(-4);
        // Pour chaque match, déterminer le résultat
        const resultIcons = playerMatches.map(m => {
            if (m.score === '1-1') return '<span style="color:orange;font-size:0.8em;">&#x1F7E1;</span>'; // orange pour nul
            if (m.winners.includes(p.id.toString())) return '<span style="color:green;font-size:0.8em;">&#x2705;</span>'; // vert pour victoire
            return '<span style="color:red;font-size:0.8em;">&#x274C;</span>'; // rouge pour défaite
        }).join('');

        html += `
            <tr ${p.isLocal ? 'style="background-color:#d1ffd1"' : ""}>
                <td>${index + 1}</td>
                <td class="player">${p.name}</td>
                <td class="P">${Math.floor(p.points)}</td>
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

        console.log(container, "created");

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
            return player ? player.name : id;
        }).join(', ');
    }
    const total = wins1 + wins2 + draws;
    const confrontationList = confrontations.slice().reverse().map(m => {
        const team1Names = getPlayerNames(m.team1);
        const team2Names = getPlayerNames(m.team2);
        return `<div class='confrontation-item'>
            <span class='confrontation-team'>[${team1Names}]</span>
            <span class='confrontation-score'>${m.score}</span>
            <span class='confrontation-team'>[${team2Names}]</span>
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
        placeholder.selected = true;
        select.appendChild(placeholder);
        players.forEach(player => {
            const option = document.createElement("option");
            option.value = player.id.toString();
            option.textContent = player.name;
            select.appendChild(option);
        });
    });
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
        const getPlayerNames = (ids: (number | string)[]) => ids
            // .filter(id => typeof id == 'number')
            .map(id => {
                if (typeof id === 'string' && id.endsWith("_custom")) {
                    return id.replace("_custom", "")
                }
                else {
                    const player = players.find(p => p.id == id);
                    return player ? player.name : 'inconnu';
                }

        });
        const namesTeam1 = getPlayerNames(match.team1).join(", ");
        const namesTeam2 = getPlayerNames(match.team2).join(", ");


        // Affichage simple : team1 vs team2
        div.innerHTML = `
            <strong>Match #${match.id}</strong><br>
            [${namesTeam1}] ⚔️ [${namesTeam2}]<br>
            Score : ${match.score}<br>
            ${match.comment}<br>
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