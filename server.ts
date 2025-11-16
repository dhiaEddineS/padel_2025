import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { Request, Response } from 'express';
import {Match, PlannedMatch} from './models/my.model.js';
import {fileURLToPath} from "node:url";
import db from './database.js';


const app = express();

// Récupérer le répertoire courant en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, "./public")));


/*db.prepare("DELETE FROM players").run();
db.prepare("DELETE FROM sqlite_sequence WHERE name = 'players'").run();

db.prepare("DELETE FROM matches").run();
db.prepare("DELETE FROM sqlite_sequence WHERE name = 'matches'").run();*/

app.get("/", (req, res) => res.send("Padel API running 🚀"));


// Record a new match
app.post("/matches", (req: Request, res: Response) => {
    console.log('req.body',req.body);
    const { team1, team2, score, winners , comment, scoreDetails } = req.body as Match;
    if (!team1 || !team2) {
        return res.status(400).json({ error: "Les équipes sont invalides" });
    }
    const allPlayers = [...team1, ...team2].filter(team => team !== null && team !== undefined);
    const hasDuplicates = new Set(allPlayers).size !== allPlayers.length;

    if (hasDuplicates) {
        return res.status(400).json({ error: "Un joueur ne peut pas être sélectionné deux fois" });
    }
    const stmt = db.prepare("INSERT INTO matches (team1, team2, score, winners, comment, scoreDetails) VALUES (?, ?, ?, ?, ?, ?)");
    const info = stmt.run(JSON.stringify(team1), JSON.stringify(team2), score, JSON.stringify(winners), comment || '', scoreDetails || '');

    res.json({ id: info.lastInsertRowid, team1, team2, score });
});


app.get("/players", (req: Request, res: Response) => {

    const players = db.prepare("SELECT * FROM players").all();
    console.log('players from db', players);
    res.json(players);
});


app.get("/matches", (req: Request, res: Response) => {
    const matches = db.prepare("SELECT * FROM matches").all() as any[];
    // Parser les champs JSON
    const parsed = matches.map((m) => ({
        ...m,
        team1: JSON.parse(m.team1),
        team2: JSON.parse(m.team2),
        score: m.score,
        winners: JSON.parse(m.winners || '[]'),
        comment: m.comment,
        videoUrl: m.videoUrl
    }));
    res.json(parsed);
});

// Stockage des matchs planifiés (remplacer par une vraie DB si nécessaire)
let plannedMatches: PlannedMatch[] = [];
let plannedMatchIdCounter = 1;

// Fonction pour nettoyer les matchs planifiés expirés
function cleanupExpiredMatches() {
    const now = new Date();
    const initialCount = plannedMatches.length;
    
    plannedMatches = plannedMatches.filter(match => {
        const matchDateTime = new Date(`${match.date}T${match.time}`);
        return matchDateTime > now;
    });
    
    const removedCount = initialCount - plannedMatches.length;
    if (removedCount > 0) {
        console.log(`🧹 ${removedCount} match(s) planifié(s) expiré(s) supprimé(s)`);
    }
}

// Lancer le nettoyage toutes les minutes (60000 ms)
setInterval(cleanupExpiredMatches, 60000);

// Nettoyage initial au démarrage
cleanupExpiredMatches();

// Route GET pour récupérer les matchs planifiés
app.get("/planned-matches", (req, res) => {
    // Nettoyer avant de retourner la liste
    cleanupExpiredMatches();
    res.json(plannedMatches);
});

// Route POST pour créer un match planifié
app.post("/planned-matches", (req, res) => {
    const newPlannedMatch: PlannedMatch = {
        ...req.body,
        id: plannedMatchIdCounter++
    };
    
    // Vérifier que la date/heure n'est pas dans le passé
    const matchDateTime = new Date(`${newPlannedMatch.date}T${newPlannedMatch.time}`);
    const now = new Date();
    
    if (matchDateTime <= now) {
        return res.status(400).json({ error: "Impossible de planifier un match dans le passé" });
    }
    
    plannedMatches.push(newPlannedMatch);
    res.status(201).json(newPlannedMatch);
});

app.listen(4000, () => console.log("🚀 Server running at http://localhost:4000"));