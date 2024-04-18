const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql/msnodesqlv8');
const cors = require('cors');

const app = express();
const port = 9020;

app.use(bodyParser.json());
app.use(cors());

const config = {
  driver: 'msnodesqlv8',
  connectionString: 'Driver={SQL Server};Server=EC2AMAZ-KPBKUAJ\\SQLEXPRESS;Database=Upstream;Trusted_Connection={yes};'
};

app.delete('/:steamId/:friendId', async (req, res) => {
  const { steamId, friendId } = req.params;

  try {
    console.log('Received delete request with steamId:', steamId, 'and friendId:', friendId); // Log received data
    
    await sql.connect(config);
    
    // Delete the friendship by UserID and FriendUserID
    const deleteQuery = `
      DELETE FROM Friends WHERE UserID = '${steamId}' AND FriendUserID = '${friendId}';
    `;
    console.log('Generated SQL query:', deleteQuery); // Log generated SQL query
    await sql.query(deleteQuery);
    await sql.close();

    res.status(200).json({ message: 'Friend deleted successfully' });
  } catch (err) {
    console.error('Error deleting friend:', err);
    res.status(500).json({ error: 'An error occurred while deleting friend' });
  }
});


app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});

