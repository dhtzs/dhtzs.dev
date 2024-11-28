export async function onRequest(context) {

    if (context.request.method === "POST") {
        try {
            const contentType = context.request.headers.get("Content-Type") || "";
            if (!contentType.includes("application/x-www-form-urlencoded")) {
                return new Response("Invalid Content-Type", { status: 400 });
            }

            const formData = await context.request.formData();
            if (!formData.get("name") || !formData.get("email") || !formData.get("message")) {
                return new Response("All fields are required.", { status: 400 });
            }

            const response = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${context.env.RESEND_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    from: "contact@dhtzs.dev",
                    to: "security@dhtzs.dev",
                    subject: "dhtzs.dev - Contact Form",
                    html: formData.get("message")
                }),
            });
            if (!response.ok) {
                console.error("Failed to send email");
                return new Response("Failed to send email", { status: 500 });
            } else {
                return new Response("Thank you for your message!", { status: 200 });
            }
      } catch (error) {
        console.error(`Error: ${error.message}`);
        return new Response(`Error: ${error.message}`, { status: 500 });
      }
    } else return new Response("Method Not Allowed", { status: 405 });

}
