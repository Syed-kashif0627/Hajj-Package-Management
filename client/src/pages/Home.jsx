import React from 'react';
import { Container, Row, Col, Button, Card, Navbar, Nav } from 'react-bootstrap';
import '../styles/Home.css';
import Logo from '../components/Logo';
import { Link } from 'react-router-dom';
import Mina from '../components/Mina'
const Home = () => {
    return (
        <>
            {/* Navigation Bar */}
            <Navbar expand="lg" className="py-3" style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <Container>
                    <Navbar.Brand href="/" className="d-flex align-items-center">
                        <div className="d-flex align-items-center">
                            {/* Adjust the logo container to ensure vertical centering */}
                            <div style={{ display: 'flex', alignItems: 'center', height: '55px',marginTop: '25px' }}>
                              <Logo height='70px'/>
                            </div>
                            <span className="ms-3 fw-bold" style={{ 
                                color: '#243b7f',
                                fontSize: '1.25rem', 
                                // Remove marginTop to let natural alignment work
                            }}>
                                Integrated Hajj Management System
                            </span>
                        </div>
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                        <Nav>
                            <Link to="/login">
                                <Button 
                                    className="me-2" 
                                    variant="outline-primary" 
                                    style={{ borderColor: '#243b7f', color: '#243b7f' }}
                                >
                                    Login
                                </Button>
                            </Link>
                            <Link to="/signup">
                                <Button 
                                    style={{ backgroundColor: '#c5b37b', borderColor: '#c5b37b' }}
                                >
                                    Sign Up
                                </Button>
                            </Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* Hero Section */}
            <div className="py-5" style={{ backgroundColor: '#f8f9fa' }}>
                <Container className="py-5">
                    <Row className="align-items-center">
                        <Col lg={6} className="mb-4 mb-lg-0">
                            <h1 className="display-4 fw-bold mb-4" style={{ color: '#243b7f' }}>
                                Begin Your Sacred Journey with Us
                            </h1>
                            <p className="lead mb-4" style={{ color: '#555' }}>
                              We offer comprehensive Hajj packages designed to provide a spiritually fulfilling and comfortable pilgrimage experience.
                            </p>
                            
                        </Col>
                        <Col lg={6}>
                            <Mina height='400px' width='9000px'/>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Features Section */}
            <Container className="py-5">
                <h2 className="text-center mb-5 fw-bold" style={{ color: '#243b7f' }}>Our Premium Services</h2>
                <Row>
                    <Col md={4} className="mb-4">
                        <Card className="h-100 border-0 shadow-sm">
                            <Card.Body className="p-4">
                                <div className="text-center mb-3">
                                    <i className="fa fa-map-marked-alt" style={{ fontSize: '3rem', color: '#c5b37b' }}></i>
                                </div>
                                <Card.Title className="text-center mb-3 fw-bold" style={{ color: '#243b7f' }}>
                                    Movement Schedule
                                </Card.Title>
                                <Card.Text className="text-center text-muted">
                                    Detailed itineraries outlining daily activities, transportation timings, and scheduled visits to holy sites, ensuring a smooth and well-organized pilgrimage.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4} className="mb-4">
                        <Card className="h-100 border-0 shadow-sm">
                            <Card.Body className="p-4">
                                <div className="text-center mb-3">
                                    <i className="fa fa-money-bill-wave" style={{ fontSize: '3rem', color: '#c5b37b' }}></i>
                                </div>
                                <Card.Title className="text-center mb-3 fw-bold" style={{ color: '#243b7f' }}>
                                    Pilgrims Information Database
                                </Card.Title>
                                <Card.Text className="text-center text-muted">
                                    Secure and comprehensive system to manage pilgrim details, emergency contacts, medical information, and preferences, facilitating personalized support and safety.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4} className="mb-4">
                        <Card className="h-100 border-0 shadow-sm">
                            <Card.Body className="p-4">
                                <div className="text-center mb-3">
                                    <i className="fa fa-headset" style={{ fontSize: '3rem', color: '#c5b37b' }}></i>
                                </div>
                                <Card.Title className="text-center mb-3 fw-bold" style={{ color: '#243b7f' }}>
                                    Hotels and Accommodation
                                </Card.Title>
                                <Card.Text className="text-center text-muted">
                                    Carefully selected range of comfortable and conveniently located hotels catering to various needs and budgets, ensuring a restful stay throughout the pilgrimage.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
                
            {/* Footer */}
            <footer className="py-4 mt-5" style={{ backgroundColor: '#243b7f', color: 'white' }}>
                <Container className="text-center">
                    <p className="mb-0">&copy; 2025 Hajj Management Services. All rights reserved.</p>
                </Container>
            </footer>
        </>
    );
};

export default Home;