import { SidebarComponent } from '../sidebar/sidebar.component';
import { Component, inject } from "@angular/core";
import { Router, RouterOutlet, RouterLink } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";
import { UserauthService } from "../services/userauth.service";
import { CommonModule } from "@angular/common";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-current-bet",
  standalone: true,
  imports: [SidebarComponent, 
    FormsModule,
    CommonModule,
    HeaderComponent,
    FooterComponent,
  ],
  templateUrl: "./current-bet.component.html",
  styleUrl: "./current-bet.component.css",
})
export class CurrentBetComponent {
  bets: any = [];
  loader = false;
  sportNames: any = {
    "1": "Football",
    "2": "Tennis",
    "4": "Cricket",
    "15": "Basketball",
    "8": "Table Tennis",
    "9": "Futsal",
    "11": "Egames",
    "18": "Volleyball",
    "50": "Binary",
    "68": "Esoccer",
    "66": "Kabaddi",
    "22": "Badminton",
    "59": "Snooker",
    "10": "Horse Racing",
    "65": "Greyhound Racing",
    "6": "Casino",
  };
  sportType = "";
  betType = "all";
  betStatus = "";
  betInfo: any = { total: 0, amount: 0 };
  totalPage = 0;
  page = 1;
  offset = 10;
  goPage = 1;
  searchString = "";
  constructor(
    private user_auth: UserauthService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {}

  sportChanged() {
    this.bets = [];
    this.betInfo = { total: 0, amount: 0 };
    this.totalPage = 0;
    this.page = 1;
    this.goPage = 1;
  }

  search() {
    this.page = 1;
    this.getBets();
  }

  getBets() {
    if (!this.sportType) {
      this.toastr.error("Select Report Type!", "", {
        timeOut: 3000,
        positionClass: "toast-top-center",
        closeButton: true,
      });
      return;
    }

    this.loader = true;
    let dt = {
      type: this.sportType,
      betType: this.betType,
      betStatus: this.betStatus,
      page: this.page,
      offset: this.offset,
      searchString: this.searchString,
    };
    this.user_auth.getunsettledbet(dt).subscribe({
      next: (res: any) => {
        this.loader = false;
        this.bets = res.data;
        this.betInfo = { total: res.total, amount: res.amount };
        this.totalPage = Math.ceil(res.total / this.offset);
      },
      error: (e) => {
        this.loader = false;
        console.log(e);
      },
    });
  }

  pageChange(type: string) {
    if (type == "next") {
      if (this.page >= this.totalPage) return;
      this.page += 1;
    } else if (type == "previous") {
      if (this.page <= 1) return;
      this.page -= 1;
    } else if (type == "first") {
      if (this.page <= 1) return;
      this.page = 1;
    } else if (type == "last") {
      if (this.page >= this.totalPage) return;
      this.page = this.totalPage;
    }
    this.goPage = this.page;
    this.getBets();
  }

  offsetChange() {
    this.page = this.goPage = 1;
    this.getBets();
  }

  goToPage() {
    if (this.goPage == this.page) return;
    if (this.goPage >= 1 && this.goPage <= this.totalPage) {
      this.page = this.goPage;
      this.getBets();
    }
  }

  filterBets(type: any) {
    if (this.sportType) {
      this.page = this.goPage = 1;
      this.getBets();
    }
  }
}
