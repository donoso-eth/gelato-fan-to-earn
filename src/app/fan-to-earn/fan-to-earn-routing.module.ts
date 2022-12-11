import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FanToEarnComponent } from './fan-to-earn/fan-to-earn.component';

const routes: Routes = [
  { path: '', component:FanToEarnComponent},

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FanToEarnRoutingModule {}
