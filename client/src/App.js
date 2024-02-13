import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import io from 'socket.io-client';
import Login from './components/Login';
import Register from './components/Register';
import Organizations from './components/Organizations';
import Dashboard from './components/Dashboard';
import CreateOrganization from './components/CreateOrganization';
import AddPeople from './components/AddPeople';
import OrgJoined from './components/OrgJoined';
import ChatPage from './components/ChatPage';
import CreateGroup from './components/CreateGroup';
import GroupChat from './components/GroupChat';
const socket = io(`${process.env.REACT_APP_BACKEND_URL}:5000`);

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Dashboard socket={socket} />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/organizations" element={<Organizations />} />
                <Route path="/createorganization" element={<CreateOrganization />} />
                <Route path="/addPeople" element={<AddPeople />} />
                <Route path="/orgJoined/:uuid" element={<OrgJoined />} />
                <Route path="/ChatPage" element={< ChatPage socket={socket} />} />
                <Route path="/CreateGroup" element={< CreateGroup />} />
                <Route path="/GroupChat" element={< GroupChat socket={socket} />} />
            </Routes>
        </Router>
    );
}

export default App;
