import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import {TenantslistComponent} from "./tenants/tenantslist/tenantslist.component";
import {PremiseListComponent} from "./premises/premise-list/premise-list.component";
import {RentalContractsListComponent} from "./contracts/rental-contracts/rental-contracts-list/rental-contracts-list.component";
import {
  RentalContractFormComponent
} from "./contracts/rental-contracts/rental-contract-form/rental-contract-form.component";
import {
  RentalContractsFormSetupComponent
} from "./contracts/rental-contracts/rental-contract-form/rental-contracts-form-setup/rental-contracts-form-setup.component";

const routes: Routes = [
  {path:'premises', component:PremiseListComponent},
  {path:'dashboard', component:DashboardComponent},
  {path:'tenants', component:TenantslistComponent},
  {path:'rental-contracts', component:RentalContractsListComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
