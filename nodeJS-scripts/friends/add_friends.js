const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql/msnodesqlv8');
const cors = require('cors');

const app = express();
const port = 9015;

app.use(bodyParser.json());
app.use(cors());

const config = {
  driver: 'msnodesqlv8',
  connectionString: 'Driver={SQL Server};Server=EC2AMAZ-KPBKUAJ\\SQLEXPRESS;Database=Upstream;Trusted_Connection={yes};'
};

app.post('/:steamId', async (req, res) => {
  const { steamId } = req.params;
  const { friendSteamId } = req.body;

  try {
    await sql.connect(config);
    
    // Check if the friendship already exists
    const checkQuery = `
      SELECT * FROM Friends WHERE UserID = '${steamId}' AND FriendUserID = '${friendSteamId}';
    `;
    const checkResult = await sql.query(checkQuery);
    if (checkResult.recordset.length > 0) {
      await sql.close();
      return res.status(400).json({ error: 'Friendship already exists' });
    }

    // If friendship doesn't exist, add it
    const addQuery = `
      INSERT INTO Friends (UserID, FriendUserID) VALUES ('${steamId}', '${friendSteamId}');
    `;
    await sql.query(addQuery);
    await sql.close();

    res.status(200).json({ message: 'Friend added successfully' });
  } catch (err) {
    console.error('Error adding friend:', err);
    res.status(500).json({ error: 'An error occurred while adding friend' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});

