const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Percorso file verbali
const VERBALI_FILE = path.join(__dirname, 'data', 'verbali.json');

// Assicura che la cartella data esista
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

// Inizializza file verbali se non esiste
if (!fs.existsSync(VERBALI_FILE)) {
    const exampleVerbale = `Data: 20 Maggio 2025
Luogo: Laboratorio ITS
Durata: 3 ore
Presenti: Luchini A., Genzini L., Bogdan M., Ayad C., Gianoglio G., Fionda G.
Tipologia: Sessione di sviluppo

Attività Svolte:
- Setup iniziale hardware Arduino Uno Q e camera
- Test comunicazione seriale
- Raccolta prime 50 immagini del dataset
- Configurazione Edge Impulse

Problemi Riscontrati:
- La camera non veniva rilevata all'avvio (risolto riavviando)
- Overheating del powerbank dopo 2 ore

Decisioni Prese:
- Utilizzare powerbank da 10000mAh
- Alternare periodi di lavoro con pause

Ore per Membro:
Luchini A.: 3h
Genzini L.: 3h
Bogdan M.: 3h
Ayad C.: 3h
Gianoglio G.: 3h
Fionda G.: 3h

Prossimi Passi (assegnato a / entro):
- Completare raccolta 500 immagini (Luchini / 30 maggio)
- Addestrare primo modello su Edge Impulse (Bogdan / 2 giugno)
- Progettare supporto CAD 3D (Genzini / 28 maggio)`;
    
    fs.writeFileSync(VERBALI_FILE, JSON.stringify([{
        id: 'v_example',
        date: '20 Maggio 2025',
        title: 'Verbale Sessione 1 - Setup Iniziale',
        tipo: 'Sessione di sviluppo',
        content: exampleVerbale,
        uploadedBy: 'system',
        createdAt: new Date().toISOString()
    }], null, 2));
}

// API Routes
// GET - Ottieni tutti i verbali
app.get('/api/verbali', (req, res) => {
    try {
        const verbali = JSON.parse(fs.readFileSync(VERBALI_FILE, 'utf8'));
        res.json(verbali);
    } catch (err) {
        res.status(500).json({ error: 'Errore nel caricamento dei verbali' });
    }
});

// POST - Aggiungi un nuovo verbale
app.post('/api/verbali', (req, res) => {
    try {
        const { title, date, content } = req.body;
        if (!title || !content) {
            return res.status(400).json({ error: 'Titolo e contenuto sono obbligatori' });
        }
        
        const verbali = JSON.parse(fs.readFileSync(VERBALI_FILE, 'utf8'));
        const newVerbale = {
            id: 'v_' + Date.now(),
            title: title,
            date: date || new Date().toLocaleDateString('it-IT'),
            tipo: 'Verbale caricato',
            content: content,
            uploadedBy: 'admin',
            createdAt: new Date().toISOString()
        };
        
        verbali.unshift(newVerbale);
        fs.writeFileSync(VERBALI_FILE, JSON.stringify(verbali, null, 2));
        res.json(newVerbale);
    } catch (err) {
        res.status(500).json({ error: 'Errore nel salvataggio del verbale' });
    }
});

// DELETE - Elimina un verbale
app.delete('/api/verbali/:id', (req, res) => {
    try {
        const id = req.params.id;
        let verbali = JSON.parse(fs.readFileSync(VERBALI_FILE, 'utf8'));
        verbali = verbali.filter(v => v.id !== id);
        fs.writeFileSync(VERBALI_FILE, JSON.stringify(verbali, null, 2));
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Errore nell'eliminazione del verbale' });
    }
});

// Avvia server
app.listen(PORT, () => {
    console.log(`🚀 Server CleaningBoat avviato su http://localhost:${PORT}`);
    console.log(`📝 Verbali condivisi accessibili da qualsiasi dispositivo sulla rete`);
    console.log(`🔐 Password admin: admin123`);
});