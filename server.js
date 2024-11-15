const express = require('express');
const cors = require('cors');
const { searchFlights } = require('./flightService'); // ייבוא הפונקציה
const app = express();
const PORT = 5000;

app.use(cors()); // לאפשר בקשות מהפרונטאנד

// נתונים מדומים (Mock Data) של טיסות
const flights = [
  { id: 1, airline: 'El Al', from: 'Tel Aviv', to: 'New York', price: 450 },
  { id: 2, airline: 'Delta', from: 'Tel Aviv', to: 'London', price: 300 },
  { id: 3, airline: 'United', from: 'Tel Aviv', to: 'Paris', price: 350 },
];

// הגדרת מסלול לקבלת נתוני טיסות
app.get('/api/flights', (req, res) => {
  const { from, to, maxPrice } = req.query;

  // הפעלת הפונקציה searchFlights לסינון הטיסות
  const filteredFlights = searchFlights(
    flights,
    from,
    to,
    undefined, // אין צורך בתאריך, אז נשלח undefined
    maxPrice ? parseFloat(maxPrice) : undefined
  );

  res.json(filteredFlights);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
