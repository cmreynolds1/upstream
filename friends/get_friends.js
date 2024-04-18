const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql/msnodesqlv8');
const cors = require('cors');

const app = express();
const port = 9014;

app.use(bodyParser.json());
app.use(cors());

const config = {
  driver: 'msnodesqlv8',
  connectionString: 'Driver={SQL Server};Server=EC2AMAZ-KPBKUAJ\\SQLEXPRESS;Database=Upstream;Trusted_Connection={yes};'
};

app.get('/:steamId', async (req, res) => {
  const { steamId } = req.params;

  try {
    await sql.connect(config);
    const query = `
      SELECT 
    Friends.*,
    UserProfiles.ProfilePic,
    UserProfiles.ProfileBio,
	Users.DisplayName
FROM 
    Friends
LEFT JOIN 
    UserProfiles ON Friends.FriendUserID = UserProfiles.UserID
LEFT JOIN 
	Users ON Friends.FriendUserID = Users.UserID
WHERE 
    Friends.UserID = '${steamId}';
    `;
    const result = await sql.query(query);
    await sql.close();

    const friends = result.recordset;
    res.status(200).json(friends);
  } catch (err) {
    console.error('Error fetching friends:', err);
    res.status(500).json({ error: 'An error occurred while fetching friends' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});

