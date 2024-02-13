import React, { useState } from 'react';

function AddPeople() {
  const [email, setEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

    const handleAddPeople = async () => {
      
      try {
          const orgId = localStorage.getItem('selectedOrgId');
          const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/v1/organization/addPeople', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email,orgId }),
      });

      if (response.ok) {
        // Successful submission
        setSuccessMessage('Email sent successfully!');
        setErrorMessage('');
        // Reset the email field after successful submission
        setEmail('');
      } else {
        // Handle error response
        setErrorMessage('Error sending email. Please try again.');
        setSuccessMessage('');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
      setSuccessMessage('');
    }
  };

  return (
    <div>
      <label htmlFor="email">Email:</label>
      <input
        type="email"
        id="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleAddPeople}>Add People</button>

      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </div>
  );
}

export default AddPeople;
