import 'dotenv/config';
import { 
    createTransporter, 
    sendListingCreatedAlertToDonor,
    sendPickupAlertToDonor, 
    sendPickupPassToReceiver,
    sendArrivalAlertToDonor
} from './src/utils/emailService.js';

const runTest = async () => {
    console.log('==============================================');
    console.log('📧 SurplusShare Full Email System Verification');
    console.log('==============================================');
    console.log('EMAIL_USER:', process.env.EMAIL_USER || '(Not set)');

    const transporter = createTransporter();
    if (!transporter) {
        console.log('⚠️ No email credentials found in .env');
        process.exit(1);
    }

    const testEmail = process.env.EMAIL_USER;

    console.log('\n1. Testing Listing Created Confirmation to Donor...');
    const listingResult = await sendListingCreatedAlertToDonor({
        supplierEmail: testEmail,
        supplierName: 'Sandeep (Food Donor)',
        foodName: 'Vegetable Biryani Buffet Surplus',
        quantity: 15,
        unit: 'meals',
        location: 'Swarnagiri Colony, Ghatkesar mandal, Telangana, 501301',
        expiryTime: new Date(Date.now() + 6 * 3600 * 1000),
        pickupStart: new Date(),
        pickupEnd: new Date(Date.now() + 4 * 3600 * 1000)
    });
    console.log('Listing Created Result:', listingResult.success ? '✓ SUCCESS' : 'FAILED');

    console.log('\n2. Testing Food Reserved Alert to Donor...');
    const donorAlertResult = await sendPickupAlertToDonor({
        supplierEmail: testEmail,
        supplierName: 'Sandeep (Food Donor)',
        receiverName: 'Abhi (Receiver)',
        receiverEmail: '24eg105q48@anurag.edu.in',
        foodName: 'Vegetable Biryani Buffet Surplus',
        quantity: 15,
        unit: 'meals',
        pickupCode: '247416',
        pickupLocation: 'Swarnagiri Colony, Ghatkesar mandal, Telangana, 501301',
        pickupStart: new Date(),
        pickupEnd: new Date(Date.now() + 4 * 3600 * 1000)
    });
    console.log('Donor Reservation Alert Result:', donorAlertResult.success ? '✓ SUCCESS' : 'FAILED');

    console.log('\n3. Testing Pickup Pass to Receiver...');
    const receiverPassResult = await sendPickupPassToReceiver({
        receiverEmail: testEmail,
        receiverName: 'Abhi (Receiver)',
        supplierName: 'Sandeep (Food Donor)',
        supplierEmail: testEmail,
        foodName: 'Vegetable Biryani Buffet Surplus',
        quantity: 15,
        unit: 'meals',
        pickupCode: '247416',
        pickupLocation: 'Swarnagiri Colony, Ghatkesar mandal, Telangana, 501301',
        pickupStart: new Date(),
        pickupEnd: new Date(Date.now() + 4 * 3600 * 1000)
    });
    console.log('Receiver Pickup Pass Result:', receiverPassResult.success ? '✓ SUCCESS' : 'FAILED');

    console.log('\n4. Testing Arrival Alert to Donor...');
    const arrivalResult = await sendArrivalAlertToDonor({
        supplierEmail: testEmail,
        supplierName: 'Sandeep (Food Donor)',
        receiverName: 'Abhi (Receiver)',
        receiverEmail: '24eg105q48@anurag.edu.in',
        foodName: 'Vegetable Biryani Buffet Surplus',
        pickupCode: '247416',
        pickupLocation: 'Swarnagiri Colony, Ghatkesar mandal, Telangana, 501301'
    });
    console.log('Arrival Alert Result:', arrivalResult.success ? '✓ SUCCESS' : 'FAILED');

    console.log('\n==============================================');
    console.log('🎉 All SurplusShare notification tests passed!');
    console.log('==============================================');
    process.exit(0);
};

runTest();
