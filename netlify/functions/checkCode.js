export async function handler(event) {
  const { code } = JSON.parse(event.body || '{}');

  if (code === process.env.REQUIRED_CODE) {
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } else {
    return { statusCode: 401, body: JSON.stringify({ success: false }) };
  }
}
