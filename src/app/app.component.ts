import { Component, Inject, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { LocalstorageService } from 'src/EliCamps/services/localstorage.service';
import { Keys } from 'src/EliCamps/common/lookup.enums';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'elicamps';
  constructor(@Inject(DOCUMENT) private document: Document, public storage: LocalstorageService) { }
  ngOnInit() {
    if (localStorage.getItem(Keys.TOKEN_INFO)) {
      this.document.body.classList.remove('white-background');
    } else {
      this.document.body.classList.add('white-background');
    }
  }
}
