import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CreateOrganization() {
    const navigate = useNavigate();
    const [organizationName, setOrganizationName] = useState('');

    const handleOrganizationNameChange = (e) => {
        setOrganizationName(e.target.value);
    };

    const handleCreateOrganization = () => {
        const token = localStorage.getItem('token');

        fetch(`${process.env.backend_url}:5000/api/v1/organization/createOrganization`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                name: organizationName,
            }),
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
                    console.log('Organization created successfully:', data.data);
                    navigate('/');
                    // You can redirect or perform any other actions after successful creation
                } else {
                    // Handle unsuccessful response
                    console.error('Error creating organization:', data.msg);
                }
            });
    };

    return (
        <div>
            <h2>Create Organization</h2>
            <label>
                Organization Name:
                <input type="text" value={organizationName} onChange={handleOrganizationNameChange} />
            </label>
            <button onClick={handleCreateOrganization}>Create</button>
        </div>
    );
}

export default CreateOrganization;
