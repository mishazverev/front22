import {Component, OnDestroy, OnInit} from '@angular/core';
import {RentalContractsService} from "../../../shared/services/rental-contract/rental-contracts.service";
import {
  RentalContractStepPaymentService
} from "../../../shared/services/rental-contract/rental-contract-step-payment.service";
import {RentalContractFeesService} from "../../../shared/services/rental-contract/rental-contract-fees.service";
import {EnumService} from "../../../shared/services/enum.service";
import {GlobalAppService} from "../../../shared/services/global-app.service";
import {ApiService} from "../../../shared/services/api.service";
import {RentalContractSetupService} from "../../../shared/services/rental-contract/rental-contract-setup.service";
import {
  RentalContractAdditionalAgreementService
} from "../../../shared/services/rental-contract/rental-contract-additional-agreement.service";
import {DatePipe} from "@angular/common";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {NotificationService} from "../../../shared/notification.service";
import {
  RentalContractsFormSetupComponent
} from "../rental-contracts-form/rental-contracts-form-setup/rental-contracts-form-setup.component";

@Component({
  selector: 'app-rental-contract-frame',
  templateUrl: './rental-contract-frame.component.html',
  styleUrls: ['./rental-contract-frame.component.sass']
})
export class RentalContractFrameComponent implements OnInit, OnDestroy {

  constructor(
    public service: RentalContractsService,
    public feeService: RentalContractFeesService,
    public enumService: EnumService,
    public globalService: GlobalAppService,
    public apiService: ApiService,
    public setupService: RentalContractSetupService,
    public additionalAgreementService: RentalContractAdditionalAgreementService,
    public dialogRef: MatDialogRef<RentalContractFrameComponent>,
    private dialog: MatDialog,
    ) { }

  ngOnInit(): void {
  }

  contractSetupOpen(){
    const dialogConfig = new MatDialogConfig()
    dialogConfig.disableClose = false
    dialogConfig.autoFocus = true
    dialogConfig.width = '1400px'
    dialogConfig.maxHeight = '90%'
    this.dialog.open(RentalContractsFormSetupComponent, dialogConfig)
  }

  // Subscriptions teardown
  cancelSubscriptions(){
    this.service.rentContractPremiseAreaSummingSubscription$.unsubscribe()
    this.service.rentContractPremiseSubscription$.unsubscribe()
    this.service.rentContractDateSubscription$.unsubscribe()
    this.service.guaranteeDepositTypeSubscription$.unsubscribe()
    this.service.guaranteeDepositCoverageSubscription$.unsubscribe()

    this.feeService.periodicalFeeMethodSubscriptionArray.forEach(subscription => subscription.unsubscribe())
    this.feeService.periodicalFeeCalculationPeriodSubscriptionArray.forEach(subscription => subscription.unsubscribe())
    this.feeService.periodicalFeeIndexationSubscriptionArray.forEach(subscription => subscription.unsubscribe())
    this.feeService.periodicalFeePaymentSubscriptionArray.forEach(subscription => subscription.unsubscribe())

    this.feeService.oneTimeFeeTriggeringEventSubscriptionArray.forEach(subscription => subscription.unsubscribe())
    this.feeService.oneTimeFeeTriggeringEventDaySubscriptionArray.forEach(subscription => subscription.unsubscribe())
    this.feeService.oneTimeFeePaymentSubscriptionArray.forEach(subscription => subscription.unsubscribe())
    this.feeService.oneTimeFeeMethodSubscriptionArray.forEach(subscription => subscription.unsubscribe())

    this.service.rentContractTenantChangeSubscription$.unsubscribe()
    this.service.rentContractBrandSelectSubscription$.unsubscribe()
    this.service.intervalDatesValidationSubscription$.unsubscribe()
    this.service.rentContractFieldsDisablingSubscription.unsubscribe()
  }

  ngOnDestroy() {
    this.cancelSubscriptions()
    console.log('Rental contracts form is closed')
  }
}
