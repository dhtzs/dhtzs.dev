export async function onRequest(context) {

	const param_platform = (new URL(context.request.url).searchParams.get("platform") || "").toLowerCase().trim();;
	const param_maxResults = Math.abs(parseInt(new URL(context.request.url).searchParams.get("max"))) || Number.MAX_SAFE_INTEGER;

	if (param_platform == "hackerone") {

		let reports = [];
		let page_size = 100;
		let page_number = 1;

		const headers = new Headers({
			"Authorization": "Basic " + btoa("dhtzs:" + context.env.HACKERONE_API_KEY),
			"Accept": "application/json"
		});

		while (reports.length < param_maxResults) {
			try {
				let response = await fetch(`https://api.hackerone.com/v1/hackers/me/reports?page[size]=${page_size}&page[number]=${page_number}`, {
					method: "GET",
					headers: headers
				});
				if (!response.ok) {
					console.error(`Failed to fetch data from API: ${response.status} ${response.statusText}`);
					return new Response("Failed to fetch data from API", { status: 500 });
				}

				response = await response.json();
				if (!response.data || !Array.isArray(response.data))
					break;

				reports.push(...response.data.filter(report => report.attributes.state == "resolved"));

				if (!response.links || !response.links.next)
					break;
				page_number++;
			} catch (error) {
				console.error(`Error: ${error.message}`);
				return new Response(`Error: ${error.message}`, { status: 500 });
			}
		}

		reports = reports.slice(0, param_maxResults).map(report => ({
			bounty_awarded_at: report.attributes.bounty_awarded_at,
			closed_at: report.attributes.closed_at,
			created_at: report.attributes.created_at,
			disclosed_at: report.attributes.disclosed_at,
			rating: report.relationships.severity.data.attributes.rating,
			weakness: report.relationships.weakness.data.attributes.name
		}));

		return new Response(JSON.stringify(reports), {
			headers: { "Content-Type": "application/json" }
		});

	} else return new Response(JSON.stringify({}), {
		headers: { "Content-Type": "application/json" },
		status: 400
	});
}
