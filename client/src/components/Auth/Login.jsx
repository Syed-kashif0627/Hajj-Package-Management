import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import '../../styles/Auth.css';
import Logo from '../Logo';
import { useHistory } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const history = useHistory();

    const handleLogin = async (e) => {
        e.preventDefault();
        
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', {
              email,
              password
            });
            
            // Store token in localStorage
            localStorage.setItem('token', res.data.token);
            
            // Redirect to dashboard
            history.push('/dashboard');
        } catch (err) {
            console.error('Login error:', err);
            setError('Login failed. Please check your credentials.');
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
            <Card className="shadow-lg border-0" style={{ maxWidth: "450px", width: "100%" }}>
                <Card.Body className="p-5">
                    <div className="text-center mb-4">
                        <Logo height="100px"/>
                        <h2 className="fw-bold mt-3" style={{ color: '#243b7f' }}>Welcome Back</h2>
                        <p className="text-muted">Sign in to your account</p>
                    </div>
                    
                    {error && <Alert variant="danger">{error}</Alert>}
                    
                    <Form onSubmit={handleLogin}>
                        <Form.Group className="mb-3">
                            <Form.Label>Email address</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="py-2"
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="py-2"
                            />
                            <div className="d-flex justify-content-end mt-1">
                                <a href="/forgot-password" style={{ color: '#c5b37b', textDecoration: 'none', fontSize: '14px' }}>
                                    Forgot password?
                                </a>
                            </div>
                        </Form.Group>

                        <Button 
                            type="submit" 
                            className="w-100 py-2 mb-3" 
                            style={{ 
                                backgroundColor: '#c5b37b', 
                                borderColor: '#c5b37b',
                                fontSize: '16px'
                            }}
                        >
                            Login
                        </Button>
                        
                        <div className="text-center">
                            <p className="mb-0">
                                Don't have an account? <a href="/signup" style={{ color: '#243b7f', textDecoration: 'none' }}>Sign up</a>
                            </p>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Login;