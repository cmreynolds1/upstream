import React, { useEffect } from 'react';
import { Nav, Navbar, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { signOut, } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { useAuth } from '../Auth/useAuth';

const SiteNav = () => {
    const { isLoggedIn, setIsLoggedIn } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const hubListener = Hub.listen('auth', (data) => {
            switch (data.payload.event) {
                case 'signIn':
                    setIsLoggedIn(true);
                    break;
                case 'signOut':
                    setIsLoggedIn(false);
                    break;
                default:
                    break;
            }
        });

        return () => hubListener();
    }, [setIsLoggedIn]);

    const handleSignOut = async () => {
        try {
            await signOut();
            setIsLoggedIn(false);
            navigate('/home');
        } catch (error) {
            console.error('Error signing out: ', error);
        }
    };

    return (
        <header>
            <Navbar bg="dark" expand="lg" variant="dark">
                <Container>
                    <Navbar.Brand as={Link} to="/">Upstream</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto">
                            <Nav.Link as={Link} to="/">Home</Nav.Link>
                            {isLoggedIn ? (
                                <>
                                    <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                                    <Nav.Link as={Link} to="/lists">Lists</Nav.Link>
                                    <Nav.Link as={Link} to="/forumpage">Forum</Nav.Link>
                                    <Nav.Link as={Link} to="/friends">Friends</Nav.Link>
                                    <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
                                    <Nav.Link onClick={handleSignOut}>Sign Out</Nav.Link>
                                </>
                            ) : (
                                <>
                                    <Nav.Link as={Link} to="/login">Login</Nav.Link>
                                    <Nav.Link as={Link} to="/register">Register</Nav.Link>
                                </>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </header>
    );
};

export default SiteNav;
