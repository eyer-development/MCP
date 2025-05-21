//--------------------------------------------------------------------------------------------
// ** Eyer javascript code to fetch all unread anomalies once per minute and store to disk **
// 
// Replace the "const token" with your apiReadToken
// Replace "path" with the path to the folder where you granted Claude access
// -------------------------------------------------------------------------------------------


const fs = require('fs');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const url = 'https://boomi.eyer.ai/api/v2/anomalies/unread';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJFeWVyIiwiaWF0IjoxNDcsImV4cCI6MTQ3LCJhdWQiOiJib29taS5leWVyLmFpICIsInN1YiI6Im1hcml1c0BleWVyLmFpIiwiUm9sZSI6InJlYWQiLCJDb21wYW55IjoiRXllck5ldyJ9.7yuOuY46G6sEr2n_j3GfMoVikU8l2uGywLZVjitxZS4';

async function fetchAlerts() {
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
 
    var currentHour = new Date().getHours();
    var pastHour = new Date().getHours() - 6;
    var path = ('/Users/mariusstorsten/Downloads/Claude/eyer_alerts' + currentHour + '.json');
    var path_last = ('/Users/mariusstorsten/Downloads/Claude/eyer_alerts' + pastHour + '.json');

     // Read existing data (if file exists)
     let existing = [];
     if (fs.existsSync(path)) {
       const content = fs.readFileSync(path, 'utf8');
       try {
         existing = JSON.parse(content);
         if (!Array.isArray(existing)) {
           existing = [existing];
         }
       } catch {
         existing = [];
       }
     }
 
     // Append new data (also handles non-array API responses)
     const toAppend = Array.isArray(data) ? data : [data];
     const combined = [...existing, ...toAppend];
 
     fs.writeFileSync(path, JSON.stringify(combined, null, 2));
     try {
     fs.unlinkSync(path_last);
     } catch (err) {
        if (err.code !== 'ENOENT') {} else {}
      }

   } catch (error) {
     console.error('Error fetching data:', error.message);
   }
 }

 async function trigger() {
    while (true) {
    var a = await fetchAlerts();
    await sleep(60000);
    }
}

trigger();
