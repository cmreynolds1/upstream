import React, { useState, useEffect } from 'react';
import './UserProfile.css';
import axios from 'axios'; // Import Axios
import { fetchUserAttributes, updateUserAttribute } from 'aws-amplify/auth';

function ProfilePage() {
  const [userAttributes, setUserAttributes] = useState({});
  const [newDisplayName, setNewDisplayName] = useState('');
  const [profilePictureData, setProfilePictureData] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProfilePicture, setSelectedProfilePicture] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [newFileSelected, setNewFileSelected] = useState(false); // New state variable to track file selection
  const [hasChangesInProfileBio, setHasChangesInProfileBio] = useState(false); // State variable to track changes in profile bio
  const [refreshProfileData, setRefreshProfileData] = useState(false); // State variable to trigger fetching of updated profile data

  useEffect(() => {
    async function getUserAttributes() {
      setIsLoading(true);
      try {
        const attributes = await fetchUserAttributes(); // Fetch user attributes using Amplify function
        setUserAttributes(attributes);
        const steamId = attributes['custom:SteamID'];
        setNewDisplayName(attributes['custom:DisplayName']);
        
        // Fetch user profile details from the database
        const response = await axios.get('http://upstreamreact.com:9008/get_profile_data', { params: { steamId } }); // Adjust the API endpoint as per your backend setup
        const { profilePictureBase64, profileBio } = response.data; // Assuming the response contains profilePictureBase64 and profileBio fields

        // Set user profile details in the state
        setProfilePictureData(profilePictureBase64);
        setProfileBio(profileBio);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    getUserAttributes();
  }, [refreshProfileData]);


  const handleChangeDisplayName = (e) => {
    setNewDisplayName(e.target.value);
    setHasChanges(true);
  };

  const handleChangeProfileBio = (e) => {
    setProfileBio(e.target.value);
    setHasChanges(true);
    setHasChangesInProfileBio(true); // Set changes in profile bio
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    setSelectedProfilePicture(file);
    setNewFileSelected(true); // Set new file selected
    setHasChanges(true);
  };

  const handleSaveAllChanges = async () => {
  try {
    // Save display name
    const output = await updateUserAttribute({
      userAttribute: {
        attributeKey: 'custom:DisplayName',
        value: newDisplayName,
      },
    });

    // Upload profile picture and profile bio if selected
    if (selectedProfilePicture || hasChangesInProfileBio || hasChanges) {
      console.log('Selected Profile Picture:', selectedProfilePicture); // Add this line for logging
      const formData = new FormData();
      if (selectedProfilePicture) {
        formData.append('profilePicture', selectedProfilePicture);
      }
      formData.append('profileBio', profileBio); // Append profile bio
      formData.append('displayName', newDisplayName); // Append display name

      const response = await axios.post(`http://upstreamreact.com:9007/upload_changes/${userAttributes['custom:SteamID']}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Set the updated profile picture data
      setProfilePictureData(response.data.profilePictureBase64 || ''); // Updated to profilePictureBase64
      setSelectedProfilePicture(null); // Reset selected picture
      setNewFileSelected(false); // Reset new file selected
      setHasChangesInProfileBio(false); // Reset changes in profile bio
      setRefreshProfileData(true); // Trigger the useEffect hook to fetch updated profile data
    }

    // Reset all state variables related to changes
    setHasChanges(false);
    setHasChangesInProfileBio(false);
    setNewFileSelected(false);
    setSelectedProfilePicture(null);

  } catch (error) {
    console.error('Error saving all changes:', error);
    setError(error.message || 'An error occurred');
  }
};


  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="profile-page">
      <h1>My Profile</h1>
      <div>
        <p>
          <strong>Username: &ensp;</strong>
          <input
            type="text"
            value={newDisplayName}
            onChange={handleChangeDisplayName}
          />
        </p>
		<p><strong>Email: &ensp;</strong> {userAttributes.email}</p>
        <p><strong>Steam ID: &ensp;</strong> {userAttributes['custom:SteamID']}</p>
        <p><strong>Profile Picture:</strong></p>
        <div className="image-container">
          <img src={profilePictureData ? `data:image/jpeg;base64,${profilePictureData}` : 'placeholder_image_url'} alt="Profile" />
          <input type="file" accept="image/*" onChange={handleProfilePictureChange} />
          {newFileSelected && <p>New file selected, changes will be applied upon saving.</p>} {/* Display message if new file selected */}
        </div>
        <div>
          <p>
            <strong>Bio: &ensp;</strong>
            <textarea
              id="bio-textarea"
              value={profileBio}
              onChange={handleChangeProfileBio}
            />
          </p>
        </div>
        {hasChanges && <button onClick={handleSaveAllChanges}>Save All Changes</button>}
      </div>
    </div>
  );
}

export default ProfilePage;
