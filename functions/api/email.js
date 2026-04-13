export async function onRequest(context) {

    try {
        if (context.request.method !== "POST") {
            console.error("Error sending email: Method Not Allowed");
            return new Response("Error sending email: Method Not Allowed", { status: 405 });
        }

        const contentType = context.request.headers.get("Content-Type") || "";
        if (!contentType.includes("application/x-www-form-urlencoded")) {
            console.error("Error sending email: Invalid Content-Type");
            return new Response("Error sending email: Invalid Content-Type", { status: 400 });
        }

        const formData = await context.request.formData();
        const userEmail = formData.get("email")?.trim();
        const userMessage = formData.get("message")?.trim();

        if (!userEmail || !userMessage) {
            console.error("Error sending email: Missing required fields");
            return new Response("Error sending email: Missing required fields", { status: 400 });
        }

        const cf_formData = new FormData();
        cf_formData.append("secret", context.env.CF_SECRET_KEY);
        cf_formData.append("response", formData.get("cf-turnstile-response"));
        cf_formData.append("remoteip", context.request.headers.get("CF-Connecting-IP"));

        let cloudflare_response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
            method: "POST",
            body: cf_formData
        });
        if (!cloudflare_response.ok) {
            console.error(`Error validating captcha: ${cloudflare_response.status} ${cloudflare_response.statusText}`);
            return new Response("Error validating captcha", { status: 500 });
        }

        cloudflare_response = await cloudflare_response.json();
        if (!cloudflare_response.success) {
            console.error("Error validating captcha");
            return new Response("Error validating captcha", { status: 400 });
        }

        let admin_response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${context.env.RESEND_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: "dhtzs.dev <no-reply@dhtzs.dev>",
                to: "contact@dhtzs.dev",
                reply_to: userEmail,
                subject: `New message from ${userEmail}`,
                text: "A new message was submitted via the dhtzs.dev contact form. The encoded message is attached.",
                attachments: [{
                    content: btoa(userMessage),
                    filename: "message.enc"
                }]
            }),
        });
        if (!admin_response.ok) {
            console.error(`Error sending admin email: ${admin_response.status} ${admin_response.statusText}`);
            return new Response("Error processing your request", { status: 500 });
        }

        let user_response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${context.env.RESEND_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: "dhtzs.dev <no-reply@dhtzs.dev>",
                to: userEmail,
                subject: "We received your message!",
                text: "Hi there,\n\nThanks for reaching out! This is an automated message to confirm that we successfully received your inquiry via dhtzs.dev.\n\nWe will review your message and get back to you shortly."
            }),
        });

        if (!user_response.ok) {
            console.error(`Error sending user auto-reply: ${user_response.status} ${user_response.statusText}`);
        }

        admin_response = await admin_response.json();
        return new Response(JSON.stringify(admin_response), {
            headers: { "Content-Type": "application/json" }
        });
    } catch(e) {
        console.error(e.message);
        return new Response(`Error: ${e.message}`, { status: 500 });
    }

}
