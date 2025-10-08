import fetch from 'node-fetch';

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { model } = JSON.parse(event.body);

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO_OWNER = 'GameboyAlex1234'; // your GitHub username
    const REPO_NAME = 'FnamImagepanel';   // your repo name
    const FILE_PATH = 'screens.json';     // adjust if file is in a folder
    const BRANCH = 'main';                // your branch

    // 1️⃣ Get current file SHA
    const getRes = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}?ref=${BRANCH}`,
      { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
    );

    const fileData = await getRes.json();
    console.log('GET response status:', getRes.status);
    console.log('GET response body:', fileData);

    if (!getRes.ok) {
      throw new Error(`GitHub GET failed: ${fileData.message || 'Unknown error'}`);
    }

    const sha = fileData.sha;

    // 2️⃣ Update the file
    const putRes = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Update screens.json via Admin Panel',
          content: Buffer.from(JSON.stringify(model, null, 2)).toString('base64'),
          sha: sha,
          branch: BRANCH
        })
      }
    );

    const putData = await putRes.json();
    console.log('PUT response status:', putRes.status);
    console.log('PUT response body:', putData);

    if (!putRes.ok) {
      throw new Error(`GitHub PUT failed: ${putData.message || 'Unknown error'}`);
    }

    return { statusCode: 200, body: JSON.stringify({ message: 'JSON updated on GitHub', putData }) };
  } catch (err) {
    console.error('Error in saveScreens:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
