# Royaleexch / Betexch999 — User Frontend

Single-page **Angular 18** client for an online sports-betting + casino exchange platform.
This repo is the **player-facing web app only**; all data, odds, bet settlement, wallet and
game round logic live in a separate backend (`environment.backendURI`) and realtime feed
services (`environment.socketURI`, `environment.cvideoURI`).

> **White-label note:** the git folder is `royaleexch-user`, but `angular.json`, `src/index.html`
> and `src/environments/*` are currently wired to the **BETEXCH999** brand
> (`backend.betexch999.com`, `dist/betexch999-user`, title `BETEXCH999`). Re-skinning = change
> `src/environments/*.ts`, `src/index.html`, `public/img/logo.png`, `angular.json > outputPath`.

---

## 1. How to read this file

This README is the **architecture map**. It explains how the pieces connect so an AI (or new
dev) can act without re-scanning all ~130 components. Section 4 (Runtime flow) and Section 6
(Services) are the core. Individual game components are near-identical clones — understand one
(`src/app/casino/teen20/`) and you understand all 62.

---

## 2. Tech stack

| Concern | Choice |
|---|---|
| Framework | Angular 18.2, **standalone components** (no NgModules), `bootstrapApplication` |
| Routing | `@angular/router`, single flat route table in `src/app/app.routes.ts` |
| HTTP | `@angular/common/http` + one global interceptor (`TokenInterceptorService`) |
| Realtime | `socket.io-client` v4 (`src/app/services/socket.service.ts`) |
| Auth token | JWT in `localStorage['token']`, decoded client-side via `@auth0/angular-jwt` |
| Crypto | `crypto-js` AES — **every API request/response body is AES-encrypted** with a static key |
| UI libs | Bootstrap 5 + `@ng-bootstrap/ng-bootstrap` (modals), `ngx-toastr` (toasts), FontAwesome |
| jQuery libs | `bootstrap-datepicker`, `flipdown` (casino countdown), `slick-carousel`, Google Charts — loaded globally, used via `declare var $` |
| Build out | `dist/betexch999-user/browser` |

No SSR at runtime (`provideClientHydration()` is configured but app is served as static SPA).

---

## 3. Folder / file structure

