import { Component, OnInit, ElementRef, HostListener, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { MatDrawer } from '@angular/material';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  public isMobile = false;
  public panelOpenState: boolean;
  public secondPanelOpenState: boolean;
  public reportPanelOpenState: boolean;
  constructor(public router: Router, @Inject(DOCUMENT) private document: Document) { }
  @HostListener('window:resize', [''])
  onResize() {
    this.checkIfWindowIsMobile(window.innerWidth);
  }
  ngOnInit() {
    this.checkIfWindowIsMobile(window.innerWidth);
  }
  private checkIfWindowIsMobile(width: number) {
    this.isMobile = width < 767;
  }
  toggle(sidenav: MatDrawer) {
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
      mainContent.className = !sidenav.opened ? 'custom-width' : 'full-width';
    }
    sidenav.toggle();
  }
  public logout = () => {
    this.document.body.classList.add('white-background');
    localStorage.clear();
    this.router.navigate(['login']);
  }
}
