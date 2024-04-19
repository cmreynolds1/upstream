import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { signIn } from "aws-amplify/auth";
import { useAuth } from "./useAuth";

import './LoginPage.css';

function LoginPage(props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { setIsLoggedIn } = useAuth();

    const handleSignIn = async (e) => {
        e.preventDefault();
        try {
            await signIn({ username: email, password });
            setIsLoggedIn(true);
            navigate('/dashboard');
        } catch (error) {
            console.log('error signing in', error);
            alert(error.message || error.toString());
        }
    };

    const handleEmailChange = (e) => setEmail(e.target.value);
    const handlePasswordChange = (e) => setPassword(e.target.value);

    return (
        <div>
            <div>
                <div>
                    <h1 className="login-title">Login</h1>
                </div>
            </div>
            <div>
                <div className="login-container">
                    <form className="login-form" onSubmit={handleSignIn}>
                        <div>
                            <label htmlFor="formBasicEmail"><strong>Email address</strong></label>
                            <input
                                type="email"
                                className="form-control"
                                id="formBasicEmail"
                                placeholder="Enter email"
                                value={email}
                                onChange={handleEmailChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="formBasicPassword"><strong>Password</strong></label>
                            <input
                                type="password"
                                className="form-control"
                                id="formBasicPassword"
                                placeholder="Password"
                                value={password}
                                onChange={handlePasswordChange}
                            />
                            <small>
                                <Link to='/ResetPass'>Click here to reset your password!</Link>
                            </small>
                        </div>
                        <br>
                        </br>
                        <div className="login-button-container">
                            <button className='login-button' type="button" onClick={() => navigate('/Register')}>
                                Register
                            </button>
                            <button className="login-button" type="submit">
                                Login
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
