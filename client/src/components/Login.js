import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}:5000/api/v1/user/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Handle successful login, e.g., set user authentication state
                console.log('Login successful:', data.msg);
                localStorage.setItem('token', data.token);
                navigate('/organizations')
            } else {
                // Handle unsuccessful login
                console.error('Login failed:', data.msg);
            }
        } catch (error) {
            console.error('Error during login:', error.message);
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form>
                <label>
                    Email:
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>
                <br />
                <label>
                    Password:
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </label>
                <br />
                <button type="button" onClick={handleLogin}>
                    Login
                </button>
            </form>
            <p>Don't have an account? <Link to="/register">Register</Link></p>
        </div>
    );
}

export default Login;
