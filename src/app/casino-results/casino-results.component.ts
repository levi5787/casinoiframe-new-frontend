import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { MatchService } from '../services/match.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
declare const $: any;

@Component({
  selector: 'app-casino-results',
  standalone: true,
  imports: [FormsModule, HeaderComponent, FooterComponent, SidebarComponent, CommonModule],
  templateUrl: './casino-results.component.html',
  styleUrl: './casino-results.component.css'
})
export class CasinoResultsComponent {
  eventId = ""; loader = false;
  current_date = ""; report: any = []; results: any = {}; mtime: any;
  tempCards: any = []; temprId = ""; tempWinner: any = []; tempAdesc = ""; tempBdesc = ""; winnerPlayer = "";
  tempAndar: string[] = []; tempBahar: string[] = []; tempc1 = ""; tempfirstA = ""; tempfirstB = "";
  is1winner = false; is2winner = false; is3winner = false; is4winner = false;
  is5winner = false; is6winner = false; is7winner = false; is8winner = false;
  templowcards: any = []; temphighcards: any = []; hukum9: any = []; hukum10: any = []; tempScore: any = [];
  tempSpadecards: any = []; tempClubcards: any = []; tempHeartcards: any = []; tempDiamondcards: any = [];
  totalStatement = 0; totalPage = 0; page = 1; offset = 10; goPage = 1; searchString = ""

  constructor(
    private match: MatchService,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private activated_route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    //this.eventId = this.activated_route.snapshot.paramMap.get('eventId');
    this.current_date = this.getCurrentDate();
    this.activated_route.params.subscribe(params => {
      this.eventId = params['eventId'] || this.eventId;
      if (this.eventId == 'poker6') {
        this.eventId = 'poker9';
      }
      // if (params['eventId']) {
      //   //this.getReport();
      //   let dt = { eventId: this.eventId, date: this.current_date, page: this.page, offset: this.offset, searchString: this.searchString }
      //   //console.log(dt)
      //   this.match.getCasinoResultReport(dt).subscribe({
      //     next: (res: any) => {
      //       this.report = res.data;
      //       this.totalStatement = res.total
      //       this.totalPage = Math.ceil(res.total / this.offset)
      //     }, error: (e) => console.log(e)
      //   })
      // }
    });
    //console.log(this.current_date)
  }
  ngAfterViewInit(): void {
    $('.datepicker#current_date').datepicker({
      format: 'yyyy-mm-dd',
      orientation: "bottom auto",
      startDate: this.getOneWeekAgoDate(),
      endDate: this.getCurrentDate(),
      autoclose: true
    }).datepicker('setDate', this.current_date);
  }

  getMinDate(): string {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    return startDate.toISOString().split('T')[0];
  }

