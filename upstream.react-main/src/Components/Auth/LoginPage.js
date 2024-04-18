import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";

import { Link, useNavigate} from "react-router-dom";
import { useState } from "react";
import { signIn} from "aws-amplify/auth";
import { useAuth } from "./useAuth";

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
        <Container>
            <Row className="px-4 my-5">
                <Col><h1>Login</h1></Col>
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
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={handlePasswordChange} />

                            <Form.Text className='text-muted'>
                                <Link to='/ResetPass'>
                                        Click here to reset your password!
                                </Link>
                            </Form.Text>
                        </Form.Group>


                        <Link
                            to='/'>
                            <Button variant="primary" type="button">Cancel</Button>
                        </Link>
                        &nbsp;&nbsp;

                        &nbsp;&nbsp;
                        <Button variant="primary" type="button"
                            onClick={handleSignIn}>Login</Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    )
}

export default LoginPage