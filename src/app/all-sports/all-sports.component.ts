import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { MatchService } from '../services/match.service';
import { UserauthService } from '../services/userauth.service';

@Component({
  selector: 'app-all-sports',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink, HeaderComponent, FooterComponent, SidebarComponent],
  templateUrl: './all-sports.component.html',
  styleUrl: './all-sports.component.css'
})
export class AllSportsComponent {

  getmatches: any; // setInterval varibale. 
  sportId = "";
  cricketMatches: any = []; footballMatches: any = []; tennisMatches: any = [];
  constructor(
    private match_service: MatchService,
    private userauth: UserauthService,
    private activatedRoute: ActivatedRoute
  ) {
    
  }
  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params:any) => {
      this.sportId = params['sportId'];
      //console.log(this.sportId)
      this.getmatch();
    });
    this.getmatch()
    this.getmatches = setInterval(() => {
      this.getmatch()
      if (this.userauth.getToken() == null) {
        clearInterval(this.getmatches);
      }
    }, 5000);
  }
  ngOnDestroy() {
    clearInterval(this.getmatches);
  }
  getmatch() {
    if (this.sportId == "4") {
      this.match_service.getCricketMatches().subscribe({
        next: (res) => {
          this.cricketMatches = res;
          this.cricketMatches.map((obj: any) => { obj.name = obj.eventName.split(' / ')[0], obj.time = obj.eventName.split(' / ')[1] })
          //console.log(this.cricketMatches)
        }, error: (e) => console.log(e)
      })
    } else if (this.sportId == "1") {
      this.match_service.getSoccerMatches().subscribe({
        next: (res) => {
          this.footballMatches = res;
          this.footballMatches.forEach((item: any) => {
            item.section.sort((a: any, b: any) => a.sno - b.sno)
          });
        }, error: (e) => console.log(e)
      })
    } else if (this.sportId == "2") {
      this.match_service.getTennisMatches().subscribe({
        next: (res) => {
          this.tennisMatches = res;
          this.tennisMatches.forEach((item: any) => {
            item.section.sort((a: any, b: any) => a.sno - b.sno)
          });
        }, error: (e) => console.log(e)
      })
    }
  }

  getback1(odds: any) {
    const item = odds.find((item: any) => item.oname === 'back1' || item.oname === 'BACK1');
    return item.odds;
  }
  getlay1(odds: any) {
    const item = odds.find((item: any) => item.oname === 'lay1' || item.oname === 'LAY1');
    return item.odds;
  }

  trackByFunc(index: number, item: any) {
    return item.gameId;
  }
  trackByFunc2(index: number, item: any) {
    return item.gmid;
  }
}