  getCurrentDate() {
    return this.formatDate(new Date())
  }
  getOneWeekAgoDate(): string {
    return this.formatDate(Date.now() - 7 * 24 * 60 * 60 * 1000)
  }
  getOneMonthAgoDate(): string {
    var currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() - 1);
    return this.formatDate(currentDate)
  }
  formatDate(dateString: any) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Adding 1 to month because it's zero-indexed
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  search() {
    this.page = 1;
    this.getReport();
  }

  getReport() {
    if (!this.eventId) {
      this.toastr.error('Select Casino Type!', '', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        closeButton: true,
      });
      return;
    }
    this.loader = true;
    this.current_date = $('.datepicker#current_date').val()
    if (!this.eventId || !this.current_date) return;
    let dt = { eventId: this.eventId, date: this.current_date, page: this.page, offset: this.offset, searchString: this.searchString }
    //console.log(dt)
    this.match.getCasinoResultReport(dt).subscribe({
      next: (res: any) => {
        this.loader = false;
        this.report = res.data;
        this.totalStatement = res.total
        this.totalPage = Math.ceil(res.total / this.offset)
      }, error: (e) => {} /* console.log(e) */
    })
  }
  /*
    getResultDetail(eventId:string,roundId:string){
      this.match.getResultDetail({eventId,roundId}).subscribe({
        next:(res)=>{
          //console.log(res)
        },error:(e)=>console.log(e)
      })
    }
  */
  openResultDetail(content: any, eventId: any, roundId: any) {
    this.loader = true;
    this.tempDiamondcards = []; this.tempSpadecards = []; this.tempClubcards = []; this.tempHeartcards = [];
    this.results = { temprId: "", tempWinner: "", tempDesc: "", tempCards: "", tempScore: "" };
    this.is1winner = false; this.is2winner = false; this.is3winner = false; this.is4winner = false;
    this.is5winner = false; this.is6winner = false; this.is7winner = false; this.is8winner = false;
    this.match.getResultDetail({ eventId, roundId }).subscribe((winnerdata: any) => {
      //console.log(winnerdata)
      this.loader = false;
      this.modalService.open(content, { size: 'xl' })
      if (this.eventId == 'teen20' || this.eventId == 'teen9' || this.eventId == 'Teen') {
        this.results.temprId = winnerdata['mid'];
        this.results.tempWinner = winnerdata['win'];
        this.results.tempCards = winnerdata['cards'];
        this.tempCards = this.results.tempCards.split(",");
      }
      if (this.eventId == 'teen8' || this.eventId == 'war') {
        this.results.temprId = winnerdata['mid'];
        this.results.tempWinner = winnerdata['sid'];
        this.tempWinner = this.results.tempWinner.split('|')[0]
        //console.log(this.tempWinner);
        this.results.tempCards = winnerdata['cards'];
        this.tempCards = this.results.tempCards.split(",");

        if (this.tempWinner.includes('1')) {
          this.is1winner = true
        }
        if (this.tempWinner.includes('2')) {
          this.is2winner = true
        }
        if (this.tempWinner.includes('3')) {
          this.is3winner = true
        }
        if (this.tempWinner.includes('4')) {
          this.is4winner = true
        }
        if (this.tempWinner.includes('5')) {
          this.is5winner = true
        }
        if (this.tempWinner.includes('6')) {
          this.is6winner = true
        }
        if (this.tempWinner.includes('7')) {
          this.is7winner = true
        }
        if (this.tempWinner.includes('8')) {
          this.is8winner = true
        }
      }
      if (this.eventId == 'poker' || this.eventId == 'poker20' || this.eventId == 'poker9') {
        this.results.temprId = winnerdata['mid'];
        this.results.tempWinner = winnerdata['win'];
        this.results.tempCards = winnerdata['cards'];
        this.tempCards = this.results.tempCards.split(",");
        this.results.tempDesc = winnerdata['desc'];
        this.results.tempAdesc = winnerdata['desc'].split('##')[1]
        this.results.tempBdesc = winnerdata['desc'].split('##')[2]
        if (this.results.tempWinner == '11') {
          this.winnerPlayer = 'Player A'
        } else if (this.results.tempWinner == '21') {
          this.winnerPlayer = 'Player B'
        }
      }
      if (this.eventId == 'ab20') {
        const r = winnerdata['data']?.[0] ?? winnerdata;
        this.results.temprId = r['mid'] ?? r['rid'] ?? roundId;
        let cards = r['cards'];
        let andarbahar = String(cards ?? '').split(',*,');
        this.tempAndar = (andarbahar[0] ?? '').split(',').filter((c: string) => c);
        //console.log(this.tempAndar)
        this.tempBahar = (andarbahar[1] ?? '').split(',').filter((c: string) => c);

        setTimeout(() => {
          if ($('.andarresult').hasClass('slick-initialized')) { $('.andarresult').slick('unslick'); }
          $('.andarresult').empty();
          $('.andarresult').slick({
            slidesToShow: 15,
            slidesToScroll: 15,
            infinite: false,
            responsive: [
              {
                breakpoint: 1024,
                settings: {
                  slidesToShow: 12,
                  slidesToScroll: 12
                }
              },
              {
                breakpoint: 990,
                settings: {
                  slidesToShow: 8,
                  slidesToScroll: 8
                }
              },
              {
                breakpoint: 480,
                settings: {
                  slidesToShow: 5,
                  slidesToScroll: 5
                }
              }
            ]
          });
          for (const img of this.tempAndar) {
            $('.andarresult').slick('slickAdd', `<div><img src="/img/cards/${img}.png">`);
          }
          if ($('.baharresult').hasClass('slick-initialized')) { $('.baharresult').slick('unslick'); }
          $('.baharresult').empty();
          $('.baharresult').slick({
            slidesToShow: 15,
            slidesToScroll: 15,
            infinite: false,
            responsive: [
              {
                breakpoint: 1024,
                settings: {
                  slidesToShow: 12,
                  slidesToScroll: 12
                }
              },
              {
                breakpoint: 990,
                settings: {
                  slidesToShow: 8,
                  slidesToScroll: 8
                }
              },
              {
                breakpoint: 480,
                settings: {
                  slidesToShow: 5,
                  slidesToScroll: 5
                }
              }
            ]
          });
          for (const img of this.tempBahar) {
            $('.baharresult').slick('slickAdd', `<div><img src="/img/cards/${img}.png">`);
          }
        });
      }
      if (this.eventId == 'abj') {
        const r2 = winnerdata['data']?.[0] ?? winnerdata;
        this.results.temprId = r2['mid'] ?? r2['rid'] ?? roundId;
        let cards = r2['cards'];
        this.results.tempWinner = r2['win'];
        //console.log(this.tempWinner)
        const cardsArray = String(cards ?? '').split(',');
        this.tempc1 = cardsArray[0];
        this.tempfirstB = cardsArray[1];
        this.tempfirstA = cardsArray[2];
        let andarTemp: any = []; let baharTemp: any = [];
        cardsArray.forEach((item: string, index: number) => {
          if (index >= 3 && item != '1') {
            if (index % 2 == 0) {
              andarTemp.push(item)
            } else {
              baharTemp.push(item)
            }
          }
        });
        //this.tempAndar = andarTemp.reverse(); this.tempBahar = baharTemp.reverse();
        this.tempAndar = andarTemp; this.tempBahar = baharTemp;

        setTimeout(() => {
          if ($('.andarresult').hasClass('slick-initialized')) { $('.andarresult').slick('unslick'); }
          $('.andarresult').empty();
          $('.andarresult').slick({
            slidesToShow: 12,
            slidesToScroll: 12,
            infinite: false,
            responsive: [
              {
                breakpoint: 1024,
                settings: {
                  slidesToShow: 8,
                  slidesToScroll: 8
                }
              },
              {
                breakpoint: 990,
                settings: {
                  slidesToShow: 5,
                  slidesToScroll: 5
                }
              },
              {
                breakpoint: 480,
                settings: {
                  slidesToShow: 3,
                  slidesToScroll: 3
                }
              }
            ]
          });
          for (const img of this.tempAndar) {
            $('.andarresult').slick('slickAdd', `<div><img src="/img/cards/${img}.png">`);
          }
          if ($('.baharresult').hasClass('slick-initialized')) { $('.baharresult').slick('unslick'); }
          $('.baharresult').empty();
          $('.baharresult').slick({
            slidesToShow: 12,
            slidesToScroll: 12,
            infinite: false,
            responsive: [
              {
                breakpoint: 1024,
                settings: {
                  slidesToShow: 8,
                  slidesToScroll: 8
                }
              },
              {
                breakpoint: 990,
                settings: {
                  slidesToShow: 5,
                  slidesToScroll: 5
                }
              },
              {
                breakpoint: 480,
                settings: {
                  slidesToShow: 3,
                  slidesToScroll: 3
                }
              }
            ]
          });
          for (const img of this.tempBahar) {
            $('.baharresult').slick('slickAdd', `<div><img src="/img/cards/${img}.png">`);
          }
        });
      }
      if (this.eventId == '3cardj' || this.eventId == 'card32' || this.eventId == 'card32eu' ||
        this.eventId == 'lucky7' || this.eventId == 'lucky7eu' || this.eventId == 'cmatch20' ||
        this.eventId == 'baccarat' || this.eventId == 'baccarat2') {
        //console.log(this.eventId)
        this.results.temprId = winnerdata['mid'];
        this.tempCards = winnerdata.cards.split(",");
        this.results.tempWinner = winnerdata['win'];
        this.results.tempDesc = winnerdata['desc'];
      }
      if (this.eventId == 'worli' || this.eventId == 'worli2' || this.eventId == 'aaa' || this.eventId == 'btable') {
        //console.log(this.eventId)
        this.results.temprId = winnerdata['mid'];
        this.results.tempSid = winnerdata['sid'];
        this.tempCards = winnerdata.cards.split(",");
        this.results.tempWinner = winnerdata['win'];
        this.results.tempDesc = winnerdata['desc'].split('|');
      }
      if (this.eventId == 'dt20' || this.eventId == 'dt6' || this.eventId == 'dt202' || this.eventId == 'dtl20') {
        //console.log(this.eventId)
        this.results.temprId = winnerdata['mid'];
        this.tempCards = winnerdata.cards.split(",");
        this.results.tempWinner = winnerdata['win'];
        this.results.tempDesc = winnerdata['desc'].split('*');
      }
      if (this.eventId == 'cmeter') {
        //console.log(this.eventId)
        this.results.temprId = winnerdata['mid'];
        this.tempCards = winnerdata.cards.split(",");
        this.tempCards.forEach((element: any) => {
          this.checkHighLowTemp(element);
        });
      }
      if (this.eventId == 'cricketv3' || this.eventId == 'superover' || this.eventId == 'ballbyball') {
        this.results.temprId = winnerdata['mid'];
        this.results.tempWinner = winnerdata['win'];
        this.results.tempDesc = winnerdata['desc'];
        this.results.tempScore = winnerdata['score'];
      }
      if (this.eventId == 'queen') {
        //console.log(this.eventId)
        this.results.temprId = winnerdata['mid'];
        this.results.tempWinner = winnerdata['win'];
        this.tempCards = winnerdata.cards.split(",");
        if (this.results.tempWinner == '1') {
          this.winnerPlayer = 'Total 0'
        } else if (this.results.tempWinner == '2') {
          this.winnerPlayer = 'Total 1'
        } else if (this.results.tempWinner == '3') {
          this.winnerPlayer = 'Total 2'
        } else if (this.results.tempWinner == '4') {
          this.winnerPlayer = 'Total 3'
        }
      }
      if (this.eventId == 'race20') {
        //console.log(this.eventId)
        this.results.temprId = winnerdata['mid'];
        this.results.tempWinner = winnerdata['win'];
        this.tempCards = winnerdata.cards.split(",");
        this.tempCards.forEach((item: any) => {
          if (item != '1') {
            let card = this.getcardvalue(item);
            if (card == "SS") { if (!this.tempDiamondcards.includes(item)) { this.tempDiamondcards.push(item) } }
            else if (card == "HH") { if (!this.tempSpadecards.includes(item)) { this.tempSpadecards.push(item) } }
            else if (card == "CC") { if (!this.tempClubcards.includes(item)) { this.tempClubcards.push(item) } }
            else if (card == "DD") { if (!this.tempHeartcards.includes(item)) { this.tempHeartcards.push(item) } }
          }
        });
        this.results.tempDesc = winnerdata['desc']
        if (this.results.tempWinner == '1') {
          this.winnerPlayer = 'Spade'
        } else if (this.results.tempWinner == '2') {
          this.winnerPlayer = 'Heart'
        } else if (this.results.tempWinner == '3') {
          this.winnerPlayer = 'Club'
        } else if (this.results.tempWinner == '4') {
          this.winnerPlayer = 'Diamond'
        }
      } if (this.eventId == 'goal' || this.eventId == 'goal2') {
        //console.log(winnerdata)
        this.results.temprId = winnerdata['rid'];
        this.mtime = winnerdata['mtime'];
        this.results.tempDesc = winnerdata.rdesc.split('#');
        this.results.tempDesc1 = this.results.tempDesc[1] + " By " + this.results.tempDesc[0];
      } if (this.eventId == 'teen20b' || this.eventId == 'teen20c') {
        //console.log(winnerdata)
        this.results.temprId = winnerdata['rid'];
        this.mtime = winnerdata['mtime'];
        const cards = winnerdata['card'].split(',');
        this.results.rc1 = "/img/cards-new/" + cards[0] + ".png";
        this.results.rc2 = "/img/cards-new/" + cards[1] + ".png";
        this.results.rc3 = "/img/cards-new/" + cards[2] + ".png";
        this.results.rc4 = "/img/cards-new/" + cards[3] + ".png";
        this.results.rc5 = "/img/cards-new/" + cards[4] + ".png";
        this.results.rc6 = "/img/cards-new/" + cards[5] + ".png";
        const desc = winnerdata['rdesc'].split('#');
        this.results.tempWinner = winnerdata['winnat'];
        // this.tempBaccarat = desc[1]
        const Baccarat = desc[1].split('~');
        this.results.tempBaccarat1 = Baccarat[0];
        this.results.tempBaccarat2 = Baccarat[1];
        this.results.tempTotal = desc[2];
        this.results.tempPair = desc[3];
        this.results.tempRedBlack = desc[4]
      } if (this.eventId == 'teenmuf') {
        //console.log(winnerdata)
        this.results.temprId = winnerdata['rid'];
        this.mtime = winnerdata['mtime'];
        this.results.tempWinner = winnerdata['winnat']
        const cards = winnerdata['card'].split(',');
        this.results.rc1 = "/img/cards-new/" + cards[0] + ".png";
        this.results.rc2 = "/img/cards-new/" + cards[1] + ".png";
        this.results.rc3 = "/img/cards-new/" + cards[2] + ".png";
        this.results.rc4 = "/img/cards-new/" + cards[3] + ".png";
        this.results.rc5 = "/img/cards-new/" + cards[4] + ".png";
        this.results.rc6 = "/img/cards-new/" + cards[5] + ".png";
        const desc = winnerdata['rdesc'].split('#');
        this.results.top9 = desc[1];
        this.results.mBaccarat = desc[2]
      } if (this.eventId == 'teen120') {
        //console.log(winnerdata)
        this.results.temprId = winnerdata['rid'];
        this.mtime = winnerdata['mtime'];
        this.results.tempWinner = winnerdata['winnat']
        const cards = winnerdata['card'].split(',');
        this.results.rc1 = "/img/cards-new/" + cards[0] + ".png";
        this.results.rc2 = "/img/cards-new/" + cards[1] + ".png";
        const desc = winnerdata['rdesc'].split('#');
        this.results.tempPair = desc[1];
      } if (this.eventId == 'lucky7eu2') {
        this.results.temprId = winnerdata['rid'];
        this.mtime = winnerdata['mtime'];
        this.results.tempWinner = winnerdata['winnat'];
        this.results.tempCard = winnerdata['card'];
        const desc = winnerdata['rdesc'].split('#');
        this.results.tempOdd = desc[1];
        this.results.tempColour = desc[2];
        this.results.tempCardDesc = desc[3];
        this.results.tempLine = desc[4];
      } if (this.eventId == 'superover2' || this.eventId == 'superover3') {
        this.results.temprId = winnerdata['rid'];
        this.mtime = winnerdata['mtime'];
        this.results.tempWinner = winnerdata['winnat'];
        this.results.tempDesc = winnerdata['rdesc'];
        const score = winnerdata['score'];
        this.results.tempScore = [];
        this.results.tempScore['indScore'] = score.filter((f: any) => f.nat == 'IND');
        this.results.tempScore['ausScore'] = score.filter((f: any) => f.nat == 'AUS');
        this.results.tempScore['indWkt'] = this.results.tempScore['indScore'].some((s: any) => s.wkt == true) ? 1 : 0;
        this.results.tempScore['ausWkt'] = this.results.tempScore['ausScore'].some((s: any) => s.wkt == true) ? 1 : 0;
        const rdscsplit = this.results.tempDesc.split(' | ');
        this.results.tempScore['indRun'] = rdscsplit[0].split(' : ')[1];
        this.results.tempScore['ausRun'] = rdscsplit[1].split(' : ')[1];
      } if (this.eventId == 'teen33' || this.eventId == 'teen3') {
        this.results.temprId = winnerdata['rid'];
        this.mtime = winnerdata['mtime'];
        this.results.tempWinner = winnerdata['rdesc'];
        const cards = winnerdata['card'].split(',');
        this.results.rc1 = "/img/cards-new/" + cards[0] + ".png";
        this.results.rc2 = "/img/cards-new/" + cards[1] + ".png";
        this.results.rc3 = "/img/cards-new/" + cards[2] + ".png";
        this.results.rc4 = "/img/cards-new/" + cards[3] + ".png";
        this.results.rc5 = "/img/cards-new/" + cards[4] + ".png";
        this.results.rc6 = "/img/cards-new/" + cards[5] + ".png";
      } if (this.eventId == 'teen41' || this.eventId == 'teen42') {
        this.results.temprId = winnerdata['rid'];
        this.mtime = winnerdata['mtime'];
        const cards = winnerdata['card'].split(',');
        this.results.rc1 = "/img/cards-new/" + cards[0] + ".png";
        this.results.rc2 = "/img/cards-new/" + cards[1] + ".png";
        this.results.rc3 = "/img/cards-new/" + cards[2] + ".png";
        this.results.rc4 = "/img/cards-new/" + cards[3] + ".png";
        this.results.rc5 = "/img/cards-new/" + cards[4] + ".png";
        this.results.rc6 = "/img/cards-new/" + cards[5] + ".png";
        this.results.tempWinner = winnerdata['winnat'];
        this.results.temprdesc = winnerdata['rdesc'].split('#')[1];
      } if (this.eventId == 'btable2') {
        this.results.temprId = winnerdata['rid'];
        this.mtime = winnerdata['mtime'];
        this.results.tempCard = winnerdata['card'];
        this.results.tempDesc = winnerdata['rdesc'].split('#');
      } if (this.eventId == 'aaa2') {
        this.results.temprId = winnerdata['rid'];
        this.mtime = winnerdata['mtime'];
        this.results.tempCard = winnerdata['card'];
        this.results.tempWin = winnerdata['winnat'];
        this.results.tempDesc = winnerdata['rdesc'].split('#');
      } if (this.eventId == 'lucky15') {
        this.results.temprId = winnerdata['rid'];
        this.mtime = winnerdata['mtime'];
        this.results.tempWinner = winnerdata['winnat'];
      } if (this.eventId == 'dum10') {
        this.results.temprId = winnerdata['rid'];
        this.mtime = winnerdata['mtime'];
        const cards = winnerdata['card'].split(',');
        this.results.tempCard = "/img/cards-new/" + cards.pop() + ".png";
        this.results.tempDesc = winnerdata['rdesc'].split('#');
        $('.resultcardslider').slick({
          slidesToShow: 15,
          slidesToScroll: 15,
          infinite: false,
          responsive: [
            {
              breakpoint: 1024,
              settings: {
                slidesToShow: 12,
                slidesToScroll: 12
              }
            },
            {
              breakpoint: 990,
              settings: {
                slidesToShow: 8,
                slidesToScroll: 8
              }
            },
            {
              breakpoint: 480,
              settings: {
                slidesToShow: 5,
                slidesToScroll: 5
              }
            }
          ]
        });
        for (const img of cards) {
          $('.resultcardslider').slick('slickAdd', `<div><img src="/img/cards-new/${img}.png">`);
        }
      } if (this.eventId == 'mogambo') {
        this.results.temprId = winnerdata['rid'];
        this.mtime = winnerdata['mtime'];
        this.results.tempWinner = winnerdata['winnat'];
        const cards = winnerdata['card'].split(',');
        this.results.rc1 = "/img/cards-new/" + cards[0] + ".png";
        this.results.rc2 = "/img/cards-new/" + cards[1] + ".png";
        this.results.rc3 = "/img/cards-new/" + cards[2] + ".png";
        this.results.tempScore = this.calculateCardTotal(winnerdata['card']);
      } if (this.eventId == 'ourroullete' || this.eventId == 'roulette11' || this.eventId == 'roulette13' || this.eventId == 'roulette12') {
        this.results.temprId = winnerdata['rid'];
        this.mtime = winnerdata['mtime'];
        this.results.tempWinner = winnerdata['win'];
      } if (this.eventId == 'lucky5') {
        this.results.temprId = winnerdata['rid'];
        this.results.tempCard = winnerdata['card'];
        const desc = winnerdata['rdesc'].split('#');
        this.results.tempWinner = desc[0];
        this.results.tempColor = desc[1];
        this.results.tempOddEven = desc[2];
        this.results.tempExtra = desc[3];
      } if (this.eventId == 'joker20') {
        this.results.temprId = winnerdata['rid'];
        this.mtime = winnerdata['mtime'];
        this.results.tempWinner = winnerdata['win'];
        this.results.winnerDetails = winnerdata['rdesc'].split('#');
        const cards = winnerdata['card'].split(',');
        this.results.showCards = cards.map((c: string) => "/img/cards-new/" + c + ".png");
      } if (this.eventId == 'joker120') {
        this.results.temprId = winnerdata['rid'];
        this.mtime = winnerdata['mtime'];
        const cards = winnerdata['card'].split(',');
        this.results.showCards = cards.map((c: string) => "/img/cards-new/" + c + ".png");
      } if (this.eventId == 'joker1') {
        this.results.temprId = winnerdata['rid'];
        this.mtime = winnerdata['mtime'];
        this.results.tempWinner = winnerdata['rdesc'];
        const cards = winnerdata['card'].split(',');
        this.results.rc1 = "/img/cards-new/" + cards[0] + ".png";
        this.results.rc2 = "/img/cards-new/" + cards[1] + ".png";
        this.results.rc3 = "/img/cards-new/" + cards[2] + ".png";
        this.results.rc4 = "/img/cards-new/" + cards[3] + ".png";
        this.results.rc5 = "/img/cards-new/" + cards[4] + ".png";
        this.results.rc6 = "/img/cards-new/" + cards[5] + ".png";
      } if (this.eventId == 'teen1') {
        this.results.temprId = winnerdata['rid'];
        this.mtime = winnerdata['mtime'];
        const desc = winnerdata['rdesc'].split('#');
        this.results.tempWinner = desc[0];
        this.results.tempDesc = desc[1];
        const cards = winnerdata['card'].split(',');
        this.results.rc1 = "/img/cards-new/" + cards[0] + ".png";
        this.results.rc2 = "/img/cards-new/" + cards[1] + ".png";
      } if (this.eventId == 'patti2') {
        this.results.temprId = winnerdata['rid'];
        this.mtime = winnerdata['mtime'];
        this.results.tempWinner = winnerdata['winnat'];
        const cards = (winnerdata['card'] || '').split(',');
        this.results.tempCards = cards.map((c: string) => "/img/cards-new/" + c + ".png");
        this.results.temprdesc = winnerdata['rdesc'].split('#');
      } if (this.eventId == 'race17') {
        this.results.temprId = winnerdata['rid'];
        this.mtime = winnerdata['mtime'];
        this.results.tempWinner = winnerdata['win'];
        this.results.winnerValue = winnerdata['rdesc'].split('#');
        const cards = winnerdata['card'].split(',').filter((c: string) => c != '1');
        this.results.showCards = cards.map((c: string) => "/img/cards-new/" + c + ".png");
      } if (this.eventId == 'sicbo' || this.eventId == 'sicbo2') {
        this.results.temprId = winnerdata['rid'];
        this.mtime = this.matchTime(winnerdata['rid']);
        const raw = String(winnerdata['card'] ?? winnerdata['cards'] ?? winnerdata['rdesc'] ?? '').trim();
        this.results.tempDesc = raw;
        this.tempCards = raw.split(',').map((c: string) => parseInt(c, 10)).filter((n: number) => n >= 1 && n <= 6);
        const sum = this.tempCards.reduce((a: number, b: number) => a + b, 0);
        this.results.tempWinner = (winnerdata['win'] ?? '') !== '' ? winnerdata['win'] : (sum || '');
      } if (this.eventId == 'dolidana') {
        this.results.temprId = winnerdata['rid'];
        this.mtime = this.matchTime(winnerdata['rid']);
        this.tempCards = String(winnerdata['card'] ?? winnerdata['cards'] ?? '').trim().split(',').map((c: string) => parseInt(c, 10)).filter((n: number) => n >= 1 && n <= 6);
        const parts = String(winnerdata['rdesc'] ?? '').split('#').map((s: string) => s.trim());
        const labels = parts.length <= 2 ? ['Turn', 'Win'] : ['Turn', 'Any Pair', 'Particular Pair', 'Sum Total', 'Odd/Even', 'Lucky 7'];
        this.results.tempDescRows = labels.map((label, i) => ({ label, value: parts[i] ?? '' }));
      } if (this.eventId == 'teen6') {
        this.results.temprId = winnerdata['rid'];
        this.mtime = winnerdata['mtime'];
        this.results.tempWinner = String(winnerdata['rdesc'] ?? '').split('#');
        this.tempCards = String(winnerdata['cards'] ?? winnerdata['card'] ?? '').split(',').map((c: string) => c.trim());
        this.results.resultCardsA = [0, 2, 4].map((i) => this.tempCards[i] || '1');
        this.results.resultCardsB = [1, 3, 5].map((i) => this.tempCards[i] || '1');
      } if (this.eventId == 'teen32') {
        this.results.temprId = winnerdata['rid'];
        this.results.tempWinner = String(winnerdata['rdesc'] ?? winnerdata['win'] ?? '');
        this.tempCards = String(winnerdata['cards'] ?? winnerdata['card'] ?? '').split(',').map((c: string) => c.trim());
        this.results.resultCardsA = [0, 2, 4].map((i) => this.tempCards[i] || '1');
        this.results.resultCardsB = [1, 3, 5].map((i) => this.tempCards[i] || '1');
      } if (this.eventId == 'teen62') {
        this.results.temprId = winnerdata['rid'];
        this.mtime = winnerdata['mtime'];
        this.results.tempWinner = String(winnerdata['rdesc'] ?? winnerdata['win'] ?? '');
        this.tempCards = String(winnerdata['cards'] ?? winnerdata['card'] ?? '').split(',').map((c: string) => c.trim());
        const RANK_ORDER = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        const ODD_RANKS = ['A', '3', '5', '7', '9', 'J', 'K'];
        const cardRank62 = (code: string) => { const m = String(code || '').match(/^(10|[2-9]|[AJQK])/); return m ? m[1] : ''; };
        const isOdd62 = (code: string) => ODD_RANKS.includes(cardRank62(code));
        const hasConsecutive = (cards: string[]) => {
          const values = cards.map((c) => RANK_ORDER.indexOf(cardRank62(c)) + 1).filter((v) => v > 0).sort((a, b) => a - b);
          for (let i = 0; i < values.length - 1; i++) if (values[i + 1] - values[i] === 1) return true;
          return values.includes(1) && values.includes(13);
        };
        const cardsA62 = [0, 2, 4].map((i) => this.tempCards[i] || '1');
        const cardsB62 = [1, 3, 5].map((i) => this.tempCards[i] || '1');
        this.results.resultCardsA = cardsA62;
        this.results.resultCardsB = cardsB62;
        this.results.resultOddEven = (this.tempCards as string[]).map((c) => (isOdd62(c) ? 'Odd' : 'Even')).join(' ');
        this.results.consecutiveA = hasConsecutive(cardsA62);
        this.results.consecutiveB = hasConsecutive(cardsB62);
      } if (this.eventId == 'teenunique') {
        this.results.temprId = winnerdata['rid'];
        this.mtime = winnerdata['mtime'];
        this.results.tempWinner = winnerdata['win'];
        this.tempCards = String(winnerdata['card'] ?? '').split(',').filter((c: string) => c && c !== '1');
      } if (this.eventId == 'poison' || this.eventId == 'poison20') {
        this.results.temprId = winnerdata['rid'];
        this.mtime = winnerdata['mtime'];
        this.results.tempWinner = winnerdata['win'];
        this.tempCards = String(winnerdata['card'] ?? winnerdata['cards'] ?? '').split(',').map((c: string) => c.trim());
        const parts = String(winnerdata['rdesc'] ?? '').split('#');
        this.results.tempWinnerDesc = parts[0] || '';
        this.results.tempOddEvenDesc = parts[1] || '';
        this.results.tempColorDesc = parts[2] || '';
        this.results.tempSuitDesc = parts[3] || '';
        this.results.resultPoisonCard = this.tempCards[0] || '1';
        this.results.resultCardsA = [1, 3, 5].map((i) => this.tempCards[i] || '1');
        this.results.resultCardsB = [2, 4, 6].map((i) => this.tempCards[i] || '1');
      } if (this.eventId == 'trio') {
        this.results.temprId = winnerdata['rid'];
        this.mtime = winnerdata['mtime'];
        this.results.tempWinner = winnerdata['win'];
        this.tempCards = String(winnerdata['card'] ?? winnerdata['cards'] ?? '').split(',').map((c: string) => c.trim()).filter((c: string) => c && c !== '1');
        const parts = String(winnerdata['rdesc'] ?? '').split('#');
        this.results.tempSessionDesc = parts[0] || '';
        this.results.tempJudgeDesc = parts[1] || '';
        this.results.tempRedBlackDesc = parts[2] || '';
        this.results.tempOddEvenDesc = parts[3] || '';
        this.results.tempPatternDesc = parts[4] || '';
      } if (this.eventId == 'trap') {
        this.results.temprId = winnerdata['rid'];
        this.mtime = winnerdata['mtime'];
        this.results.tempWinner = winnerdata['win'];
        this.tempCards = String(winnerdata['card'] ?? winnerdata['cards'] ?? '').split(',').map((c: string) => c.trim());
        const parts = String(winnerdata['rdesc'] ?? '').split('#');
        this.results.tempMainDesc = parts[0] || '';
        this.results.tempSevenDesc = parts[1] || '';
        this.results.tempPictureDesc = parts[2] || '';
        const pointValueTrap = (code: string) => {
          const m = String(code || '').match(/^(10|[2-9]|[AJQK])/);
          if (!m) return 0;
          const r = m[1];
          if (r === 'A') return 1; if (r === 'J') return 11; if (r === 'Q') return 12; if (r === 'K') return 13;
          return parseInt(r, 10);
        };
        const cardsATrap = this.tempCards.filter((c: string, i: number) => i % 2 === 0 && c && c !== '1');
        const cardsBTrap = this.tempCards.filter((c: string, i: number) => i % 2 === 1 && c && c !== '1');
        this.results.resultCardsA = cardsATrap;
        this.results.resultCardsB = cardsBTrap;
        this.results.resultTotalA = cardsATrap.reduce((s: number, c: string) => s + pointValueTrap(c), 0);
        this.results.resultTotalB = cardsBTrap.reduce((s: number, c: string) => s + pointValueTrap(c), 0);
      } if (this.eventId == 'teensin') {
        this.results.temprId = winnerdata['rid'];
        this.mtime = winnerdata['mtime'];
        this.results.tempWinner = winnerdata['win'];
        this.tempCards = String(winnerdata['cards'] ?? winnerdata['card'] ?? '').split(',').map((c: string) => c.trim());
        const cardRankSin = (code: string) => { const m = String(code || '').match(/^(\d+)/); return m ? parseInt(m[1], 10) : 0; };
        const cardSuitSin = (code: string) => { const m = String(code || '').match(/(SS|HH|DD|CC)$/); return m ? m[1] : ''; };
        const baccaratValue = (cards: string[]) => cards.reduce((s, c) => s + cardRankSin(c), 0) % 10;
        const hasTrioSin = (cards: string[]) => { const r = cards.map(cardRankSin); return r.length === 3 && r[0] === r[1] && r[1] === r[2]; };
        const hasPairSin = (cards: string[]) => { const r = cards.map(cardRankSin); return r.length >= 2 && new Set(r).size < r.length; };
        const colorPlusLabel = (cards: string[]) => {
          if (cards.length !== 3) return '';
          const ranks = cards.map(cardRankSin).sort((x, y) => x - y);
          const suits = cards.map(cardSuitSin);
          const isFlush = suits.every((s) => s === suits[0]);
          const isSeq = ranks[1] === ranks[0] + 1 && ranks[2] === ranks[1] + 1;
          if (hasTrioSin(cards)) return 'Trio';
          if (isSeq && isFlush) return 'Straight Flush';
          if (isFlush) return 'Flush';
          if (isSeq) return 'Straight';
          return '';
        };
        const cardsASin = [this.tempCards[0], this.tempCards[2], this.tempCards[4]].filter((c: string) => c && c !== '1');
        const cardsBSin = [this.tempCards[1], this.tempCards[3], this.tempCards[5]].filter((c: string) => c && c !== '1');
        this.results.resultCardsA = cardsASin;
        this.results.resultCardsB = cardsBSin;
        const valueASin = baccaratValue(cardsASin), valueBSin = baccaratValue(cardsBSin);
        this.results.resultValueA = valueASin;
        this.results.resultValueB = valueBSin;
        let winnerLabelSin = '';
        if (cardsASin.length >= 3 && cardsBSin.length >= 3) {
          const trioA = hasTrioSin(cardsASin), trioB = hasTrioSin(cardsBSin);
          if (trioA !== trioB) winnerLabelSin = trioA ? 'Player A' : 'Player B';
          else if (valueASin !== valueBSin) winnerLabelSin = valueASin > valueBSin ? 'Player A' : 'Player B';
          else winnerLabelSin = 'Tie';
        }
        this.results.resultWinnerLabel = winnerLabelSin;
        let highCardSin = '';
        if (cardsASin.length >= 3 && cardsBSin.length >= 3) {
          const maxA = Math.max(...cardsASin.map(cardRankSin)), maxB = Math.max(...cardsBSin.map(cardRankSin));
          highCardSin = maxA === maxB ? '-' : (maxA > maxB ? 'Player A' : 'Player B');
        }
        this.results.resultHighCard = highCardSin;
        const pairA = hasPairSin(cardsASin), pairB = hasPairSin(cardsBSin);
        this.results.resultPair = pairA && pairB ? 'Both' : pairA ? 'Player A' : pairB ? 'Player B' : '-';
        const colorA = colorPlusLabel(cardsASin), colorB = colorPlusLabel(cardsBSin);
        this.results.resultColorPlus = colorA && colorB ? ('A: ' + colorA + ' | B: ' + colorB) : colorA ? ('Player A (' + colorA + ')') : colorB ? ('Player B (' + colorB + ')') : '-';
        this.results.resultLucky9 = [...cardsASin, ...cardsBSin].some((c) => cardRankSin(c) === 9) ? 'Yes' : 'No';
      } if (this.eventId == 'notenum') {
        this.results.temprId = winnerdata['rid'];
        this.mtime = winnerdata['mtime'];
        this.tempCards = String(winnerdata['cards'] ?? winnerdata['card'] ?? '').split(',').map((c: string) => c.trim());
        const cardRankNum = (code: string) => { const m = String(code || '').match(/^(10|[2-9]|A)/); if (!m) return 0; return m[1] === 'A' ? 1 : parseInt(m[1], 10); };
        const cardSuitNum = (code: string) => { const m = String(code || '').match(/(SS|HH|DD|CC)$/); return m ? m[1] : ''; };
        const isRedNum = (code: string) => cardSuitNum(code) === 'HH' || cardSuitNum(code) === 'DD';
        const baccPoint = (code: string) => { const n = cardRankNum(code); return n === 10 ? 0 : n; };
        const dealt = this.tempCards.filter((c: string) => c && c !== '1');
        this.results.resultDealtCards = dealt;
        this.results.resultOddEven = dealt.map((c: string) => (cardRankNum(c) % 2 === 0 ? 'Even' : 'Odd')).join(' ');
        this.results.resultRedBlack = dealt.map((c: string) => (isRedNum(c) ? 'Red' : 'Black')).join(' ');
        this.results.resultLowHigh = dealt.map((c: string) => (cardRankNum(c) <= 5 ? 'Low' : 'High')).join(' ');
        this.results.resultCardNums = dealt.map((c: string) => cardRankNum(c)).join(' ');
        const b1 = this.tempCards.slice(0, 3).filter((c: string) => c && c !== '1').reduce((s: number, c: string) => s + baccPoint(c), 0) % 10;
        const b2 = this.tempCards.slice(3, 6).filter((c: string) => c && c !== '1').reduce((s: number, c: string) => s + baccPoint(c), 0) % 10;
        this.results.resultBaccarat = dealt.length < 6 ? '' : ((b1 === b2 ? 'Tie' : (b1 > b2 ? 'Baccarat 1' : 'Baccarat 2')) + ' (B1: ' + b1 + ' | B2: ' + b2 + ')');
      } if (this.eventId == 'lottcard') {
        this.results.temprId = winnerdata['rid'] ?? winnerdata['mid'] ?? roundId;
        this.mtime = winnerdata['mtime'];
        this.tempCards = String(winnerdata['cards'] ?? '').split(',').map((c: string) => c.trim()).filter((c: string) => c);
        const FACE_DIGIT: Record<string, string> = { A: '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', '10': '0' };
        const cardFace = (code: string) => { const m = String(code || '').match(/^(10|[2-9]|[AJQK])/); return m ? m[1] : ''; };
        this.results.resultDigits = this.tempCards.map((c: string) => FACE_DIGIT[cardFace(c)] ?? '').join(' ');
      } if (this.eventId == 'ab3' || this.eventId == 'ab4') {
        const r3 = winnerdata['data']?.[0] ?? winnerdata;
        this.results.temprId = r3['rid'] ?? r3['mid'] ?? roundId;
        this.mtime = r3['mtime'];
        this.results.tempWinner = r3['win'];
        this.tempCards = String(r3['cards'] ?? r3['card'] ?? '').split(',').map((c: string) => c.trim());
        const sliderSettings = {
          slidesToShow: 12, slidesToScroll: 12, infinite: false,
          responsive: [
            { breakpoint: 1024, settings: { slidesToShow: 8, slidesToScroll: 8 } },
            { breakpoint: 990, settings: { slidesToShow: 5, slidesToScroll: 5 } },
            { breakpoint: 480, settings: { slidesToShow: 3, slidesToScroll: 3 } },
          ],
        };
        const andar = this.tempCards.map((code: string, i: number) => ({ pos: i + 1, code })).filter((c: any) => c.code && c.code !== '1' && c.pos % 2 === 0);
        const bahar = this.tempCards.map((code: string, i: number) => ({ pos: i + 1, code })).filter((c: any) => c.code && c.code !== '1' && c.pos % 2 === 1);
        setTimeout(() => {
          if ($('.andarresult').hasClass('slick-initialized')) { $('.andarresult').slick('unslick'); }
          $('.andarresult').empty();
          $('.andarresult').slick(sliderSettings);
          for (const c of andar) {
            $('.andarresult').slick('slickAdd', `<div><div class="text-center">${c.pos}</div><img src="/img/cards-new/${c.code}.png"></div>`);
          }
          if ($('.baharresult').hasClass('slick-initialized')) { $('.baharresult').slick('unslick'); }
          $('.baharresult').empty();
          $('.baharresult').slick(sliderSettings);
          for (const c of bahar) {
            $('.baharresult').slick('slickAdd', `<div><div class="text-center">${c.pos}</div><img src="/img/cards-new/${c.code}.png"></div>`);
          }
        });
      } if (this.eventId == 'race2') {
        this.results.temprId = winnerdata['rid'];
        this.mtime = this.matchTime(winnerdata['rid']);
        const winMapRace2: Record<string, string> = { '1': 'Player A', '2': 'Player B', '3': 'Player C', '4': 'Player D' };
        this.results.tempWinner = winMapRace2[winnerdata['win']] ?? winnerdata['win'] ?? '';
        this.tempCards = String(winnerdata['card'] ?? winnerdata['cards'] ?? '').split(',').map((c: string) => c.trim());
      } if (this.eventId == 'cmeter1') {
        this.results.temprId = winnerdata['rid'];
        this.mtime = this.matchTime(winnerdata['rid']);
        const winMapCmeter: Record<string, string> = { '1': 'Fighter A', '2': 'Fighter B', '3': 'Tie' };
        const rdescWinner = String(winnerdata['rdesc'] ?? '').split('#')[0];
        this.results.tempWinner = rdescWinner || winMapCmeter[winnerdata['win']] || winnerdata['winnat'] || winnerdata['win'] || '';
        this.tempCards = String(winnerdata['card'] ?? winnerdata['cards'] ?? '').split(',').map((c: string) => c.trim());
        const cardPointCmeter = (code: string) => {
          const m = String(code || '').match(/^(10|[2-9]|[AJQK])/);
          if (!m) return 0;
          const r = m[1];
          if (r === 'A') return 1; if (r === 'J') return 11; if (r === 'Q') return 12; if (r === 'K') return 13;
          return parseInt(r, 10);
        };
        this.results.resultPoints = Math.abs(cardPointCmeter(this.tempCards[0]) - cardPointCmeter(this.tempCards[1]));
      }
    })
  }
  calculateCardTotal(cardStr: string): number {
    if (!cardStr) return 0;
    const rankValues: { [key: string]: number } = { J: 11, Q: 12, K: 13, A: 1 };
    return cardStr.split('').reduce((sum: number, part: string) => {
      const match = part.trim().match(/^(10|[2-9]|[JQKA])/i);
      if (!match) return sum;
      const rank = match[1].toUpperCase();
      let value = rankValues[rank] !== undefined ? rankValues[rank] : parseInt(rank, 10);
      if (value === 1) value = 0;
      return sum + value;
    }, 0);
  }
  checkHighLowTemp(c: any) {
    const lowArray = ['A', '2', '3', '4', '5', '6', '7', '8', '9'];
    const highArray = ['10', 'J', 'Q', 'K'];
    if (lowArray.some(val => c.includes(val))) {
      if (!this.templowcards.includes(c)) {
        if (c.includes('9HH')) {
          this.hukum9.push(c);
        } else {
          this.templowcards.push(c);
        }
      }
    }
    if (highArray.some(val => c.includes(val))) {
      if (!this.temphighcards.includes(c)) {
        if (c.includes('10HH')) {
          this.hukum10.push(c);
        } else {
          this.temphighcards.push(c);
        }
      }
    }
  }
  getObjectKeys(obj: any) {
    return Object.keys(obj);
  }
  /** DD/MM/YYYY HH:MM:SS decoded from the trailing YYMMDDHHMMSS of a round id (sicbo/dolidana/race2/cmeter1: no reliable server `mtime`). */
  matchTime(rid: any): string {
    const digits = String(rid ?? '').replace(/\D/g, '');
    const s = (digits.length > 15 ? digits.slice(0, 15) : digits).slice(-12);
    if (s.length < 12) return '';
    return `${s.slice(4, 6)}/${s.slice(2, 4)}/20${s.slice(0, 2)} ${s.slice(6, 8)}:${s.slice(8, 10)}:${s.slice(10, 12)}`;
  }
  dice(n: any): string {
    return '/img/dice/' + n + '.png';
  }
  getcardvalue(cards: string) {
    return cards.slice(-2);
  }
  pageChange(type: string) {
    if (type == 'next') {
      if (this.page >= this.totalPage) return;
      this.page += 1;
    } else if (type == 'previous') {
      if (this.page <= 1) return;
      this.page -= 1;
    } else if (type == 'first') {
      if (this.page <= 1) return;
      this.page = 1;
    } else if (type == 'last') {
      if (this.page >= this.totalPage) return;
      this.page = this.totalPage;
    }
    this.goPage = this.page;
    this.getReport();
  }

  offsetChange() {
    this.page = this.goPage = 1;
    this.getReport();
  }

  goToPage() {
    if (this.goPage == this.page) return;
    if (this.goPage >= 1 && this.goPage <= this.totalPage) {
      this.page = this.goPage;
      this.getReport();
    }
  }
}
