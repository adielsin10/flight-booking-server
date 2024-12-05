// flightService.test.js
const { searchFlights } = require('../flightService');

// בדיקה לפונקציית  חיפוש טיסות עם כל הפרמטרים
test('searchFlights - filters flights by from, to, date, and maxPrice', () => {
  const flights = [
    { id: 1, from: 'NYC', to: 'Paris', date: '2024-12-01', price: 500 },
    { id: 2, from: 'NYC', to: 'London', date: '2024-12-01', price: 300 },
    { id: 3, from: 'NYC', to: 'Paris', date: '2024-12-02', price: 700 },
  ];
  const result = searchFlights(flights, 'NYC', 'Paris', '2024-12-01', 600);
  expect(result).toEqual([{ id: 1, from: 'NYC', to: 'Paris', date: '2024-12-01', price: 500 }]);
});

// בדיקה כאשר אין טיסות שמתאימות
test('searchFlights - no flights match criteria', () => {
  const flights = [
    { id: 1, from: 'NYC', to: 'Paris', date: '2024-12-01', price: 500 },
    { id: 2, from: 'NYC', to: 'London', date: '2024-12-01', price: 300 },
    { id: 3, from: 'NYC', to: 'Paris', date: '2024-12-02', price: 700 },
  ];
  const result = searchFlights(flights, 'NYC', 'Tokyo', '2024-12-01', 600);
  expect(result).toEqual([]); // אין טיסות שמתאימות
});

// בדיקה אם תוצאת החיפוש מתאימה למחיר בלבד
test('searchFlights - filters flights by maxPrice only', () => {
  const flights = [
    { id: 1, from: 'NYC', to: 'Paris', date: '2024-12-01', price: 500 },
    { id: 2, from: 'NYC', to: 'London', date: '2024-12-01', price: 300 },
    { id: 3, from: 'NYC', to: 'Paris', date: '2024-12-02', price: 700 },
  ];
  const result = searchFlights(flights, '', '', '', 600);
  expect(result).toEqual([
    { id: 1, from: 'NYC', to: 'Paris', date: '2024-12-01', price: 500 },
    { id: 2, from: 'NYC', to: 'London', date: '2024-12-01', price: 300 },
  ]);
});

// בדיקה אם כל הפילטרים מניבים תוצאה נכונה
test('searchFlights - filters flights with all criteria', () => {
  const flights = [
    { id: 1, from: 'NYC', to: 'Paris', date: '2024-12-01', price: 500 },
    { id: 2, from: 'NYC', to: 'London', date: '2024-12-01', price: 300 },
    { id: 3, from: 'NYC', to: 'Paris', date: '2024-12-02', price: 700 },
    { id: 4, from: 'LA', to: 'Paris', date: '2024-12-01', price: 400 },
  ];
  const result = searchFlights(flights, 'NYC', 'Paris', '2024-12-01', 600);
  expect(result).toEqual([{ id: 1, from: 'NYC', to: 'Paris', date: '2024-12-01', price: 500 }]);
});
