import { Routes } from "@angular/router";
import { CasinoComponent } from "./casino/casino.component";
import { SuperoverComponent } from "./casino/superover/superover.component";
import { Race20Component } from "./casino/race20/race20.component";
import { QueenComponent } from "./casino/queen/queen.component";
import { Cricketv3Component } from "./casino/cricketv3/cricketv3.component";
import { BallbyballComponent } from "./casino/ballbyball/ballbyball.component";
import { Ab2Component } from "./casino/ab2/ab2.component";
import { Dt20Component } from "./casino/dt20/dt20.component";
import { Baccarat2Component } from "./casino/baccarat2/baccarat2.component";
import { BaccaratComponent } from "./casino/baccarat/baccarat.component";
import { Lucky7euComponent } from "./casino/lucky7eu/lucky7eu.component";
import { Cmatch20Component } from "./casino/cmatch20/cmatch20.component";
import { CmeterComponent } from "./casino/cmeter/cmeter.component";
import { WarComponent } from "./casino/war/war.component";
import { Dtl20Component } from "./casino/dtl20/dtl20.component";
import { Teen9Component } from "./casino/teen9/teen9.component";
import { Teen8Component } from "./casino/teen8/teen8.component";
import { TeenComponent } from "./casino/teen/teen.component";
import { Teen20Component } from "./casino/teen20/teen20.component";
import { Poker6Component } from "./casino/poker6/poker6.component";
import { Ab20Component } from "./casino/ab20/ab20.component";
import { WorliComponent } from "./casino/worli/worli.component";
import { Worli2Component } from "./casino/worli2/worli2.component";
import { Card32aComponent } from "./casino/card32a/card32a.component";
import { Card32bComponent } from "./casino/card32b/card32b.component";
import { AaaComponent } from "./casino/aaa/aaa.component";
import { BtableComponent } from "./casino/btable/btable.component";
import { Dt6Component } from "./casino/dt6/dt6.component";
import { Lucky7Component } from "./casino/lucky7/lucky7.component";
import { Dt202Component } from "./casino/dt202/dt202.component";
import { PokerComponent } from "./casino/poker/poker.component";
import { Poker20Component } from "./casino/poker20/poker20.component";
import { CurrentBetComponent } from "./current-bet/current-bet.component";
import { LiveCasinoBetsComponent } from "./live-casino-bets/live-casino-bets.component";
import { CpassHomeComponent } from "./cpass-home/cpass-home.component";
import { SecureAuthComponent } from "./secure-auth/secure-auth.component";
import { CasinoListComponent } from "./casino-list/casino-list.component";
import { CasinoListVirtualComponent } from "./casino-list-virtual/casino-list-virtual.component";
// import { FantasyListComponent } from './fantasy-list/fantasy-list.component';
// import { LiveCasinoListComponent } from './live-casino-list/live-casino-list.component';
// import { SlotListComponent } from './slot-list/slot-list.component';
// import { VirtualListComponent } from './virtual-list/virtual-list.component';
import { AuthGuard } from "./guards/auth.guard";
import { tokenGuard } from "./guards/token.guard";
import { SessionExpiredComponent } from "./session-expired/session-expired.component";
import { ThreecardjComponent } from "./casino/threecardj/threecardj.component";
import { Teen120Component } from "./casino/teen120/teen120.component";
import { TeenmufComponent } from "./casino/teenmuf/teenmuf.component";
import { Teen20bComponent } from "./casino/teen20b/teen20b.component";
import { Lucky7eu2Component } from "./casino/lucky7eu2/lucky7eu2.component";
import { Superover3Component } from "./casino/superover3/superover3.component";
import { Lucky15Component } from "./casino/lucky15/lucky15.component";
import { GoalComponent } from "./casino/goal/goal.component";
import { Btable2Component } from "./casino/btable2/btable2.component";
import { Teen41Component } from "./casino/teen41/teen41.component";
import { Teen42Component } from "./casino/teen42/teen42.component";
import { Teen33Component } from "./casino/teen33/teen33.component";
import { Teen20cComponent } from "./casino/teen20c/teen20c.component";
import { Aaa2Component } from "./casino/aaa2/aaa2.component";
import { OurroulleteComponent } from "./casino/ourroullete/ourroullete.component";
import { ClistComponent } from "./clist/clist.component";
import { CvideoComponent } from "./casino/cvideo/cvideo.component";
import { AviatorComponent } from "./casino/aviator/aviator.component";
import { Dum10Component } from "./casino/dum10/dum10.component";
import { Roulette11Component } from "./casino/roulette11/roulette11.component";
import { Superover2Component } from "./casino/superover2/superover2.component";
import { MogamboComponent } from "./casino/mogambo/mogambo.component";
import { Lucky6Component } from "./casino/lucky6/lucky6.component";
import { Goal2Component } from "./casino/goal2/goal2.component";
import { InstantTeenpattiComponent } from "./casino/instant-teenpatti/instant-teenpatti.component";
import { OneCardOneDayComponent } from "./casino/one-card-one-day/one-card-one-day.component";
import { TwoCardsTeenpattiComponent } from "./casino/two-cards-teenpatti/two-cards-teenpatti.component";
import { UnlimitedJokerOnedayComponent } from "./casino/unlimited-joker-oneday/unlimited-joker-oneday.component";
import { Roulette13Component } from "./casino/roulette13/roulette13.component";
import { TeenpattiJokerComponent } from "./casino/teenpatti-joker/teenpatti-joker.component";
import { Race17Component } from "./casino/race17/race17.component";
import { UnlimitedJoker2020Component } from "./casino/unlimited-joker-20-20/unlimited-joker-20-20.component";
import { Cmeter1Component } from "./casino/cmeter1/cmeter1.component";
import { Roulette12Component } from "./casino/roulette12/roulette12.component";
import { Race2Component } from "./casino/race2/race2.component";
import { Teen32Component } from "./casino/teen32/teen32.component";
import { Teen6Component } from "./casino/teen6/teen6.component";
import { Teen62Component } from "./casino/teen62/teen62.component";
import { PoisonComponent } from "./casino/poison/poison.component";
import { Poison20Component } from "./casino/poison20/poison20.component";
import { TrioComponent } from "./casino/trio/trio.component";
import { TrapComponent } from "./casino/trap/trap.component";
import { TeensinComponent } from "./casino/teensin/teensin.component";
import { NotenumComponent } from "./casino/notenum/notenum.component";
import { Ab3Component } from "./casino/ab3/ab3.component";
import { Ab4Component } from "./casino/ab4/ab4.component";
import { SicboComponent } from "./casino/sicbo/sicbo.component";
import { Sicbo2Component } from "./casino/sicbo2/sicbo2.component";
import { DolidanaComponent } from "./casino/dolidana/dolidana.component";
import { TeenuniqueComponent } from "./casino/teenunique/teenunique.component";
import { LottcardComponent } from "./casino/lottcard/lottcard.component";

