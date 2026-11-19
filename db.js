import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
fs.mkdirSync('data/media',{recursive:true});
export const db=new DatabaseSync(process.env.DB_PATH||'data/engine.sqlite');
db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY,value TEXT);
CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,expires INTEGER);
CREATE TABLE IF NOT EXISTS creators(id INTEGER PRIMARY KEY,name TEXT,handle TEXT,channel TEXT,checked TEXT);
CREATE TABLE IF NOT EXISTS refs(id INTEGER PRIMARY KEY,title TEXT,url TEXT UNIQUE,notes TEXT,created TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS videos(id INTEGER PRIMARY KEY,title TEXT,creator TEXT,day TEXT,status TEXT DEFAULT 'draft',source TEXT,secondary TEXT,output TEXT,thumbnail TEXT,start REAL DEFAULT 0,duration REAL DEFAULT 30,caption TEXT DEFAULT '',scheduled TEXT,approved_at TEXT,revision INTEGER DEFAULT 1,error TEXT);
CREATE TABLE IF NOT EXISTS publications(id INTEGER PRIMARY KEY,video_id INTEGER,platform TEXT,status TEXT,remote_id TEXT,error TEXT,created TEXT DEFAULT CURRENT_TIMESTAMP,UNIQUE(video_id,platform));
CREATE TABLE IF NOT EXISTS editorial(video_id INTEGER PRIMARY KEY REFERENCES videos(id),config TEXT NOT NULL DEFAULT '{}');
CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY,event TEXT,detail TEXT,created TEXT DEFAULT CURRENT_TIMESTAMP);`);
if(!db.prepare('SELECT id FROM creators LIMIT 1').get()){
const insert=db.prepare('INSERT INTO creators(name,handle) VALUES(?,?)');
for(const c of [['Alanzoka','alanzoka'],['LOUD Coringa','loud_coringa'],['Paulinho o LOKO','paulinhoolokobr'],['Bagi','bagi'],['Skorpion Gamer','SkorpionGamer'],['Robin Hood Gamer','RobinHoodGamer'],['Gameplayrj','Gameplayrj']])insert.run(...c);
}
db.prepare('INSERT OR IGNORE INTO refs(title,url,notes) VALUES(?,?,?)').run('Referência Everest Chris','https://x.com/everestchris6/status/2122741990018494669','Preservada do briefing. Conteúdo não verificado: X bloqueou a leitura.');
export function audit(event,detail){db.prepare('INSERT INTO audit(event,detail) VALUES(?,?)').run(event,String(detail));}
export function day(){return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo'}).format(new Date());}
