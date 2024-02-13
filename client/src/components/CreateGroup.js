import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CreateGroup() {
    const navigate = useNavigate();
    // State variables for members, group name, and success message
    const [members, setMembers] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [searchData, setSearchData] = useState([]);
    const [searchResultsHeight, setSearchResultsHeight] = useState('auto');
    const [successMessage, setSuccessMessage] = useState('');
    var orgId = localStorage.getItem('selectedOrgId');
    var token = localStorage.getItem('token');
    useEffect(() => {
        const fetchData = async () => {
            var search;
            const searchResponse = await fetch(`http://localhost:5000/api/v1/organization/searchOrgMembers`, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    orgId: orgId,
                    search: search
                }),
            });

            if (!searchResponse.ok) {
                console.log("error");
            }

            const searchData = await searchResponse.json();

            if (searchData.success) {
                console.log("searchData", searchData);
                setSearchData(searchData.data);
                setSearchResultsHeight(`${searchData.data.length * 50}px`); // Adjust the multiplication factor as needed
            } else {
                console.log("error");
            }
        }

        fetchData();

    }, []);

    // Function to handle adding members
    const handleAddMember = (name, value) => {
        console.log("add member clicked");
        // e.preventDefault();

        if (value !== '' && !members.includes(value)) {
            setMembers([...members, { name, value }]);
            //e.target.reset();
        }

    };

    // Function to handle deleting members
    const handleDeleteMember = (index) => {
        console.log("members", members);

        const updatedMembers = [...members];
        updatedMembers.splice(index, 1);
        setMembers(updatedMembers);
    };

    // Function to handle group name input
    const handleGroupNameChange = (e) => {
        setGroupName(e.target.value);
    };

    // Function to handle group creation
    const handleCreateGroup = async () => {
        if (groupName !== '' && members.length > 0) {

            console.log("Creating Group: ", groupName, "with Members: ", members);
            var mem = [];
            for (let i of members) {
                mem.push(i.value);
            }
            const groupData = {
                groupName,
                mem,
                orgId
            };
            const membersResponse = await fetch(`http://localhost:5000/api/v1/organization/CreateGroup`, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(groupData),
            });

            if (!membersResponse.ok) {
                throw new Error('Failed to create group');
            }

            const membersData = await membersResponse.json();

            if (membersData.success) {
                console.log("group created successfully");
                //navigate('/');

            } else {
                console.log("err");
            }


        }
    };

    async function handleSearch(e) {
        console.log("text", e.target.value);

        var search = e.target.value;

        const searchResponse = await fetch(`http://localhost:5000/api/v1/organization/searchOrgMembers`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                orgId: orgId,
                search: search
            }),
        });

        if (!searchResponse.ok) {
            console.log("error");
        }

        const searchData = await searchResponse.json();

        if (searchData.success) {
            console.log("searchData", searchData);
            setSearchData(searchData.data);
            setSearchResultsHeight(`${searchData.data.length * 50}px`); // Adjust the multiplication factor as needed
        } else {
            console.log("error");
        }


    }

    return (
        <div>
            <h2>Create Group</h2>

            <label htmlFor="member">Choose member:</label>
            <input type="text" id="member" name="member" onChange={handleSearch} />
            {searchData.length > 0 && (
                <div style={{ border: '1px solid #ccc', padding: '8px', marginTop: '8px', overflow: 'auto' }}>
                    {searchData.map((result, index) => (
                        <h2 key={index} onClick={() => handleAddMember(result.fullName, result._id)}>
                            {result.fullName}
                        </h2>
                    ))}
                </div>
            )}

            <ul>
                {members.map((member, index) => (
                    <li key={index}>
                        {member.name}
                        <button onClick={() => handleDeleteMember(index)}>Delete</button>
                    </li>
                ))}
            </ul>
            <label htmlFor="groupName">Group Name:</label>
            <input
                type="text"
                id="groupName"
                name="groupName"
                value={groupName}
                onChange={handleGroupNameChange}
            />
            <button onClick={handleCreateGroup}>Create Group</button>
            {successMessage && <p>{successMessage}</p>}
        </div>
    );
}

export default CreateGroup;
