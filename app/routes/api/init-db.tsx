import { sql } from '@vercel/postgres';

export async function action({ request }: { request: Request }) {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    // Create the appointments table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        appointment_type VARCHAR(100) NOT NULL,
        location VARCHAR(100) NOT NULL,
        date DATE NOT NULL,
        time TIME NOT NULL,
        name VARCHAR(255) NOT NULL,
        age INTEGER,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(255),
        preference VARCHAR(50),
        observations TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(date, time, location) -- Prevent double booking
      )
    `;

    return Response.json({ success: true, message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Error initializing database:', error);
    return Response.json({ error: 'Failed to initialize database' }, { status: 500 });
  }
}