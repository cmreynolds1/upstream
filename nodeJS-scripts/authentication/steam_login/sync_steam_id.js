const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sql = require('mssql/msnodesqlv8');

const app = express();
const port = 9013;

// Middleware to parse incoming request bodies
app.use(bodyParser.json());

app.use(cors()); // Enable CORS for all routes

// Configuration for SQL Server connection
const config = {
	driver: 'msnodesqlv8',
	connectionString: 'Driver={SQL Server};Server={EC2AMAZ-KPBKUAJ\\SQLEXPRESS};Database={Upstream};Trusted_Connection={yes};',
};

app.post('/sync_steam_id', async (req, res) => {
    const { steamId, displayName } = req.body;

    try {
        // Connect to SQL Server database
		await sql.connect(config);

        // Check if SteamID already exists in the database
        const existingUser = await sql.query`SELECT UserID FROM Users WHERE UserID = ${steamId}`;
        if (existingUser.recordset.length > 0) {
            console.log('SteamID already exists in the database');
            return res.status(400).send('SteamID already exists in the database');
        }

        // Insert SteamID and DisplayName into MSSQL database
        await sql.query`INSERT INTO Users (UserID, DisplayName) VALUES (${steamId}, ${displayName})`;

        console.log('SteamID and DisplayName inserted successfully');
        res.sendStatus(200); // Send success status code
    } catch (err) {
        console.error('Error inserting SteamID and DisplayName:', err);
        res.status(500).send('Error inserting SteamID and DisplayName'); // Send error status code and message
    } finally {
        // Close the database connection
        try {
            await sql.close();
        } catch (err) {
            console.error('Error closing connection:', err);
        }
    }
});

app.post('/check_steam_id', async (req, res) => {
    const { steamId } = req.body;

    try {
        // Connect to SQL Server database
        await sql.connect(config);

        // Check if SteamID already exists in the database
        const existingUser = await sql.query`SELECT UserID FROM Users WHERE UserID = ${steamId}`;
        const exists = existingUser.recordset.length > 0;
        res.json({ exists });
    } catch (err) {
        console.error('Error checking SteamID:', err);
        res.status(500).send('Error checking SteamID'); // Send error status code and message
    } finally {
        // Close the database connection
        try {
            await sql.close();
        } catch (err) {
            console.error('Error closing connection:', err);
        }
    }
});


// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});

