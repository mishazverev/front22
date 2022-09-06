import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import {FormsModule, ReactiveFormsModule,} from "@angular/forms";
import { HttpClientModule} from "@angular/common/http";
import { DatePipe} from "@angular/common";
import { NotificationService } from "./shared/notification.service";

import { MatSnackBar } from "@angular/material/snack-bar";

import { MainNavComponent } from './main-nav/main-nav.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MaterialModule } from "./material/material.module";
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PremiseListComponent } from './premises/premise-list/premise-list.component';
import { PremiseFormComponent } from './premises/premise-form/premise-form.component';
import { TenantslistComponent } from './tenants/tenantslist/tenantslist.component';
import { TenantformComponent } from './tenants/tenantform/tenantform.component';
import { ModalContactDeleteComponent } from './modal-windows/modal-contact-delete/modal-contact-delete.component';
import { RentalContractsListComponent } from './contracts/rental-contracts/rental-contracts-list/rental-contracts-list.component';
import { RentalContractFormComponent } from './contracts/rental-contracts/rental-contract-form/rental-contract-form.component';
import { RentalContractsSetupComponent } from './contracts/rental-contracts/rental-contracts-setup/rental-contracts-setup.component';
import {MatProgressBarModule} from "@angular/material/progress-bar";
import { RentalContractsFormSetupComponent } from './contracts/rental-contracts/rental-contract-form/rental-contracts-form-setup/rental-contracts-form-setup.component';
import {MAT_DATE_LOCALE} from "@angular/material/core";
import { DateTransformCorrectHoursPipe } from './shared/pipes/date-transform-correct-hours.pipe';
import { ArraySortPipe } from './shared/pipes/array-sort.pipe';
import { FixedRentStepComponent } from './contracts/rental-contracts/rental-contract-form/step-payments/fixed-rent-step/fixed-rent-step.component';
import { PeriodicalFeeStepComponent } from './contracts/rental-contracts/rental-contract-form/step-payments/periodical-fee-step/periodical-fee-step.component';
import {MatDialogRef} from "@angular/material/dialog";
import { RentalContractAdditionalAgreementComponent } from './contracts/rental-contracts/rental-contract-additional-agreement/rental-contract-additional-agreement.component';

@NgModule({
  declarations: [
    AppComponent,
    MainNavComponent,
    DashboardComponent,
    TenantslistComponent,
    TenantformComponent,
    ModalContactDeleteComponent,
    RentalContractsListComponent,
    PremiseListComponent,
    PremiseFormComponent,
    RentalContractFormComponent,
    RentalContractsSetupComponent,
    RentalContractsFormSetupComponent,
    DateTransformCorrectHoursPipe,
    ArraySortPipe,
    FixedRentStepComponent,
    PeriodicalFeeStepComponent,
    RentalContractAdditionalAgreementComponent,
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        LayoutModule,
        MaterialModule,
        ReactiveFormsModule,
        HttpClientModule,
        FormsModule,
        MatProgressBarModule,


    ],
  exports: [
  ],
  providers: [ DateTransformCorrectHoursPipe, ArraySortPipe,
  DatePipe, NotificationService, MatSnackBar,
    {
      provide: MatDialogRef,
      useValue: {}
    },
    {provide: MAT_DATE_LOCALE, useValue: 'ru-RU'},

],
  bootstrap: [AppComponent],
  entryComponents: [PremiseFormComponent],
})
export class AppModule { }
