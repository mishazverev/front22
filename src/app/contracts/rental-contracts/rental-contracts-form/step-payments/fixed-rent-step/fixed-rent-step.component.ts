import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {RentalContractsService} from "../../../../../shared/services/rental-contracts.service";
import {StepPaymentService} from "../../../../../shared/services/step-payment.service";
import {StepPaymentValidatorService} from "../../../../../shared/validators/step-payment-validator.service";
import {RentalContractFeesService} from "../../../../../shared/services/rental-contract-fees.service";
import {EnumService} from "../../../../../shared/services/enum.service";
import {GlobalAppService} from "../../../../../shared/services/global-app.service";
import {ApiService} from "../../../../../shared/services/api.service";
import {RentalContractSetupService} from "../../../../../shared/services/rental-contract-setup.service";
import {DatePipe} from "@angular/common";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {NotificationService} from "../../../../../shared/notification.service";
import {tap} from "rxjs/operators";


@Component({
  selector: 'app-fixed-rent-step',
  templateUrl: './fixed-rent-step.component.html',
  styleUrls: ['./fixed-rent-step.component.sass']
})
export class FixedRentStepComponent implements OnInit, OnDestroy {

  public closeSubscription$: Subscription = new Subscription()

  constructor(
    public service: RentalContractsService,
    public stepService: StepPaymentService,
    public stepValidatorService: StepPaymentValidatorService,
    public feeService: RentalContractFeesService,
    public enumService: EnumService,
    public globalService: GlobalAppService,
    public apiService: ApiService,
    public setupService: RentalContractSetupService,
    private datepipe: DatePipe,
    public dialogRef: MatDialogRef<FixedRentStepComponent>,
    private dialog: MatDialog,
    private notificationService: NotificationService,
  ) {
  }

  ngOnInit(): void {

    this.stepService.rentContractRentStartDateActual = this.service.rentContractRentStartDateActual$.value
    this.stepService.rentContractStopBillingDateActualDate = this.service.rentContractStopBillingDateActual$.value

    this.closeSubscription$ = this.dialogRef.afterClosed().pipe(
      tap(
        () => {
          this.stepService.fixedRentStepFormLines.controls.forEach((line, index) => {
            if (line.invalid) {
              this.stepService.fixedRentStepFormLines.removeAt(index)
              this.stepService.fixedRentStepArray.value.splice(index, 1)}
          })
          this.stepService.fixedRentIntervalUsedDatesArrayTemp = []
        }
      )
    ).subscribe()
    console.log(this.stepService.fixedRentStepArray.value)
    console.log(this.stepService.fixedRentStepFormLines.value)
  }

  onSubmit() {
    this.dialogRef.close()
  }

  ngOnDestroy(){
    // this.stepService.cancelSubscriptions()
  }

}
