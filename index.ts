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
  console.log(_req)
  if (_req.method === "OPTIONS") {
    return handlePreFlightRequest(); 
  }

  const headers = new Headers();
  headers.append("Content-Type", "application/json");

  const url = new URL(_req.url);
  let word = url.pathname.split("/").pop() || "";
  word = decodeURIComponent(word);

  console.log("User input word:", word);

  const similarityRequestBody = JSON.stringify({
    word1: word,
    word2: "supelec",
  });

  const requestOptions = {
    method: "POST",
    headers,
    body: similarityRequestBody,
    redirect: "follow",
  };

  try {
    const response = await fetch("https://word2vec.nicolasfley.fr/similarity", requestOptions);

    if (!response.ok) {
      console.error(`Error: ${response.statusText}`);
      return new Response(`Error: ${response.statusText}`, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "content-type",
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        },
      });
    }

    const result = await response.json();
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "content-type",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Fetch error:", message);
    return new Response(`Error: ${message}`, {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}

Deno.serve(handler);