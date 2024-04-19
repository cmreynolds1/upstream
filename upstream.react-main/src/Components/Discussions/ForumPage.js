import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { fetchUserAttributes } from 'aws-amplify/auth';
import './ForumPage.css';

function ForumPage() {
    const [posts, setPosts] = useState([]);
    const [postTitle, setPostTitle] = useState('');
    const [postContent, setPostContent] = useState('');
    const [userID, setUserID] = useState(null); // Initialize userID state
	const [userDisplayName, setUserDisplayName] = useState(null); // Initialize userDisplayName state
	
	const formatDate = (timeString) => {
		// Parse the time string
		const date = new Date(`2000-01-01T${timeString}`);
		
		// Extract hours and minutes
		let hours = date.getHours();
		const minutes = date.getMinutes();
		
		// Determine AM/PM
		const ampm = hours >= 12 ? 'PM' : 'AM';
		
		// Convert 24-hour format to 12-hour format
		hours = hours % 12;
		hours = hours ? hours : 12; // Handle midnight
		
		// Add leading zero for single-digit minutes
		const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
		
		// Construct the formatted time string
		const formattedTime = `${hours}:${formattedMinutes} ${ampm}`;
		
		return formattedTime;
	};

    useEffect(() => {
        fetchUserAndPosts();
    }, []);

    const fetchUserAndPosts = async () => {
        try {
            const attributes = await fetchUserAttributes();
            setUserID(attributes['custom:SteamID']); // Set the userID state
			setUserDisplayName(attributes['custom:DisplayName']); // Set the userDisplayName state
            fetchPosts();
        } catch (error) {
            console.error('Error fetching user attributes:', error);
        }
    };

    const fetchPosts = async () => {
        try {
            const response = await axios.get('http://upstreamreact.com:9004/get_posts');
            setPosts(response.data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const currentDate = new Date().toISOString().slice(0, 10);
            const currentTime = new Date().toLocaleTimeString();

            const postData = {
                title: postTitle,
                content: postContent,
                userID: userID,
				userDisplayName: userDisplayName,
                dateCreated: currentDate,
                timeCreated: currentTime
            };

            const response = await axios.post('http://upstreamreact.com:9005/submit_posts', postData);
            fetchPosts();
            setPostTitle('');
            setPostContent('');
        } catch (error) {
            console.error('Error submitting post:', error);
        }
    };

    const handleDeletePost = async (postId) => {
        try {
            const response = await axios.delete(`http://upstreamreact.com:9006/delete_post/${postId}/${userID}`);

            if (response.status === 200) {
                fetchPosts();
            } else {
                console.error('Error deleting post:', response.statusText);
            }
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    return (
        <div className="forum-container">
            <div className="forum-header">
                <h2>Forum</h2>
            </div>
            <div className="forum-form-container">
                <form onSubmit={handleSubmit} className="forum-form">
                    <div className="form-group">
                        <label htmlFor="formPostTitle">Title</label>
                        <input
                            type="text"
                            className="form-control"
                            id="formPostTitle"
                            placeholder="Enter post title"
                            value={postTitle}
                            onChange={(e) => setPostTitle(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="formPostContent">Content</label>
                        <textarea
                            className="form-control"
                            id="formPostContent"
                            rows="3"
                            placeholder="Enter post content"
                            value={postContent}
                            onChange={(e) => setPostContent(e.target.value)}
                        ></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary">
                        Submit Post
                    </button>
                </form>
            </div>
            <div className="forum-posts">
                {posts.map((post, index) => (
                    <div key={index} className="post-card">
                        <div className="card-body">
                            <h5 className="card-title">{post.Title}</h5>
                            <p className="card-text">{post.Content}</p>
                            <p className="card-info"><strong>Date Created:</strong> {post.DateCreated}</p>
                            <p className="card-info"><strong>Time Created:</strong> {formatDate(post.TimeCreated.replace(/\.\d+$/, ''))}</p>
                            <p className="card-info"><strong>Created By:</strong> {post.DisplayName}</p>
                            <p className="card-info"><strong>User ID:</strong> {post.UserID}</p>
                            {userID === post.UserID && (
                                <button className="btn btn-danger" onClick={() => handleDeletePost(post.PostID)}>Delete</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ForumPage;
