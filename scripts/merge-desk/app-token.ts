// Mints a one-hour installation token for the defaultdave-agents App and prints only the token (ADR 0001).
// The App is shared across Dave's projects, so the token request names this repo and nothing else: an
// unrestricted token could write to the other projects. Config comes from ~/.config/defaultdave-agents/app.conf;
// the signing-key path is read from there and the key file is read here, never logged.
// Run: node scripts/merge-desk/app-token.ts
import { createSign } from "node:crypto";
import { readFileSync } from "node:fs";
import { userInfo } from "node:os";
import { join } from "node:path";

// The passwd entry, not $HOME: a caller's environment must not redirect where the key is read from.
export const DEFAULT_CONF = join(
  userInfo().homedir,
  ".config",
  "defaultdave-agents",
  "app.conf",
);
/** Repository names (without the owner) the minted token may touch. */
export const TOKEN_REPOSITORIES = ["defaultdave"] as const;

export interface AppConf {
  appId: string;
  clientId: string | null;
  installationId: string;
  keyPath: string;
}

/** Parses KEY=VALUE lines. Required: APP_ID, APP_INSTALLATION_ID, APP_KEY. Optional: APP_CLIENT_ID. */
export function parseConf(text: string): AppConf {
  const values: Record<string, string | undefined> = {};
  for (const line of text.split("\n")) {
    const match = /^\s*([A-Z_]+)=(.*)$/.exec(line);
    if (match?.[1] !== undefined && match[2] !== undefined) {
      values[match[1]] = match[2].trim().replace(/^(["'])(.*)\1$/, "$2");
    }
  }
  const required = (key: string): string => {
    const value = values[key];
    if (!value) throw new Error(`app.conf is missing ${key}`);
    return value;
  };
  return {
    appId: required("APP_ID"),
    clientId: values.APP_CLIENT_ID ?? null,
    installationId: required("APP_INSTALLATION_ID"),
    keyPath: required("APP_KEY").replace(/^~(?=\/)/, userInfo().homedir),
  };
}

const b64url = (input: string | Buffer) =>
  Buffer.from(input).toString("base64url");

/** RS256 JWT for the App: iat 60 s back, exp 9 min ahead, iss the Client ID or else the App ID. */
export function signAppJwt(
  conf: AppConf,
  signingKeyPem: string,
  nowSeconds: number,
): string {
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = b64url(
    JSON.stringify({
      iat: nowSeconds - 60,
      exp: nowSeconds + 9 * 60,
      iss: conf.clientId ?? conf.appId,
    }),
  );
  const signature = createSign("RSA-SHA256")
    .update(`${header}.${payload}`)
    .sign(signingKeyPem);
  return `${header}.${payload}.${b64url(signature)}`;
}

export interface MintOptions {
  confPath?: string;
  fetch?: typeof fetch;
  now?: () => number;
}

interface TokenReply {
  token?: string;
  repositories?: { name?: string }[];
}

export async function mintToken(options: MintOptions = {}): Promise<string> {
  const conf = parseConf(
    readFileSync(
      options.confPath ?? process.env.DEFAULTDAVE_APP_CONF ?? DEFAULT_CONF,
      "utf8",
    ),
  );
  const now = options.now?.() ?? Math.floor(Date.now() / 1000);
  const jwt = signAppJwt(conf, readFileSync(conf.keyPath, "utf8"), now);
  const response = await (options.fetch ?? fetch)(
    `https://api.github.com/app/installations/${conf.installationId}/access_tokens`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({ repositories: TOKEN_REPOSITORIES }),
    },
  );
  if (!response.ok) {
    throw new Error(
      `GitHub refused the token request: HTTP ${String(response.status)}`,
    );
  }
  const body = (await response.json()) as TokenReply;
  if (!body.token) throw new Error("GitHub's reply had no token");
  const allowed: readonly (string | undefined)[] = TOKEN_REPOSITORIES;
  if (
    body.repositories?.some((repository) => !allowed.includes(repository.name))
  ) {
    throw new Error(
      "GitHub granted the token more repositories than requested; discarding it",
    );
  }
  return body.token;
}

if (import.meta.main) {
  try {
    process.stdout.write(`${await mintToken()}\n`);
  } catch (error) {
    console.error((error as Error).message);
    process.exit(1);
  }
}
