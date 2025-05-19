import React, { useState, useEffect } from 'react';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import { Link, useHistory, useLocation } from 'react-router-dom';
import '../pages/Dashboard.css';
import Logo from '../components/Logo';
import { 
    FaHome, FaLuggageCart, FaUser, FaCog, FaSignOutAlt, FaBars, FaChevronLeft, 
    FaCalendarAlt, FaPassport, FaLink, FaClipboardList,
    FaInfoCircle, FaHeadset, FaEye, FaClock, FaBuilding, FaArrowUp, FaTasks
} from 'react-icons/fa';
import axios from 'axios';

const DashboardLayout = ({ children }) => {
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    const [user, setUser] = useState({ email: ""});
    const history = useHistory();
    const location = useLocation();

    // Fetch user data on component mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Get token from localStorage
                const token = localStorage.getItem('token');
                
                if (!token) {
                    console.log('No token found, redirecting to login');
                    history.push('/login');
                    return;
                }
                
                // Fetch the user profile
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                // Set the user data
                setUser({ 
                    email: response.data.email,
                    lastLogin: response.data.lastLogin || new Date().toISOString()
                });
            } catch (error) {
                console.error('Error fetching user data:', error);
                // If there's an error, we might want to redirect to login
                localStorage.removeItem('token');
                history.push('/login');
            }
        };
        
        fetchUserData();
    }, [history]);

    const toggleSidebar = () => {
        setSidebarExpanded(!sidebarExpanded);
    };

    const handleLogout = () => {
        // Add logout logic here
        history.push('/login');
    };

    return (
        <div className="dashboard-wrapper">
            {/* Fixed Top Navbar */}
            <Navbar bg="white" expand="lg" className="border-bottom py-2 fixed-top">
                <Container fluid>
                    <div className="d-flex align-items-center">
                        <Button 
                            variant="light" 
                            className="border-0 me-2 p-1"
                            onClick={toggleSidebar}
                        >
                            {sidebarExpanded ? <FaChevronLeft /> : <FaBars />}
                        </Button>
                        <Navbar.Brand href="#" className="d-flex align-items-center m-0">
                            <span style={{ color: '#243b7f', fontWeight: 'bold' }}>Al Rajhi Hajj</span>
                        </Navbar.Brand>
                    </div>
                    
                    <Navbar.Toggle />
                    <Navbar.Collapse className="justify-content-end">
                        <Nav className="align-items-center">
                            <div className="me-3 d-flex align-items-center">
                                <div className="me-2 d-flex justify-content-center align-items-center bg-light rounded-circle" 
                                     style={{ width: '38px', height: '38px' }}>
                                    <FaUser className="text-primary" />
                                </div>
                                <div className="text-end">
                                    <div className="small text-muted">Account</div>
                                    <div className="fw-medium" style={{ fontSize: '0.9rem' }}>{user.email}</div>
                                </div>
                            </div>
                            <Button 
                                variant="outline-danger" 
                                size="sm" 
                                className="d-flex align-items-center gap-1"
                                onClick={handleLogout}
                            >
                                <FaSignOutAlt /> Logout
                            </Button>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <div className="d-flex main-content">
                {/* Fixed Sidebar with scrollbar */}
                <div className={`sidebar bg-white border-end ${sidebarExpanded ? 'expanded' : 'collapsed'}`}>
                    <div className="sidebar-inner">
                        {sidebarExpanded && (
                            <div className="sidebar-header p-0 text-center border-bottom">
                                <Logo height="80px" />
                            </div>
                        )}
                        <div className="sidebar-menu">
                            <Nav className="flex-column">
                                <Nav.Link 
                                    as={Link} 
                                    to="/dashboard" 
                                    className={`sidebar-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
                                >
                                    <FaHome className="sidebar-icon" />
                                    {sidebarExpanded && <span className="ms-2">Dashboard</span>}
                                </Nav.Link>
                                
                                <Nav.Link 
                                    as={Link} 
                                    to="/dashboard/project-timeline" 
                                    className={`sidebar-link ${location.pathname === '/dashboard/project-timeline' ? 'active' : ''}`}
                                >
                                    <FaCalendarAlt className="sidebar-icon" />
                                    {sidebarExpanded && <span className="ms-2">Project Timeline</span>}
                                </Nav.Link>
                                
                                <Nav.Link 
                                    as={Link} 
                                    to="/dashboard/guides" 
                                    className={`sidebar-link ${location.pathname === '/dashboard/guides' ? 'active' : ''}`}
                                >
                                    <FaUser className="sidebar-icon" />
                                    {sidebarExpanded && <span className="ms-2">Guides</span>}
                                </Nav.Link>
                                
                                {/* <Nav.Link 
                                    as={Link} 
                                    to="/dashboard/guide-organizer-contract" 
                                    className={`sidebar-link ${location.pathname === '/dashboard/guide-organizer-contract' ? 'active' : ''}`}
                                >
                                    <FaClipboardList className="sidebar-icon" />
                                    {sidebarExpanded && <span className="ms-2">Guide/Organizer Contract</span>}
                                </Nav.Link> */}
                                
                                <div className="sidebar-divider mt-2 mb-2"></div>
                                <div className="sidebar-heading px-3 py-2 text-muted">
                                    {sidebarExpanded && <small>DATA MANAGEMENT</small>}
                                </div>
                                
                                <Nav.Link 
                                    as={Link} 
                                    to="/dashboard/passport-visa" 
                                    className={`sidebar-link ${location.pathname === '/dashboard/passport-visa' ? 'active' : ''}`}
                                >
                                    <FaPassport className="sidebar-icon" />
                                    {sidebarExpanded && <span className="ms-2">Passport & Visa</span>}
                                </Nav.Link>
                                
                                <Nav.Link 
                                    as={Link} 
                                    to="/dashboard/link-pilgrims" 
                                    className={`sidebar-link ${location.pathname === '/dashboard/link-pilgrims' ? 'active' : ''}`}
                                >
                                    <FaLink className="sidebar-icon" />
                                    {sidebarExpanded && <span className="ms-2">Link Pilgrims</span>}
                                </Nav.Link>
                                
                                {/* <Nav.Link 
                                    as={Link} 
                                    to="/dashboard/operation-list" 
                                    className={`sidebar-link ${location.pathname === '/dashboard/operation-list' ? 'active' : ''}`}
                                >
                                    <FaClipboardList className="sidebar-icon" />
                                    {sidebarExpanded && <span className="ms-2">Operation List</span>}
                                </Nav.Link> */}
                                
                                <Nav.Link 
                                    as={Link} 
                                    to="/dashboard/pilgrims-information" 
                                    className={`sidebar-link ${location.pathname === '/dashboard/pilgrims-information' ? 'active' : ''}`}
                                >
                                    <FaInfoCircle className="sidebar-icon" />
                                    {sidebarExpanded && <span className="ms-2">Pilgrims Informations</span>}
                                </Nav.Link>
                                
                                {/* <Nav.Link 
                                    as={Link} 
                                    to="/dashboard/operator-helper" 
                                    className={`sidebar-link ${location.pathname === '/dashboard/operator-helper' ? 'active' : ''}`}
                                >
                                    <FaHeadset className="sidebar-icon" />
                                    {sidebarExpanded && <span className="ms-2">Operator Helper</span>}
                                </Nav.Link> */}
                                
                                {/* <Nav.Link 
                                    as={Link} 
                                    to="/dashboard/operator-overview" 
                                    className={`sidebar-link ${location.pathname === '/dashboard/operator-overview' ? 'active' : ''}`}
                                >
                                    <FaEye className="sidebar-icon" />
                                    {sidebarExpanded && <span className="ms-2">Operator Overview</span>}
                                </Nav.Link> */}
                                
                                {/* <Nav.Link 
                                    as={Link} 
                                    to="/dashboard/room-upgrades" 
                                    className={`sidebar-link ${location.pathname === '/dashboard/room-upgrades' ? 'active' : ''}`}
                                >
                                    <FaArrowUp className="sidebar-icon" />
                                    {sidebarExpanded && <span className="ms-2">Room Upgrades</span>}
                                </Nav.Link> */}
                                
                                {/* <Nav.Link 
                                    as={Link} 
                                    to="/dashboard/accommodation" 
                                    className={`sidebar-link ${location.pathname === '/dashboard/accommodation' ? 'active' : ''}`}
                                >
                                    <FaBuilding className="sidebar-icon" />
                                    {sidebarExpanded && <span className="ms-2">Accommodation</span>}
                                </Nav.Link> */}
                                
                                <Nav.Link 
                                    as={Link} 
                                    to="/dashboard/hotel-visualization" 
                                    className={`sidebar-link ${location.pathname === '/dashboard/hotel-visualization' ? 'active' : ''}`}
                                >
                                    <FaEye className="sidebar-icon" />
                                    {sidebarExpanded && <span className="ms-2">Hotel Visualization</span>}
                                </Nav.Link>
                                
                                <Nav.Link 
                                    as={Link} 
                                    to="/dashboard/movement-schedule" 
                                    className={`sidebar-link ${location.pathname === '/dashboard/movement-schedule' ? 'active' : ''}`}
                                >
                                    <FaClock className="sidebar-icon" />
                                    {sidebarExpanded && <span className="ms-2">Movement Schedule</span>}
                                </Nav.Link>
                                
                                {/* <Nav.Link 
                                    as={Link} 
                                    to="/dashboard/accommodation-tasks" 
                                    className={`sidebar-link ${location.pathname === '/dashboard/accommodation-tasks' ? 'active' : ''}`}
                                >
                                    <FaTasks className="sidebar-icon" />
                                    {sidebarExpanded && <span className="ms-2">Accommodation Tasks</span>}
                                </Nav.Link> */}
                                
                                <div className="sidebar-divider mt-2 mb-2"></div>
                                <div className="sidebar-heading px-3 py-2 text-muted">
                                    {sidebarExpanded && <small>SETTINGS</small>}
                                </div>
                                
                                <Nav.Link 
                                    as={Link} 
                                    to="/dashboard/settings" 
                                    className={`sidebar-link ${location.pathname === '/dashboard/settings' ? 'active' : ''}`}
                                >
                                    <FaCog className="sidebar-icon" />
                                    {sidebarExpanded && <span className="ms-2">Settings</span>}
                                </Nav.Link>
                            </Nav>
                        </div>
                    </div>
                </div>

                {/* Main Content Area - This is where the page-specific content will render */}
                <div className="content-wrapper bg-light">
                    <Container fluid className="py-4 content-container">
                        {children}
                    </Container>
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;