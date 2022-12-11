import { Component, OnInit } from '@angular/core';
import { DappBaseComponent, DappInjector } from 'angular-web3';
import { PrimeNGConfig } from 'primeng/api';
import { Store } from '@ngrx/store';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent extends DappBaseComponent implements OnInit {
  title = 'fan-to-earn';
  constructor(private primengConfig: PrimeNGConfig,
    dapp: DappInjector, store: Store, ){
      super(dapp, store);
    }
  ngOnInit() {
    this.primengConfig.ripple = true;
    document.documentElement.style.fontSize = '16px';
  }
}
