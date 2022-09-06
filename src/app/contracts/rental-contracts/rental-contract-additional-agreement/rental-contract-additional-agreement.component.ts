import { Component, OnInit } from '@angular/core';
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
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {NotificationService} from "../../../shared/notification.service";

@Component({
  selector: 'app-rental-contract-additional-agreement',
  templateUrl: './rental-contract-additional-agreement.component.html',
  styleUrls: ['./rental-contract-additional-agreement.component.sass']
})
export class RentalContractAdditionalAgreementComponent implements OnInit {

  constructor(
    public service: RentalContractsService,
    public stepService: RentalContractStepPaymentService,
    public feeService: RentalContractFeesService,
    public enumService: EnumService,
    public globalService: GlobalAppService,
    public apiService: ApiService,
    public setupService: RentalContractSetupService,
    public additionalAgreementService: RentalContractAdditionalAgreementService,
    private datepipe: DatePipe,
    public dialogRef: MatDialogRef<RentalContractAdditionalAgreementComponent>,
    private dialog: MatDialog,
    private notificationService: NotificationService,
  ) { }

  ngOnInit(): void {
  }

  onSubmit(){

  }
  onClose(){

  }
}