```
src/
├── main.ts                     # bootstrap → appConfig + AppComponent
├── index.html                  # <app-root>, brand <title>, favicon
├── styles.css                  # ~200KB global stylesheet (main theme)
├── environments/
│   ├── environment.ts          # dev  (backendURI/socketURI/cvideoURI/kk AES key)
│   └── environment.prod.ts     # prod (swapped in by angular.json fileReplacements)
├── assets/                     # fonts + css/custom.css, css/responsive.css
└── app/
    ├── app.component.ts        # root shell = <router-outlet> only; calls auth.autoAuth()
    ├── app.config.ts           # ApplicationConfig: providers (router, http, interceptor, toastr…)
    ├── app.routes.ts           # THE route table (see §5)
    │
    ├── services/               # ← all cross-cutting logic lives here (§6)
    │   ├── userauth.service.ts     # auth, wallet cache, AES helpers, ALL bet-placement calls
    │   ├── match.service.ts        # match/odds list feeds, casino results, aggregator game lists
    │   ├── socket.service.ts       # socket.io connections + typed observable wrappers
    │   └── token.service.ts        # TokenInterceptorService (HTTP encrypt/decrypt + auth header)
    ├── guards/
    │   └── auth.guard.ts           # AuthGuard — gate for nearly every route
    ├── pipes/
    │   └── short-number.pipe.ts    # 1000 → "1K", 100000 → "1L"
    │
    ├── header/  footer/  sidebar/  mmenutab/  container/   # shared layout chrome (§7)
    │
    ├── login/            # username/password login
    ├── loginauth/        # 2FA 6-digit PIN entry step (during login)
    ├── secure-auth/      # enable/disable 2FA from the account menu
    ├── changepassword/   # FORCED change on first login (localStorage['first'])
    ├── cpass-home/       # normal "change password" page
    │
    ├── home/             # landing: live sports list, tab per sport, 5s polling
    ├── all-sports/       # /all-sports/:sportId — single-sport list view
    │
    ├── game-details/         # CRICKET betting screen (sportId 4) — reference implementation
    ├── gamedetail-football/  # sportId 1
    ├── gamedetail-tennis/    # sportId 2
    ├── gamedetail-politics/  # sportId 40
    ├── gamedetail-kabaddi/   # sportId 66
    ├── gamedetail-horse/     # sportId 10
    ├── gamedetail-greyhound/ # sportId 65
    ├── virtual-cricket/      # virtual T10 cricket (sportId 4 virtual)
    │
    ├── casino/                   # PROPRIETARY live-dealt casino
    │   ├── casino.component.*        # layout shell (header/sidebar/footer + <router-outlet>)
    │   ├── teen20/ dt20/ lucky7/ aaa/ …  (62 game dirs — one component each)
    │   ├── aviator/                  # crash game, OWN socket.io + canvas/RAF animation (special)
    │   └── cvideo/                   # bare casino video iframe page
    │
    ├── casino-list/          # curated grid → links to internal /casino/* games
    ├── live-casino-list/     # 3rd-party aggregator: Evolution/Creedroomz/… (section 'live')
    ├── casino-list-virtual/  # aggregator virtual games (route LC/19)
    ├── slot-list/            # aggregator slots  (section 'slot')
    ├── virtual-list/         # aggregator virtual (section 'virtual')
    ├── crash-list/           # aggregator crash  (section 'crash')
    ├── fantasy-list/         # aggregator fantasy (section 'fantasy')
    ├── mac88/                # single aggregator game in fullscreen iframe (route int-play/:gameId)
    ├── clist/                # static alt casino menu
    │
    ├── account-statement/    # ledger + drill-down statement detail (modal)
    ├── current-bet/          # open/settled bet history, paginated
    ├── casino-results/       # casino round results browser + result-detail modal
    ├── activity-logs/        # login / bet / transaction activity logs
    ├── live-casino-bets/     # 3rd-party casino bet report
    └── googlechart/googlechart.js   # vendored Google Charts (referenced by angular.json scripts)
```

`public/` = static assets copied verbatim to build root: `img/cards/*`, `img/casino-rules/*`,
`img/flags/*`, `audio/*` (aviator sounds), `img/logo.png`, `favicon.ico`.

---

## 4. Runtime flow (the important part)

### 4.1 Bootstrap
`main.ts` → `bootstrapApplication(AppComponent, appConfig)`.
`app.config.ts` registers: `provideRouter(routes)`, `provideHttpClient(withInterceptorsFromDi())`,
`JwtHelperService`, `TokenInterceptorService` as `HTTP_INTERCEPTORS`, `provideAnimations()`,
`provideToastr()`, `provideClientHydration()`.
`AppComponent` template is just `<router-outlet>`. Its `ngOnInit()` calls
`UserauthService.autoAuth()` which sets `isAuthenticated = true` iff a non-expired JWT is in
`localStorage`.

### 4.2 Auth gate
Every meaningful route has `canActivate: [AuthGuard]`. `AuthGuard.canActivate()`:
1. No token **or** `authStatus() === false` → redirect `/login`, block.
2. If `localStorage['first']` is set (server said password must be changed) → force-redirect to
   `/changepasswordlogin` unless already there.
3. Otherwise allow.

### 4.3 Login
`LoginComponent.loginuser()` → `UserauthService.loginuser()` → `POST /userlogin`.
Response branches:
- `res.secAuth` truthy → stash `username`, route to `/loginauth/2` (2FA). `LoginauthComponent`
  collects a 6-digit PIN → `POST /validatesecuritycode` → on success `setToken(res.token)` → `/home`.
- `res.firstpass` truthy → `setToken`, set `localStorage['first']='true'`, route to
  `/changepasswordlogin` (`ChangepasswordComponent`, forced strong-password change).
- else → `setToken(res.token, true)`, clear `first`, route to `/home`.

`setToken` writes `localStorage['token']` and flips `isAuthenticated`.
There is a hard-coded **demo login** button (`Demo` / `User@123`).

