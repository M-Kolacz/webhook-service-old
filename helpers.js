const fetch = require("node-fetch");

const { REST_API, TOKEN } = process.env;

function getStatus(build) {
  switch (build.status) {
    case "FAILED":
      return {
        state: "error",
        description:
          "Build ${build.number} has suffered a system error. Please try again.",
      };

    case "BROKEN":
      return {
        state: "failure",
        description: `Build ${build.number} failed to render.`,
      };
    case "DENIED":
      return {
        state: "failure",
        description: `Build ${build.number} denied.`,
      };
    case "PENDING":
      return {
        state: "pending",
        description: `Build ${build.number} has ${build.changeCount} changes that must be accepted`,
      };
    case "ACCEPTED":
      return {
        state: "success",
        description: `Build ${build.number} accepted.`,
      };
    case "PASSED":
      return {
        state: "success",
        description: `Build ${build.number} passed unchanged.`,
      };
  }

  return {
    context: "UI Tests",
  };
}

export async function setCommitStatus(build, { repoId, name }) {
  const status = getStatus(build);

  const body = JSON.stringify({
    context: name ? `UI Tests (${name})` : "UI Tests",
    target_url: build.webUrl,
    ...status,
  });

  console.log(
    `POSTING to ${REST_API}repositories/${repoId}/statuses/${build.commit}`
  );

  const result = await fetch(
    `${REST_API}repositories/${repoId}/statuses/${build.commit}`,
    {
      method: "POST",
      body,
      headers: { Authorization: `Bearer ${TOKEN}` },
    }
  );

  console.log(result);
  console.log(await result.text());
}
