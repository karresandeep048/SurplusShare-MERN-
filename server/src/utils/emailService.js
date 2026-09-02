import nodemailer from 'nodemailer';

/**
 * Creates and configures the Nodemailer transporter.
 * Supports Gmail (via App Passwords) or custom SMTP.
 */
const createTransporter = () => {
    const user = process.env.EMAIL_USER || process.env.GMAIL_USER;
    const pass = process.env.EMAIL_PASS || process.env.GMAIL_PASS || process.env.EMAIL_PASSWORD;

    if (!user || !pass) {
        return null;
    }

    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user,
            pass
        }
    });
};

/**
 * Sends an email notification to the Supplier (Food Poster) when a receiver claims food.
 */
export const sendReservationNotificationToSupplier = async ({
    supplierEmail,
    supplierName,
    receiverName,
    receiverEmail,
    foodName,
    quantity,
    unit,
    pickupCode,
    pickupLocation,
    pickupStart,
    pickupEnd
}) => {
    try {
        const transporter = createTransporter();
        const fromEmail = process.env.EMAIL_USER || process.env.GMAIL_USER || 'notifications@surplusshare.com';

        const formattedStart = pickupStart ? new Date(pickupStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
        const formattedEnd = pickupEnd ? new Date(pickupEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';

        const subject = `🍽️ New Food Reservation: "${foodName}" Claimed by ${receiverName}`;
        
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
                    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
                    .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; padding: 28px; text-align: center; }
                    .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
                    .content { padding: 32px; }
                    .badge { display: inline-block; background: #ecfdf5; color: #047857; padding: 6px 14px; border-radius: 12px; font-weight: 700; font-size: 13px; margin-bottom: 20px; }
                    .code-box { background: #f0fdf4; border: 2px dashed #059669; border-radius: 16px; padding: 20px; text-align: center; margin: 24px 0; }
                    .code-text { font-family: monospace; font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #047857; margin: 8px 0; }
                    .details-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
                    .details-table td { padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
                    .details-table td.label { color: #64748b; font-weight: 600; width: 40%; }
                    .details-table td.value { color: #0f172a; font-weight: 700; }
                    .footer { text-align: center; padding: 20px; font-size: 12px; color: #94a3b8; background: #f8fafc; border-top: 1px solid #f1f5f9; }
                </style>
            </head>
            <body>
                <div class="card">
                    <div class="header">
                        <h1>SurplusShare Alert</h1>
                        <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">Someone reserved your surplus food!</p>
                    </div>
                    <div class="content">
                        <span class="badge">🌱 Food Rescue In Progress</span>
                        <p style="font-size: 16px; line-height: 1.5; margin-top: 0;">
                            Hello <strong>${supplierName}</strong>,
                        </p>
                        <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                            Great news! <strong>${receiverName}</strong> has just reserved a portion of your donated surplus food.
                        </p>

                        <div class="code-box">
                            <span style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #047857; letter-spacing: 1px;">Handover Pickup Code</span>
                            <div class="code-text">${pickupCode}</div>
                            <span style="font-size: 12px; color: #065f46;">Verify this 6-digit code with the receiver before handing over the food.</span>
                        </div>

                        <table class="details-table">
                            <tr>
                                <td class="label">Food Item:</td>
                                <td class="value">${foodName}</td>
                            </tr>
                            <tr>
                                <td class="label">Quantity Claimed:</td>
                                <td class="value">${quantity} ${unit}</td>
                            </tr>
                            <tr>
                                <td class="label">Claimed By:</td>
                                <td class="value">${receiverName} (<a href="mailto:${receiverEmail}" style="color: #059669; text-decoration: none;">${receiverEmail}</a>)</td>
                            </tr>
                            <tr>
                                <td class="label">Pickup Window:</td>
                                <td class="value">${formattedStart} - ${formattedEnd}</td>
                            </tr>
                            <tr>
                                <td class="label">Pickup Venue:</td>
                                <td class="value">${pickupLocation}</td>
                            </tr>
                        </table>

                        <p style="font-size: 13px; color: #64748b; margin-top: 24px; line-height: 1.5;">
                            When ${receiverName} arrives at your venue, ask for their 6-digit code and verify it on your SurplusShare Dashboard.
                        </p>
                    </div>
                    <div class="footer">
                        Sent via SurplusShare • Fighting food waste together
                    </div>
                </div>
            </body>
            </html>
        `;

        if (!transporter) {
            console.log('\n📧 [EMAIL NOTIFICATION TO DONOR (GMAIL SIMULATED)]');
            console.log(`To: ${supplierEmail} (${supplierName})`);
            console.log(`From: ${fromEmail}`);
            console.log(`Subject: ${subject}`);
            console.log(`Receiver: ${receiverName} (${receiverEmail})`);
            console.log(`Item: ${foodName} (${quantity} ${unit})`);
            console.log(`6-Digit Verification Code: ${pickupCode}`);
            console.log(`💡 Note: To send real Gmail messages, add GMAIL_USER and GMAIL_PASS (App Password) to server/.env.\n`);
            return { simulated: true, success: true };
        }

        const info = await transporter.sendMail({
            from: `"SurplusShare" <${fromEmail}>`,
            to: supplierEmail,
            subject,
            html: htmlContent
        });

        console.log(`✓ Gmail notification successfully sent to supplier ${supplierEmail}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Failed to send supplier email notification:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Sends a confirmation email to the Receiver with their digital pickup pass.
 */
export const sendReservationConfirmationToReceiver = async ({
    receiverEmail,
    receiverName,
    supplierName,
    foodName,
    quantity,
    unit,
    pickupCode,
    pickupLocation,
    pickupStart,
    pickupEnd
}) => {
    try {
        const transporter = createTransporter();
        const fromEmail = process.env.EMAIL_USER || process.env.GMAIL_USER || 'notifications@surplusshare.com';

        const formattedStart = pickupStart ? new Date(pickupStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
        const formattedEnd = pickupEnd ? new Date(pickupEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';

        const subject = `🎉 Surplus Food Reservation Confirmed: "${foodName}" - Pass #${pickupCode}`;

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
                    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
                    .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; padding: 28px; text-align: center; }
                    .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
                    .content { padding: 32px; }
                    .code-box { background: #f0fdf4; border: 2px dashed #059669; border-radius: 16px; padding: 20px; text-align: center; margin: 24px 0; }
                    .code-text { font-family: monospace; font-size: 36px; font-weight: 900; letter-spacing: 6px; color: #047857; margin: 8px 0; }
                    .details-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
                    .details-table td { padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
                    .details-table td.label { color: #64748b; font-weight: 600; width: 40%; }
                    .details-table td.value { color: #0f172a; font-weight: 700; }
                    .footer { text-align: center; padding: 20px; font-size: 12px; color: #94a3b8; background: #f8fafc; border-top: 1px solid #f1f5f9; }
                </style>
            </head>
            <body>
                <div class="card">
                    <div class="header">
                        <h1>Surplus Food Claim Pass</h1>
                        <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">Your reservation is locked in!</p>
                    </div>
                    <div class="content">
                        <p style="font-size: 16px; line-height: 1.5; margin-top: 0;">
                            Hello <strong>${receiverName}</strong>,
                        </p>
                        <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                            You have successfully reserved <strong>${quantity} ${unit}</strong> of <strong>${foodName}</strong> from <strong>${supplierName}</strong>.
                        </p>

                        <div class="code-box">
                            <span style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #047857; letter-spacing: 1px;">Your 6-Digit Pickup Code</span>
                            <div class="code-text">${pickupCode}</div>
                            <span style="font-size: 12px; color: #065f46;">Show this code to the donor at the venue upon arrival.</span>
                        </div>

                        <table class="details-table">
                            <tr>
                                <td class="label">Item:</td>
                                <td class="value">${foodName}</td>
                            </tr>
                            <tr>
                                <td class="label">Donor / Venue:</td>
                                <td class="value">${supplierName}</td>
                            </tr>
                            <tr>
                                <td class="label">Pickup Window:</td>
                                <td class="value">${formattedStart} - ${formattedEnd}</td>
                            </tr>
                            <tr>
                                <td class="label">Pickup Location:</td>
                                <td class="value">${pickupLocation}</td>
                            </tr>
                        </table>
                    </div>
                    <div class="footer">
                        SurplusShare • Thank you for rescuing surplus food!
                    </div>
                </div>
            </body>
            </html>
        `;

        if (!transporter) {
            console.log('\n📧 [EMAIL CONFIRMATION TO RECEIVER (GMAIL SIMULATED)]');
            console.log(`To: ${receiverEmail} (${receiverName})`);
            console.log(`Subject: ${subject}`);
            console.log(`6-Digit Pass: ${pickupCode}`);
            return { simulated: true, success: true };
        }

        const info = await transporter.sendMail({
            from: `"SurplusShare" <${fromEmail}>`,
            to: receiverEmail,
            subject,
            html: htmlContent
        });

        console.log(`✓ Gmail confirmation sent to receiver ${receiverEmail}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Failed to send receiver confirmation email:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Sends an email notification to the Supplier when a receiver clicks "I've Arrived".
 */
export const sendArrivalAlertToSupplier = async ({
    supplierEmail,
    supplierName,
    receiverName,
    foodName,
    pickupCode
}) => {
    try {
        const transporter = createTransporter();
        const fromEmail = process.env.EMAIL_USER || process.env.GMAIL_USER || 'notifications@surplusshare.com';
        const subject = `🔔 Receiver Arrived at Venue: ${receiverName} is here for "${foodName}"!`;

        const htmlContent = `
            <div style="font-family: sans-serif; padding: 20px; background: #fffbeb; border-radius: 16px; border: 1px solid #fef3c7; max-width: 500px;">
                <h2 style="color: #92400e; margin: 0 0 10px;">🔔 Receiver Arrived!</h2>
                <p style="color: #78350f; font-size: 14px;"><strong>${receiverName}</strong> has just arrived at your location to pick up <strong>${foodName}</strong>.</p>
                <div style="background: white; border: 2px solid #f59e0b; padding: 15px; border-radius: 12px; text-align: center; margin: 15px 0;">
                    <span style="font-size: 11px; text-transform: uppercase; color: #b45309; font-weight: 800;">Receiver Pickup Code</span>
                    <div style="font-size: 28px; font-weight: 900; font-family: monospace; color: #78350f;">${pickupCode}</div>
                </div>
                <p style="font-size: 12px; color: #92400e;">Verify this code on your SurplusShare terminal to complete the handover.</p>
            </div>
        `;

        if (!transporter) {
            console.log(`\n🔔 [EMAIL ARRIVAL ALERT TO DONOR (GMAIL SIMULATED)]`);
            console.log(`To: ${supplierEmail} (${supplierName})`);
            console.log(`Subject: ${subject}`);
            console.log(`Pickup Code: ${pickupCode}\n`);
            return { simulated: true, success: true };
        }

        const info = await transporter.sendMail({
            from: `"SurplusShare" <${fromEmail}>`,
            to: supplierEmail,
            subject,
            html: htmlContent
        });

        console.log(`✓ Gmail arrival alert sent to supplier ${supplierEmail}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Failed to send arrival alert email:', error.message);
        return { success: false, error: error.message };
    }
};
