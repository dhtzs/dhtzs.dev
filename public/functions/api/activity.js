export async function onRequest(context) {

    const param_type = (new URL(context.request.url).searchParams.get("type") || "").toLowerCase().trim();

    if (param_type == "insights") {

        const headers = new Headers({
            "User-Agent": "CloudflareWorker/1.0"
        });

        try {
            let response = await fetch("https://api.lanyard.rest/v1/users/685173086022402060", {
                method: "GET",
                headers: headers
            });
            if (!response.ok) {
                console.error(`Error fetching data from API: ${response.status} ${response.statusText}`);
                return new Response("Error fetching data from API", { status: 500 });
            }

            response = await response.json();
            if (!response.success) {
                console.error("Error fetching data from API");
                return new Response("Error fetching data from API", { status: 400 });
            }

            response = Object.fromEntries(Object.entries(response.data).filter(([_]) => !["kv", "discord_user", "discord_status", "active_on_discord_desktop", "active_on_discord_mobile", "active_on_discord_web"].includes(_)));

            return new Response(JSON.stringify(response), {
                headers: { "Content-Type": "application/json" }
            });
        } catch(e) {
            console.error(e.message);
            return new Response(`Error: ${e.message}`, { status: 500 });
        }

    } else if (param_type == "interactions") {

        const headers = new Headers({
            "User-Agent": "CloudflareWorker/1.0"
        });

        try {
            let response = await fetch(`https://api.github.com/gists/${context.env.GIST_ID}`, {
                method: "GET",
                headers: headers
            });
            if (!response.ok) {
                console.error(`Error fetching data from API: ${response.status} ${response.statusText}`);
                return new Response("Error fetching data from API", { status: 500 });
            }

            response = await response.json();
            if (!response.files || !response.files["activity.log"]) {
                console.error("Error fetching data from API");
                return new Response("Error fetching data from API", { status: 400 });
            }

            return new Response(response.files["activity.log"].content, {
                headers: { "Content-Type": "application/json" }
            });
        } catch(e) {
            console.error(e.message);
            return new Response(`Error: ${e.message}`, { status: 500 });
        }

    } else if (param_type == "reports") {

        const param_platform = (new URL(context.request.url).searchParams.get("platform") || "").toLowerCase().trim();
        const param_maxResults = Math.abs(parseInt(new URL(context.request.url).searchParams.get("max"))) || Number.MAX_SAFE_INTEGER;

        if (param_platform == "hackerone") {

            const headers = new Headers({
                "User-Agent": "CloudflareWorker/1.0",
                "Authorization": "Basic " + btoa("dhtzs:" + context.env.HACKERONE_API_KEY),
                "Accept": "application/json"
            });

            let reports = [];
            let page_size = 100;
            let page_number = 1;

            while (reports.length < param_maxResults) {
                try {
                    let response = await fetch(`https://api.hackerone.com/v1/hackers/me/reports?page[size]=${page_size}&page[number]=${page_number}`, {
                        method: "GET",
                        headers: headers
                    });
                    if (!response.ok) {
                        console.error(`Error fetching data from API: ${response.status} ${response.statusText}`);
                        return new Response("Error fetching data from API", { status: 500 });
                    }
                    response = await response.json();
                    if (!response.data || !Array.isArray(response.data))
                        break;

                    reports.push(...response.data.filter(report => report.attributes.state == "resolved"));

                    if (!response.links || !response.links.next)
                        break;
                    page_number++;
                } catch(e) {
                    console.error(e.message);
                    return new Response(`Error: ${e.message}`, { status: 500 });
                }
            }

            reports = reports.slice(0, param_maxResults).map(report => {
                return Object.fromEntries(Object.entries({
                    bounty_awarded_at: report.attributes.bounty_awarded_at,
                    closed_at: report.attributes.closed_at,
                    created_at: report.attributes.created_at,
                    disclosed_at: report.attributes.disclosed_at,
                    rating: report.relationships.severity.data.attributes.rating,
                    weakness: report.relationships.weakness.data.attributes.name
                }).filter(([, value]) => value !== null))
            });

            return new Response(JSON.stringify(reports), {
                headers: { "Content-Type": "application/json" }
            });

        } else return new Response(JSON.stringify({}), {
            headers: { "Content-Type": "application/json" },
            status: 400
        });

    } else return new Response(JSON.stringify({}), {
        headers: { "Content-Type": "application/json" },
        status: 400
    });

}
