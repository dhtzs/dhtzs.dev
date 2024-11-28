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
        if (!formData.get("email") || !formData.get("message")) {
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

        let resend_response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${context.env.RESEND_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: "dhtzs.dev <sender@dhtzs.dev>",
                to: "contact@dhtzs.dev",
                reply_to: formData.get("email").trim(),
                cc: formData.get("email").trim(),
                subject: "Encrypted message",
                text: "This email contains an encrypted file attachment, representing the message sent from dhtzs.dev. Decrypt the file to view its content.",
                attachments: [{
                    content: btoa(formData.get("message").trim()),
                    filename: "message.enc"
                }]
            }),
        });
        if (!resend_response.ok) {
            console.error(`Error sending email: ${resend_response.status} ${resend_response.statusText}`);
            return new Response("Error sending email", { status: 500 });
        }

        resend_response = await resend_response.json();
        return new Response(JSON.stringify(resend_response), {
            headers: { "Content-Type": "application/json" }
        });
    } catch(e) {
      console.error(e.message);
      return new Response(`Error: ${e.message}`, { status: 500 });
    }

}
