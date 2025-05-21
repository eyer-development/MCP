//--------------------------------------------------------------------------------------------
// ** Eyer javascript code to fetch all unread anomalies once per minute and store to disk **
// 
// Replace the "const token" with your apiTokenRead
// Replace "path" with the path to the folder where you granted Claude access.Make sure to end
// the path with a "/"
// -------------------------------------------------------------------------------------------


const fs = require('fs');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const url = 'https://boomi.eyer.ai/api/v2/anomalies/unread';
const path = 'path_to_folder_for_Claude';
const token = 'apiTokenRead';

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
    var write_path = (path + 'eyer_alerts' + currentHour + '.json');
    var delete_path = (path + 'eyer_alerts' + pastHour + '.json');

     // Read existing data (if file exists)
     let existing = [];
     if (fs.existsSync(write_path)) {
       const content = fs.readFileSync(write_path, 'utf8');
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
 
     fs.writeFileSync(write_path, JSON.stringify(combined, null, 2));
     try {
     fs.unlinkSync(delete_path);
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
