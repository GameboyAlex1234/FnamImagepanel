export async function handler(event) {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { model } = JSON.parse(event.body);

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO_OWNER = 'GameboyAlex1234';
    const REPO_NAME = 'FnamImagepanel';
    const FILE_PATH = 'screens.json';
    const BRANCH = 'main';

    // Step 1: GET current file to get SHA
    const getRes = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}?ref=${BRANCH}`,
      { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
    );
    const getData = await getRes.json();

    if (!getRes.ok) {
      console.error('GET failed:', getData);
      throw new Error(getData.message || 'Failed to fetch file');
    }

    const sha = getData.sha;

    // Step 2: PUT updated file
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
          sha,
          branch: BRANCH
        })
      }
    );

    const putData = await putRes.json();

    if (!putRes.ok) {
      console.error('PUT failed:', putData);
      throw new Error(putData.message || 'Failed to update file');
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'JSON updated successfully!', putData })
    };
  } catch (err) {
    console.error('Function error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
