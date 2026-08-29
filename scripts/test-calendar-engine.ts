import { calendarService } from '../src/services/calendar/calendar.service.js';

async function runCalendarTestSuite() {
  console.log('================================================================');
  console.log('🗓️ STARTING GOOGLE CALENDAR & APPOINTMENT BOOKING TEST SUITE');
  console.log('================================================================\n');

  const businessId = 'test-business-clinic';
  const targetFriday = '2026-09-04'; // Simulated upcoming Friday

  // 1. Find Available Slots & Suggest 3 Times
  console.log(`1️⃣ Finding free slots for date: ${targetFriday}...`);
  const slotResult = await calendarService.findAvailableSlots(targetFriday, 45, 3);
  console.log(`📋 Top 3 Suggested Times for WhatsApp:\n${slotResult.formattedSuggestions}\n`);

  const chosenSlot = slotResult.suggestedSlots[0];
  console.log(`2️⃣ Booking Appointment for Sophia Martinez at: ${chosenSlot.displayTime}...`);

  // 2. Book Appointment
  const bookResult = await calendarService.bookAppointment({
    businessId,
    customerName: 'Sophia Martinez',
    customerPhone: '+1 (555) 234-5678',
    customerEmail: 'sophia.m@example.com',
    serviceType: 'Cosmetic Laser Teeth Whitening',
    startTime: chosenSlot.startTime,
    durationMinutes: 45,
    notes: 'Requested Dr. Reynolds',
  });

  console.log(`   Status: ${bookResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`   Confirmation Message:\n${bookResult.confirmationMessage}\n`);

  const appointmentId = bookResult.appointment!.id;

  // 3. Test Double Booking Prevention
  console.log(`3️⃣ Testing Double-Booking Prevention: David Chen attempts to book the SAME slot...`);
  const conflictResult = await calendarService.bookAppointment({
    businessId,
    customerName: 'David Chen',
    customerPhone: '+1 (555) 876-5432',
    customerEmail: 'dchen@techcorp.io',
    serviceType: 'Dental Consultation',
    startTime: chosenSlot.startTime, // Exact same occupied start time
    durationMinutes: 45,
  });

  if (!conflictResult.success && conflictResult.error === 'DoubleBookingConflict') {
    console.log(`   🛡️ Conflict Blocked Correctly: "${conflictResult.confirmationMessage}"\n`);
  } else {
    console.error(`   ❌ ERROR: Double booking was not prevented!`);
  }

  // 4. Reschedule Appointment
  const newSlot = slotResult.suggestedSlots[1];
  console.log(`4️⃣ Rescheduling Sophia's Appointment to second slot: ${newSlot.displayTime}...`);
  const rescheduleResult = await calendarService.rescheduleAppointment(
    appointmentId,
    newSlot.startTime,
    45
  );
  console.log(`   Status: ${rescheduleResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`   Update:\n${rescheduleResult.confirmationMessage}\n`);

  // 5. Cancel Appointment
  console.log(`5️⃣ Cancelling Appointment (Customer Request)...`);
  const cancelResult = await calendarService.cancelAppointment(
    appointmentId,
    'Client rescheduled for next month'
  );
  console.log(`   Status: ${cancelResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`   Cancellation Reply:\n${cancelResult.confirmationMessage}\n`);

  // 6. Verify Slot Availability After Cancellation
  console.log(`6️⃣ Verifying Slot Availability After Cancellation...`);
  const updatedSlots = await calendarService.findAvailableSlots(targetFriday, 45, 3);
  console.log(`   Available Times Now:\n${updatedSlots.formattedSuggestions}\n`);

  console.log('================================================================');
  console.log('✅ ALL GOOGLE CALENDAR & BOOKING TESTS COMPLETED SUCCESSFULLY!');
  console.log('================================================================');
}

runCalendarTestSuite().catch(console.error);
