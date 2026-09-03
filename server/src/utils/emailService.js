import dns from 'node:dns';
import dnsPromises from 'node:dns/promises';
import nodemailer from 'nodemailer';

// Force IPv4 first to prevent ENETUNREACH errors on cloud container hosts like Render
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

/**
 * Creates and configures the Nodemailer transporter.
 * Pre-resolves IPv4 address to prevent ENETUNREACH IPv6 failures on cloud container hosts like Render.
 */
export const createTransporter = async () => {
    const user = process.env.EMAIL_USER || process.env.GMAIL_USER;
    const pass = process.env.EMAIL_PASS || process.env.GMAIL_PASS || process.env.EMAIL_PASSWORD;

    if (!user || !pass) {
        return null;
    }

    let hostTarget = 'smtp.gmail.com';
    try {
        const ips = await dnsPromises.resolve4('smtp.gmail.com');
        if (ips && ips.length > 0) {
            hostTarget = ips[0];
        }
    } catch (e) {
        console.warn('Could not pre-resolve IPv4 for smtp.gmail.com, falling back to hostname:', e.message);
    }

    return nodemailer.createTransport({
        host: hostTarget,
        port: 587,
        secure: false, // STARTTLS
        requireTLS: true,
        auth: {
            user: user.trim(),
            pass: pass.trim().replace(/\s+/g, '') // strip any extra spaces
        },
        tls: {
            servername: 'smtp.gmail.com',
            rejectUnauthorized: false
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 20000
    });
};

/**
 * Sends a detailed email notification to the Food Poster (Donor / Supplier)
 * with the 6-digit verification code and receiver claim details.
 */
export const sendPickupAlertToDonor = async ({
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
    const fromEmail = process.env.EMAIL_USER || process.env.GMAIL_USER || 'notifications@surplusshare.com';
    const formattedStart = pickupStart ? new Date(pickupStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
    const formattedEnd = pickupEnd ? new Date(pickupEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
    const subject = `🍽️ SurplusShare Pickup Alert: ${receiverName} reserved "${foodName}" (Verification Code #${pickupCode})`;
    
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
                .code-text { font-family: monospace; font-size: 36px; font-weight: 900; letter-spacing: 6px; color: #047857; margin: 8px 0; }
                .details-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
                .details-table td { padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
                .details-table td.label { color: #64748b; font-weight: 600; width: 40%; }
                .details-table td.value { color: #0f172a; font-weight: 700; }
                .receiver-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-top: 16px; }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #94a3b8; background: #f8fafc; border-top: 1px solid #f1f5f9; }
            </style>
        </head>
        <body>
            <div class="card">
                <div class="header">
                    <h1>SurplusShare Donor Alert</h1>
                    <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">A receiver has claimed your surplus food!</p>
                </div>
                <div class="content">
                    <span class="badge">🌱 Food Rescue In Progress</span>
                    <p style="font-size: 16px; line-height: 1.5; margin-top: 0;">
                        Hello <strong>${supplierName}</strong>,
                    </p>
                    <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                        Community member <strong>${receiverName}</strong> has reserved your food donation <strong>"${foodName}"</strong> and will arrive for the pickup.
                    </p>

                    <div class="code-box">
                        <span style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #047857; letter-spacing: 1px;">Handover Verification Code</span>
                        <div class="code-text">${pickupCode}</div>
                        <span style="font-size: 12px; color: #065f46;">Verify this 6-digit code with ${receiverName} upon handover.</span>
                    </div>

                    <div class="receiver-box">
                        <span style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #64748b; letter-spacing: 0.5px;">Claimed By (Receiver Details)</span>
                        <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 4px;">${receiverName}</div>
                        <div style="font-size: 13px; color: #059669; margin-top: 2px;">
                            <a href="mailto:${receiverEmail}" style="color: #059669; text-decoration: none;">${receiverEmail}</a>
                        </div>
                    </div>

                    <table class="details-table">
                        <tr>
                            <td class="label">Food Item:</td>
                            <td class="value">${foodName}</td>
                        </tr>
                        <tr>
                            <td class="label">Quantity Reserved:</td>
                            <td class="value">${quantity} ${unit}</td>
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
                        When <strong>${receiverName}</strong> arrives at your location, verify code <strong style="color: #047857;">${pickupCode}</strong> on your SurplusShare dashboard to complete the handover.
                    </p>
                </div>
                <div class="footer">
                    Sent via SurplusShare • Fighting food waste together
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        const transporter = await createTransporter();
        if (!transporter) {
            console.log(`[EMAIL LOG] No SMTP credentials configured. Simulated email to donor ${supplierEmail} with code ${pickupCode}`);
            return { delivered: false, simulated: true, success: true, reason: 'No SMTP credentials' };
        }

        const info = await transporter.sendMail({
            from: `"SurplusShare" <${fromEmail}>`,
            to: supplierEmail,
            subject,
            html: htmlContent
        });

        console.log(`✓ [EMAIL SENT] Pickup verification pass sent to donor ${supplierEmail} (ID: ${info.messageId})`);
        return { delivered: true, simulated: false, success: true, messageId: info.messageId };
    } catch (error) {
        console.warn(`⚠️ [EMAIL WARNING] Could not dispatch to donor (${error.message}). Logged to console.`);
        return { delivered: false, simulated: true, success: true, error: error.message };
    }
};

/**
 * Sends a detailed pickup pass and confirmation email to the Food Receiver
 * with the 6-digit verification code, venue location, and donor contact details.
 */
export const sendPickupPassToReceiver = async ({
    receiverEmail,
    receiverName,
    supplierName,
    supplierEmail,
    foodName,
    quantity,
    unit,
    pickupCode,
    pickupLocation,
    pickupStart,
    pickupEnd
}) => {
    if (!receiverEmail) return { delivered: false, simulated: true, success: false, reason: 'No receiver email' };

    const fromEmail = process.env.EMAIL_USER || process.env.GMAIL_USER || 'notifications@surplusshare.com';
    const formattedStart = pickupStart ? new Date(pickupStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
    const formattedEnd = pickupEnd ? new Date(pickupEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
    const subject = `🎫 Your SurplusShare Pickup Pass: "${foodName}" (Code #${pickupCode})`;

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
                .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
                .header { background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff; padding: 28px; text-align: center; }
                .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
                .content { padding: 32px; }
                .badge { display: inline-block; background: #e0f2fe; color: #0369a1; padding: 6px 14px; border-radius: 12px; font-weight: 700; font-size: 13px; margin-bottom: 20px; }
                .code-box { background: #f0fdf4; border: 2px dashed #059669; border-radius: 16px; padding: 20px; text-align: center; margin: 24px 0; }
                .code-text { font-family: monospace; font-size: 38px; font-weight: 900; letter-spacing: 6px; color: #047857; margin: 8px 0; }
                .details-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
                .details-table td { padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
                .details-table td.label { color: #64748b; font-weight: 600; width: 40%; }
                .details-table td.value { color: #0f172a; font-weight: 700; }
                .donor-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-top: 16px; }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #94a3b8; background: #f8fafc; border-top: 1px solid #f1f5f9; }
            </style>
        </head>
        <body>
            <div class="card">
                <div class="header">
                    <h1>SurplusShare Pickup Pass</h1>
                    <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">Your food reservation is confirmed & ready for pickup!</p>
                </div>
                <div class="content">
                    <span class="badge">🎒 Active Reservation Pass</span>
                    <p style="font-size: 16px; line-height: 1.5; margin-top: 0;">
                        Hello <strong>${receiverName}</strong>,
                    </p>
                    <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                        Your reservation for <strong>"${foodName}"</strong> has been confirmed. Please show your 6-digit pickup code upon arrival at the venue.
                    </p>

                    <div class="code-box">
                        <span style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #047857; letter-spacing: 1px;">Your 6-Digit Pickup Code</span>
                        <div class="code-text">${pickupCode}</div>
                        <span style="font-size: 12px; color: #065f46;">Show this code to donor ${supplierName} at handover.</span>
                    </div>

                    <div class="donor-box">
                        <span style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #64748b; letter-spacing: 0.5px;">Food Donor / Venue Contact</span>
                        <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 4px;">${supplierName}</div>
                        <div style="font-size: 13px; color: #0284c7; margin-top: 2px;">
                            <a href="mailto:${supplierEmail}" style="color: #0284c7; text-decoration: none;">${supplierEmail}</a>
                        </div>
                    </div>

                    <table class="details-table">
                        <tr>
                            <td class="label">Food Item:</td>
                            <td class="value">${foodName}</td>
                        </tr>
                        <tr>
                            <td class="label">Quantity:</td>
                            <td class="value">${quantity} ${unit}</td>
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

                    <p style="font-size: 13px; color: #64748b; margin-top: 24px; line-height: 1.5;">
                        Track your route live or view real-time status on your SurplusShare dashboard. Thank you for rescuing surplus food!
                    </p>
                </div>
                <div class="footer">
                    Sent via SurplusShare • Zero Food Waste Community
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        const transporter = await createTransporter();
        if (!transporter) {
            console.log(`[EMAIL LOG] No SMTP credentials configured. Simulated email to receiver ${receiverEmail} with code ${pickupCode}`);
            return { delivered: false, simulated: true, success: true, reason: 'No SMTP credentials' };
        }

        const info = await transporter.sendMail({
            from: `"SurplusShare" <${fromEmail}>`,
            to: receiverEmail,
            subject,
            html: htmlContent
        });

        console.log(`✓ [EMAIL SENT] Pickup confirmation pass sent to receiver ${receiverEmail} (ID: ${info.messageId})`);
        return { delivered: true, simulated: false, success: true, messageId: info.messageId };
    } catch (error) {
        console.warn(`⚠️ [EMAIL WARNING] Could not dispatch to receiver (${error.message}). Logged to console.`);
        return { delivered: false, simulated: true, success: true, error: error.message };
    }
};

/**
 * Sends a confirmation email to Food Donor when they publish a new food listing.
 */
export const sendListingCreatedAlertToDonor = async ({
    supplierEmail,
    supplierName,
    foodName,
    quantity,
    unit,
    location,
    expiryTime,
    pickupStart,
    pickupEnd
}) => {
    if (!supplierEmail) return { delivered: false, simulated: true, success: false, reason: 'No supplier email' };

    const fromEmail = process.env.EMAIL_USER || process.env.GMAIL_USER || 'notifications@surplusshare.com';
    const formattedExpiry = expiryTime ? new Date(expiryTime).toLocaleString() : 'N/A';
    const formattedStart = pickupStart ? new Date(pickupStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
    const formattedEnd = pickupEnd ? new Date(pickupEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
    const subject = `🍲 Your Surplus Food Listing is Live: "${foodName}" on SurplusShare`;

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
                .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
                .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; padding: 28px; text-align: center; }
                .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
                .content { padding: 32px; }
                .badge { display: inline-block; background: #ecfdf5; color: #047857; padding: 6px 14px; border-radius: 12px; font-weight: 700; font-size: 13px; margin-bottom: 20px; }
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
                    <h1>Food Donation Published!</h1>
                    <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">Your surplus food is now visible to nearby community members.</p>
                </div>
                <div class="content">
                    <span class="badge">✨ Listing Active & Ready</span>
                    <p style="font-size: 16px; line-height: 1.5; margin-top: 0;">
                        Hello <strong>${supplierName}</strong>,
                    </p>
                    <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                        Thank you for contributing to zero food waste! Your surplus listing <strong>"${foodName}"</strong> has been successfully published.
                    </p>

                    <table class="details-table">
                        <tr>
                            <td class="label">Food Item:</td>
                            <td class="value">${foodName}</td>
                        </tr>
                        <tr>
                            <td class="label">Available Quantity:</td>
                            <td class="value">${quantity} ${unit}</td>
                        </tr>
                        <tr>
                            <td class="label">Pickup Venue:</td>
                            <td class="value">${location}</td>
                        </tr>
                        <tr>
                            <td class="label">Pickup Window:</td>
                            <td class="value">${formattedStart} - ${formattedEnd}</td>
                        </tr>
                        <tr>
                            <td class="label">Valid Until:</td>
                            <td class="value">${formattedExpiry}</td>
                        </tr>
                    </table>

                    <p style="font-size: 13px; color: #64748b; margin-top: 24px; line-height: 1.5;">
                        You will receive an instant email notification as soon as a community member reserves these meals.
                    </p>
                </div>
                <div class="footer">
                    Sent via SurplusShare • Empowering Zero Food Waste
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        const transporter = await createTransporter();
        if (!transporter) {
            console.log(`[EMAIL LOG] No SMTP credentials configured. Simulated listing email to ${supplierEmail}`);
            return { delivered: false, simulated: true, success: true, reason: 'No SMTP credentials' };
        }

        const info = await transporter.sendMail({
            from: `"SurplusShare" <${fromEmail}>`,
            to: supplierEmail,
            subject,
            html: htmlContent
        });

        console.log(`✓ [EMAIL SENT] Listing confirmation sent to donor ${supplierEmail} (ID: ${info.messageId})`);
        return { delivered: true, simulated: false, success: true, messageId: info.messageId };
    } catch (error) {
        console.warn(`⚠️ [EMAIL WARNING] Could not dispatch listing email to donor (${error.message}).`);
        return { delivered: false, simulated: true, success: true, error: error.message };
    }
};

/**
 * Sends an instant arrival alert to Food Donor when receiver reaches the pickup venue.
 */
export const sendArrivalAlertToDonor = async ({
    supplierEmail,
    supplierName,
    receiverName,
    receiverEmail,
    foodName,
    pickupCode,
    pickupLocation
}) => {
    if (!supplierEmail) return { delivered: false, simulated: true, success: false, reason: 'No supplier email' };

    const fromEmail = process.env.EMAIL_USER || process.env.GMAIL_USER || 'notifications@surplusshare.com';
    const subject = `🔔 Receiver Arrived at Venue: ${receiverName} is here for "${foodName}" (Code #${pickupCode})`;

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
                .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
                .header { background: linear-gradient(135deg, #e11d48 0%, #be123c 100%); color: #ffffff; padding: 28px; text-align: center; }
                .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
                .content { padding: 32px; }
                .badge { display: inline-block; background: #ffe4e6; color: #be123c; padding: 6px 14px; border-radius: 12px; font-weight: 700; font-size: 13px; margin-bottom: 20px; }
                .code-box { background: #fff1f2; border: 2px dashed #e11d48; border-radius: 16px; padding: 20px; text-align: center; margin: 24px 0; }
                .code-text { font-family: monospace; font-size: 38px; font-weight: 900; letter-spacing: 6px; color: #be123c; margin: 8px 0; }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #94a3b8; background: #f8fafc; border-top: 1px solid #f1f5f9; }
            </style>
        </head>
        <body>
            <div class="card">
                <div class="header">
                    <h1>Receiver Arrived at Pickup Venue!</h1>
                    <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">Please verify the handover code to release the food.</p>
                </div>
                <div class="content">
                    <span class="badge">📍 Arrival Notification</span>
                    <p style="font-size: 16px; line-height: 1.5; margin-top: 0;">
                        Hello <strong>${supplierName}</strong>,
                    </p>
                    <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                        Community member <strong>${receiverName}</strong> (<a href="mailto:${receiverEmail}">${receiverEmail}</a>) has arrived at <strong>${pickupLocation}</strong> to collect <strong>"${foodName}"</strong>.
                    </p>

                    <div class="code-box">
                        <span style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #be123c; letter-spacing: 1px;">Handover Verification Code</span>
                        <div class="code-text">${pickupCode}</div>
                        <span style="font-size: 12px; color: #9f1239;">Match this code with ${receiverName} to complete the food handover.</span>
                    </div>

                    <p style="font-size: 13px; color: #64748b; margin-top: 24px; line-height: 1.5;">
                        Log in to your SurplusShare dashboard or live tracker to verify and release this food parcel.
                    </p>
                </div>
                <div class="footer">
                    Sent via SurplusShare • Zero Food Waste Community
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        const transporter = await createTransporter();
        if (!transporter) {
            console.log(`[EMAIL LOG] No SMTP credentials configured. Simulated arrival alert to ${supplierEmail}`);
            return { delivered: false, simulated: true, success: true, reason: 'No SMTP credentials' };
        }

        const info = await transporter.sendMail({
            from: `"SurplusShare" <${fromEmail}>`,
            to: supplierEmail,
            subject,
            html: htmlContent
        });

        console.log(`✓ [EMAIL SENT] Arrival alert sent to donor ${supplierEmail} (ID: ${info.messageId})`);
        return { delivered: true, simulated: false, success: true, messageId: info.messageId };
    } catch (error) {
        console.warn(`⚠️ [EMAIL WARNING] Could not dispatch arrival alert to donor (${error.message}).`);
        return { delivered: false, simulated: true, success: true, error: error.message };
    }
};


