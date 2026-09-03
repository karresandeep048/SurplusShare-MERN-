import 'dotenv/config';
import { createTransporter, sendPickupAlertToDonor } from './src/utils/emailService.js';

const runTest = async () => {
    console.log('==============================================');
    console.log('📧 SurplusShare Donor Pickup Alert Email Test');
    console.log('==============================================');
    console.log('EMAIL_USER:', process.env.EMAIL_USER || '(Not set)');

    const transporter = createTransporter();
    if (!transporter) {
        console.log('⚠️ No email credentials found in .env');
        process.exit(1);
    }

    console.log('Sending sample pickup alert email to food donor/poster...');
    const result = await sendPickupAlertToDonor({
        supplierEmail: process.env.EMAIL_USER,
        supplierName: 'Green Bowl Restaurant (Food Donor)',
        receiverName: 'Sandeep (Receiver)',
        receiverEmail: 'sandeep.receiver@surplusshare.com',
        foodName: 'Vegetable Biryani & Fresh Parathas',
        quantity: 4,
        unit: 'meals',
        pickupCode: '849201',
        pickupLocation: 'Koramangala 4th Block, Bengaluru',
        pickupStart: new Date(),
        pickupEnd: new Date(Date.now() + 3 * 3600 * 1000)
    });

    console.log('\nDispatch Result:', result);
    console.log('==============================================');
    process.exit(0);
};

runTest();
