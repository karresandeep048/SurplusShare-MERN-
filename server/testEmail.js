import 'dotenv/config';
import nodemailer from 'nodemailer';
import { 
    createTransporter,
    sendReservationNotificationToSupplier, 
    sendReservationConfirmationToReceiver, 
    sendArrivalAlertToSupplier 
} from './src/utils/emailService.js';

const runEmailTest = async () => {
    console.log('==============================================');
    console.log('📧 SurplusShare Email Service Diagnostic Test');
    console.log('==============================================');
    console.log('EMAIL_USER:', process.env.EMAIL_USER || '(Not set)');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '******** (configured)' : '(Not set)');
    
    console.log('\n1. Verifying Transporter...');
    const transporter = createTransporter();
    if (!transporter) {
        console.log('ℹ️ No credentials provided in .env -> Simulated email mode is ACTIVE.');
    } else {
        try {
            await transporter.verify();
            console.log('✅ Gmail Transporter Verified Successfully!');
        } catch (err) {
            console.error('⚠️ Verification Error:', err.message);
        }
    }

    console.log('\n2. Testing Sample Reservation Confirmation Dispatch...');
    const resReceiver = await sendReservationConfirmationToReceiver({
        receiverEmail: process.env.EMAIL_USER || 'receiver.demo@surplusshare.com',
        receiverName: 'Sandeep (Receiver)',
        supplierName: 'Green Bowl Restaurant',
        foodName: 'Vegetable Biryani',
        quantity: 5,
        unit: 'meals',
        pickupCode: '839201',
        pickupLocation: 'Koramangala, Bengaluru',
        pickupStart: new Date(),
        pickupEnd: new Date(Date.now() + 3 * 3600 * 1000)
    });
    console.log('Receiver Email Dispatch Result:', resReceiver);

    console.log('\n3. Testing Sample Supplier Reservation Alert Dispatch...');
    const resSupplier = await sendReservationNotificationToSupplier({
        supplierEmail: process.env.EMAIL_USER || 'supplier.demo@surplusshare.com',
        supplierName: 'Green Bowl Restaurant (Donor)',
        receiverName: 'Sandeep (Receiver)',
        receiverEmail: process.env.EMAIL_USER,
        foodName: 'Vegetable Biryani',
        quantity: 5,
        unit: 'meals',
        pickupCode: '839201',
        pickupLocation: 'Koramangala, Bengaluru',
        pickupStart: new Date(),
        pickupEnd: new Date(Date.now() + 3 * 3600 * 1000)
    });
    console.log('Supplier Email Dispatch Result:', resSupplier);

    console.log('\n4. Testing Arrival Alert Dispatch...');
    const resArrival = await sendArrivalAlertToSupplier({
        supplierEmail: process.env.EMAIL_USER || 'supplier.demo@surplusshare.com',
        supplierName: 'Green Bowl Restaurant',
        receiverName: 'Sandeep (Receiver)',
        foodName: 'Vegetable Biryani',
        pickupCode: '839201'
    });
    console.log('Arrival Alert Dispatch Result:', resArrival);

    console.log('==============================================');
    process.exit(0);
};

runEmailTest();
