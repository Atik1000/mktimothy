import { NextResponse } from "next/server";
import { emailService } from "@/lib/services/email";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const data: Record<string, string> = {};
    const attachments: Array<{ filename: string; content: Buffer; contentType: string }> = [];

    // Parse formData fields and files
    const entries = Array.from(formData.entries());
    for (const [key, value] of entries) {
      if (value instanceof File) {
        if (value.size > 0) {
          const buffer = Buffer.from(await value.arrayBuffer());
          attachments.push({
            filename: value.name,
            content: buffer,
            contentType: value.type,
          });
        }
      } else {
        data[key] = value.toString();
      }
    }
    
    // Construct the email body based on the submitted form data
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Abuse Report</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f7f6; }
            .container { max-width: 650px; margin: 20px auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
            .header { background: linear-gradient(135deg, #1a1a2e, #16213e); color: white; padding: 25px 30px; border-bottom: 4px solid #FF5F00; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px; }
            .header p { margin: 5px 0 0 0; font-size: 14px; opacity: 0.9; color: #e2e8f0; }
            .content { padding: 30px; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 18px; color: #1a1a2e; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #f1f5f9; font-weight: 600; }
            .field { margin-bottom: 12px; }
            .field-label { font-weight: 600; color: #475569; font-size: 14px; display: block; margin-bottom: 4px; }
            .field-value { background: #f8fafc; padding: 10px 15px; border-radius: 6px; border: 1px solid #e2e8f0; font-size: 15px; color: #1e293b; word-break: break-word; }
            .field-value pre { margin: 0; font-family: inherit; white-space: pre-wrap; font-size: 14px; }
            .badge { display: inline-block; background: #FF5F00; color: white; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
            .footer { background: #f1f5f9; padding: 20px 30px; text-align: center; color: #64748b; font-size: 13px; }
            .attachment-notice { background: #fff7ed; border-left: 4px solid #f97316; padding: 15px; margin-top: 20px; border-radius: 0 6px 6px 0; color: #9a3412; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🛡️ New Abuse Report Submitted</h1>
              <p>A new <strong>${data.selectedType}</strong> abuse report has been securely logged.</p>
            </div>
            
            <div class="content">
              <div class="section">
                <div style="margin-bottom: 20px;">
                  <span class="field-label">Report Category</span>
                  <span class="badge">${data.selectedType.replace(/-/g, ' ')}</span>
                </div>
              </div>

              <div class="section">
                <h2 class="section-title">General Information</h2>
                <div class="field">
                  <span class="field-label">Full Name</span>
                  <div class="field-value">${data.fullName || "Not provided"}</div>
                </div>
                <div class="field">
                  <span class="field-label">Email Address</span>
                  <div class="field-value">${data.email || "Not provided"}</div>
                </div>
                <div class="field">
                  <span class="field-label">Phone Number</span>
                  <div class="field-value">${data.phone || "Not provided"}</div>
                </div>
              </div>

              <div class="section">
                <h2 class="section-title">Case Details</h2>
                ${Object.entries(data)
                  .filter(([key, value]) => !['selectedType', 'fullName', 'email', 'confirmEmail', 'phone'].includes(key) && value)
                  .map(([key, value]) => `
                    <div class="field">
                      <span class="field-label">${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                      <div class="field-value">${key === 'emailHeaders' || key === 'messageBody' || key === 'description' ? `<pre>${value}</pre>` : value}</div>
                    </div>
                  `)
                  .join('')}
              </div>

              ${attachments.length > 0 ? `
                <div class="attachment-notice">
                  <strong>📎 Attachments Included:</strong> This report includes ${attachments.length} attached file(s). Please check the email attachments to view the evidence.
                </div>
              ` : `
                <div class="attachment-notice" style="background: #f8fafc; border-left-color: #cbd5e1; color: #475569;">
                  No evidentiary files were attached to this report.
                </div>
              `}
            </div>

            <div class="footer">
              This is an automated system message from Mk Timothy & Company.
            </div>
          </div>
        </body>
      </html>
    `;

    // Send the email to the admin/support email
    const success = await emailService.sendEmail({
      to: "support@mktimothy.com", // You can change this to your desired recipient
      subject: `[ABUSE REPORT] ${data.selectedType.toUpperCase()} - from ${data.fullName || "Unknown"}`,
      html: emailHtml,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    if (success) {
      return NextResponse.json({ success: true, message: "Report submitted successfully." });
    } else {
      return NextResponse.json({ success: false, message: "Failed to send report email." }, { status: 500 });
    }
  } catch (error) {
    console.error("Error submitting report:", error);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}
