import { NgModule,InjectionToken } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FanToEarnComponent } from './fan-to-earn/fan-to-earn.component';
import { FanToEarnRoutingModule } from './fan-to-earn-routing.module';

import {DividerModule} from 'primeng/divider';
import { ButtonModule } from 'primeng/button';



@NgModule({
  declarations: [
    FanToEarnComponent
  ],
  imports: [
    CommonModule,
    FanToEarnRoutingModule,
    DividerModule,
    ButtonModule
  ],
  exports: [
    FanToEarnComponent,
  ],
  providers:[]
})
export class FanToEarnModule { }
