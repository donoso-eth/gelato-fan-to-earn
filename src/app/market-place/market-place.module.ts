import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MarketPlaceRoutingModule } from './market-place-routing.module';
import { MarketPlaceComponent } from './market-place/market-place.component';
import { NftModule } from '../shared/components/nft/nft.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';


@NgModule({
  declarations: [
    MarketPlaceComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MarketPlaceRoutingModule,
    DialogModule,
    ButtonModule,
    InputNumberModule,
    NftModule
  ]
})
export class MarketPlaceModule { }
