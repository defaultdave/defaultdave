import { createVerify, generateKeyPairSync } from "node:crypto";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir, userInfo } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  mintToken,
  parseConf,
  signAppJwt,
  TOKEN_REPOSITORIES,
} from "./app-token";

// A throwaway keypair made for these tests; the real App key is never read here.
const pair = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
  publicKeyEncoding: { type: "spki", format: "pem" },
});

function setup(conf: string) {
  const dir = mkdtempSync(join(tmpdir(), "app-token-"));
  const keyFile = join(dir, "test-signing-key");
  writeFileSync(keyFile, pair.privateKey);
  const confPath = join(dir, "app.conf");
  writeFileSync(confPath, conf.replace("KEYFILE", keyFile));
  return confPath;
}

const decode = (part: string | undefined) =>
  JSON.parse(Buffer.from(part ?? "", "base64url").toString()) as Record<
    string,
    unknown
  >;
const MINIMAL = "APP_ID=123\nAPP_INSTALLATION_ID=456\nAPP_KEY=/k\n";
const CONF = "APP_ID=123\nAPP_INSTALLATION_ID=456\nAPP_KEY=KEYFILE\n";

function capture(reply: Response) {
  const seen: { url: string; init: RequestInit }[] = [];
  const fake = ((url: string, init: RequestInit) => {
    seen.push({ url, init });
    return Promise.resolve(reply);
  }) as unknown as typeof fetch;
  return { fake, seen };
}

describe("parseConf", () => {
  it("reads the ids and the key path, and treats a missing Client ID as null", () => {
    expect(parseConf(MINIMAL)).toEqual({
      appId: "123",
      clientId: null,
      installationId: "456",
      keyPath: "/k",
    });
  });

  it("strips quotes and expands ~ in the key path", () => {
    const conf = parseConf(
      'APP_ID="1"\nAPP_INSTALLATION_ID=2\nAPP_KEY=~/k.pem\n',
    );
    expect(conf.appId).toBe("1");
    expect(conf.keyPath.endsWith("/k.pem")).toBe(true);
    expect(conf.keyPath.startsWith("~")).toBe(false);
  });

  it.each(["APP_ID", "APP_INSTALLATION_ID", "APP_KEY"])(
    "rejects a file missing %s",
    (key) => {
      const lines = MINIMAL.split("\n").filter((line) => !line.startsWith(key));
      expect(() => parseConf(lines.join("\n"))).toThrow(key);
    },
  );
});

describe("signAppJwt", () => {
  it("is RS256, backdated 60 s, lives 9 min, and verifies against the public key", () => {
    const jwt = signAppJwt(parseConf(MINIMAL), pair.privateKey, 1_000_000);
    const [header, payload, signature] = jwt.split(".");
    expect(decode(header)).toEqual({ alg: "RS256", typ: "JWT" });
    expect(decode(payload)).toEqual({
      iat: 999_940,
      exp: 1_000_540,
      iss: "123",
    });
    const valid = createVerify("RSA-SHA256")
      .update(`${header ?? ""}.${payload ?? ""}`)
      .verify(pair.publicKey, Buffer.from(signature ?? "", "base64url"));
    expect(valid).toBe(true);
  });

  it("uses the Client ID as issuer when one is recorded", () => {
    const conf = parseConf(`${MINIMAL}APP_CLIENT_ID=Iv1.abc\n`);
    expect(decode(signAppJwt(conf, pair.privateKey, 0).split(".")[1]).iss).toBe(
      "Iv1.abc",
    );
  });
});

describe("mintToken", () => {
  it("posts to the installation endpoint with the JWT and returns only the token", async () => {
    const { fake, seen } = capture(
      new Response(JSON.stringify({ token: "ghs_fake" }), { status: 201 }),
    );
    const token = await mintToken({
      confPath: setup(CONF),
      fetch: fake,
      now: () => 1_000_000,
    });
    expect(token).toBe("ghs_fake");
    expect(seen[0]?.url).toBe(
      "https://api.github.com/app/installations/456/access_tokens",
    );
    expect(seen[0]?.init.method).toBe("POST");
    const auth =
      (seen[0]?.init.headers as Record<string, string>).Authorization ?? "";
    expect(auth.startsWith("Bearer ")).toBe(true);
    expect(decode(auth.slice(7).split(".")[1]).iss).toBe("123");
  });

  it("restricts the token to defaultdave/defaultdave in the request body", async () => {
    const { fake, seen } = capture(
      new Response(JSON.stringify({ token: "ghs_fake" }), { status: 201 }),
    );
    await mintToken({ confPath: setup(CONF), fetch: fake });
    expect(JSON.parse(seen[0]?.init.body as string)).toEqual({
      repositories: ["defaultdave"],
    });
    expect([...TOKEN_REPOSITORIES]).toEqual(["defaultdave"]);
  });

  it("discards a token that GitHub scoped to other repositories", async () => {
    const reply = {
      token: "ghs_wide",
      repositories: [{ name: "defaultdave" }, { name: "ramble" }],
    };
    const { fake } = capture(
      new Response(JSON.stringify(reply), { status: 201 }),
    );
    await expect(
      mintToken({ confPath: setup(CONF), fetch: fake }),
    ).rejects.toThrow("more repositories");
  });

  it("accepts a reply that lists only this repository", async () => {
    const reply = { token: "ghs_ok", repositories: [{ name: "defaultdave" }] };
    const { fake } = capture(
      new Response(JSON.stringify(reply), { status: 201 }),
    );
    await expect(
      mintToken({ confPath: setup(CONF), fetch: fake }),
    ).resolves.toBe("ghs_ok");
  });

  it("fails with the status and nothing else when GitHub refuses", async () => {
    const { fake } = capture(
      new Response('{"message":"Bad credentials"}', { status: 401 }),
    );
    const error = await mintToken({ confPath: setup(CONF), fetch: fake }).catch(
      (e: unknown) => e,
    );
    expect((error as Error).message).toBe(
      "GitHub refused the token request: HTTP 401",
    );
  });

  it("fails when the reply has no token", async () => {
    const { fake } = capture(new Response("{}", { status: 201 }));
    await expect(
      mintToken({ confPath: setup(CONF), fetch: fake }),
    ).rejects.toThrow("no token");
  });
});

describe("home directory", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("resolves DEFAULT_CONF and a ~/ APP_KEY from the passwd entry, whatever HOME says", async () => {
    vi.stubEnv("HOME", "/evil");
    vi.resetModules();
    const fresh = await import("./app-token");
    const home = userInfo().homedir;
    expect(fresh.DEFAULT_CONF).toBe(
      `${home}/.config/defaultdave-agents/app.conf`,
    );
    const conf = fresh.parseConf(
      "APP_ID=1\nAPP_INSTALLATION_ID=2\nAPP_KEY=~/k.pem\n",
    );
    expect(conf.keyPath).toBe(`${home}/k.pem`);
  });
});
