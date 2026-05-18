// Thin GitHub Contents API wrapper. We only need to read a file and
// write a new version with a commit, using SHA-based optimistic locking.

const API = "https://api.github.com";

function ghHeaders(env) {
  return {
    accept: "application/vnd.github+json",
    "user-agent": "calderyn-registry-relay",
    authorization: `Bearer ${env.GITHUB_TOKEN}`,
    "x-github-api-version": "2022-11-28",
  };
}

function repoPath(env, file) {
  return `${API}/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${file}?ref=${env.GITHUB_BRANCH}`;
}

// Fetch the current contents + SHA of a file on the configured branch.
export async function getFile(env, file) {
  const res = await fetch(repoPath(env, file), { headers: ghHeaders(env) });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`github get ${res.status}: ${text.slice(0, 300)}`);
  }
  const data = await res.json();
  // GitHub returns base64 content; decode it.
  const content = atob(data.content.replace(/\n/g, ""));
  // Decode UTF-8 properly (data.js has em-dashes, ·, etc.)
  const bytes = Uint8Array.from(content, c => c.charCodeAt(0));
  return {
    sha: data.sha,
    text: new TextDecoder("utf-8").decode(bytes),
  };
}

// Commit a new version of a file. Returns { contentSha, commitSha }.
// Caller is responsible for retrying on 409 (concurrent write) using
// getFile again.
export async function putFile(env, file, newText, currentSha, commitMessage) {
  const encoded = encodeBase64Utf8(newText);
  const res = await fetch(
    `${API}/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${file}`,
    {
      method: "PUT",
      headers: { ...ghHeaders(env), "content-type": "application/json" },
      body: JSON.stringify({
        message: commitMessage,
        content: encoded,
        sha: currentSha,
        branch: env.GITHUB_BRANCH,
      }),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`github put ${res.status}: ${text.slice(0, 300)}`);
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  return { contentSha: data.content?.sha, commitSha: data.commit?.sha };
}

// Update a file with retry on SHA conflict. `mutate(currentText)` returns
// the new text; called fresh on each attempt so it sees the latest file.
// Returns { commitSha, unchanged } — commitSha is undefined when nothing
// changed.
export async function updateFile(env, file, commitMessage, mutate, maxAttempts = 4) {
  let lastErr;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const current = await getFile(env, file);
    const next = mutate(current.text);
    if (next === current.text) return { unchanged: true };
    try {
      const { commitSha } = await putFile(env, file, next, current.sha, commitMessage);
      return { commitSha };
    } catch (err) {
      lastErr = err;
      // 409 = SHA mismatch (someone else wrote between get and put).
      // 422 with "does not match" is the same class. Retry; anything
      // else is fatal.
      if (err.status !== 409 && err.status !== 422) throw err;
    }
  }
  throw lastErr || new Error("updateFile exhausted retries");
}

function encodeBase64Utf8(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}
