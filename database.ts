import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "node:url";
import {Player} from "./models/my.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, "padel.db"));


// Création des tables si elles n'existent pas
db.prepare(`
CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    matchesPlayed INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    setsWon INTEGER DEFAULT 0,
    setsLost INTEGER DEFAULT 0,
    isLocal BOOLEAN DEFAULT 0
)
`).run();

// Liste de joueurs par défaut
const defaultPlayers  = [
    { name: 'Le Boss', isLocal: true},
    { name: 'Joy', isLocal: true },
    { name: 'Idriss', isLocal: true },
    { name: 'Momo', isLocal: true },
    { name: 'Walid', isLocal: true },
    { name: 'Said', isLocal: true },
    { name: 'Haroun', isLocal: true },
    { name: 'Farouk', isLocal: true }
];

// Insérer les joueurs par défaut seulement si la table est vide
const count = (db.prepare('SELECT COUNT(*) as c FROM players').get()as { c: number }).c;
if (count === 0) {
    const insert = db.prepare('INSERT INTO players (name, isLocal) VALUES (?, ?)');
    const insertMany = db.transaction((players: typeof defaultPlayers) => {
        for (const p of players) insert.run(p.name, p.isLocal ? 1 : 0);
    });
    insertMany(defaultPlayers);
    console.log('Joueurs par défaut insérés dans la base');
}


db.prepare(`
CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team1 TEXT NOT NULL, -- JSON string des IDs joueurs
    team2 TEXT NOT NULL,
    score TEXT NOT NULL,
    winners TEXT,
    comment TEXT
)
`).run();

export default db;