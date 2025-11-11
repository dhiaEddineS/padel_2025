import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "node:url";
import { defaultMatches, defaultPlayers } from "./backup.database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, "padel.db"));


// Création des tables si elles n'existent pas
db.prepare(`
CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    isLocal BOOLEAN DEFAULT 0
)
`).run();


// Insérer les joueurs par défaut seulement si la table est vide
const count = (db.prepare('SELECT COUNT(*) as c FROM players').get()as { c: number }).c;
if (count === 0) {
    const insert = db.prepare('INSERT INTO players (id, name, isLocal) VALUES (?, ?, ?)');
    const insertMany = db.transaction((players: typeof defaultPlayers) => {
        for (const p of players) insert.run(p.id, p.name, p.isLocal ? 1 : 0);
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

// Insérer les matchs par défaut seulement si la table est vide
const matchCount = (db.prepare('SELECT COUNT(*) as c FROM matches').get() as { c: number }).c;
if (matchCount === 0) {
    const insertMatch = db.prepare('INSERT INTO matches (team1, team2, score, winners, comment) VALUES (?, ?, ?, ?, ?)');
    const insertManyMatches = db.transaction((matches: typeof defaultMatches) => {
        for (const m of matches) insertMatch.run(JSON.stringify(m.team1), JSON.stringify(m.team2), m.score, JSON.stringify(m.winners), m.comment || '');
    });
    insertManyMatches(defaultMatches);
    console.log('Matchs par défaut insérés dans la base');
}


export default db;