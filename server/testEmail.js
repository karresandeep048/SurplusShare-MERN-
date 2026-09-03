import 'dotenv/config';
import { createTransporter, sendPickupAlertToDonor, sendPickupPassToReceiver } from './src/utils/emailService.js';

const runTest = async () => {
    console.log('==============================================');
    console.log('📧 SurplusShare Email System Test');
    console.log('==============================================');
    console.log('EMAIL_USER:', process.env.EMAIL_USER || '(Not set)');

    const transporter = createTransporter();
    if (!transporter) {
        console.log('⚠️ No email credentials found in .env');
        process.exit(1);
    }

    console.log('\n1. Sending pickup pass to Receiver inbox...');
    const receiverResult = await sendPickupPassToReceiver({
        receiverEmail: process.env.EMAIL_USER,
        receiverName: 'Sandeep (Receiver)',
        supplierName: 'Sai (Food Donor)',
        supplierEmail: '24eg105q48@anurag.edu.in',
        foodName: 'Vegetable Biryani & Fresh Parathas',
        quantity: 4,
        unit: 'meals',
        pickupCode: '326050',
        pickupLocation: 'Swarnagiri Colony, Ghatkesar mandal, Telangana, 501301',
        pickupStart: new Date(),
        pickupEnd: new Date(Date.now() + 3 * 3600 * 1000)
    });
    console.log('Receiver Pass Result:', receiverResult);

    console.log('\n2. Sending pickup alert to Donor inbox...');
    const donorResult = await sendPickupAlertToDonor({
        supplierEmail: process.env.EMAIL_USER,
        supplierName: 'Sai (Food Donor)',
        receiverName: 'Sandeep (Receiver)',
        receiverEmail: '24eg105q04@anurag.edu.in',
        foodName: 'Vegetable Biryani & Fresh Parathas',
        quantity: 4,
        unit: 'meals',
        pickupCode: '326050',
        pickupLocation: 'Swarnagiri Colony, Ghatkesar mandal, Telangana, 501301',
        pickupStart: new Date(),
        pickupEnd: new Date(Date.now() + 3 * 3600 * 1000)
    });
    console.log('Donor Alert Result:', donorResult);

    console.log('==============================================');
    process.exit(0);
};

runTest();
