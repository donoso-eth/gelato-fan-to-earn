import { NgModule,InjectionToken } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FanToEarnComponent } from './fan-to-earn/fan-to-earn.component';
import { FanToEarnRoutingModule } from './fan-to-earn-routing.module';

import {DividerModule} from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { NftModule } from '../shared/components/nft/nft.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';



@NgModule({
  declarations: [
    FanToEarnComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FanToEarnRoutingModule,
    NftModule,
    DividerModule,
    ButtonModule,
    DropdownModule,
  ],
  exports: [
    FanToEarnComponent,
  ],
  providers:[]
})
export class FanToEarnModule { }
