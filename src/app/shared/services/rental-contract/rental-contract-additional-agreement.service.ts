import { Injectable } from '@angular/core';
import {AdditionalAgreementModel, FixedRentStepModel, RentalContractModelExpanded} from "../../../models/models";
import {BehaviorSubject} from "rxjs";
import {FormArray, FormBuilder, FormControl, Validators} from "@angular/forms";
import {ApiService} from "../api.service";
import {GlobalAppService} from "../global-app.service";
import {MatDialog} from "@angular/material/dialog";

@Injectable({
  providedIn: 'root'
})
export class RentalContractAdditionalAgreementService {
  additionalAgreementsArray = new BehaviorSubject<AdditionalAgreementModel[]>([])// Additional agreements array

  constructor(
    public fb: FormBuilder,
    public apiService: ApiService,
    public globalService: GlobalAppService,
    public modalContactDeleteDialog: MatDialog,
  ) { }

  additionalAgreementCardsForm = this.fb.group({
    additionalAgreementsFormArray: this.fb.array([
    ])
  })
  additionalAgreementCards: FormArray = this.additionalAgreementCardsForm.get('additionalAgreementsFormArray') as FormArray

  setNewAdditionalAgreementCard(contract: RentalContractModelExpanded) {
    const additionalAgreementObject = {} as AdditionalAgreementModel
    this.additionalAgreementsArray.value.push(additionalAgreementObject)
    this.additionalAgreementCards.push(
      this.fb.group({
        id: new FormControl(''),
        rent_contract_id: new FormControl(contract.id),
        additional_agreement_number: new FormControl(''),
        additional_agreement_signing_date: new FormControl('', Validators.required),
        additional_agreement_expiration_date: new FormControl('', Validators.required),

        premise_id: new FormControl(contract.premise_id),
        contracted_area: new FormControl(contract.contracted_area),
        tenant_contractor_id: new FormControl(contract.tenant_contractor_id),
        brand: new FormControl(contract.brand),

        rent_start_date: new FormControl(contract.rent_start_date),
        stop_billing_date: new FormControl(contract.stop_billing_date),

        fixed_rent_calculation_period: new FormControl(contract.fixed_rent_calculation_period),
        fixed_rent_payment_period: new FormControl(contract.fixed_rent_payment_period),
        fixed_rent_calculation_method: new FormControl(contract.fixed_rent_calculation_method),

        fixed_rent_per_sqm: new FormControl(contract.fixed_rent_per_sqm),
        fixed_rent_total_payment: new FormControl(contract.fixed_rent_total_payment),
        fixed_rent_prepayment_or_postpayment:  new FormControl(contract.fixed_rent_prepayment_or_postpayment),

        fixed_rent_advance_payment_day: new FormControl(contract.fixed_rent_advance_payment_day),
        fixed_rent_post_payment_day: new FormControl(contract.fixed_rent_post_payment_day),
        fixed_rent_indexation_type: new FormControl(contract.fixed_rent_indexation_type),
        fixed_rent_indexation_fixed: new FormControl(contract.fixed_rent_indexation_fixed),

        turnover_fee_is_applicable: new FormControl(contract.turnover_fee_is_applicable),
        turnover_fee: new FormControl(contract.turnover_fee),
        turnover_fee_period: new FormControl(contract.turnover_fee_period),
        turnover_data_providing_day: new FormControl(contract.turnover_data_providing_day),
        turnover_fee_payment_day: new FormControl(contract.turnover_fee_payment_day),

        CA_utilities_compensation_is_applicable: new FormControl(contract.CA_utilities_compensation_is_applicable),
        CA_utilities_compensation_type: new FormControl(contract.CA_utilities_compensation_type),
        CA_utilities_compensation_fixed_indexation_type: new FormControl(contract.CA_utilities_compensation_fixed_indexation_type),

        CA_utilities_compensation_fee_fixed: new FormControl(contract.CA_utilities_compensation_fee_fixed),
        CA_utilities_compensation_fee_fixed_indexation_type_fixed: new FormControl(contract.CA_utilities_compensation_fee_fixed_indexation_type_fixed),
        CA_utilities_compensation_fee_prepayment_or_postpayment: new FormControl(contract.CA_utilities_compensation_fee_prepayment_or_postpayment),

        CA_utilities_compensation_fee_advance_payment_day: new FormControl(contract.CA_utilities_compensation_fee_advance_payment_day),
        CA_utilities_compensation_fee_post_payment_day: new FormControl(contract.CA_utilities_compensation_fee_post_payment_day),

        guarantee_deposit_required: new FormControl(contract.guarantee_deposit_required),
        guarantee_deposit_coverage_number_of_periods: new FormControl(contract.guarantee_deposit_coverage_number_of_periods),
        guarantee_deposit_type: new FormControl(contract.guarantee_deposit_type),
        guarantee_deposit_amount: new FormControl(contract.guarantee_deposit_amount),
        guarantee_deposit_contract_providing_date: new FormControl(contract.guarantee_deposit_contract_providing_date),
        guarantee_deposit_actual_providing_date: new FormControl(contract.guarantee_deposit_actual_providing_date),
        guarantee_bank_guarantee_expiration_date: new FormControl(contract.guarantee_bank_guarantee_expiration_date),

        insurance_required: new FormControl(contract.insurance_required),
        insurance_contract_providing_date: new FormControl(contract.insurance_contract_providing_date),
        insurance_actual_providing_date: new FormControl(contract.insurance_actual_providing_date),
        insurance_expiration_date: new FormControl(contract.insurance_expiration_date),

        last_updated: new FormControl(''),
        user_updated: new FormControl(''),
      })
    )
    console.log('New Additional Agreement card is added')
    return this.additionalAgreementCards
  }

  createAdditionalAgreement() {

  }
}
