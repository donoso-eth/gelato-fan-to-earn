import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MarketPlaceRoutingModule } from './market-place-routing.module';
import { MarketPlaceComponent } from './market-place/market-place.component';


@NgModule({
  declarations: [
    MarketPlaceComponent
  ],
  imports: [
    CommonModule,
    MarketPlaceRoutingModule
  ]
})
export class MarketPlaceModule { }