### 4.4 The HTTP envelope (applies to ALL backend calls)
`TokenInterceptorService.intercept()` wraps every request:
- Adds header `Authorization: <raw JWT>` (no `Bearer` prefix).
- Replaces the body with `{ data: AES_encrypt(originalBody) }` using
  `CryptoJS.AES.encrypt(JSON.stringify(body), environment.kk)`.
- On response: expects `{ data: <ciphertext> }`, decrypts it, and hands the **plaintext object**
  back to the caller (components never see ciphertext).
- On error: if decrypted error payload has `logout: true` → `UserauthService.logOut()`.
- **Escape hatch:** a request carrying header `Skip-Interceptor: true` keeps the auth header but
  skips encrypt/decrypt (used only by `logOut()`'s `POST /logout` blocklist call).

`environment.kk` is a **static shared secret** (`"Yr]M[uA>%C(#5{!bNcS29JHd;*7'LK+R"`), identical
dev/prod. The same key also decrypts some socket payloads (see §6.3 `updateCheck`).

### 4.5 Home / sports listing
`HomeComponent` holds `navItems[]` (sport tabs). `ngOnInit` starts a **5s `setInterval`** calling
`getmatch()`, which — based on the active tab — calls the matching `MatchService.getXxxMatches()`
(`getcricketmatches`, `getsoccermatches`, `gettennismatches`, `getkabaddimatches`,
`gethorseracingmatches`, `getgreyhoundracingmatches`, …). Interval self-clears when the token
disappears. Match rows link to `/game-details/<sportId>/<eventId>`.
`AllSportsComponent` is the same idea for one sport via `/all-sports/:sportId`.

### 4.6 Sports betting screen (reference: `game-details/` — cricket, sportId 4)
`GameDetailsComponent` is the template every `gamedetail-*` component follows:

1. `ngOnInit`: read `:gameid` param → `MatchService.getMatchDetail(eventId)` for name/date/tv.
2. `getLiveTvURL()` → `MatchService.getOthersTvURL()` → sanitized iframe URL (desktop vs mobile).
3. `socketEmit()`:
   - `SocketService.gamedata('Market', eventId)` → stream of odds. The big `for` loop buckets
     `data[i].mname` into typed arrays: `match_odds` (`MATCH_ODDS`/`TOURNAMENT_WINNER`),
     `bookmaker`, `bookmaker2`, `normal_fancy` (`Normal`), `ballbyball`, `overbyover`, `fancy1`,
     `oddeven`, `meter`, `khado`, `completed_match`(+`_bm`), `tied_match`(+`_bm`), `bm10over`
     (`10 over Bookmaker`), plus `cricket_casino` = rows with `gtype == 'cricketcasino'`.
   - `SocketService.scoredata('Score', eventId)` → live scoreboard fields.
4. A 3s watchdog `setInterval` re-emits the socket if no `Market` packet arrived in the last 3s.
5. `marketNotAvailable()`: if no market data after 8s → toast + redirect `/home`.
6. **Placing a bet:** `openBetForm(...)` sets `betFor/rate/betType/oddsType/sid/oname/min/max`
   → `calcProfit()` computes a *pre-book* (projected P/L per selection, per market type) shown to
   the user → `betsubmit()` builds `dt = {eventid, eventname, betfor, bettype, oddstype, rate,
   stake, sid, oname, isCashout}` → `UserauthService.placebet(dt)` (or `placewbet` when
   `mType === 'winner'`) → on success: toast, then after 1s refresh balance + `getOpenBets()`.
7. **Books / exposure:** `getOpenBets()` → `UserauthService.getopenbet(eventId)` returns
   `{openbets, books}`; books are split by `oddsType` into `matchOddsBook`, `bookmakerBook`,
   `bm2Book`, `TMBook`, `CMBook`, and fancy/khado/meter/oddeven reduced into keyed maps.
8. **Cashout:** `clickCashout()` inspects the current book (highest/lowest projected amount),
   picks a back/lay side + rate to flatten exposure, pre-fills the bet form with `isCashout=true`.
9. `ratePlus/rateMinus` step odds using `calculateIncrement()` (betfair-style tick ladder).
10. Stake quick-buttons come from `UserauthService.getButtons()` (`gamebutton` / `casinobutton`
    arrays); editable via the "button settings" modal → `updateButtons()`.

Per-sport variants differ only in **market names parsed** and the **`placeXxxBet` /
`getXxxOpenBet`** method used (football has `over_under`, `correct_score`, `ht_ft`, `corners`, …;
tennis/kabaddi/etc. are lighter). `virtual-cricket` uses `placeVirtualT10Bet`.

### 4.7 Proprietary casino (reference: `casino/teen20/`)
Route `/casino/*` renders `CasinoComponent` (chrome + `<router-outlet>`); each child route
(`teen20`, `dt20`, `lucky7`, `aaa`, `war`, `queen`, `poker6`, `roulette13`, …) is a self-contained
component:

1. Casino video: `MatchService.getCasinoVideo()` returns `environment.cvideoURI` (or a dummy for
   user `demo`); embedded as sanitized iframe `<cvideoURI>?id=<streamId>`.
2. `SocketService.casinodata('Casino', '<matchcode>')` → per-round data: `t1` (round meta:
   `mid` = roundId, `autotime` = countdown, card codes `C1..C6`), `t2` (rate/min/max/`gstatus`
   per betting option). Card images resolved as `/img/cards/<code>.png`.
3. `SocketService.casinolast10('Last10', '<matchcode>')` → recent results strip.
4. `SocketService.updateCheck('User', username)` → on `{update:true}` refresh balance + open bets.
5. Flip-clock countdown driven by `autotime` via `updateClock()` / `flipdown`-style digits.
6. **Bet:** `openBetForm()` → `submitbet()` builds `{roundid, matchcode, matchname, betfor,
   bettype:'back', oddstype, odds, stake, sid}` → `UserauthService.placeCasinoBet()`.
7. **Books:** `UserauthService.getCasinoOpenBet(matchcode, roundId)` → `{openbets, books}`, books
   split by `oddsType` (e.g. `Winner`, `APairPlus`, `BPairPlus`).
8. **Results modal:** `MatchService.getResult(roundId)` → winner + card list.
9. On new `roundId`, per-round book/bet arrays are cleared.

`aviator/` is the **exception**: it opens its **own** `socket.io` connections
(`gameSocket = environment.socketURI`, `siteSocket = environment.backendURI`), runs a
`requestAnimationFrame` plane animation with preloaded `public/audio/*` sounds, supports
2 bet panels with auto-bet / auto-cashout, and calls `UserauthService.placebetAviator /
cashoutAviator / cancelbetAviator / getGameHistory`.
⚠️ The `/casino/aviator` child route is **commented out** in `app.routes.ts:201`, so header links
to it currently fall through to the `**` wildcard → `/home`. Re-enable that line to ship it.

### 4.8 Third-party aggregator games (external iframe)
`live-casino-list`, `casino-list-virtual`, `slot-list`, `virtual-list`, `crash-list`,
`fantasy-list` all share one pattern:

1. `MatchService.get{LiveCasino|Slot|Virtual|Crash|Fantasy}Games()` →
   `POST /livecasino-v1/getallgames { section: 'live'|'slot'|'virtual'|'crash'|'fantasy' }`.
   Response `res.data` = flat game list (`game_id`, `game_name`, `category_normalized`,
   `sub_provider_name`, `url_thumb`, …).
2. `buildNav()` groups games by `sub_provider_name` → top tabs, then by `category_normalized`
   → sub-tabs. Ordering: `PROVIDER_SORT_ORDER` / `CATEGORY_SORT_ORDER` priority lists, then
   alphabetical, `Other/Misc` last (`sortWithPriority()`). Slots have no real sub-category → a
   single "All Games" sub-tab.
3. `openGame(game)` → `MatchService.getGameUrl({ gameId, platformId: 'desktop'|'mobile' })` →
   `POST /livecasino-v1/play-game` → `res.data.url` → sanitized `<iframe>` opened **in-page**
   (overlay), `closeIframe()` to exit. Errors → toast.

`Mac88Component` (route `int-play/:gameId`) is the same `getGameUrl` call rendered as a
standalone fullscreen iframe page. `MatchService` notes: `/livecasino-v1/*` goes through the
normal encrypted interceptor; `/mac88-v1/*` (backend webhooks) stays plaintext.

`CasinoListComponent` (`/casino-list`) is a **static curated grid** of `routerLink`s into
internal `/casino/*` routes + the aggregator list pages (no API call for the grid itself).

### 4.9 Wallet / balance
`UserauthService` caches `balance` & `exposure`. `getUserBalance()` → `GET /getuserbalance`
(`{balance, exposure, logout?}`; `logout:true` → force logout). `HeaderComponent` calls it on a
**5s interval** and also reacts to socket `User/<username>` updates. Components refresh it ~1s
after any successful bet.

### 4.10 Single-session enforcement / forced logout
`SocketService.listenForceLogout()` (called from `HeaderComponent.ngOnInit`) opens
`sessionSocket = io(backendURI, { auth: { token } })` and listens for `force_logout`. The device
that just logged in carries a `survivorToken`; if the pushed `payload.survivorToken` matches the
local token the event is ignored, otherwise `UserauthService.logOut()` fires. `logOut()` also
POSTs `/logout` (with `Skip-Interceptor`) to blocklist the token server-side, clears
`localStorage`, and routes to `/login`.

---

## 5. Route table (`src/app/app.routes.ts`)

| Path | Component | Notes |
|---|---|---|
| `` → `/home` | — | redirect |
| `login` | `LoginComponent` | public |
| `loginauth/2` | `LoginauthComponent` | public; 2FA PIN step |
| `home` | `HomeComponent` | guarded |
| `game-details/4/:gameid` | `GameDetailsComponent` | cricket |
| `game-details/1/:gameid` | `GamedetailFootballComponent` | football |
| `game-details/2/:gameid` | `GamedetailTennisComponent` | tennis |
| `game-details/40/:gameid` | `GamedetailPoliticsComponent` | politics |
| `game-details/66/:gameid` | `GamedetailKabaddiComponent` | kabaddi |
| `game-details/10/:gameid` | `GamedetailHorseComponent` | horse racing |
| `game-details/65/:gameid` | `GamedetailGreyhoundComponent` | greyhound |
| `virtual-cricket/4/:gameid` | `VirtualCricketComponent` | virtual T10 |
| `int-play/:gameId` | `Mac88Component` | aggregator fullscreen iframe |
| `casino` | `CasinoComponent` | shell; **60 active child routes** `casino/<name>` (teen20, dt20, lucky7, aaa, war, queen, poker/poker6/poker20, roulette11/13, race17/20, superover/2/3, worli/2, card32a/b, dtl20, cmatch20, cmeter, ballbyball, cricketv3, goal/2, lucky6/7/7eu/7eu2/15, instant-teenpatti, one-card-one-day, Two-Card-Teenpatti, unlimited-joker-oneday, joker20/joker120, teen*/…). Note aliases: `abj`→Ab2, `3cardj`→Threecardj, `joker20`→TeenpattiJoker, `joker120`→UnlimitedJoker2020. `aviator` child is **commented out**. |
| `account-statement` | `AccountStatementComponent` | |
| `current-bet` | `CurrentBetComponent` | |
| `casino-results` / `casino-results/:eventId` | `CasinoResultsComponent` | |
| `all-sports/:sportId` | `AllSportsComponent` | |
| `changepasswordlogin` | `ChangepasswordComponent` | forced first-login change |
| `change-password` | `CpassHomeComponent` | normal change |
| `activity-log` | `ActivityLogsComponent` | |
| `fantasy-list` | `FantasyListComponent` | |
| `live-casino-list` (+ `/CS/26`, `/CS/26/:id`) | `LiveCasinoListComponent` | `:id` preselects provider tab |
| `live-casino-bets` | `LiveCasinoBetsComponent` | |
| `casino-list` (+ `/LC/4`, `/LC/4/:id`) | `CasinoListComponent` | |
| `casino-list/LC/19` (+ `/:id`) | `CasinoListVirtualComponent` | |
| `slot-list` / `virtual-list` / `crash-list` | `SlotListComponent` / `VirtualListComponent` / `CrashListComponent` | |
| `secure-auth` | `SecureAuthComponent` | enable/disable 2FA |
| `clist` | `ClistComponent` | public (no guard) |
| `cvideo/:eventId` | `CvideoComponent` | public; bare video iframe |
| `**` | — | redirect `/home` |

All rows guarded by `AuthGuard` **except** `login`, `loginauth/2`, `clist`, `cvideo/:eventId`.

---

## 6. Services (`src/app/services/`)

### 6.1 `UserauthService` (`userauth.service.ts`) — auth + wallet + **all bet placement**
- **Auth:** `loginuser`, `autoAuth` (expiry check), `authStatus`, `setToken`/`getToken`
  (`localStorage['token']`), `logOut` (server blocklist + clear + `/login`),
  `getUserDetails`/`getUsername` (JWT decode), `getPreviousUrl` (tracks `NavigationStart`).
- **Crypto:** `EncryptData` / `DecryptData` — AES with `environment.kk` (used by the interceptor
  and socket payloads).
- **Wallet:** `getUserBalance` (`GET /getuserbalance`), `getBalance`, `getExposure`, `getmymarket`.
- **Bet placement (one method per market family):**
  - Cricket: `placebet` (`/cricket/placebet`), `placewbet` (`/cricket/placewbet`),
    `placeccbet` (`/cricket/placeccbet`), `getopenbet`, `getfancybook`.
  - Per sport: `placeFootballBet`/`placeTennisBet`/`placeBasketballBet`/`placeVolleyballBet`/
    `placeTableTennisBet`/`placeFutsalBet`/`placeEgamesBet`/`placeEsoccerBet`/`placeBinaryBet`/
    `placeKabaddiBet`/`placeBadmintonBet`/`placeSnookerBet`/`placeHorseRacingBet`/
    `placeGreyhoundRacingBet` + matching `getXxxOpenBet` (all `/<sport>/placebet` &
    `/<sport>/getopenbet`).
  - Virtual: `placeVirtualT10Bet` (`/virtualt10/placebet`).
  - Casino: `placeCasinoBet` (`/casino/placebet`), `getCasinoOpenBet` (`/casino/getopenbet`).
  - Aviator: `placebetAviator`, `cancelbetAviator`, `cashoutAviator`, `getGameHistory`
    (`/aviator/*`).
- **Reports:** `getuserstatement` (`/getaccountstatement`), `getstatementdetail`,
  `getunsettledbet`, `getuserbethistory` (`/getbethistory`), `getuserprofitloss`,
  `getactivitylog` (`/activitylogs`).
- **Stake buttons:** `getButtons` (`/getuserbuttons` → `{gamebutton, casinobutton}`),
  `updateButtons` (`/updatebuttons`).
- **Password:** `changeUserPassFirst` (`/change_user_password`), `changeUserPass`
  (`/changeuserpassword`).
- **2FA:** `getConnectionId`, `validateSecurityCode` (`/validatesecuritycode`), `secAuthStatus`
  (`/secureAuthStatus`), `disableSecAuth`, `validateDisableSecAuth`.

### 6.2 `MatchService` (`match.service.ts`) — read feeds + game catalogs
- **Match lists:** `getCricketMatches`, `getSoccerMatches`, `getTennisMatches`,
  `getBasketballMatches`, `getVolleyballMatches`, `getTabletennisMatches`, `getFutsalMatches`,
  `getEgamesMatches`, `getEsoccerMatches`, `getKabaddiMatches`, `getSnookerMatches`,
  `getBadmintonMatches`, `getHorceraceMatches`, `getGrayhoundMatches`, `getBinaryMatches`
  (each `GET /get<sport>matches`).
- **Detail / misc:** `getMatchDetail` (`POST /getmatchdetail`), `getNotice` (`/getnotice`),
  `getccmatches` / `getccdata` (cricket-casino), `GetTokenDecoded`, `getUsername`.
- **Casino results:** `getResult` (`GET /casino/getresult/:roundId`), `getCasinoResultReport`
  (`/casino/getcasinoresultsdata`), `getResultDetail` (`/casino/getresultdetail`).
- **Media:** `getCasinoVideo` (returns `cvideoURI`), `getCVideo` (`/getcvideo`), `getTvURL`
  (`/getlivetv`), `getOthersTvURL`, `getScoreAnimation` (`/getanimationurl`).
- **Aggregator catalog:** `getLiveCasinoGames` / `getSlotGames` / `getVirtualGames` /
  `getCrashGames` / `getFantasyGames` → all `POST /livecasino-v1/getallgames { section }`;
  `getGameUrl` → `POST /livecasino-v1/play-game`.

### 6.3 `SocketService` (`socket.service.ts`)
- `sportSocket = io(environment.socketURI, { transports:['websocket'], query:{ token } })` —
  the primary feed connection.
  - `gamedata(evt, id)` → emits `evt`, listens `Market/<id>` → Observable.
  - `scoredata(evt, id)` → listens `Score/<id>`.
  - `casinodata(evt, code)` → listens `Casino/<code>`.
  - `casinolast10(evt, code)` → listens `Last10/<code>`.
  - `updateCheck(evt, username)` → listens `User/<username>`, **payload is AES-encrypted** →
    piped through `UserauthService.DecryptData`.
  - `leavaAllRooms()`, `disconnectSport()`.
- `sessionSocket = io(environment.backendURI, { auth:{ token } })` — `listenForceLogout()`
  only; handles `force_logout` (§4.10).
- `socket` / `scoreSocket` and their helpers (`dataemit`, `resultemit`, `scoredataemit`) are
  **legacy/commented-out** (old casino & score servers) — not connected in the current build.

### 6.4 `TokenInterceptorService` (`token.service.ts`)
The global `HTTP_INTERCEPTORS` entry. See §4.4 — auth header + AES request/response envelope +
`Skip-Interceptor` bypass + `logout` error handling.

---

## 7. Shared layout components

| Component | Role |
|---|---|
| `HeaderComponent` | Top bar: username, balance/exposure (5s poll + socket), notice ticker (`getNotice`), "My Markets" modal (`getmymarket`), stake-button settings modal (`getButtons`/`updateButtons`), rules modals, account dropdown, search, logout, `listenForceLogout()`. Balance/exposure passed in via `@Input()` from parent pages but also self-fetched. |
| `SidebarComponent` | Static left nav (sports / racing / others accordions). No API. |
| `MmenutabComponent` | Mobile bottom/segmented nav: Crash / Sports / Our Casino / Live Casino / Slots / Fantasy. |
| `FooterComponent` | Static footer. |
| `ContainerComponent` | Near-empty placeholder (commented-out "latest events" strip). |

Each full page composes `<app-header>` + `<app-sidebar>` + `<app-footer>` itself (standalone
imports) — there is **no single app-level layout**; `AppComponent` is only `<router-outlet>`.

---

## 8. Cross-cutting conventions & business logic

- **Odds ladder:** `calculateIncrement(rate)` in `game-details` defines the betfair-style tick
  size by price band (e.g. 0.01 below 2.0, up to 10 above 100). Reused for rate +/- steppers.
- **Pre-book / projected P&L:** before a bet is placed, `calcProfit()` recomputes a
  per-selection projected exposure table (`preBook`, `matchOPreBook`, `bmPrebook`, …) so the
  user sees "what my book becomes if this bet matches". Back uses `rate - 1` (odds) or
  `rate / 100` (bookmaker %); lay is the mirror. Khado is special (`rate + khado - 1`).
- **Market type strings are the contract** between socket feed and UI: `MATCH_ODDS`,
  `Bookmaker`, `Bookmaker 2`, `Normal` (fancy), `fancy1`, `oddeven`, `meter`, `khado`,
  `TIED_MATCH` / `Tied Match`, `COMPLETED_MATCH` / `Completed Match`, `10 over Bookmaker`,
  `TOURNAMENT_WINNER`, `gtype == 'cricketcasino'`. Changing these on the backend breaks parsing.
- **`sid` / `oname`** identify a selection + odds slot and must be echoed back in the bet body.
- **`gstatus`** on a selection (`''` / `SUSPENDED` / `Ball Running` / `CLOSED`) gates whether the
  bet button is active.
- **Sport IDs** used throughout: `1` Football, `2` Tennis, `4` Cricket, `6` Casino, `8` Table
  Tennis, `9` Futsal, `10` Horse, `11` Egames, `15` Basketball, `18` Volleyball, `22` Badminton,
  `40` Politics, `50` Binary, `59` Snooker, `65` Greyhound, `66` Kabaddi, `68` Esoccer
  (see `sportNames` maps in `account-statement` / `current-bet`).
- **Toasts:** every success/error goes through `ngx-toastr` with
  `positionClass:'toast-top-center'`, `timeOut:3000`, `closeButton:true`.
- **jQuery datepickers:** report pages (`account-statement`, `activity-logs`,
  `casino-results`, `live-casino-bets`) init `$('.datepicker#...').datepicker(...)` in
  `ngAfterViewInit`, read values with `$('#id').val()`. Date range usually last 7 days, capped at
  1 month back / today.
- **Pagination:** report components share the shape `{ page, offset(=10), totalPage, goPage,
  searchString }` with server-side paging.
- **iframe URLs** (TV, casino video, aggregator games) are always passed through
  `DomSanitizer.bypassSecurityTrustResourceUrl`.
- **Strict TS:** `tsconfig.json` has `strict`, `noImplicitReturns`, `strictTemplates`, etc. —
  but component fields are pervasively typed `any`.

---

## 9. Configuration

`src/environments/environment.ts` (dev) & `environment.prod.ts` (prod, swapped by
`angular.json > configurations.production.fileReplacements`):

| Key | Meaning |
|---|---|
| `production` | Angular prod-mode flag (`main.ts` calls `enableProdMode()`). |
| `backendURI` | REST API base + `sessionSocket` host. |
| `socketURI` | Primary `socket.io` feed host (odds/score/casino) + aviator game socket. |
| `cvideoURI` | Casino live-video stream base (`<cvideoURI>?id=<streamId>`). |
| `livetvURI` / `sportstvURI` | Currently empty; TV comes from backend `/getlivetv` instead. |
| `kk` | **AES key** for the API envelope & encrypted socket payloads (static, shared). |

⚠️ `backendURI` in the committed **dev** file points at production
(`https://backend.betexch999.com`); the `localhost:3000` line is commented. `socketURI` differs
between dev and prod.

`angular.json` globals (order matters): Bootstrap CSS/JS, `bootstrap-datepicker`, `flipdown`,
`ngx-toastr`, `slick-carousel`, `src/styles.css`, `assets/css/responsive.css`,
`assets/css/custom.css`, FontAwesome (CDN), jQuery, `src/app/googlechart/googlechart.js`.
Prod budgets: initial warn 500 kB / error 8 MB.

---

## 10. Build & run

```bash
npm install
npm start            # ng serve → http://localhost:4200  (development config)
npm run build        # ng build → dist/betexch999-user/browser  (production config)
npm run watch        # ng build --watch --configuration development
npm test             # ng test (Karma + Jasmine; only stub *.spec.ts exist)
```

Node/Angular CLI 18.x. No lint config, no e2e, no CI in-repo. `dist/` is git-ignored (a stale
build is present locally).

---

## 11. Known rough edges (accurate to current code)

- `/casino/aviator` route is commented out (`app.routes.ts:201`) while `HeaderComponent` still
  links to it → falls through to `/home`.
- `routerLink="/sports-book/33"` (header/casino-list) has **no matching route** → `/home`.
- `casino-list.component.html` links to several `/casino/*` paths with **no route/component**
  (`card32`, `card32eu`, `teen32`, `teen6`, `abj` alias, etc.) — dead links → `/home`.
- Repo/brand name mismatch: folder `royaleexch-user`, build/brand `betexch999`.
- `SocketService.socket` / `scoreSocket` methods exist but their `io()` calls are commented out;
  calling `dataemit`/`disconnect()` would throw.
- Heavy use of `setInterval` polling (home 5s, header balance 5s, game-details 3s watchdog);
  intervals are cleared in `ngOnDestroy` / on token loss.
