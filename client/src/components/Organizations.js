import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Organizations() {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [selectedOrgId, setSelectedOrgId] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch(`${process.env.backend_url}:5000/api/v1/organization/organizations`, {
            method: 'GET',
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    // Handle successful response
                    console.log('Organization data:', data.data);
                    setData(data.data);

                    // Check if there is a selectedOrgId in localStorage
                    const storedOrgId = localStorage.getItem('selectedOrgId');
                    if (storedOrgId && data.data.some(org => org._id === storedOrgId)) {
                        setSelectedOrgId(storedOrgId);
                        
                    }

                    console.log('Message:', data.msg);
                } else {
                    // Handle unsuccessful response
                    console.error('Error fetching data:', data.msg);
                }
            });
    }, []);

    const handleCreateOrganization = () => {
        // Navigate to the createOrganization page
        navigate('/createorganization');
    };

    const handleOrganizationClick = (orgId) => {
        // Set the selected organization in state and localStorage
        setSelectedOrgId(orgId);
        localStorage.setItem('selectedOrgId', orgId);

        // Navigate to the dashboard page with the organization ID
        navigate('/');
    };

    return (
        <>
            {data.length > 0 ? (
                data.map((org, index) => (
                    <button
                        key={index}
                        onClick={() => handleOrganizationClick(org._id)}
                        style={{ fontWeight: org._id === selectedOrgId ? 'bold' : 'normal' }}
                    >
                        {org.name}
                    </button>
                ))
            ) : (
                <h2>You are not joined with any organizations</h2>
            )}

            <button onClick={handleCreateOrganization}>Create Organization</button>
        </>
    );
}

export default Organizations;
