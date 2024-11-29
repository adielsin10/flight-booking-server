// flightService.js
function searchFlights(flights, from, to, date, maxPrice) {
    return flights.filter(flight => {
      const matchesFrom = !from || flight.from === from;
      const matchesTo = !to || flight.to === to;
      const matchesDate = !date || flight.date === date;
      const matchesPrice = !maxPrice || flight.price <= maxPrice;
  
      return matchesFrom && matchesTo && matchesDate && matchesPrice;
    });
  }
  
  module.exports = { searchFlights };