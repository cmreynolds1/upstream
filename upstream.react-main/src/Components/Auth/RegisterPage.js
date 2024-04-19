import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from 'axios';
import { signUp, confirmSignUp } from 'aws-amplify/auth';
import Tooltip_PassReq from "../Tooltips/Tooltip_PassReq";
import Tooltip_SteamID_Alert from "../Tooltips/Tooltip_SteamID_Alert";
import { useAuth } from "./useAuth";

import './RegisterPage.css';

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
        <div>
            <div>
                <div>
                    <h1 className="register-title">Register</h1>
                </div>
            </div>
            <div>
                <div className="register-container">
                    <form className="register-form" onSubmit={handleSubmit}>
                        {/* Display Name input */}
                        <label>
                            <strong>Display Name</strong>
                            <input
                                type="text"
                                placeholder="Please enter your display name"
                                value={formState.DisplayName}
                                onChange={setFormValue('DisplayName')}
                                required
                            />
                        </label>
                        <div className="steamid-field-container">
                            {/* SteamID input */}
                            <label>
                                <strong>SteamID</strong>
                                <Tooltip_SteamID_Alert />
                                <input
                                    className="steamid-input"
                                    type="text"
                                    placeholder="Enter Your SteamID"
                                    value={steamId}
                                    onChange={setFormValue('SteamID')}
                                    required
                                />
                            </label>
                            {/* Steam login image link */}
                            <a href="http://upstreamreact.com:9000/auth/steam" className="steam-signin">
                                <img src="https://community.cloudflare.steamstatic.com/public/images/signinthroughsteam/sits_02.png" className="steam-signin-img" alt="Sign in through Steam" />
                            </a>
                        </div>
                        {/* Email input */}
                        <label>
                            <strong>Email Address</strong>
                            <input
                                type="email"
                                placeholder="Enter Your Email"
                                value={formState.email}
                                onChange={setFormValue('email')}
                                required
                            />
                        </label>
                        {/* Password input */}
                        <label>
                            <strong>Password</strong>
                            <Tooltip_PassReq />
                            <input
                                type="password"
                                minLength="8"
                                placeholder="Enter Password"
                                value={formState.password}
                                onChange={setFormValue('password')}
                                required
                            />
                        </label>
                        {/* Confirm Password input */}
                        <label>
                            <strong>Confirm Password</strong>
                            <input
                                type="password"
                                minLength="8"
                                placeholder="Confirm Password"
                                value={formState.confirmPassword}
                                onChange={setFormValue('confirmPassword')}
                                required
                            />
                        </label>
                        {/* Confirmation Code input */}
                        {formState.isSignUpComplete && (
                            <label>
                                <strong>Confirmation Code</strong>
                                <input
                                    type="text"
                                    placeholder="Enter Confirmation Code"
                                    value={formState.confirmationCode}
                                    onChange={setFormValue('confirmationCode')}
                                />
                            </label>
                        )}
                        {/* Buttons */}
                        <button type="submit">
                            {formState.isSignUpComplete ? 'Confirm' : 'Register'}
                        </button>
                        <button type="button" onClick={() => navigate('/Login')}>
                            Login
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;
