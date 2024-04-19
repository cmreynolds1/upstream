import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resetPassword, confirmResetPassword } from "aws-amplify/auth";
import { Link } from "react-router-dom";
import Tooltip_PassReq from "../Tooltips/Tooltip_PassReq";
import './ResetPass.css';

function ResetPass() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleEmailChange = (e) => setEmail(e.target.value);
    const handleResetCodeChange = (e) => setResetCode(e.target.value);
    const handleNewPasswordChange = (e) => setNewPassword(e.target.value);
    const handleConfirmPasswordChange = (e) => setConfirmPassword(e.target.value);

    const handleSendCode = async () => {
        if (!email) {
            alert('Please enter your email address');
            return;
        }
        try {
            const { CodeDeliveryDetails } = await resetPassword({ username: email });
            console.log(CodeDeliveryDetails);
        } catch (error) {
            console.log('error sending code:', error);
        }
    };

    const handleResetPassword = async () => {
        if (!resetCode.trim()) {
            console.log('Please enter the confirmation code.');
            return;
        }
        if (newPassword !== confirmPassword) {
            console.log('Passwords do not match.');
            return;
        }
        try {
            await confirmResetPassword({ username: email, confirmationCode: resetCode, newPassword, });
            console.log('Password reset successfully!');
            alert('Password reset successfully!');
            navigate('/login');
        } catch (error) {
            console.log('error resetting password:', error);
        }
    };

    return (
        <div className="reset-container">
            <div className="reset-header">
                <h1>Reset Password</h1>
            </div>
            <div className="reset-form-container">
                <form className="reset-form">
                    {/* Email input */}
                    <div className="email-container">
                        <label>
                            Email address
                            <input
                                className="email-input"
                                type="email"
                                placeholder="Enter email"
                                value={email}
                                onChange={handleEmailChange}
                            />
                        </label>
                        <button type="button" onClick={handleSendCode} className="send-code-button">
                            Receive Code
                        </button>
                    </div>
                    {/* Confirmation Code input */}
                    <label>
                        Confirmation Code
                        <input
                            type="text"
                            placeholder="Enter confirmation code"
                            value={resetCode}
                            onChange={handleResetCodeChange}
                        />
                    </label>
                    {/* New Password input */}
                    <label>
                        New Password <Tooltip_PassReq />
                        <input
                            type="password"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={handleNewPasswordChange}
                        />
                    </label>
                    {/* Confirm New Password input */}
                    <label>
                        Confirm New Password
                        <input
                            type="password"
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                        />
                    </label>
                    {/* Action Buttons */}
                    <div className="reset-action-buttons">
                        <Link to="/">
                            <button type="button">Cancel</button>
                        </Link>
                        <button type="button" onClick={handleResetPassword}>
                            Submit New Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ResetPass;
