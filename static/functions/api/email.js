export async function onRequest(context) {

    try {
        if (context.request.method !== "POST") {
            console.error("Method Not Allowed");
            return new Response("Error: Method Not Allowed", { status: 405 });
        }

        const contentType = context.request.headers.get("Content-Type") || "";
        if (!contentType.includes("application/x-www-form-urlencoded")) {
            console.error("Invalid Content-Type");
            return new Response("Error: Invalid Content-Type", { status: 400 });
        }

        const formData = await context.request.formData();
        if (!formData.get("email") || !formData.get("message")) {
            console.error("Missing required fields");
            return new Response("Error: Missing required fields", { status: 400 });
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
            console.error("Failed to validate captcha");
            return new Response("Failed to validate captcha", { status: 500 });
        }

        cloudflare_response = await cloudflare_response.json();
        if (!cloudflare_response.success) {
            console.error("Failed to validate captcha");
            return new Response("Failed to validate captcha", { status: 400 });
        }

        let resend_response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${context.env.RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: "dhtzs.dev <sender@dhtzs.dev>",
                to: "contact@dhtzs.dev",
                reply_to: formData.get("email").trim(),
                cc: formData.get("email").trim(),
                subject: "dhtzs.dev - Contact Form",
                text: formData.get("message").trim()
            }),
        });
        if (!resend_response.ok) {
            console.error("Failed to send email");
            return new Response("Failed to send email", { status: 500 });
        }

        resend_response = await resend_response.json();
        return new Response(JSON.stringify(resend_response), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (e) {
      console.error(e.message);
      return new Response(`Error: ${e.message}`, { status: 500 });
    }

}
