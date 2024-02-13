import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function OrgJoined() {
    const navigate = useNavigate();
    var { uuid } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            try {
                await fetch('http://localhost:5000/api/v1/organization/orgJoined', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ uuid }),
                }).then(response => {
                    if (!response.ok) {
                        
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        console.log("data", data.data);
                        let orgId = data.data;
                        localStorage.setItem('selectedOrgId', orgId);
                        navigate('/');
                       
                    } else {
                        console.error('Error fetching data:', data.msg);
                    }
                });
            } catch (error) {
                console.error('Error while making fetch request:', error);
            }
        };

        fetchData();
    }, [uuid]);

    return (
        // Your component JSX here
        <div>
            {/* Render your component content here */}
        </div>
    );
}

export default OrgJoined;
