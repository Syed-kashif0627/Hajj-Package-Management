import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import '../../styles/Auth.css';
import Logo from '../Logo';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });

    // Validate email format
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Validate password strength
    const validatePassword = (password) => {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const isLongEnough = password.length >= 8;

        return {
            isValid: hasUpperCase && hasLowerCase && hasNumber && isLongEnough,
            message: !isLongEnough 
                ? 'Password must be at least 8 characters long' 
                : (!hasUpperCase || !hasLowerCase || !hasNumber)
                    ? 'Password must include uppercase, lowercase, and numbers'
                    : ''
        };
    };

    // Perform validation when inputs change
    useEffect(() => {
        const newValidationErrors = { email: '', password: '', confirmPassword: '' };
        
        // Email validation
        if (email && !validateEmail(email)) {
            newValidationErrors.email = 'Please enter a valid email address';
        }
        
        // Password validation
        if (password) {
            const passwordCheck = validatePassword(password);
            if (!passwordCheck.isValid) {
                newValidationErrors.password = passwordCheck.message;
            }
        }
        
        // Confirm password validation
        if (confirmPassword && password !== confirmPassword) {
            newValidationErrors.confirmPassword = 'Passwords do not match';
        }
        
        setValidationErrors(newValidationErrors);
    }, [email, password, confirmPassword]);

    const handleSignup = async (e) => {
        e.preventDefault();

        // Check for any validation errors before submission
        if (validationErrors.email || validationErrors.password || validationErrors.confirmPassword) {
            setError('Please fix the form errors before submitting');
            return;
        }

        // Check if passwords match (as a final check)
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const response = await fetch(`https://hajj-package-management.onrender.com/api/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Handle successful signup
                console.log('Signup successful');
                setError('');
                // Redirect to login page
                window.location.href = '/login';
            } else {
                // Show the specific error message from the backend
                setError(data.message || 'Signup failed. Please try again.');
            }
        } catch (error) {
            console.error('Error during signup:', error);
            setError('Server connection error. Please try again later.');
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
            <Card className="shadow-lg border-0" style={{ maxWidth: "450px", width: "100%" }}>
                <Card.Body className="p-5">
                    <div className="text-center mb-4">
                        <Logo height='100px'/>
                        <h2 className="fw-bold mt-3" style={{ color: '#243b7f' }}>Create Account</h2>
                        <p className="text-muted">Join us for a blessed journey</p>
                    </div>
                    
                    {error && <Alert variant="danger">{error}</Alert>}
                    
                    <Form onSubmit={handleSignup} noValidate>
                        <Form.Group className="mb-3">
                            <Form.Label>Email address</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="py-2"
                                isInvalid={validationErrors.email}
                            />
                            <Form.Control.Feedback type="invalid">
                                {validationErrors.email}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="py-2"
                                isInvalid={validationErrors.password}
                            />
                            <Form.Control.Feedback type="invalid">
                                {validationErrors.password}
                            </Form.Control.Feedback>
                            <Form.Text className="text-muted">
                                Must be at least 8 characters with uppercase, lowercase, and numbers
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="py-2"
                                isInvalid={validationErrors.confirmPassword}
                            />
                            <Form.Control.Feedback type="invalid">
                                {validationErrors.confirmPassword}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Button 
                            type="submit" 
                            className="w-100 py-2 mb-3" 
                            style={{ 
                                backgroundColor: '#243b7f', 
                                borderColor: '#243b7f',
                                fontSize: '16px'
                            }}
                        >
                            Sign Up
                        </Button>
                        
                        <div className="text-center">
                            <p className="mb-0">
                                Already have an account? <a href="/login" style={{ color: '#c5b37b', textDecoration: 'none' }}>Login</a>
                            </p>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Signup;