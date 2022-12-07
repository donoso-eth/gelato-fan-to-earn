import { NgModule,InjectionToken } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FanToEarnComponent } from './fan-to-earn/fan-to-earn.component';





@NgModule({
  declarations: [
    FanToEarnComponent
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    FanToEarnComponent,
  ],
  providers:[]
})
export class FanToEarnModule { }
