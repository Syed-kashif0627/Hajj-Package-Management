import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { FaLock, FaUser, FaEnvelope, FaShieldAlt, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';

const Settings = () => {
  const [user, setUser] = useState({ email: '' });
  const [loading, setLoading] = useState(true);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [updating, setUpdating] = useState(false);
  
  useEffect(() => {
    fetchUserData();
  }, []);
  
  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Fetch the user profile - only retrieve email
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Set only the email from the user data
      setUser({ 
        email: response.data.email,
        lastLogin: response.data.lastLogin || new Date().toISOString()
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setErrorMessage('Failed to load user data: ' + (error.response?.data?.message || error.message));
      setShowError(true);
      setLoading(false);
    }
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };
  
  const validatePasswordForm = () => {
    if (!passwordData.currentPassword) {
      setErrorMessage('Current password is required');
      return false;
    }
    if (!passwordData.newPassword) {
      setErrorMessage('New password is required');
      return false;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage('New passwords do not match');
      return false;
    }
    if (passwordData.newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters');
      return false;
    }
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset alert states
    setShowSuccess(false);
    setShowError(false);
    
    if (!validatePasswordForm()) {
      setShowError(true);
      return;
    }
    
    try {
      setUpdating(true);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Call the actual API endpoint to change password
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/change-password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setShowSuccess(true);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      // Handle different error responses
      setErrorMessage(error.response?.data?.message || 'An error occurred while changing your password');
      setShowError(true);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading user information...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-0">Account Settings</h4>
          <p className="text-muted">Manage your account information and password</p>
        </div>
      </div>
      
      <Row className="g-4">
        <Col lg={5}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-primary bg-gradient text-white">
              <div className="d-flex align-items-center">
                <FaUser className="me-2" size={18} />
                <span className="fw-medium">Account Information</span>
              </div>
            </Card.Header>
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <div className="avatar-circle mx-auto mb-3">
                  <span className="avatar-initials">{user.email ? user.email.charAt(0).toUpperCase() : '?'}</span>
                </div>
                <h5 className="mb-1">Account User</h5>
                <span className="badge bg-primary">User</span>
              </div>
              
              <hr />
              
              <div className="mb-4">
                <h6 className="text-muted mb-2">Email Address</h6>
                <div className="d-flex align-items-center">
                  <div className="icon-box bg-light text-primary me-3">
                    <FaEnvelope />
                  </div>
                  <span className="fw-medium">{user.email}</span>
                </div>
              </div>
              
              <div>
                <h6 className="text-muted mb-2">Last Login</h6>
                <div className="d-flex align-items-center">
                  <div className="icon-box bg-light text-success me-3">
                    <FaCheckCircle />
                  </div>
                  <span>
                    {new Date(user.lastLogin).toLocaleString()}
                  </span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={7}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary bg-gradient text-white">
              <div className="d-flex align-items-center">
                <FaLock className="me-2" size={18} />
                <span className="fw-medium">Change Password</span>
              </div>
            </Card.Header>
            <Card.Body className="p-4">
              {showSuccess && (
                <Alert variant="success" dismissible onClose={() => setShowSuccess(false)}>
                  <div className="d-flex align-items-center">
                    <FaCheckCircle className="me-2" size={18} />
                    <span>Password changed successfully!</span>
                  </div>
                </Alert>
              )}
              
              {showError && (
                <Alert variant="danger" dismissible onClose={() => setShowError(false)}>
                  {errorMessage}
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <div className="d-flex align-items-center mb-3">
                    <FaShieldAlt className="text-muted me-2" />
                    <h6 className="mb-0">Password Security</h6>
                  </div>
                  <p className="text-muted small">
                    Ensure your account is using a long, random password to stay secure.
                    Your password should be at least 8 characters and include a mix of letters,
                    numbers, and symbols.
                  </p>
                </div>
                
                <Form.Group className="mb-3">
                  <Form.Label>Current Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter your current password"
                    disabled={updating}
                  />
                </Form.Group>
                
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>New Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter new password"
                        disabled={updating}
                      />
                      <Form.Text className="text-muted">
                        Minimum 8 characters
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Confirm New Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirm new password"
                        disabled={updating}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <div className="d-flex justify-content-end mt-4">
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={updating}
                    className="d-flex align-items-center"
                  >
                    {updating ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <FaLock className="me-2" />
                        <span>Update Password</span>
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Settings;