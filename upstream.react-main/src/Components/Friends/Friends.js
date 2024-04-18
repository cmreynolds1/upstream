import React, { useState, useEffect } from 'react';
import './Friends.css';
import axios from 'axios';
import { fetchUserAttributes } from 'aws-amplify/auth';
const Buffer = require('buffer').Buffer;

<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.15.4/css/all.css"></link>

function Friends() {
  const [friends, setFriends] = useState([]);
  const [friendIdInput, setFriendIdInput] = useState('');

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const attributes = await fetchUserAttributes();
      const steamId = attributes['custom:SteamID'];
      const userData = await axios.get(`http://upstreamreact.com:9014/${steamId}`);
      const userFriends = userData.data.map(friend => ({
        ...friend,
        ProfilePic: `data:image/jpeg;base64,${Buffer.from(friend.ProfilePic.data).toString('base64')}`
      }));
      setFriends(userFriends);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const addFriend = async () => {
    // Implement functionality to add a friend
    try {
      const attributes = await fetchUserAttributes();
      const steamId = attributes['custom:SteamID'];
      console.log('Steam ID:', steamId); // Log the steam ID
      
      await axios.post(`http://upstreamreact.com:9015/${steamId}`, { friendSteamId: friendIdInput });
      console.log('Friend added successfully');
      
      fetchFriends(); // Refresh friends list after adding a friend
      setFriendIdInput(''); // Clear the input field after adding a friend
    } catch (error) {
      console.error('Error adding friend:', error);
    }
  };

const deleteFriend = async (friendId) => {
  // Implement functionality to delete a friend
  try {  
    // Show confirmation dialog
    const isConfirmed = window.confirm("Are you sure you want to delete this friend?");
    if (!isConfirmed) return; // If not confirmed, abort deletion
    console.log(friendId);
    const attributes = await fetchUserAttributes();
    const steamId = attributes['custom:SteamID'];
    console.log('Deleting friend with steamId:', steamId, 'and friendId:', friendId); // Log data being sent
    await axios.delete(`http://upstreamreact.com:9020/${steamId}/${friendId}`);
    console.log('Friend deleted successfully');
    
    setFriends(friends.filter(friend => friend.FriendUserID !== friendId));
  } catch (error) {
    console.error('Error deleting friend:', error);
  }
};




  return (
    <div className="friends-list-container">
      <h2 className="friends-list-title">Friends List</h2>
      <div className="friends-list">
        {friends.map((friend) => (
          <div className="friend-card" key={friend.FriendUserID}>
            <img className="friend-img" src={friend.ProfilePic} alt={friend.FriendUserID} />
            <span className="friend-name">Name: {friend.DisplayName}</span>
            <span className="friend-bio">&nbsp;Bio: {friend.ProfileBio}</span>
            <button className="friend-action-button delete-friend-btn" onClick={() => deleteFriend(friend.FriendUserID)}>Delete</button>
          </div>
        ))}
      </div>
      <div className="add-friend-container">
        <input
          type="text"
          placeholder="Enter Friend's ID"
          value={friendIdInput}
          onChange={(e) => setFriendIdInput(e.target.value)}
          className="add-friend-input"
        />
        <button className="friend-action-button add-friend-btn" onClick={addFriend}>Add Friend</button>
      </div>
    </div>
  );
}

export default Friends;
