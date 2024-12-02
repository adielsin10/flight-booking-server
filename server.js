const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const app = express();
const PORT = 5000;

// הגדרת חיבור למסד נתונים PostgreSQL בתוך Docker
const pool = new Pool({
  user: 'user',              // תואם ל-POSTGRES_USER ב-docker-compose.yml
  host: 'db',                // תואם לשם השירות בקובץ docker-compose.yml
  database: 'flights_db',    // תואם ל-POSTGRES_DB
  password: 'password',      // תואם ל-POSTGRES_PASSWORD
  port: 5432,                // פורט ברירת המחדל של PostgreSQL
});

app.use(cors());
app.use(express.json());

// יצירת הטבלאות אם לא קיימות והוספת נתוני התחלה
async function initializeDatabase() {
  try {
    // יצירת טבלאות
    await pool.query(`
      CREATE TABLE IF NOT EXISTS flights (
        id SERIAL PRIMARY KEY,
        airline VARCHAR(100),
        from_location VARCHAR(100),
        to_location VARCHAR(100),
        price DECIMAL(10,2),
        departure_date DATE,
        departure_time TIME,
        arrival_date DATE,
        arrival_time TIME,
        baggage_allowance VARCHAR(50),
        flight_duration VARCHAR(50),
        seat_type VARCHAR(50),
        transit_stops INTEGER,
        in_flight_meals VARCHAR(100)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS reservations (
        id SERIAL PRIMARY KEY,
        flight_id INTEGER REFERENCES flights(id),
        name VARCHAR(100),
        last_name VARCHAR(100),
        phone VARCHAR(20),
        email VARCHAR(100),
        status VARCHAR(50) DEFAULT 'confirmed'
      )
    `);

    // הוספת טיסות ראשוניות אם הטבלה ריקה
    const flightsResult = await pool.query('SELECT COUNT(*) FROM flights');
    if (parseInt(flightsResult.rows[0].count) === 0) {
      console.log('Adding initial flights...');
      await insertInitialFlights();
    }
  } catch (error) {
    console.error('שגיאה באתחול מסד הנתונים:', error);
  }
}

// הוספת טיסות ראשוניות
async function insertInitialFlights() {
  const initialFlights = [
    {
      airline: 'El Al',
      from_location: 'Tel Aviv',
      to_location: 'New York',
      price: 450,
      departure_date: '2024-12-01',
      departure_time: '10:00:00',
      arrival_date: '2024-12-01',
      arrival_time: '16:00:00',
      baggage_allowance: '23kg',
      flight_duration: '10 hours',
      seat_type: 'Economy',
      transit_stops: 0,
      in_flight_meals: 'Included'
    },
    {
      airline: 'Delta',
      from_location: 'Tel Aviv',
      to_location: 'London',
      price: 300,
      departure_date: '2024-12-05',
      departure_time: '18:00:00',
      arrival_date: '2024-12-05',
      arrival_time: '21:00:00',
      baggage_allowance: '30kg',
      flight_duration: '5 hours',
      seat_type: 'Business',
      transit_stops: 1,
      in_flight_meals: 'Included'
    }
  ];

  for (const flight of initialFlights) {
    await pool.query(
      `INSERT INTO flights (
        airline, from_location, to_location, price, 
        departure_date, departure_time, 
        arrival_date, arrival_time, 
        baggage_allowance, flight_duration, 
        seat_type, transit_stops, in_flight_meals
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        flight.airline, flight.from_location, flight.to_location, flight.price,
        flight.departure_date, flight.departure_time,
        flight.arrival_date, flight.arrival_time,
        flight.baggage_allowance, flight.flight_duration,
        flight.seat_type, flight.transit_stops, flight.in_flight_meals
      ]
    );
  }
  console.log('Initial flights added successfully!');
}

// אתחול השרת
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch(error => {
    console.error('Failed to start server:', error);
  });

// חיפוש טיסות לפי פרמטרים
app.get('/api/flights', async (req, res) => {
  const { from, to, maxPrice, departureDate, arrivalDate } = req.query;
  
  let query = 'SELECT * FROM flights WHERE 1=1';
  const queryParams = [];
  let paramCount = 1;

  if (from) {
    query += ` AND from_location = $${paramCount}`;
    queryParams.push(from);
    paramCount++;
  }
  if (to) {
    query += ` AND to_location = $${paramCount}`;
    queryParams.push(to);
    paramCount++;
  }
  if (maxPrice) {
    query += ` AND price <= $${paramCount}`;
    queryParams.push(parseFloat(maxPrice));
    paramCount++;
  }
  if (departureDate) {
    query += ` AND departure_date = $${paramCount}`;
    queryParams.push(departureDate);
    paramCount++;
  }
  if (arrivalDate) {
    query += ` AND arrival_date = $${paramCount}`;
    queryParams.push(arrivalDate);
    paramCount++;
  }

  try {
    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error('שגיאה בשאילתת חיפוש:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// קבלת פרטי טיסה לפי מזהה
app.get('/api/flights/:id', async (req, res) => {
  const flightId = parseInt(req.params.id);

  try {
    const result = await pool.query('SELECT * FROM flights WHERE id = $1', [flightId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Flight not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('שגיאה בשליפת טיסה:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// יצירת הזמנה חדשה
app.post('/api/reservations', async (req, res) => {
  const { flightId, name, lastName, phone, email } = req.body;

  if (!flightId || !name || !lastName || !phone || !email) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // בדיקה שהטיסה קיימת
    const flightCheck = await pool.query('SELECT * FROM flights WHERE id = $1', [flightId]);
    if (flightCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Flight not found' });
    }

    const result = await pool.query(
      'INSERT INTO reservations (flight_id, name, last_name, phone, email) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [flightId, name, lastName, phone, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('שגיאה ביצירת הזמנה:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
