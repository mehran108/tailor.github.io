import { Component, Inject, OnInit } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { LocalstorageService } from "src/EliCamps/services/localstorage.service";
import { Keys, LookupEnum } from "src/EliCamps/common/lookup.enums";
import { ListService } from "src/EliCamps/services/list.service";
import { Title } from "@angular/platform-browser";
import { NavigationEnd, Router } from "@angular/router";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit {
  title = "elicamps";
  constructor(
    @Inject(DOCUMENT) private document: Document,
    public storage: LocalstorageService,
    public list: ListService
  ) {

  }

  ngOnInit() {
    if (localStorage.getItem(Keys.TOKEN_INFO)) {
      this.document.body.classList.remove("white-background");
    } else {
      this.document.body.classList.add("white-background");
    }
    this.list.getAll(LookupEnum.CONFIG).subscribe((res) => {
      if (res && res.length > 0) {
        const regFee = res.find((el) => el.value === 1035);
        if (regFee) {
          this.storage.set(Keys.REG_FEE, regFee.description);
        }
      }
    });
  }
}
