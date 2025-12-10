
import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';

// Load env vars from the service directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

import connectMongoDB from '../config/db.config';
import { ReservationRepository } from '../repository/implementation/reservation.repository';
import { RoomLookupAdapter } from '../services/adapters/roomLookup.adapter';
import { ReservationService } from '../services/implementation/reservation.service';

async function debugAvailability() {
  console.log('--- Starting Availability Debug Script ---');
  
  try {
    await connectMongoDB();
    
    const repo = new ReservationRepository();
    const roomLookup = new RoomLookupAdapter();
    
    // Mock other dependencies
    const pricingEngine = {} as any;
    const payments = {} as any;
    const guestRpc = {} as any;
    
    const service = new ReservationService(repo, roomLookup, pricingEngine, payments, guestRpc);

    // Test criteria: 2 days starting tomorrow
    const today = new Date();
    const checkIn = new Date(today);
    checkIn.setDate(today.getDate() + 1);
    checkIn.setHours(14, 0, 0, 0);
    
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkIn.getDate() + 2);
    checkOut.setHours(11, 0, 0, 0);

    console.log(`Checking availability for: ${checkIn.toISOString()} to ${checkOut.toISOString()}`);
    
    const results = await service.checkAvailability({
      checkIn: checkIn,
      checkOut: checkOut,
      adults: 2,
      type: 'Standard' // Try filtering by type to see if that's the issue? Or remove to test all.
                       // Let's rely on default behavior first (no type)
    });
    
    console.log(`--- Result: Found ${results.length} available rooms ---`);
    if (results.length > 0) {
      console.log('Sample Room:', results[0].name);
    } else {
        // If 0, let's look at raw reservations to see why
        console.log('Fetching raw reservations for this period to debug...');
        const overlaps = await repo.findAll({
            checkIn: { $lt: checkOut },
            checkOut: { $gt: checkIn },
            status: { $in: ['PendingPayment', 'Confirmed', 'CheckedIn'] }
        });
        console.log(`Found ${overlaps.length} raw overlapping reservations in DB.`);
        if (overlaps.length > 0) {
            console.log('Sample overlap:', JSON.stringify(overlaps[0], null, 2));
        }
    }

  } catch (error: any) {
    console.error('--- ERROR ---');
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
}

debugAvailability();
