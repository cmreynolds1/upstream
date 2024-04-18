import { Link } from 'react-router-dom';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Button from 'react-bootstrap/Button';

function HomePage() {

    return (
        <Container>
            <Row className="px-4 my-5 align-items-center">
                <Col xs={12} sm={6} className='d-flex justify-content-center'>
                    <Image
                        src="/logo192.png"
                        fluid />
                </Col>
                <Col sm={6}>
                    <h1 className="font-weight-light">Upstream</h1>
                    <p className="mt-4" style={{textIndent: '25px', lineHeight: '2.2'}}>
                        Upstream is an innovative game organizational tool designed to simplify how you manage and sort your video game collection. With its user-friendly interface, Upstream allows gamers to effortlessly organize their games across multiple platforms in one centralized location. Whether you're looking to categorize your games by completion, achivements, or even dropped. Upstream makes it possible with just a few clicks. The best part? Upstream is available to use right now, offering a seamless and hassle-free setup process. Say goodbye to the clutter and hello to a more organized gaming experience with Upstream. Start optimizing your gaming library today and enjoy a more streamlined and enjoyable gaming experience.
                    </p>
                    <Link
                        to={{ pathname: '/Login' }}>
                        <Button variant="outline-primary">Login</Button>
                    </Link>
                    &nbsp;&nbsp;
                    <Link
                        to={{ pathname: '/Register' }}>
                        <Button variant="outline-primary">Register</Button>
                    </Link>
                </Col>
            </Row>

            <Row className="px-4 my-5 align-items-center">
                <Col sm={6}>
                    <p className="mt-4" style={{textIndent: '25px', lineHeight: '2.2'}}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </p>
                </Col>

                <Col xs={12} sm={6} className='d-flex justify-content-center'>
                    <Image
                        src="/logo192.png"
                        fluid />
                </Col>
            </Row>
        </Container>
    )
}

export default HomePage;