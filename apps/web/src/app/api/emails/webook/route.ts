export async function POST(req: Request) {
  const body = await req.text();
  console.log("Email received", body);

  const decodedData = decodeURIComponent(body);
  console.log("Email decoded", decodedData);

  const modifiedData = decodedData.split("data=")[1];
  console.log("Email modified", modifiedData);

  const jsonBody = JSON.parse(modifiedData);
  console.log("Email received", jsonBody, JSON.stringify(jsonBody, null, 2));
  return new Response("Email received", { status: 200 });
}
