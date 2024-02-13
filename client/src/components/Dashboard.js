import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

function Dashboard({ socket }) {
    const navigate = useNavigate();
    const [organizationData, setOrganizationData] = useState({});
    const [membersData, setMembersData] = useState([]);
    const [groupData, setGroupData] = useState([]);
    const [searchData, setSearchData] = useState([]);
    const [userId, setUserId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResultsHeight, setSearchResultsHeight] = useState('auto');
    var orgId = localStorage.getItem('selectedOrgId');
    var token = localStorage.getItem('token');


    useEffect(() => {

        const fetchData = async () => {
            try {
                // Fetch organization data
                const orgResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}:5000/api/v1/organization/getOrg`, {
                    method: 'POST',
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        orgId: orgId,
                    }),
                });

                if (!orgResponse.ok) {
                    navigate('/login');
                    return;
                }

                const orgData = await orgResponse.json();

                if (orgData.success) {
                    setOrganizationData(orgData.data);
                    setUserId(orgData.uid);
                    let memberId = orgData.uid;
                    socket.emit('join', { memberId, page: 'home' });
                } else {
                    navigate('/login');
                    return;
                }

                // Fetch members data
                const membersResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}:5000/api/v1/organization/getHomeMembersAndGroups`, {
                    method: 'POST',
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        orgId: orgId,
                    }),
                });

                if (!membersResponse.ok) {
                    navigate('/login');
                    return;
                }

                const membersData = await membersResponse.json();

                if (membersData.success) {
                    setMembersData(membersData.data);
                } else {
                    navigate('/login');
                    return;
                }

                //fetch messages
                const msgs = await fetch(`${process.env.REACT_APP_BACKEND_URL}:5000/api/v1/organization/getDisconnectMsgs`, {
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!msgs.ok) {
                    // navigate('/login');
                    return;
                }

                const messages = await msgs.json();

                if (messages.success) {
                    console.log("messages", messages.data);
                    var a = membersData.data;
                    var b = messages.data;
                    for (var i of a) {
                        for (var j of b) {
                            if (j.senderId == i._id) {
                                i.count = j.count;
                            }
                        }
                    }
                    setMembersData(a);
                } else {
                    //navigate('/login');
                    // return;
                }

                //fetch groups
                const grps = await fetch(`${process.env.REACT_APP_BACKEND_URL}:5000/api/v1/organization/getYourGroups`, {
                    method: 'POST',
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        orgId: orgId,
                    }),
                });

                if (!grps.ok) {
                    // navigate('/login');
                    return;
                }

                const grpMsgs = await grps.json();

                if (grpMsgs.success) {

                    setGroupData(grpMsgs.data);



                } else {
                    //navigate('/login');
                    // return;
                }

                //get groups count
                // const grpsCount = await fetch(`http://localhost:5000/api/v1/organization/getGrpMsgsCount`, {
                //     method: 'GET',
                //     headers: {
                //         'Content-type': 'application/json; charset=UTF-8',
                //         'Authorization': `Bearer ${token}`
                //     }
                // });

                // if (!grpsCount.ok) {
                //     // navigate('/login');
                //     return;
                // }

                // const grpCount = await grpsCount.json();

                // if (grpCount.success) {
                //     console.log("messagesCount", groupData);
                //     var a = groupData;
                //     var b = grpCount.data;
                //     for (var i of a) {
                //         for (var j of b) {
                //             if (j.groupId == i._id) {
                //                 i.count = j.count;
                //             }
                //         }
                //     }


                //     setGroupData(a);



                // } else {

                // }



            }
            catch (error) {
                console.error('Error fetching data:', error);
                // navigate('/login');
            }
        };

        fetchData();

        // Subscribe to socket event
        const handleNewMessage = (newMessage) => {
            setMembersData(prevData => {
                const updatedMembers = prevData.map(member => {
                    if (member._id === newMessage.senderId) {
                        return { ...member, count: newMessage.count };
                    }
                    return member;
                });
                return updatedMembers;
            });
        };
        socket.on('HomePageMessages', handleNewMessage);

        return () => {
            socket.off('HomePageMessages', handleNewMessage);
            socket.off('grpCount');
            console.log("yes unmount on dashboard");
        };
    }, []);



    socket.on("grpCount", (msgData) => {
        setGroupData(prevData => {
            const updatedMembers = prevData.map(member => {
                if (member._id === msgData.groupId) {
                    return { ...member, count: msgData.count };
                }
                return member;
            });
            return updatedMembers;
        });


    })


    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleMemberClick = (memberId) => {
        navigate('/chatPage', { state: { memberId, userId } });
    };

    const handleGroupClick = (groupId) => {
        navigate('/GroupChat', { state: { groupId, userId } });
    };
    const handleSearch = async (e) => {
        console.log("text", e.target.value);
        setSearchTerm(e.target.value);
        var search = e.target.value;
        if (search) {
            const searchResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}:5000/api/v1/organization/searchOrgMembers`, {
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
        else {
            setSearchData([]);
        }
    }
    async function CreateGroup() {
        navigate('/CreateGroup');
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h2>Organization name: {organizationData.name}</h2>
                <button onClick={CreateGroup}>create group</button>
                <button onClick={handleLogout}>Logout</button>
            </div>
            <input type="text" value={searchTerm} onChange={handleSearch}></input>

            {searchData.length > 0 && (
                <div style={{ border: '1px solid #ccc', padding: '8px', marginTop: '8px', overflow: 'auto' }}>
                    {searchData.map((result, index) => (
                        <h2 key={index} onClick={() => handleMemberClick(result._id)}>
                            {result.fullName}
                        </h2>
                    ))}
                </div>
            )}

            <h2>Members:</h2>
            {membersData && membersData.length > 0 && membersData.map((member, index) => (
                <h2 key={index} onClick={() => handleMemberClick(member._id)}>
                    {member.fullName} {member._id} (count of messages)={member.count > 0 ? member.count : ""}
                </h2>
            ))}

            <h2>Groups:</h2>
            {groupData && groupData.length > 0 && groupData.map((member, index) => (
                <h2 key={index} onClick={() => handleGroupClick(member._id)}>
                    {member.name} {member._id} (count of messages)={member.count > 0 ? member.count : ""}
                </h2>
            ))}
            <Link to="/addPeople">
                <button>Add People</button>
            </Link>
        </div>
    );
}

export default Dashboard;
