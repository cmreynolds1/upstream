import React, { useState, useEffect } from 'react';
import './GameList.css';
import axios from 'axios';
import { fetchUserAttributes } from 'aws-amplify/auth';

function GameLists() {
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [gameToAdd, setGameToAdd] = useState({ title: '', Notes: '', description: '' });
  const [selectedListIndex, setSelectedListIndex] = useState(null);
  const [steamId, setSteamId] = useState('');
  const [statistics, setStatistics] = useState({});

  useEffect(() => {
    async function fetchData() {
      try {
        const attributes = await fetchUserAttributes();
        const steamId = attributes['custom:SteamID'];
        setSteamId(steamId);

        // Fetch user's lists
        await refreshUserLists(steamId);

        // Fetch statistics
        await fetchStatistics(steamId);
      } catch (error) {
        console.error('Failed to fetch user lists:', error);
      }
    }
    fetchData();
  }, []);

  const refreshUserLists = async (steamId) => {
    try {
      const response = await axios.get(`http://upstreamreact.com:9017/${steamId}`);
      setLists(response.data);
    } catch (error) {
      console.error('Failed to refresh user lists:', error);
    }
  };

  const fetchStatistics = async (steamId) => {
    try {
      const response = await axios.get(`http://upstreamreact.com:9019/statistics/${steamId}`);
      setStatistics(response.data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const createList = async () => {
    if (newListName !== '') {
      try {
        const response = await axios.post('http://upstreamreact.com:9011/create_list', { name: newListName, userID: steamId });
        const newList = response.data;
        // Update local state with the new list
        setLists([...lists, newList]);
        setNewListName('');

        // Fetch user's lists again to ensure the UI is updated
        await refreshUserLists(steamId);
      } catch (error) {
        console.error('Failed to create list:', error);
      }
    }
  };

  const deleteList = async (listId) => {
    try {
      // Fetch user attributes to get the userID
      const attributes = await fetchUserAttributes();
      const userID = attributes['custom:SteamID'];

      // Display confirmation prompt
      const confirmDelete = window.confirm('Are you sure you want to delete this list?');
      if (confirmDelete) {
        // Call delete_lists script with userID and listId
        await axios.delete(`http://upstreamreact.com:9018/delete_list/${userID}/${listId}`);
        // Refresh user's lists after deletion
        await refreshUserLists(steamId);
      }
    } catch (error) {
      console.error('Failed to delete list:', error);
    }
  };

  const addGameToList = () => {
    if (selectedListIndex !== null && gameToAdd.title !== '') {
      const updatedLists = [...lists];
      updatedLists[selectedListIndex].games.push({ ...gameToAdd });
      setLists(updatedLists);
      setGameToAdd({ title: '', Notes: '', description: '' }); // Reset input fields
    }
  };

  const createDefaultLists = async () => {
    try {
      await axios.post('http://upstreamreact.com:9011/create_default_lists', { userID: steamId }); // Send userID in the request body
      console.log('Default lists created successfully');
	  await refreshUserLists(steamId);
    } catch (error) {
      console.error('Failed to create default lists:', error);
    }
  };

  return (
    <div className="game-lists-container">
      {/* List Creation Section */}
      <div className="list-creation-section">
        <h2>List Creation</h2>
        <div className="form-container">
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="New List Name"
            className="new-list-input"
          />
          <button onClick={createList} className="new-list-button">Create New List</button>
          <button onClick={createDefaultLists} className="new-list-button">Create Default Lists</button>
        </div>
      </div>

      {/* My Lists Section */}
      <div className="my-lists-section">
        <h2>My Lists</h2>
        <div className="lists-container">
          {lists.map((list, index) => (
            <div key={index} className="list-item">
              <span>{list.ListName}</span>
              <button onClick={() => deleteList(list.ListID)} className="delete-list-button">Delete</button>
            </div>
          ))}
        </div>
      </div>

      {/* Statistics Section */}
      <div className="statistics-section">
        <h2>Statistics</h2>
        <div className="statistics-container">
          <p>Total Lists: {statistics.totalLists || 0}</p>
          <p>Total Games: {statistics.totalGames || 0}</p>
          <h3>Games per List</h3>
          <ul>
            {statistics.gamesPerList && statistics.gamesPerList.map((item, index) => (
              <li key={index}>{`${item.ListName}: ${item.TotalGames}`}</li>
            ))}
          </ul>
          <h3>Games by Rating</h3>
          <ul>
  {statistics.gamesByRating && statistics.gamesByRating.map((item, index) => (
    <li key={index}>{`Rating ${item.Rating ? item.Rating : 'N/A'}: ${item.TotalGames}`}</li>
  ))}
</ul>

        </div>
      </div>
    </div>
  );
}

export default GameLists;
