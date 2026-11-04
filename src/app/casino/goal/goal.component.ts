import { Component, HostListener } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatchService } from '../../services/match.service';
import { SocketService } from '../../services/socket.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { UserauthService } from '../../services/userauth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShortNumberPipe } from '../../pipes/short-number.pipe';

@Component({
  selector: 'app-goal',
  standalone: true,
  imports: [CommonModule,FormsModule,ShortNumberPipe],
  templateUrl: './goal.component.html',
  styleUrl: './goal.component.css'
})
export class GoalComponent {
  loader=false;
  
  isSticky=false;sidebarTopOffset= 124;cvideoURL:any;
  safeURL: any;data: any;autotime=0;beforeNum=0;rdesc: any;bounceEnter=false;roundId: any;
  mybets: any=[];min: any;max: any;remark: any;results: any=[];betFor="";odds: any;betType="";profit=0;loss=0;
  stake: any = null;sid=0;temprId: any;tempDesc: any; tempDesc1:any;placeLoader=false;mybooks: any; clastnum=0;flipsecond=false;cfirstnum=0;flipfirst=false;
  bettab=false; gametab=true;setButtonTab='casino';userButtons: any={};mtime:any;
  placebetButton: any;
  showbetform=false;
  oddsType="";
  CRBook: any=[]; LMBook:any=[];RLBook:any=[];NJBook:any=[];HKBook:any=[];RuLBook:any=[];
  EHBook:any=[];ZIBook:any=[];KMBook:any=[];NoGoalBook:any=[];
  ShotGoalBook:any=[];PenaltyGoalBook:any=[];HeaderGoalBook:any=[];FreeKickGoalBook:any=[];NoGoalBookOne:any=[];
  CRdata: any={};LMdata: any={};RLdata: any={};NJdata: any={};HKdata: any={};RuLdata: any={};
  ShotGoaldata: any={};PenaltyGoaldata: any={};EHdata: any={};KMdata: any={};NoGoaldata: any={};
  HeaderGoaldata: any={};ZIdata: any={};FreeKickGoaldata: any={};
  NoGoaldata1: any={};
  constructor(
    private _sanitizer: DomSanitizer,
    private match_service: MatchService,
    private socket_service: SocketService,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private userauth: UserauthService
  ) { }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isSticky = (window.pageYOffset >= this.sidebarTopOffset);
    //console.log(this.sidebarTopOffset)
  }

  ngOnInit(): void {
    this.cvideoURL = this.match_service.getCasinoVideo()
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL + '?id=3065');
    //this.getCvideoURL();
    this.socket_service.casinodata('Casino', 'goal').subscribe((data: any) => {
      //  console.log(data)
      this.data = data.data;
      //code for flipclock
      this.autotime = parseInt(this.data['lt']);
      if (this.beforeNum != this.autotime) {
        this.updateClock(this.autotime);
      }
      this.beforeNum = this.autotime;
      //code for flipclock 
      this.rdesc = this.data['rdesc'];

      if (this.rdesc != '') {
        this.bounceEnter = true;
        setTimeout(() => {
          this.bounceEnter = false;
        }, 1.5 * 1000);
      }
      if(this.roundId != this.data['mid']){
        this.clearBooks(); this.mybets=[];
      }
      this.roundId = this.data['mid'];
      // console.log(this.roundId)
      this.min = this.data.sub[0]['min'];
      this.max = this.data.sub[0]['max'];
      this.remark = this.data.remark;

      this.CRdata=this.data.sub[0];this.LMdata=this.data.sub[1];
      this.RLdata=this.data.sub[2];this.NJdata=this.data.sub[3];
      this.HKdata=this.data.sub[4];this.ZIdata=this.data.sub[5];
      this.RuLdata=this.data.sub[6];this.KMdata=this.data.sub[7];
      this.EHdata=this.data.sub[8];this.NoGoaldata=this.data.sub[9];
      this.ShotGoaldata=this.data.sub[10];this.HeaderGoaldata=this.data.sub[11];
      this.PenaltyGoaldata=this.data.sub[12];this.FreeKickGoaldata=this.data.sub[13];
      this.NoGoaldata1=this.data.sub[14];
      // console.log(this.NoGoaldata1)

    })
    this.socket_service.casinolast10('Last10', 'goal').subscribe((winnerdata: any) => {
      this.results = winnerdata['data']['res']
      //this.results = this.results.reverse()
      // console.log(winnerdata);
    })
    setTimeout(() => {
      this.getopenbet();
      setTimeout(() => {
        this.getopenbet()
      }, 2000);
    }, 1500);
    this.socket_service.updateCheck('User', this.userauth.getUsername()).subscribe((data: any) => {
      if (data.update) {
        this.userauth.getUserBalance();
        this.getopenbet();
      }
    })
    this.placeBetButton();
  }
  ngOnDestroy() {
    this.socket_service.leavaAllRooms();
  }
  getCvideoURL() {
    this.match_service.getCVideo('goal').subscribe({
      next: (res: any) => {
        //console.log(res)
        const url = res.url;
        this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(url)
      }, error: (e) => {
        console.log(e)
      }
    })
  }
  openBetForm(content: any, betfor: string, odds: any, type: string, sid: number, oddstype: string) {
    this.showbetform = true
    this.betFor = betfor;
    this.odds = odds;
    this.betType = type;
    this.oddsType = oddstype;
    this.profit = 0
    this.loss = 0
    this.stake = null;
    this.sid = sid;
    if (window.innerWidth < 1100) {
      this.modalService.open(content)
    }
  }
  hideBetPlace() {
    this.showbetform = false
  }
  placeStake(val: number) {
    this.stake += val;
    this.calcProfit(val);
  }
  resetStake() {
    this.stake = null;
    this.profit = 0;
    this.loss = 0;
  }
  calcProfit(stake: any) {

  }
  open(content: any) {
    this.modalService.open(content, { size: 'lg' });;
  }
  openResult(content: any, rid: any) {
    this.modalService.open(content, { size: 'xl' })
    this.match_service.getResult(rid).subscribe((winnerdata: any) => {
      //console.log(winnerdata)
      this.temprId = rid;
      //console.log(this.temprId);
      this.mtime=winnerdata.data[0].mtime;
      this.tempDesc = winnerdata.data[0].rdesc.split('#');
      this.tempDesc1 = this.tempDesc[1] + " By " + this.tempDesc[0];
    })
  }
  submitbet() {
    this.placeLoader = true;
    var dt = { roundid: this.roundId, matchcode: 'goal', matchname: 'Goal', betfor: this.betFor, bettype: this.betType, oddstype: this.oddsType, odds: this.odds, stake: this.stake, sid: this.sid };
    this.userauth.placeCasinoBet(dt).subscribe({
      next: (res: any) => {
        this.placeLoader = false;
        this.displayToast(res.message, res.status);
        this.getopenbet(); this.userauth.getUserBalance();
        this.modalService.dismissAll();
      },
      error: (e) => {
        this.placeLoader = false;
        this.displayToast(e.error.message, "failed");
        this.modalService.dismissAll();
      }
    })
    this.showbetform = false;
  }
  getopenbet() {
    this.userauth.getCasinoOpenBet("goal", this.roundId).subscribe({
      next: (res: any) => {
        this.mybets = res.openbets;
        this.mybooks = res.books;
        this.mybooks.forEach((item: any) => {
          if (item.oddsType == "Cristiano Ronaldo") { this.CRBook = item.book }
          else if (item.oddsType == "Lionel Messi") { this.LMBook = item.book }
          else if (item.oddsType == "Robert Lewandowski") { this.RLBook = item.book }
          else if (item.oddsType == "Neymar") { this.NJBook = item.book }
          else if (item.oddsType == "Harry Kane") { this.HKBook = item.book }
          else if (item.oddsType == "Zlatan Ibrahimovic") { this.ZIBook = item.book }
          else if (item.oddsType == "Romelu Lukaku") { this.RuLBook = item.book }
          else if (item.oddsType == "Kylian Mbappe") { this.KMBook = item.book }
          else if (item.oddsType == "Erling Haaland") { this.EHBook = item.book }
          else if (item.oddsType == "No Goal") { this.NoGoalBook = item.book }
          else if (item.oddsType == "Shot Goal") { this.ShotGoalBook = item.book }
          else if (item.oddsType == "Header Goal") { this.HeaderGoalBook = item.book }
          else if (item.oddsType == "Penalty Goal") { this.PenaltyGoalBook = item.book }
          else if (item.oddsType == "Free Kick Goal") { this.FreeKickGoalBook = item.book }
          else if (item.oddsType == "No Goal One") { this.NoGoalBookOne = item.book }

        });
        //  console.log(this.NoGoalBookOne);
      }, error: (e) => console.log(e)
    })
  }
  displayToast(msg: any, type: any) {
    if (type == "success") {
      this.toastr.success(msg, '', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        closeButton: true,
      });
    } else {
      this.toastr.error(msg, '', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        closeButton: true,
      });
    }
  }
  updateClock(time: number) {
    if (time < 10) {
      this.cfirstnum = 0;
      this.clastnum = time;
      //flip number
      this.flipsecond = true;
      setTimeout(() => {
        this.flipNumber();
      }, 500);

    } else {
      let stime = time.toString()
      this.cfirstnum = parseInt(stime.charAt(0));
      this.clastnum = parseInt(stime.charAt(1));
      //flip number
      //this.flipfirst=true;
      this.flipsecond = true;
      setTimeout(() => {
        this.flipNumber();
      }, 500);
    }
  }
  flipNumber() {
    this.flipfirst = false;
    this.flipsecond = false;
  }
  trackByFunc(index: number, item: any) {
    return item.sid;
  }
  trackByMid(index: number, item: any) {
    return item.mid;
  }
  clearBooks() {
    this.CRBook=[]; this.LMBook=[];this.RLBook=[];this.NJBook=[];this.HKBook=[];this.RuLBook=[];
  this.EHBook=[];this.ZIBook=[];this.KMBook=[];this.NoGoalBook=[];
  this.ShotGoalBook=[];this.PenaltyGoalBook=[];this.HeaderGoalBook=[];this.FreeKickGoalBook=[];this.NoGoalBookOne=[];
    
  }
  twoDecimal(num: number) {
    if (num) return num.toFixed(2);
    return 0.00;
  }
  gameTabClicked(){
    this.bettab = false;
    this.gametab = true;
  }
  betTabClicked(){
    this.bettab = true;
    this.gametab = false;
  }
  placeBetButton() {
    this.userauth.getButtons().subscribe({
      next: (res: any) => {
        this.placebetButton = res.casinobutton;
        //console.log(this.placebetButton)
      }, error: (e) => console.log(e)
    })
  }
  clickSetButtonTab(name: any) {
    this.setButtonTab = name
  }
  openButtons(content: any) {
    this.userauth.getButtons().subscribe({
      next: (res) => {
        this.userButtons = res;
        this.modalService.open(content, { size: 'md' });
      }, error: (e) => {
        console.log(e)
      }
    })
  }
  updateButtons() {
    this.userauth.updateButtons(this.userButtons).subscribe({
      next: (res: any) => {
        this.toastr.success(res.message, '', {
          timeOut: 3000,
          positionClass: 'toast-top-center',
          closeButton: true,
        });
        this.modalService.dismissAll();
      }, error: (e) => {
        this.toastr.error(e.error.message, '', {
          timeOut: 3000,
          positionClass: 'toast-top-center',
          closeButton: true,
        });
        this.modalService.dismissAll();
      }
    })
  }
  

}
