import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { signUp, confirmSignUp } from 'aws-amplify/auth';
import Tooltip_PassReq from "../Tooltips/Tooltip_PassReq";
import Tooltip_SteamID_Alert from "../Tooltips/Tooltip_SteamID_Alert";
import { useAuth } from "./useAuth";

function RegisterPage() {
    const navigate = useNavigate();
	const location = useLocation();
    const [steamId, setSteamId] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const steamIdParam = params.get('steamId');
        if (steamIdParam) {
            setSteamId(steamIdParam);
        }
    }, [location.search]);

    const { setIsLoggedIn } = useAuth();

    async function handleSignUp({ DisplayName, SteamID, password, email }) {
    console.log('Attempting to sign up:', email); // Debugging
    try {
        // Check if SteamID already exists in the database
        const response = await axios.post('http://upstreamreact.com:9013/check_steam_id', { steamId });
        if (response.data.exists) {
            console.log('SteamID already exists in the database');
            return; // Stop sign-up process
        }

        // Proceed with sign-up
        const { userId } = await signUp({
            username: email,
            password,
            options: {
                userAttributes: {
                    'custom:DisplayName': DisplayName,
                    'custom:SteamID': SteamID,
                },
            },
        });

        console.log('Sign up successful, user ID:', userId); // Debugging
        setFormState(prevState => ({ ...prevState, isSignUpComplete: true }));
    } catch (error) {
        console.error('Error signing up:', error);
        return; // Stop execution if there's an error
    }
}

async function handleSignUpConfirmation({ email, confirmationCode }) {
    console.log('Confirming sign up for:', email);
    try {
        // Check if SteamID already exists in the database
        const response = await axios.post('http://upstreamreact.com:9013/check_steam_id', { steamId });
        if (response.data.exists) {
            console.log('SteamID already exists in the database');
            return; // Stop confirmation process
        }

        await confirmSignUp({
            username: email,
            confirmationCode,
        });
        console.log('Sign up confirmation successful');

        // Save SteamID and DisplayName to the database upon sign-up confirmation
        await axios.post('http://upstreamreact.com:9013/sync_steam_id', { steamId, displayName: formState.DisplayName });
        console.log('SteamID and DisplayName saved successfully to the database');

        setIsLoggedIn(true);
        console.log("(Register) User is logged in:", true)
        navigate('/login');
    } catch (error) {
        console.error('Error confirming sign up:', error);
        return; // Stop execution if there's an error
    }
}



    const [formState, setFormState] = useState({
        DisplayName: '',
        email: '',
        password: '',
        confirmPassword: '',
        confirmationCode: '',
        isSignUpComplete: false,
    })

    const setFormValue = (key) => (e) => {
        setFormState({ ...formState, [key]: e.target.value });
    };
	
	// New code - Collin
	const handleSteamLogin = () => {
        window.location.href = 'http://upstreamreact.com:9000/auth/steam'; // Replace with your Node.js authentication script URL
    };
	// Done
	
	
    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            // Continue with the rest of the form submission
            if (!formState.isSignUpComplete) {
                if (formState.password !== formState.confirmPassword) {
                    alert("Passwords don't match!");
                    return;
                }

                await handleSignUp({
                    DisplayName: formState.DisplayName,
                    SteamID: steamId,
                    password: formState.password,
                    email: formState.email
                });

            } else {
                await handleSignUpConfirmation({
                    email: formState.email,
                    confirmationCode: formState.confirmationCode
                });
            }

        } catch (error) {
            console.error('Error saving SteamID to the database:', error);
        }
    };

    return (
        <Container>
            <Row className="px-4 my-5">
                <Col><h1>Register</h1></Col>
            </Row>
            <Row className="px-4 my-5">
                <Col sm={6}>
                    <Form onSubmit={handleSubmit}>

						<a href="http://upstreamreact.com:9000/auth/steam"><img src="https://community.cloudflare.steamstatic.com/public/images/signinthroughsteam/sits_02.png"/></a> {/* New code - Collin*/}

						<Form.Group className="mb-3" controlId="DisplayName">
                            <Form.Label><div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>Display Name</div></Form.Label>
                            <Form.Control type="text" placeholder="Please enter your display name" value={formState.DisplayName} onChange={setFormValue('DisplayName')} required />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="SteamID">
							<Form.Label><div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>SteamID<Tooltip_SteamID_Alert /></div></Form.Label>
							<Form.Control type="text" placeholder="Enter Your SteamID" value={steamId} onChange={setFormValue('SteamID')} required />
							<Form.Text className='text-muted'>
								<a href="https://store.steampowered.com/account/" target="_blank">Please visit this link to obtain your SteamID</a>
							</Form.Text>
						</Form.Group>

                        <Form.Group className="mb-3" controlId="email">
                            <Form.Label>Email Address</Form.Label>
                            <Form.Control type="email" placeholder="Enter Your Email" value={formState.email} onChange={setFormValue('email')} required />
                            <Form.Text className='text-muted'>
                                We'll never share your email!
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formPassword">
                            <Form.Label><div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>Password <Tooltip_PassReq /></div></Form.Label>
                            <Form.Control type="password" minLength="8" placeholder="Enter Password" value={formState.password} onChange={setFormValue('password')} required />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formConfirm">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control type="password" minLength="8" placeholder="Confirm Password" value={formState.confirmPassword} onChange={setFormValue('confirmPassword')} required />
                        </Form.Group>

                        {
                            formState.isSignUpComplete && (
                                <Form.Group className="mb-3" controlId="formConfirmationCode">
                                    <Form.Label>Confirmation Code</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter Confirmation Code"
                                        value={formState.confirmationCode}
                                        onChange={setFormValue('confirmationCode')}
                                    />
                                </Form.Group>
                            )
                        }

                        <Link
                            to='/'>
                            <Button variant="primary" type="button">Cancel</Button>
                        </Link>
                        &nbsp;&nbsp;
                        <Button variant="primary" type="submit">
                            {formState.isSignUpComplete ? 'Confirm' : 'Register'}</Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}

export default RegisterPage;
