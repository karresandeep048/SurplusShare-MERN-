import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { 
    sendReservationNotificationToSupplier, 
    sendReservationConfirmationToReceiver, 
    sendArrivalAlertToSupplier 
} from './src/utils/emailService.js';

dotenv.config();

const runEmailTest = async () => {
    console.log('==============================================');
    console.log('📧 SurplusShare Email Service Diagnostic Test');
    console.log('==============================================');
    console.log('EMAIL_USER:', process.env.EMAIL_USER || '(Not set)');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '******** (configured)' : '(Not set)');
    
    console.log('\n1. Testing Nodemailer Transporter Connection...');
    const user = process.env.EMAIL_USER || process.env.GMAIL_USER;
    const pass = process.env.EMAIL_PASS || process.env.GMAIL_PASS;

    if (!user || !pass) {
        console.log('ℹ️ No credentials provided in .env -> Simulated email mode is ACTIVE.');
        console.log('All email alerts will print cleanly to the terminal logs.');
    } else {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user, pass }
        });

        try {
            await transporter.verify();
            console.log('✅ Gmail SMTP Server Connection Verified Successfully!');
        } catch (err) {
            console.error('⚠️ Gmail SMTP Verification Warning:', err.message);
            if (err.message.includes('Username and Password not accepted') || err.message.includes('BadCredentials')) {
                console.log('\n💡 Tip: For Gmail / Google Workspace accounts, you must use a 16-character Google App Password:');
                console.log('   1. Visit https://myaccount.google.com/apppasswords');
                console.log('   2. Generate an App Password for "Mail" / "Node.js"');
                console.log('   3. Put the 16-character code into EMAIL_PASS in server/.env\n');
            }
        }
    }

    console.log('\n2. Testing Sample Reservation Confirmation Dispatch...');
    const res = await sendReservationConfirmationToReceiver({
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

    console.log('\nDispatch Result:', res);
    console.log('==============================================');
    process.exit(0);
};

runEmailTest();
