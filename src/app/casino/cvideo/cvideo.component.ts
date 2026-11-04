import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatchService } from '../../services/match.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-cvideo',
  standalone: true,
  imports: [],
  templateUrl: './cvideo.component.html',
  styleUrl: './cvideo.component.css'
})
export class CvideoComponent {

  safeURL: any;
  constructor(
    private match_service: MatchService,
    private _sanitizer: DomSanitizer,
    private activated_route: ActivatedRoute
  ) { }
  ngOnInit() {
    const eventId = this.activated_route.snapshot.paramMap.get('eventId');
    this.match_service.getCVideo(eventId || '').subscribe({
      next: (res: any) => {
        //console.log(res)
        const url = res.url;
        this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(url)
      }, error: (e) => {
        console.log(e)
      }
    })
    //this.getCvideoURL()
  }
  getCvideoURL() {
    this.match_service.getCVideo('aaa').subscribe({
      next: (res: any) => {
        //console.log(res)
        const url = res.url;
        this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(url)
      }, error: (e) => {
        console.log(e)
      }
    })
  }
}
