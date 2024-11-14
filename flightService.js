// flightService.js

/**
 * חיפוש טיסות לפי פרמטרים שהמשתמש הגדיר
 * @param {Array} flights - מערך של אובייקטים המייצגים טיסות
 * @param {string} from - יעד יציאה
 * @param {string} to - יעד הגעה
 * @param {string} date - תאריך טיסה
 * @param {number} maxPrice - מחיר מקסימלי
 * @returns {Array} - מערך של טיסות שתואמות את הפרמטרים שהוגדרו
 */
function searchFlights(flights, from, to, date, maxPrice) {
    return flights.filter((flight) => {
      const matchesFrom = from ? flight.from === from : true;
      const matchesTo = to ? flight.to === to : true;
      const matchesDate = date ? flight.date === date : true;
      const matchesPrice = maxPrice ? flight.price <= maxPrice : true;
      
      return matchesFrom && matchesTo && matchesDate && matchesPrice;
    });
  }
  
  module.exports = { searchFlights };
  