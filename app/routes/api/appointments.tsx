import { sql } from '@vercel/postgres';

export async function loader() {
  try {
    // Get all appointments for checking availability
    const { rows } = await sql`
      SELECT date, time, appointment_type, location 
      FROM appointments 
      WHERE date >= CURRENT_DATE
      ORDER BY date, time
    `;
    
    return Response.json({ appointments: rows });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return Response.json({ appointments: [], error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

export async function action({ request }: { request: Request }) {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await request.json();
    const {
      appointmentType,
      location,
      date,
      time,
      name,
      age,
      phone,
      email,
      preference,
      observations
    } = body;

    // Validate required fields
    if (!appointmentType || !location || !date || !time || !name || !phone) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert the new appointment
    const { rows } = await sql`
      INSERT INTO appointments (
        appointment_type, location, date, time, name, age, phone, email, preference, observations, created_at
      ) VALUES (
        ${appointmentType}, ${location}, ${date}, ${time}, ${name}, ${age || null}, ${phone}, ${email || null}, ${preference || null}, ${observations || null}, NOW()
      )
      RETURNING id
    `;

    return Response.json({ success: true, appointmentId: rows[0].id });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return Response.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}