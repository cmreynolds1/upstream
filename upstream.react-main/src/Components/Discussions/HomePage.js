import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { fetchUserAttributes } from 'aws-amplify/auth';

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
        <Container>
            <Row className="mt-5">
                <Col xs={12}>
                    <h2>Forum</h2>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="formPostTitle">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter post title"
                                value={postTitle}
                                onChange={(e) => setPostTitle(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formPostContent">
                            <Form.Label>Content</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Enter post content"
                                value={postContent}
                                onChange={(e) => setPostContent(e.target.value)}
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Submit Post
                        </Button>
                    </Form>
                </Col>
            </Row>
            <Row className="mt-4">
                {posts.map((post, index) => (
                    <Col key={index} xs={12} md={6} lg={4} className="mb-4">
                        <Card>
                            <Card.Body>
                                <Card.Title>{post.Title}</Card.Title>
                                <Card.Text>{post.Content}</Card.Text>
                                <Card.Text>
                                    <strong>Date Created:</strong> {post.DateCreated}
                                </Card.Text>
								<Card.Text>
									<strong>Time Created:</strong> {formatDate(post.TimeCreated.replace(/\.\d+$/, ''))}
								</Card.Text>
                                <Card.Text>
                                    <strong>Created By:</strong> {post.DisplayName}
                                </Card.Text>
                                <Card.Text><strong>User ID:</strong> {post.UserID}</Card.Text>
                                {userID === post.UserID && (
                                    <Button variant="danger" onClick={() => handleDeletePost(post.PostID)}>Delete</Button>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
}

export default ForumPage;
