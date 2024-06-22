export async function onRequest(context) {

    const headers = new Headers({
        "User-Agent": "CloudflareWorker/1.0"
    });

    try {
        let response = await fetch(`https://api.github.com/gists/${context.env.GIST_ID}`, {
            method: "GET",
            headers: headers
        });
        if (!response.ok) {
            console.error("Failed to fetch data from API");
            return new Response("Failed to fetch data from API", { status: 500 });
        }

        response = await response.json();
        if (!response.files || !response.files["activity.log"]) {
            console.error("Failed to fetch data from API");
            return new Response("Failed to fetch data from API", { status: 400 });
        }

        return new Response(response.files["activity.log"].content, {
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return new Response(`Error: ${error.message}`, { status: 500 });
    }
}