// Casino game pages (token verified by tokenGuard on every navigation).
const casinoGames: Routes = [
  { path: "ballbyball", component: BallbyballComponent },
  { path: "superover", component: SuperoverComponent },
  { path: "race20", component: Race20Component },
  { path: "queen", component: QueenComponent },
  { path: "cricketv3", component: Cricketv3Component },
  { path: "abj", component: Ab2Component },
  { path: "dt20", component: Dt20Component },
  { path: "baccarat2", component: Baccarat2Component },
  { path: "goal", component: GoalComponent },
  { path: "baccarat", component: BaccaratComponent },
  { path: "lucky7eu", component: Lucky7euComponent },
  { path: "cmatch20", component: Cmatch20Component },
  { path: "cmeter", component: CmeterComponent },
  { path: "war", component: WarComponent },
  { path: "dtl20", component: Dtl20Component },
  { path: "teen9", component: Teen9Component },
  { path: "teen8", component: Teen8Component },
  { path: "teen", component: TeenComponent },
  { path: "teen41", component: Teen41Component },
  { path: "teen42", component: Teen42Component },
  { path: "teen20", component: Teen20Component },
  { path: "teen20b", component: Teen20bComponent },
  { path: "teen33", component: Teen33Component },
  { path: "teen20c", component: Teen20cComponent },
  { path: "teen120", component: Teen120Component },
  { path: "teenmuf", component: TeenmufComponent },
  { path: "poker6", component: Poker6Component },
  { path: "ab20", component: Ab20Component },
  { path: "worli", component: WorliComponent },
  { path: "worli2", component: Worli2Component },
  { path: "card32a", component: Card32aComponent },
  { path: "card32b", component: Card32bComponent },
  { path: "aaa", component: AaaComponent },
  { path: "btable", component: BtableComponent },
  { path: "dt6", component: Dt6Component },
  { path: "lucky7", component: Lucky7Component },
  { path: "lucky7eu2", component: Lucky7eu2Component },
  { path: "lucky15", component: Lucky15Component },
  { path: "dt202", component: Dt202Component },
  { path: "poker", component: PokerComponent },
  { path: "poker20", component: Poker20Component },
  { path: "3cardj", component: ThreecardjComponent },
  { path: "superover3", component: Superover3Component },
  { path: "btable2", component: Btable2Component },
  { path: "aaa2", component: Aaa2Component },
  { path: "ourroullete", component: OurroulleteComponent },
  // { path: 'aviator', component: AviatorComponent },
  { path: "dum10", component: Dum10Component },
  { path: "roulette11", component: Roulette11Component },
  { path: "superover2", component: Superover2Component },
  { path: "mogambo", component: MogamboComponent },
  { path: "lucky6", component: Lucky6Component },
  { path: "goal2", component: Goal2Component },
  { path: "instant-teenpatti", component: InstantTeenpattiComponent },
  { path: "one-card-one-day", component: OneCardOneDayComponent },
  { path: "Two-Card-Teenpatti", component: TwoCardsTeenpattiComponent },
  { path: "unlimited-joker-oneday", component: UnlimitedJokerOnedayComponent },
  { path: "roulette13", component: Roulette13Component },
  { path: "joker20", component: TeenpattiJokerComponent },
  { path: "race17", component: Race17Component },
  { path: "joker120", component: UnlimitedJoker2020Component },
  // new tables
  { path: "cmeter1", component: Cmeter1Component },
  { path: "roulette12", component: Roulette12Component },
  { path: "race2", component: Race2Component },
  { path: "teen32", component: Teen32Component },
  { path: "teen6", component: Teen6Component },
  { path: "teen62", component: Teen62Component },
  { path: "poison", component: PoisonComponent },
  { path: "poison20", component: Poison20Component },
  { path: "trio", component: TrioComponent },
  { path: "trap", component: TrapComponent },
  { path: "teensin", component: TeensinComponent },
  { path: "notenum", component: NotenumComponent },
  { path: "ab3", component: Ab3Component },
  { path: "ab4", component: Ab4Component },
  { path: "sicbo", component: SicboComponent },
  { path: "sicbo2", component: Sicbo2Component },
  { path: "dolidana", component: DolidanaComponent },
  { path: "teenunique", component: TeenuniqueComponent },
  { path: "lottcard", component: LottcardComponent },
  // { path: 'worli3', component: Worli3Component },
];

