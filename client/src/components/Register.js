import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


function Register() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async () => {
        try {
            const response = await fetch(`${process.env.backend_url}:5000/api/v1/user/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    fullName: fullName,
                    password: password,
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Handle successful registration, e.g., redirect to a new page
                console.log('Registration successful:', data.msg);
                navigate('/login')
            } else {
                // Handle unsuccessful registration
                console.error('Registration failed:', data.msg);
            }
        } catch (error) {
            console.error('Error during registration:', error.message);
        }
    };

    return (
        <div>
            <h2>Register</h2>
            <form>
                <label>
                    Email:
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>
                <br />
                <label>
                    Full Name:
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </label>
                <br />
                <label>
                    Password:
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </label>
                <br />
                <button type="button" onClick={handleRegister}>
                    Register
                </button>
            </form>
        </div>
    );
}

export default Register;
