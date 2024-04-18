import React, { useState, useEffect } from 'react';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { Heading } from '@aws-amplify/ui-react';
import axios from 'axios';

function SteamGamesList() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [scannedGames, setScannedGames] = useState([]);
  const [gameRatings, setGameRatings] = useState({});
  const [achievementPercentages, setAchievementPercentages] = useState({});
  const [gameStatuses, setGameStatuses] = useState({});
  const [gameNotes, setGameNotes] = useState({});
  const [listOptions, setListOptions] = useState([]);
  const [pendingChanges, setPendingChanges] = useState([]);
  const [sortBy, setSortBy] = useState('default');
  const [sortDirection, setSortDirection] = useState('asc');
  const [originalOrder, setOriginalOrder] = useState([]);
  const [fetchedAchievements, setFetchedAchievements] = useState(new Set());

  useEffect(() => {
    fetchListOptions();
    reloadGames();
  }, []);

  const fetchListOptions = async () => {
    try {
      const attributes = await fetchUserAttributes();
      const steamId = attributes['custom:SteamID'];
      const response = await axios.get(`http://upstreamreact.com:9010/list_options/${steamId}`);
      const data = response.data;
      setListOptions(data);
    } catch (error) {
      console.error('Error fetching list options:', error);
    }
  };

  const reloadGames = async () => {
  try {
    const attributes = await fetchUserAttributes();
    const steamId = attributes['custom:SteamID'];
    const gamesResponse = await axios.get(`http://upstreamreact.com:9003/get_games/${steamId}`);
    const gamesData = gamesResponse.data;

    const initialGameRatings = {};
    const initialGameStatuses = {};
    const initialGameNotes = {};

    gamesData.forEach(game => {
      initialGameRatings[game.GameID] = game.Rating;
      initialGameStatuses[game.GameID] = game.ListName;
      initialGameNotes[game.GameID] = game.NoteText;
    });

    setScannedGames(gamesData);
    setOriginalOrder([...gamesData]); // Save the original order
    setGameRatings(initialGameRatings);
    setGameStatuses(initialGameStatuses);
    setGameNotes(initialGameNotes);
  } catch (error) {
    console.error('Error reloading games:', error);
  }
};

  
  const fetchGamesLibrary = async () => {
    try {
      const attributes = await fetchUserAttributes();
      const steamId = attributes['custom:SteamID'];
      await axios.post('http://upstreamreact.com:9002/fetch_game_library', { steamId });
      reloadGames();
    } catch (error) {
      console.error('Error updating game library:', error);
    }
  };

  const fetchAchievementPercentage = async (gameId) => {
    try {
      const attributes = await fetchUserAttributes();
      const steamId = attributes['custom:SteamID'];
      const response = await axios.get(`http://upstreamreact.com:9016/get_achievements/${steamId}/${gameId}`);
      const achievementData = response.data;
	  console.log(achievementData);

      const totalAchievements = achievementData.length;
      const unlockedAchievements = achievementData.filter(achievement => achievement.achieved).length;
      const percentage = totalAchievements ? (unlockedAchievements / totalAchievements) * 100 : 0;

      setAchievementPercentages(prevState => ({
        ...prevState,
        [gameId]: percentage
      }));

      setFetchedAchievements(prevSet => new Set([...prevSet, gameId]));
    } catch (error) {
      console.error(`Error fetching achievements for game ${gameId}:`, error);
      // Handle error by setting percentage to null
      setAchievementPercentages(prevState => ({
        ...prevState,
        [gameId]: null
      }));
    }
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleRatingChange = (appId, newRating) => {
    const updatedGameRatings = { ...gameRatings, [appId]: newRating };
    setGameRatings(updatedGameRatings);
    updatePendingChanges(appId, 'rating', newRating);
  };

  const handleStatusChange = (appId, newStatus) => {
    const selectedOption = listOptions.find(option => option.label === newStatus);
    const updatedGameStatuses = { ...gameStatuses, [appId]: newStatus };
    setGameStatuses(updatedGameStatuses);
    updatePendingChanges(appId, 'status', selectedOption ? selectedOption.value : newStatus);
  };

  const handleNotesChange = (appId, newNotes) => {
    const updatedGameNotes = { ...gameNotes, [appId]: newNotes };
    setGameNotes(updatedGameNotes);
    updatePendingChanges(appId, 'notes', newNotes);
  };

  const updatePendingChanges = (appId, field, value) => {
    setPendingChanges(prevChanges => {
      const existingChangeIndex = prevChanges.findIndex(change => change.id === appId);
      if (existingChangeIndex !== -1) {
        const updatedChanges = [...prevChanges];
        updatedChanges[existingChangeIndex][field] = value;
        return updatedChanges;
      } else {
        return [...prevChanges, { id: appId, [field]: value }];
      }
    });
  };

  const handleSaveChanges = async () => {
    try {
      const attributes = await fetchUserAttributes();
      const steamId = attributes['custom:SteamID'];

      const data = {
        userSteamId: steamId,
        games: scannedGames.map(game => ({
          GameID: game.GameID,
          Rating: gameRatings[game.GameID] || game.Rating,
          ListName: gameStatuses[game.GameID] || game.ListName,
          NoteText: gameNotes[game.GameID] || game.NoteText
        })),
        pendingChanges: pendingChanges.map(change => ({
          id: change.id,
          status: change.status,
          rating: gameRatings[change.id],
          notes: gameNotes[change.id]
        }))
      };

      await axios.post('http://upstreamreact.com:9009/save_changes', data);
      reloadGames();
    } catch (error) {
      console.error('Error saving changes:', error);
    }
  };

  const handleSortChange = (column) => {
    if (sortBy === 'default') {
      setSortBy(column);
      setSortDirection('asc');
    } else if (sortBy === column && sortDirection === 'asc') {
      setSortDirection('desc');
    } else {
      setSortBy('default');
      setSortDirection('asc');
    }
  };

  let sortedGames;
  if (sortBy === 'title') {
    sortedGames = scannedGames.slice().sort((a, b) => {
      const aValue = a.Title.toLowerCase();
      const bValue = b.Title.toLowerCase();
      return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    });
  } else if (sortBy === 'rating') {
    sortedGames = scannedGames.slice().sort((a, b) => {
      const aValue = gameRatings[a.GameID] || a.Rating;
      const bValue = gameRatings[b.GameID] || b.Rating;
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
  } else {
    sortedGames = originalOrder.slice();
  }

  let filteredGames = sortedGames.filter(game =>
  game.Title.toLowerCase().includes(searchQuery.toLowerCase()) &&
  (statusFilter === 'all' || game.ListName === statusFilter)
);


  return (
    <div id="mainpage">
      <div className='container'>
        <Heading level={4} id="Upstreamtitle">Games Overview
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className='small-dropdown'
            style={{ position: 'absolute', marginLeft: 20, marginTop: 3, fontSize: 13 }}>
            <option value="all">All</option>
            {listOptions.map(option => (
              <option key={option.value} value={option.label}>{option.label}</option>
            ))}
          </select>
        </Heading>
        <div>
          <button onClick={fetchGamesLibrary}>Import Library</button>
          <button onClick={reloadGames}>Reload Games</button>
        </div>
        <button onClick={handleSaveChanges}>Save Changes</button>
      </div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search by Title"
        className="search-input"
      />
      <table id="games-list">
        <tbody>
          <tr className='gameheader'>
            <th>#</th>
            <th>Logo</th>
            <th onClick={() => handleSortChange('title')}>
              {sortBy === 'title' ? `Title ${sortDirection === 'asc' ? '(A-Z)' : '(Z-A)'}` : 'Title (Default)'}
            </th>
            <th>Achievement%</th>
            <th onClick={() => handleSortChange('rating')}>
              {sortBy === 'rating' ? `Rating ${sortDirection === 'asc' ? '(Low-High)' : '(High-Low)'}` : 'Rating (Default)'}
            </th>
            <th>List</th>
            <th>Notes</th>
          </tr>
          {filteredGames.map((game, index) => (
            <tr className='game-row' key={`${game.GameID}-${index}`} data-status={game.ListName}>
              <td className='game-number'>{index + 1}</td>
              <td>
                {game.LogoURL && (
                  <img className='gamepic' src={`http://media.steampowered.com/steamcommunity/public/images/apps/${game.GameID}/${game.LogoURL}.jpg`} alt={game.Title} />
                )}
              </td>
              <td>{game.Title}</td>
              <td>
                {fetchedAchievements.has(game.GameID) ? 
                  (achievementPercentages[game.GameID] !== null ? `${achievementPercentages[game.GameID].toFixed(2)}%` : 'N/A')
                  : (
                    <button onClick={() => fetchAchievementPercentage(game.GameID)}>Fetch Achievements</button>
                  )}
              </td>
              <td>
                <select
                  value={gameRatings[game.GameID] || 'N/A'}
                  onChange={(e) => handleRatingChange(game.GameID, e.target.value === 'N/A' ? null : parseInt(e.target.value))}
                  className='small-dropdown'>
                  <option value="N/A">N/A</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                  <option value="7">7</option>
                  <option value="8">8</option>
                  <option value="9">9</option>
                  <option value="10">10</option>
                </select>
              </td>
              <td>
                <select
                  value={gameStatuses[game.GameID] || ''}
                  onChange={(e) => handleStatusChange(game.GameID, e.target.value)}
                  className='small-dropdown'>
                  {!listOptions.some(option => option.value === gameStatuses[game.GameID]) &&
                    <option value={gameStatuses[game.GameID] || ''}>{gameStatuses[game.GameID] || 'Select List'}</option>
                  }
                  {listOptions.map(option => (
                    <option key={option.value} value={option.label}>{option.label}</option>
                  ))}
                </select>
              </td>
              <td>
                <textarea
                  value={gameNotes[game.GameID] || ''}
                  onChange={(e) => handleNotesChange(game.GameID, e.target.value)}
                  className='notes-input' />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SteamGamesList;
