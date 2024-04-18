import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { resetPassword, confirmResetPassword } from "aws-amplify/auth";
import { Link } from "react-router-dom";
import Tooltip_PassReq from "../Tooltips/Tooltip_PassReq";

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
        <Container>
            <Row className="px-4 my-5">
                <Col><h1>Reset Password</h1></Col>
            </Row>
            <Row className="px-4 my-5">
                <Col sm={6}>
                    <Form>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Email address</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Enter email"
                                value={email}
                                onChange={handleEmailChange}
                            />
                            <Form.Text className='text-muted'>
                                <Button variant="link" onClick={handleSendCode} style={{ padding: 0, fontSize: 12.5 }}>
                                     Click to recieve confirmation code
                                </Button>
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicConfirmationCode">
                            <Form.Label>Confirmation Code</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter confirmation code"
                                value={resetCode}
                                onChange={(handleResetCodeChange)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicNewPassword">
                            <Form.Label>New Password<Tooltip_PassReq/></Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={handleNewPasswordChange} />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicConfirmPassword">
                            <Form.Label>Confirm New Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={handleConfirmPasswordChange} />
                        </Form.Group>
                        <Link to='/'>
                            <Button variant="primary" type="button">Cancel</Button>
                        </Link>
                        &nbsp;&nbsp;
                        <Button variant="primary" type="button" onClick={handleResetPassword}>
                            Submit New Password
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}

export default ResetPass;
