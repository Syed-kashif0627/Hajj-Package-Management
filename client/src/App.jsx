import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Logout from './components/Auth/Logout';
import './styles/App.css';

// Import the DashboardLayout component
import DashboardLayout from './layouts/DashboardLayout';

// Import actual components
import Guides from './pages/Guides';
import ProjectTimeline from './pages/ProjectTimeline';
import PilgrimsInformation from './pages/PilgrimsInformation';
import MovementSchedule from './pages/MovementSchedule';
import Hotels from './pages/Hotels';
import LinkPilgrims from './pages/LinkPilgrims';
import PassportVisa from './pages/PassportVisa';
import Settings from './pages/Settings';

// Placeholder components for each dashboard section
// You can replace these as you implement them
const GuideOrganizerContract = () => <h2>Guide/Organizer Contract</h2>;
const OperationList = () => <h2>Operation List</h2>;
const OperatorHelper = () => <h2>Operator Helper</h2>;
const OperatorOverview = () => <h2>Operator Overview</h2>;
const RoomUpgrades = () => <h2>Room Upgrades</h2>;
const Accommodation = () => <h2>Accommodation</h2>;
const AccommodationTasks = () => <h2>Accommodation Tasks</h2>;

const App = () => {
    return (
        <Router>
            <div className="app-container">
                <Switch>
                    {/* Public routes */}
                    <Route path="/" exact component={Home} />
                    <Route path="/login" component={Login} />
                    <Route path="/signup" component={Signup} />
                    <Route path="/logout" component={Logout} />
                    
                    {/* Dashboard routes with shared layout */}
                    <Route path="/dashboard">
                        <DashboardLayout>
                            <Switch>
                                <Route exact path="/dashboard" component={Dashboard} />
                                <Route path="/dashboard/project-timeline" component={ProjectTimeline} />
                                <Route path="/dashboard/guides" component={Guides} />
                                <Route path="/dashboard/guide-organizer-contract" component={GuideOrganizerContract} />
                                <Route path="/dashboard/passport-visa" component={PassportVisa} />
                                <Route path="/dashboard/link-pilgrims" component={LinkPilgrims} />
                                <Route path="/dashboard/operation-list" component={OperationList} />
                                <Route path="/dashboard/pilgrims-information" component={PilgrimsInformation} />
                                <Route path="/dashboard/operator-helper" component={OperatorHelper} />
                                <Route path="/dashboard/operator-overview" component={OperatorOverview} />
                                <Route path="/dashboard/room-upgrades" component={RoomUpgrades} />
                                <Route path="/dashboard/accommodation" component={Accommodation} />
                                <Route path="/dashboard/hotel-visualization" component={Hotels} />
                                <Route path="/dashboard/movement-schedule" component={MovementSchedule} />
                                <Route path="/dashboard/accommodation-tasks" component={AccommodationTasks} />
                                <Route path="/dashboard/settings" component={Settings} />
                            </Switch>
                        </DashboardLayout>
                    </Route>
                    
                    {/* Fallback redirect */}
                    <Redirect to="/" />
                </Switch>
            </div>
        </Router>
    );
};

export default App;