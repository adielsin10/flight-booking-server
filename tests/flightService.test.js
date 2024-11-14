// flightService.test.js
const { searchFlights } = require('../flightService');

// בדיקה לפונקציית חיפוש טיסות עם כל הפרמטרים
test('searchFlights - filters flights by from, to, date, and maxPrice', () => {
  const flights = [
    { id: 1, from: 'NYC', to: 'Paris', date: '2024-12-01', price: 500 },
    { id: 2, from: 'NYC', to: 'London', date: '2024-12-01', price: 300 },
    { id: 3, from: 'NYC', to: 'Paris', date: '2024-12-02', price: 700 },
  ];
  const result = searchFlights(flights, 'NYC', 'Paris', '2024-12-01', 600);
  expect(result).toEqual([{ id: 1, from: 'NYC', to: 'Paris', date: '2024-12-01', price: 500 }]);
});
