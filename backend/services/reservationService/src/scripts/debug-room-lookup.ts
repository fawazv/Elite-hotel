
import dotenv from 'dotenv';
import path from 'path';

// Load env vars from the service directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { RoomLookupAdapter } from '../services/adapters/roomLookup.adapter';

async function verifyRoomServiceConnection() {
  console.log('--- Starting Room Lookup Debug Script ---');
  
  const roomServiceUrl = process.env.ROOM_SERVICE_URL;
  console.log(`Configured ROOM_SERVICE_URL: ${roomServiceUrl}`);
  
  const adapter = new RoomLookupAdapter();
  
  try {
    console.log('Attempting to fetch all rooms...');
    const start = Date.now();
    const rooms = await adapter.getAllRooms();
    const duration = Date.now() - start;
    
    console.log(`Successfully fetched ${rooms.length} rooms in ${duration}ms`);
    
    if (rooms.length > 0) {
      console.log('--- First Room Sample ---');
      console.log(JSON.stringify(rooms[0], null, 2));
      
      const availableCount = rooms.filter(r => r.available).length;
      console.log(`--- Summary ---`);
      console.log(`Total Rooms: ${rooms.length}`);
      console.log(`Available Rooms: ${availableCount}`);
      console.log(`Unavailable Rooms: ${rooms.length - availableCount}`);
    } else {
      console.warn('WARNING: RoomService returned 0 rooms.');
    }
    
  } catch (error: any) {
    console.error('--- ERROR FETCHING ROOMS ---');
    console.error(error.message);
    if (error.response) {
       console.error('Status:', error.response.status);
       console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

verifyRoomServiceConnection();
