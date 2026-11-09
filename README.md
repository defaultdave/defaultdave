# davidfleming.me

```text
                 .-=======++==:.
               :=**#####%%%%%#%+--:.
      .::-=-:-=#+********####%%#**#*=-
     :::--##*#**#%%###%%###*#%%###*###=:
    :+==*#**++*#%%##*#********#%%*****+=-
   :-*###**+*#%%##*++++***#******##*##***-
 .=+*####***#%%#**+--===+++=====+###*****+-
 .+*####**+**##*+=:::------===+=-+#**++#*+*.
 :*##%#**+=====---:::....::::--==-++=+***=**.
 -%#%%%#++=-:::::::..... .:::::====+-=*#*+#%=
 .#@%%%*+=---:::::......  ..::-=:==-:-**####+
  .#@#*+=---::::::...........:--:-=:::+**#+*+
   .*#*+=---:::...............-:--=---=*++=-.
     **==------::::::::-------+++++=---=*=-.
     -***+++++++==--==+****#**#####+----+=:.
     :*#%#######*+---=*###*****###*=-::---.:
      +#**##%%%%%*-..:+*##*#%#**++=::::--:.=.
      =*########**:..:::--=====-:::..::--.-=
      -+*+**+==---:.::::.:---::.....::---.=+
      -+==----:---...::--..........::----.-=
      :+=---:::=+=---==---:......::::----:.:
      :+===----+###*#%%#+:--:::::::::----:.
      .++===---*%@@@%##+=:::::::::::-=---:
      .=+++==+*%%%##***+++++=--------=---:
       -+*++#%%%#**+*++++*#%%#=---====--:
       :=*++%@%#######*+=-==+#*=--===-==:=-.
        -+**#+=+****+*+=-----=*+++++==++*#*+.    :.
        :=+##+++====---:---===++*****##%*++*=    =+=:
         ---*#*****++========*#%%%%####*+*++*=   =++++-.
         .---+**##%%###*+**#%@%%%##%#*+++++++*-  +++++++=---
           ...:*##%%%@@%%%%%%%%##%%#****++++**++==*####%%%##
              .+**######%%%%%#%%%#******+*++*+*++++++%@@@@@@
          .:=*%#***##########%%#********++++******++==+#%@@@
       .-+#%@@@@***########%%#**********++++*****+++++==++*%
  . .-*#%@%%@@@@%*#####*#%%%**********+++++****+++++++++==-=
. .-*%@%%%%@@@@@@####*#%%%***********+++++***++++++++++*####
 -*%%%%%@@%@@@@@@@%%%%%%***#####***++++++****++++++**#%%%%%%
+%%%%%%%%%%@@@@@@@@%%#******######*+++******+++++*#%%%%%%%%%
%#####%%%%%@@@@@@%#**+*********#*++*+*+**********%%%#%%%%%%%
```

Source for [davidfleming.me](https://davidfleming.me), the portfolio of David Fleming: shipped work, performance case studies, writing and music.

Next.js App Router on Vercel, with Keystatic as a git-based CMS and MDX content. The plan and live status are in [`docs/plan/`](docs/plan/STATUS.md).

## Stack

- Next.js (App Router, `src/` layout, fully static) with React 19 and the React Compiler
- TypeScript with `strict` and `exactOptionalPropertyTypes`
- ESLint with typescript-eslint `strict-type-checked`, Prettier, Knip
- Vitest for unit tests, Playwright with axe for the smoke test
- pnpm (pinned in `packageManager`), Node 26 (`.nvmrc`)
- GitHub Actions: CI gates, CodeQL, Gitleaks, OSV-Scanner; Dependabot weekly
- Keystatic CMS and MDX content arrive in the `cms` unit

## Scripts

| Script              | What it does                                                       |
| ------------------- | ------------------------------------------------------------------ |
| `pnpm dev`          | Start the dev server                                               |
| `pnpm build`        | Production build                                                   |
| `pnpm start`        | Serve the production build                                         |
| `pnpm lint`         | ESLint                                                             |
| `pnpm typecheck`    | `next typegen`, then `tsc --noEmit`                                |
| `pnpm test`         | Vitest, one run                                                    |
| `pnpm format`       | Prettier, write                                                    |
| `pnpm format:check` | Prettier, check only                                               |
| `pnpm knip`         | Unused files, exports and dependencies                             |
| `pnpm e2e`          | Playwright smoke test with axe, trace off (run `pnpm build` first) |

First run: `pnpm install`, then `pnpm exec playwright install chromium` for `pnpm e2e`.

## Keystatic locally

Run `pnpm dev` and open `/keystatic` (use `http://127.0.0.1:3000`; Keystatic normalizes `localhost` to it). Edits write straight to `content/` on disk, with no sign-in and no secrets.

On Vercel (production and previews) the admin runs in GitHub mode instead: sign in with GitHub and each save is a commit to the repo through the Keystatic GitHub App. The mode is chosen at build time in `next.config.ts` (`VERCEL` set means GitHub). To try GitHub mode locally, start the dev server with `VERCEL=1 pnpm dev` and set the three variables below in `.env`.

| Variable                         | Where it comes from                        |
| -------------------------------- | ------------------------------------------ |
| `KEYSTATIC_GITHUB_CLIENT_ID`     | The Keystatic GitHub App                   |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | The same App (generate a client secret)    |
| `KEYSTATIC_SECRET`               | Any long random string, used to sign state |

Keep them in the Vercel env store and your local `.env`, nowhere else. `.env.example` lists the names.
