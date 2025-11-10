import { Match, Player } from "./models/my.model.js";

export const defaultMatches : Match[] = [
    {
        "id": 1,
        "team1": [
            "1",
            "2"
        ],
        "team2": [
            "Alex_custom",
            "ITA_custom"
        ],
        "score": "2-0",
        "winners": [
            "1",
            "2"
        ],
        "comment": "6-4 6-2\nRevanche validée",
    },
    {
        "id": 2,
        "team1": [
            "7",
            "William_custom"
        ],
        "team2": [
            "5",
            "imed_custom"
        ],
        "score": "2-0",
        "winners": [
            "7",
            "William_custom"
        ],
        "comment": "non équilibré\nImed vers ligue 2"
    },
    {
        "id": 3,
        "team1": [
            "1",
            "6"
        ],
        "team2": [
            "5",
            "David_custom"
        ],
        "score": "2-1",
        "winners": [
            "1",
            "6"
        ],
        "comment": "3-6 6-4 6-1"
    },
    {
        "id": 4,
        "team1": [
            "3",
            "4"
        ],
        "team2": [
            "7",
            "niv3_custom"
        ],
        "score": "2-1",
        "winners": [
            "3",
            "4"
        ],
        "comment": ""
    },
    {
        "id": 5,
        "team1": [
            "1",
            "3"
        ],
        "team2": [
            "5",
            "8"
        ],
        "score": "2-0",
        "winners": [
            "1",
            "3"
        ],
        "comment": "6-3 6-2 Bon match en général "
    },
    {
        "id": 6,
        "team1": [
            "1",
            "8"
        ],
        "team2": [
            "Julien_custom",
            "Simon_custom"
        ],
        "score": "2-1",
        "winners": [
            "1",
            "8"
        ],
        "comment": "4-6 6-3 6-1"
    },
    {
        "id": 7,
        "team1": [
            "4",
            "6"
        ],
        "team2": [
            "7",
            "5"
        ],
        "score": "2-1",
        "winners": [
            "4",
            "6"
        ],
        "comment": "6-4 2-6 6-2 Match non télévisé "
    },
    {
        "id": 8,
        "team1": [
            "1",
            "2"
        ],
        "team2": [
            "5",
            "8"
        ],
        "score": "2-0",
        "winners": [
            "1",
            "2"
        ],
        "comment": "7-6 6-4 Que des fautes"
    },
    {
        "id": 9,
        "team1": [
            "5",
            "7"
        ],
        "team2": [
            "6",
            "4"
        ],
        "score": "2-1",
        "winners": [
            "5",
            "7"
        ],
        "comment": "1-6 6-3 7-5 Revanche et retour de loin"
    },
    {
        "id": 10,
        "team1": [
            "5",
            "8"
        ],
        "team2": [
            "1",
            "3"
        ],
        "score": "2-0",
        "winners": [
            "5",
            "8"
        ],
        "comment": "6-4 6-3 adversaire en forme et 1ere défaite pr le Boss"
    },
    {
        "id": 11,
        "team1": [
            "5",
            "7"
        ],
        "team2": [
            "6",
            "4"
        ],
        "score": "2-0",
        "winners": [
            "5",
            "7"
        ],
        "comment": "6-2 6-4 Classico sous tension mais pas de victimes finalement "
    },
    {
        "id": 12,
        "team1": [
            "1",
            "2"
        ],
        "team2": [
            "5",
            "8"
        ],
        "score": "1-1",
        "winners": [
            "1",
            "2"
        ],
        "comment": "6-2 5-7 2-4 Unpopular opinion vérifiée"
    },
    {
        "id": 13,
        "team1": [
            "1",
            "4"
        ],
        "team2": [
            "5",
            "3"
        ],
        "score": "2-0",
        "winners": [
            "1",
            "4"
        ],
        "comment": "6-4 7-6"
    },
    {
        "id": 14,
        "team1": [
            "1",
            "3"
        ],
        "team2": [
            "8",
            "4"
        ],
        "score": "2-0",
        "winners": [
            "1",
            "3"
        ],
        "comment": "6-3 7-6 Pari gagné 50 € smash retro vs Momo"
    },
    {
        "id": 15,
        "team1": [
            "4",
            "8"
        ],
        "team2": [
            "6",
            "5"
        ],
        "score": "1-1",
        "winners": [
            "4",
            "8"
        ],
        "comment": "7-5 3-6 3-3 nul au goût de la défaite "
    },
    {
        "id": 16,
        "team1": [
            "1",
            "4"
        ],
        "team2": [
            "6",
            "5"
        ],
        "score": "2-1",
        "winners": [
            "1",
            "4"
        ],
        "comment": "6-2 3-6 6-4 Partie chaude à l urban"
    },
    {
        "id": 17,
        "team1": [
            "5",
            "3"
        ],
        "team2": [
            "1",
            "4"
        ],
        "score": "2-0",
        "winners": [
            "5",
            "3"
        ],
        "comment": "7-6 6-4 chfbbi en forme victoire méritée "
    },
    {
        "id": 18,
        "team1": [
            "5",
            "Paul_5_custom"
        ],
        "team2": [
            "1",
            "3"
        ],
        "score": "2-0",
        "winners": [
            "5",
            "Paul_5_custom"
        ],
        "comment": "6-4 6-4 Match à sens unique"
    },
    {
        "id": 19,
        "team1": [
            "1",
            "6"
        ],
        "team2": [
            "5",
            "4"
        ],
        "score": "2-0",
        "winners": [
            "1",
            "6"
        ],
        "comment": "6-4 6-3 Retour aux victoires"
    },
    {
        "id": 20,
        "team1": [
            "Vito_custom",
            "Niv5_custom"
        ],
        "team2": [
            "5",
            "7"
        ],
        "score": "2-0",
        "winners": [
            "Vito_custom",
            "Niv5_custom"
        ],
        "comment": "6-0 6-0 6-0 Partie héroïque à Lubumbashi"
    },
        {
        "id": 21,
        "team1": [
            "1",
            "3"
        ],
        "team2": [
            "5",
            "Paul5_custom"
        ],
        "score": "2-1",
        "winners": [
            "1",
            "3"
        ],
        "comment": "2-6 6-0 6-1 Idriss homme du match"
    },
    {
        "id": 22,
        "team1": [
            "1",
            "8"
        ],
        "team2": [
            "5",
            "Paul5_custom"
        ],
        "score": "2-0",
        "winners": [
            "1",
            "8"
        ],
        "comment": "6-4 6-3 Bon match"
    },
    {
        "id": 23,
        "team1": [
            "5",
            "Damien6_custom"
        ],
        "team2": [
            "1",
            "8"
        ],
        "score": "2-1",
        "winners": [
            "5",
            "Damien6_custom"
        ],
        "comment": "6-1 2-6 6-2 Bon rendement vs Federer"
    },
    {
        "id": 24,
        "team1": [
            "6",
            "Damien6_custom"
        ],
        "team2": [
            "1",
            "8"
        ],
        "score": "2-1",
        "winners": [
            "6",
            "Damien6_custom"
        ],
        "comment": "2-6 7-6 6-0 Match sans enjeu (bchal)"
    },
        {
        "id": 25,
        "team1": [
            "1",
            "8"
        ],
        "team2": [
            "5",
            "7"
        ],
        "score": "2-0",
        "winners": [
            "1",
            "8"
        ],
        "comment": "6-3 6-3 Match rapide "
    }
];

