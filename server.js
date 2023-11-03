const express = require('express');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');
const path = require('path'); // Import the 'path' module

const app = express();
const port = process.env.PORT || 5500;

app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'imgur_gallery.html'));
});

// Create a SQLite database connection
const db = new sqlite3.Database('./database/imgur_links.db');

// Create a table to store visited links
db.run('CREATE TABLE IF NOT EXISTS imgur_links (url TEXT)');

// Add a new visited link to the database
app.post('/add-link', (req, res) => {
    const { url } = req.body;
    console.log(`Received URL: ${url}`);

    db.run('INSERT INTO imgur_links (url) VALUES (?)', [url], (err) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Error adding link to the database');
        } else {
            res.status(200).send('Link added to the database');
        }
    });
});


// Get the list of visited links from the database
app.get('/visited-links', (req, res) => {
    db.all('SELECT url FROM imgur_links', (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Error retrieving visited links from the database');
        } else {
            const visitedLinks = rows.map((row) => row.url);
            res.json(visitedLinks);
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
