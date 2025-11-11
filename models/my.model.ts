export interface Player {
    id: number;
    name: string;
    isLocal? : boolean;
}

export interface PlayerModel extends Player {
    matchesPlayed: number;
    points: number;
    wins: number;
    losses: number;
    draws: number;
    setsWon: number;
    setsLost: number;
    winRate? : number;
}

export interface Match {
    id : number,
    team1: string[];
    team2: string[];
    score: '2-1' | '2-0' | '1-1';
    scoreDetails?: string;
    winners: string[];
    comment?: string;
}