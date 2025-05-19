import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import { 
    FaClock, FaUser, FaUsers, FaBuilding, FaExclamationTriangle,
    FaCalendarAlt, FaCheck, FaChevronDown
} from 'react-icons/fa';

const ProjectTimeline = () => {
    // Timeline events data
    const [events, setEvents] = useState([
        {
            id: 1,
            title: 'Organizer Registration',
            icon: <FaUser className="text-success" />,
            status: 'Completed',
            statusColor: 'success',
            startDate: '11/03/2025',
            endDate: '13/03/2025',
            color: '#e6f7f5',
            iconColor: '#20b2aa',
            position: 'left'
        },
        {
            id: 2,
            title: 'Guide Registration',
            icon: <FaUsers className="text-primary" />,
            status: 'Completed',
            statusColor: 'success',
            startDate: '17/03/2025',
            endDate: '15/03/2025',
            color: '#e9f5ff',
            iconColor: '#4195e1',
            position: 'right'
        },
        {
            id: 3,
            title: 'Assign Pilgrims to Guides',
            icon: <FaUsers className="text-warning" />,
            status: 'Completed',
            statusColor: 'success',
            startDate: '12/03/2025',
            endDate: '31/03/2025',
            color: '#fff9e6',
            iconColor: '#f0ad4e',
            position: 'left'
        },
        {
            id: 4,
            title: 'Hotel Accommodation',
            icon: <FaBuilding className="text-info" />,
            status: 'Completed',
            statusColor: 'success',
            startDate: '31/03/2025',
            endDate: '30/04/2025',
            color: '#f8f0ff',
            iconColor: '#a66bbe',
            position: 'right'
        },
        {
            id: 5,
            title: 'Camp Accommodation',
            icon: <FaExclamationTriangle className="text-danger" />,
            status: 'Upcoming',
            statusColor: 'warning',
            startDate: '30/04/2025',
            endDate: '30/05/2025',
            color: '#ffede6',
            iconColor: '#f5794a',
            position: 'left'
        }
    ]);

    // Countdown timer state
    const [countdown, setCountdown] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        // Fixed target date: May 30, 2025
        const targetDate = new Date('May 30, 2025 00:00:00').getTime();
        
        // Function to calculate and set the remaining time
        const calculateTimeRemaining = () => {
            const now = new Date().getTime();
            const difference = targetDate - now;
            
            if (difference <= 0) {
                // Target date has passed
                setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return false; // Return false to stop the interval
            }
            
            // Calculate days, hours, minutes, seconds precisely
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);
            
            setCountdown({ days, hours, minutes, seconds });
            return true; // Continue the interval
        };
        
        // Calculate immediately when component mounts
        calculateTimeRemaining();
        
        // Update countdown every second
        const timer = setInterval(() => {
            const shouldContinue = calculateTimeRemaining();
            if (!shouldContinue) clearInterval(timer);
        }, 1000);
        
        // Cleanup timer on unmount
        return () => clearInterval(timer);
    }, []);

    // Function to show more details (placeholder for now)
    const handleShowMore = (id) => {
        console.log(`Show more details for event ${id}`);
    };

    return (
        <>
            <div className="text-center mb-4">
                <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light p-3 mb-3">
                    <FaCalendarAlt size={30} style={{ color: '#c5b37b' }} />
                </div>
                <h2 className="fw-bold" style={{ color: '#243b7f' }}>Project Timeline</h2>
                <p className="text-muted">Key milestones and deadlines for the Hajj season</p>
            </div>

            {/* Countdown section */}
            <Card className="border-0 shadow-sm mb-5">
                <Card.Body className="p-4">
                    <h5 className="fw-bold mb-4" style={{ color: '#243b7f' }}>Time Remaining Until Camp Accommodation</h5>
                    
                    <div className="d-flex align-items-center mb-4">
                        <div className="bg-light rounded-circle p-2">
                            <FaClock style={{ color: '#c5b37b' }} />
                        </div>
                        <span className="ms-2 fw-bold" style={{ color: '#243b7f' }}>Time Remaining</span>
                    </div>
                    
                    <Row className="text-center g-3">
                        <Col xs={3}>
                            <Card className="h-100 border-0 bg-light">
                                <Card.Body className="p-3">
                                    <h2 className="display-5 fw-bold" style={{ color: '#c5b37b' }}>{countdown.days.toString().padStart(2, '0')}</h2>
                                    <div className="text-muted small">Days</div>
                                </Card.Body>
                            </Card>
                        </Col>
                        
                        <Col xs={3}>
                            <Card className="h-100 border-0 bg-light">
                                <Card.Body className="p-3">
                                    <h2 className="display-5 fw-bold" style={{ color: '#c5b37b' }}>{countdown.hours.toString().padStart(2, '0')}</h2>
                                    <div className="text-muted small">Hours</div>
                                </Card.Body>
                            </Card>
                        </Col>
                        
                        <Col xs={3}>
                            <Card className="h-100 border-0 bg-light">
                                <Card.Body className="p-3">
                                    <h2 className="display-5 fw-bold" style={{ color: '#c5b37b' }}>{countdown.minutes.toString().padStart(2, '0')}</h2>
                                    <div className="text-muted small">Minutes</div>
                                </Card.Body>
                            </Card>
                        </Col>
                        
                        <Col xs={3}>
                            <Card className="h-100 border-0 bg-light">
                                <Card.Body className="p-3">
                                    <h2 className="display-5 fw-bold" style={{ color: '#c5b37b' }}>{countdown.seconds.toString().padStart(2, '0')}</h2>
                                    <div className="text-muted small">Seconds</div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Timeline section */}
            <div className="position-relative timeline-wrapper mt-5">
                {/* Center line */}
                <div className="timeline-center-line"></div>
                
                {/* Timeline events */}
                {events.map((event, index) => (
                    <div 
                        key={event.id} 
                        className={`timeline-item ${event.position} mb-5`}
                    >
                        <div 
                            className="timeline-content p-4 rounded" 
                            style={{ backgroundColor: event.color }}
                        >
                            <div className="d-flex justify-content-between mb-3">
                                <div className="d-flex align-items-center">
                                    <div 
                                        className="rounded-circle p-2" 
                                        style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}
                                    >
                                        {event.icon}
                                    </div>
                                    <h5 className="fw-bold mb-0 ms-2">{event.title}</h5>
                                </div>
                                <Badge 
                                    bg={event.statusColor} 
                                    className={`px-3 py-2 ${event.status === 'Upcoming' ? 'text-dark' : ''}`}
                                >
                                    {event.status === 'Completed' && <FaCheck className="me-1" size={10} />}
                                    {event.status === 'Upcoming' && <FaExclamationTriangle className="me-1" size={10} />}
                                    {event.status}
                                </Badge>
                            </div>
                            
                            <div className="timeline-dates mb-3">
                                <div className="mb-1">
                                    <FaCalendarAlt className="me-2 text-muted" size={12} />
                                    <small className="text-muted">Start: {event.startDate}</small>
                                </div>
                                <div>
                                    <FaCalendarAlt className="me-2 text-muted" size={12} />
                                    <small className="text-muted">End: {event.endDate}</small>
                                </div>
                            </div>
                            
                            <div 
                                className="show-more text-center cursor-pointer" 
                                onClick={() => handleShowMore(event.id)}
                            >
                                <small className="text-muted">Show More</small>
                                <FaChevronDown className="ms-1 text-muted" size={10} />
                            </div>
                        </div>
                        
                        {/* Timeline dot */}
                        <div 
                            className="timeline-dot" 
                            style={{ backgroundColor: event.iconColor }}
                        ></div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default ProjectTimeline;