export const routes: Routes = [
  { path: "", redirectTo: "/session-expired", pathMatch: "full" },
  { path: "session-expired", component: SessionExpiredComponent },
  // Iframe entry points: token in URL, verified by our backend.
  {
    path: "casino/lobby/:token",
    component: CasinoListComponent,
    canActivate: [tokenGuard],
  },

  {
    path: "casino",
    component: CasinoComponent,
    // Each game works as /casino/<game>/<token> (iframe entry) and /casino/<game> (internal links).
    children: casinoGames.flatMap((r) => [
      r,
      { ...r, path: `${r.path}/:token` },
    ]),
    canActivateChild: [tokenGuard],
  },

  {
    path: "current-bet",
    component: CurrentBetComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "change-password",
    component: CpassHomeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "live-casino-bets",
    component: LiveCasinoBetsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "casino-list",
    component: CasinoListComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "casino-list/LC/4",
    component: CasinoListComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "casino-list/LC/4/:id",
    component: CasinoListComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "casino-list/LC/19",
    component: CasinoListVirtualComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "casino-list/LC/19/:id",
    component: CasinoListVirtualComponent,
    canActivate: [AuthGuard],
  },
  // {
  //   path: "fantasy-list",
  //   component: FantasyListComponent,
  //   canActivate: [AuthGuard],
  // },
  // {
  //   path: "live-casino-list",
  //   component: LiveCasinoListComponent,
  //   canActivate: [AuthGuard],
  // },
  // {
  //   path: "live-casino-list/CS/26",
  //   component: LiveCasinoListComponent,
  //   canActivate: [AuthGuard],
  // },
  // {
  //   path: "live-casino-list/CS/26/:id",
  //   component: LiveCasinoListComponent,
  //   canActivate: [AuthGuard],
  // },
  // { path: "slot-list", component: SlotListComponent, canActivate: [AuthGuard] },
  // { path: "virtual-list", component: VirtualListComponent, canActivate: [AuthGuard] },
  {
    path: "secure-auth",
    component: SecureAuthComponent,
    canActivate: [AuthGuard],
  },

  { path: "clist", component: ClistComponent },
  { path: "cvideo/:eventId", component: CvideoComponent },
  { path: "**", redirectTo: "/session-expired" },
];
