const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const twilio = require('twilio');

// ✅ Load environment variables before anything else
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ Twilio client using correct env keys
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// ✅ POST route
app.post('/api/book-appointment', async (req, res) => {
  const {
    patientName,
    patientPhone,
    doctorName,
    doctorPhone,
    appointmentDate,
    appointmentTime
  } = req.body;

  if (
    !patientName ||
    !patientPhone ||
    !doctorName ||
    !doctorPhone ||
    !appointmentDate ||
    !appointmentTime
  ) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const patientMsg = `Hi ${patientName}, your appointment with Dr. ${doctorName} is confirmed for ${appointmentDate} at ${appointmentTime}.`;
  const doctorMsg = `Dr. ${doctorName}, you have a new appointment with ${patientName} on ${appointmentDate} at ${appointmentTime}.`;

  try {
    // Send WhatsApp message to patient
    await client.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `whatsapp:${patientPhone}`,
      body: patientMsg
    });

    // Send WhatsApp message to doctor
    await client.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `whatsapp:${doctorPhone}`,
      body: doctorMsg
    });

    res.status(200).json({
      message: 'Appointment booked and messages sent successfully.'
    });
  } catch (error) {
    console.error('Error sending messages:', error.message);
    res.status(500).json({
      message: 'Failed to send WhatsApp messages',
      error: error.message
    });
  }
});

// ✅ Basic server check route
app.get('/', (req, res) => {
  res.send('Doctor Appointment API is running...');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
