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

    players.sort((a, b) => {
    if (b.points !== a.points) {
        return b.points - a.points;
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
                    <th class="MJ">MJ</th>
                    <th class="P">P</th>

                    <th class="V-N-D">V-N-D</th>
                    <th class="SG">Sets</th>
                    <th class="SD">+/-</th>
                    <th class="winRate">Win%</th>
                </tr>
            </thead>
            <tbody>
    `;

    players.forEach((p, index) => {
        const winRate = p.matchesPlayed > 0 ? ((p.wins / p.matchesPlayed) * 100).toFixed(0) : '0';
        const setDifference = p.setsWon - p.setsLost;

        html += `
            <tr ${p.isLocal ? 'style="background-color:#d1ffd1"' : ""}>
                <td>${index + 1}</td>
                <td class="player">${p.name}</td>
                <td class="J">${p.matchesPlayed}</td>
                <td class="P">${p.points}</td>
                <td class="V">${p.wins}-${p.draws}-${p.losses}</td>
                <td class="SG">${p.setsWon}-${p.setsLost}</td>
                <td class="SD">${setDifference}</td>
                <td class="winRate">${winRate}</td>
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
        console.log(otherOption, "added to", select);

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
    initForm();
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