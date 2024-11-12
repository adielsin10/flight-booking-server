# שלב 1: שימוש בתמונה בסיסית של Node.js
FROM node:14

# שלב 2: העתקת קבצי הפרויקט
WORKDIR /app
COPY . .

# שלב 3: התקנת התלויות
RUN npm install

# שלב 4: חשיפת הפורט
EXPOSE 5000

# שלב 5: הפעלת השרת
CMD ["node", "server.js"]
