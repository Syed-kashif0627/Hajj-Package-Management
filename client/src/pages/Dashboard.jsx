import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { FaUserFriends, FaHotel, FaBus, FaUserShield, FaSuitcase, FaUser } from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentGuides, setRecentGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

 // Update only the useEffect function

// Update the useEffect function

useEffect(() => {
  const fetchDashboardData = async () => {
    try {
      // Check the actual URL paths in your server code
      // Make sure this matches your routes in server/app.js or server.js
      const summaryResponse = await axios.get('http://localhost:5000/api/dashboard/summary', {
        params: { _t: new Date().getTime() }
      });
      
      // Update this URL to match exactly how you've registered the route in your server
      const guidesResponse = await axios.get('http://localhost:5000/api/guides/recent', {
        params: { limit: 5, _t: new Date().getTime() }
      });
      
      console.log('Dashboard data:', summaryResponse.data);
      console.log('Guides data:', guidesResponse.data);
      
      // Process the data
      const summaryData = summaryResponse.data;
      const guidesData = guidesResponse.data || [];
      
      setStats(summaryData);
      setRecentGuides(guidesData);
      setError(null);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      const errorMsg = err.response?.data?.message || 'Failed to load dashboard data';
      console.error('Error details:', err.message);
      
      // Set dummy data if API fails
      setStats({
        totalPilgrims: 210,
        totalGuides: 5,
        totalHotels: 3,
        upcomingMovements: 2,
        totalPackages: 3
      });
      
      setRecentGuides([
        { 
          _id: '1', 
          name: 'Syed Zaidi', 
          email: 'hszaidi21@gmail.com', 
          createdAt: new Date('2025-04-09') 
        },
        { 
          _id: '2', 
          name: 'Abdelghani Benyahya', 
          email: 'boumaima@hotmail.com', 
          createdAt: new Date('2025-04-08') 
        },
        { 
          _id: '3', 
          name: 'Tanzil Farhan Khan', 
          email: 'Tanzil@sbcglobal.net', 
          createdAt: new Date('2025-04-08') 
        },
        { 
          _id: '4', 
          name: 'Sohaib Sheikh', 
          email: 'sohaibsheikh@gmail.com', 
          createdAt: new Date('2025-04-08') 
        },
        { 
          _id: '5', 
          name: 'Khansa Teli', 
          email: 'kteli@nooral-fajr.com', 
          createdAt: new Date('2025-03-04') 
        }
      ]);
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };
  
  fetchDashboardData();
}, []);

  const displayStats = stats || {
    totalPilgrims: 210,
    totalGuides: 4,
    totalHotels: 3,
    upcomingMovements: 2,
    totalPackages: 3
  };
  
  // Format date as MM/DD/YYYY
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };
  
  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" className="mb-3" style={{ width: '3rem', height: '3rem' }} />
          <h5 className="text-muted">Loading dashboard data...</h5>
        </div>
      </Container>
    );
  }

  if (error && !stats) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Dashboard Error</Alert.Heading>
          <p>{error}</p>
          <hr />
          <p className="mb-0">
            Please check your network connection and try refreshing the page.
          </p>
        </Alert>
      </Container>
    );
  }

  return (
    <div className="dashboard-container">
      <Container fluid className="py-4">
        {error && (
          <Alert variant="warning" dismissible className="mb-3">
            <small>Note: Using demo data - {error}</small>
          </Alert>
        )}
        
        <div className="mb-4">
          <h1 className="dashboard-title">Welcome to the Hajj Dashboard</h1>
          <div className="dashboard-subtitle">Overview of Pilgrims, Guides, Hotels, and Operations</div>
        </div>
        
        {/* Stats Cards */}
        <Row className="mb-4 g-4 stats-row">
          <Col lg={4} md={6} sm={12}>
            <Card className="stat-card border-0 shadow-sm h-100 card-hover-effect">
              <Card.Body className="d-flex align-items-center">
                <div className="stat-icon-container me-3">
                  <FaUserFriends className="stat-icon" />
                </div>
                <div>
                  <h2 className="stat-value">{displayStats.totalPilgrims}</h2>
                  <div className="stat-label">Total Pilgrims</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={4} md={6} sm={12}>
            <Card className="stat-card border-0 shadow-sm h-100 card-hover-effect">
              <Card.Body className="d-flex align-items-center">
                <div className="stat-icon-container me-3" style={{ backgroundColor: 'rgba(0, 196, 159, 0.15)' }}>
                  <FaUserShield className="stat-icon" style={{ color: '#00C49F' }} />
                </div>
                <div>
                  <h2 className="stat-value">{displayStats.totalGuides}</h2>
                  <div className="stat-label">Guides</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={4} md={6} sm={12}>
            <Card className="stat-card border-0 shadow-sm h-100 card-hover-effect">
              <Card.Body className="d-flex align-items-center">
                <div className="stat-icon-container me-3" style={{ backgroundColor: 'rgba(255, 187, 40, 0.15)' }}>
                  <FaHotel className="stat-icon" style={{ color: '#FFBB28' }} />
                </div>
                <div>
                  <h2 className="stat-value">{displayStats.totalHotels}</h2>
                  <div className="stat-label">Hotels</div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6} md={6} sm={12}>
            <Card className="stat-card border-0 shadow-sm h-100 card-hover-effect">
              <Card.Body className="d-flex align-items-center">
                <div className="stat-icon-container me-3" style={{ backgroundColor: 'rgba(255, 128, 66, 0.15)' }}>
                  <FaBus className="stat-icon" style={{ color: '#FF8042' }} />
                </div>
                <div>
                  <h2 className="stat-value">{displayStats.upcomingMovements}</h2>
                  <div className="stat-label">Upcoming Movements</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={6} md={6} sm={12}>
            <Card className="stat-card border-0 shadow-sm h-100 card-hover-effect">
              <Card.Body className="d-flex align-items-center">
                <div className="stat-icon-container me-3" style={{ backgroundColor: 'rgba(231, 76, 60, 0.15)' }}>
                  <FaSuitcase className="stat-icon" style={{ color: '#e74c3c' }} />
                </div>
                <div>
                  <h2 className="stat-value">{displayStats.totalPackages}</h2>
                  <div className="stat-label">Packages</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Recent Guides Section */}
        <Card className="border-0 shadow-sm mt-4">
          <Card.Body className="p-4">
            <h3 className="mb-4">Recent Guides</h3>
            
            {recentGuides.length > 0 ? (
              recentGuides.map((guide, index) => (
                <div 
                  key={guide._id} 
                  className={`d-flex align-items-center py-3 ${
                    index !== recentGuides.length - 1 ? 'border-bottom' : ''
                  }`}
                >
                  <div className="guide-icon-container me-3">
                    <FaUser className="guide-icon" />
                  </div>
                  <div className="flex-grow-1">
                    <h5 className="guide-name mb-0">{guide.name}</h5>
                    <div className="guide-email text-muted">{guide.email}</div>
                  </div>
                  <div className="guide-date">
                    {formatDate(guide.createdAt)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-3">
                <p className="text-muted mb-0">No recent guides found</p>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Hajj Season Card */}
        <Row className="g-4 mt-4">
          <Col xs={12}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-4">
                <h3 className="mb-3" style={{ color: '#243b7f' }}>Al Rajhi Hajj Season 2025</h3>
                <p className="text-muted mb-0">May 24 - June 15, 2025</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Dashboard;