export const defaultPlayers: Player[] = [
    {
        "id": 1,
        "name": "Le Boss",
        "matchesPlayed": 18,
        "points": 20.5,
        "wins": 12,
        "losses": 5,
        "draws": 1,
        "setsWon": 27,
        "setsLost": 15,
        "isLocal": true
    },
    {
        "id": 2,
        "name": "Joy",
        "matchesPlayed": 3,
        "points": 4.5,
        "wins": 2,
        "losses": 0,
        "draws": 1,
        "setsWon": 5,
        "setsLost": 1,
        "isLocal": false
    },
    {
        "id": 3,
        "name": "Idriss",
        "matchesPlayed": 8,
        "points": 8,
        "wins": 5,
        "losses": 3,
        "draws": 0,
        "setsWon": 10,
        "setsLost": 8,
        "isLocal": true
    },
    {
        "id": 4,
        "name": "Momo",
        "matchesPlayed": 10,
        "points": 5.5,
        "wins": 4,
        "losses": 5,
        "draws": 1,
        "setsWon": 10,
        "setsLost": 14,
        "isLocal": true
    },
    {
        "id": 5,
        "name": "Walid",
        "matchesPlayed": 20,
        "points": 11,
        "wins": 6,
        "losses": 12,
        "draws": 2,
        "setsWon": 18,
        "setsLost": 28,
        "isLocal": true
    },
    {
        "id": 6,
        "name": "Said",
        "matchesPlayed": 8,
        "points": 5.5,
        "wins": 4,
        "losses": 3,
        "draws": 1,
        "setsWon": 11,
        "setsLost": 10,
        "isLocal": true
    },
    {
        "id": 7,
        "name": "Haroun",
        "matchesPlayed": 7,
        "points": 5,
        "wins": 3,
        "losses": 4,
        "draws": 0,
        "setsWon": 8,
        "setsLost": 9,
        "isLocal": true
    },
    {
        "id": 8,
        "name": "Farouk",
        "matchesPlayed": 11,
        "points": 8,
        "wins": 4,
        "losses": 5,
        "draws": 2,
        "setsWon": 12,
        "setsLost": 13,
        "isLocal": true
    }
];