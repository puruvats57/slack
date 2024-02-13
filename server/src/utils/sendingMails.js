const nodemailer = require('nodemailer');
exports.sendMail = (email, orgId,uuid) => {
    
    
  
    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail', // e.g., 'gmail', 'hotmail', etc.
      auth: {
        user: 'prateekvats963@gmail.com',
        pass: 'hixwjkmxxykbrnwt',
      },
    });
  
    const dynamicURL = `http://localhost:3000/orgJoined/${uuid}`;
    // Create an HTML email template with a button
    const emailBody = `
    <html>
      <body>
        <p>Click the button below to join organization:</p>
        <a href="${dynamicURL}">
          <button style="padding: 10px 20px; background-color: #008CBA; color: #fff; border: none; cursor: pointer;">Join Now</button>
        </a>
      </body>
    </html>
  `;
  
    // Define the email options
    const mailOptions = {
      from: 'prateekvats963@gmail.com',
      to: email,
      subject: 'Join org',
      html: emailBody,
    };
  
    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        //console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send email' });
  
      } else {
        //console.log('Email sent:', info.response);
        //res.status(200).json({ message: 'Email sent successfully' });
      }
    });
  }