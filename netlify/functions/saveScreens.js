import fetch from 'node-fetch';

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { model } = JSON.parse(event.body);

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO_OWNER = 'GameboyAlex1234'; // replace if needed
    const REPO_NAME = 'FnamImagepanel';   // replace if needed
    const FILE_PATH = 'screens.json';
    const BRANCH = 'main';

    // Get current file SHA
    const getRes = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}?ref=${BRANCH}`,
      { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
    );
    if (!getRes.ok) throw new Error('Failed to fetch current JSON');
    const fileData = await getRes.json();
    const sha = fileData.sha;

    // Update file
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

    if (!putRes.ok) throw new Error('Failed to update GitHub file');

    return { statusCode: 200, body: JSON.stringify({ message: 'JSON updated on GitHub' }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
