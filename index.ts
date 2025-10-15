function handlePreFlightRequest(): Response {
  return new Response("Preflight OK!", {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "content-type",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    },
  });
}

async function handler(_req: Request): Promise<Response> {
  if (_req.method === "OPTIONS") {
    return handlePreFlightRequest();
  }


  const headers = new Headers();
  headers.append("Content-Type", "application/json");

  const url = new URL(_req.url);
  const word = decodeURIComponent(url.pathname.split("/").pop() || "");

  console.log("User input word:", word);

  if (!word) {
    return new Response(JSON.stringify({ error: "Missing word in URL" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  const similarityRequestBody = JSON.stringify({
    word1: word,
    word2: "supelec",
  });

  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: similarityRequestBody,
  };

  try {
    const response = await fetch("https://word2vec.nicolasfley.fr/similarity", requestOptions);

    if (!response.ok) {
      console.error("Similarity API error:", response.statusText);
      return new Response(
        JSON.stringify({ error: response.statusText }),
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const result = await response.json();

    return new Response(JSON.stringify({value: result.result }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Fetch error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    });
  }
}

Deno.serve(handler);