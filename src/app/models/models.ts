export interface BuildingModel{
  id: number
  address_postal_index: string
  address_country: string
  address_city: string
  address_street_number: string
  number_of_floors: number
  description: string
  last_updated: Date
  user_updated: string
}

export interface BrandCategoryTagModel {
  id: number
  category_tag_name: string
  category_tag_description: string
}

export interface BrandModel {
  id: number
  brand_name: string
  brand_description: string
  brand_category_tag: []

  retail_premise_type: string
  needed_min_area: number
  needed_max_area: number
  needed_ceiling_height: number
  needed_facade_length: number
  needed_fitout_condition: boolean
  needed_electric_capacity: number
  needed_cooling_capacity: number
  needed_water_supply: boolean
  needed_additional_requirements: string
}



export interface CounterModel{
  id: number
  counter_number: number
  counter_utility_type: string
  counter_description: string
  last_updated: Date
  user_updated: string
}

export interface PremiseModel {
  id: number
  number: string
  premise_type: string

  floor: number
  measured_area: number
  measurement_date: Date
  contracted: boolean
  description: string

  ceiling_height: number
  facade_length: number
  fitout_condition: boolean
  electric_capacity: number
  cooling_capacity: number
  water_supply: boolean

  last_updated: Date
  user_updated: string
}

export interface PremiseModelStep1 {
  id: number
  number: string
  premise_type: string

  floor: number
  measured_area: number
  measurement_date: Date
  contracted: boolean
  description: string

  last_updated: Date
  user_updated: string
}

export interface PremiseModelStep2 {
  ceiling_height: number
  facade_length: number
  fitout_condition: boolean
  electric_capacity: number
  cooling_capacity: number
  water_supply: boolean
}


export interface TenantModel {
  id: number
  //form1
  company_name: string
  needed_premise_type: string
  brands_id: [number]
  description: string

  //form2
  needed_min_area: number
  needed_max_area: number
  needed_ceiling_height: number
  needed_fitout_condition: boolean
  needed_electric_capacity: number
  needed_cooling_capacity: number
  needed_water_supply: boolean
  needed_additional_requirements: string

  //form3
  legal_name: string
  tax_id: number
  signing_person_name: string
  signing_person_position: string
  legal_address: string
  postal_address: string

  kpp: number
  bik: number
  bank_name: string
  current_account: number
  correspondent_account: number
  ogrn: number
  okpo: number
  registration_authority: string
  legal_entity_certificate_number: string

  last_updated: Date;
  user_updated: string;
}

export interface TenantExtendedModel extends TenantModel{
  brands_name: string[]
}

export interface TenantContactsModelApi{
  id: number
  tenant_contractor_id: number
  contact_person_name: string
  contact_person_position: string
  contact_person_email: string
  contact_person_phone: string
  contact_person_mobile1: string
  contact_person_mobile2: string
}

export enum PremiseType {
  retail_premise = 'Торговое помещение',
  office_premise = 'Офисное помещение',
  warehouse_premise = 'Склаское помещение'
}

export interface RentalContractModel{

  id: number

  rent_contract_number: string
  rent_contract_signing_date: Date
  rent_contract_expiration_date: Date

  building_id: number
  premise_id: number[]
  contracted_area: string
  tenant_contractor_id: number
  brand: number

  act_of_transfer_date: Date
  rent_start_date: Date
  stop_billing_date: Date
  premise_return_date: Date


  fixed_rent_name: string
  fixed_rent_calculation_period: string
  fixed_rent_payment_period: string
  fixed_rent_calculation_method: string

  fixed_rent_per_sqm: number
  fixed_rent_total_payment: number
  fixed_rent_prepayment_or_postpayment: string

  fixed_rent_advance_payment_day: number
  fixed_rent_post_payment_day: number
  fixed_rent_indexation_type: string
  fixed_rent_indexation_fixed: number

  turnover_fee_is_applicable: boolean
  turnover_fee: number
  turnover_fee_period: string
  turnover_data_providing_day: number
  turnover_fee_payment_day: number

  CA_utilities_compensation_is_applicable: boolean
  CA_utilities_compensation_type: string

  CA_utilities_compensation_fixed_indexation_type: string
  CA_utilities_compensation_fee_fixed: number
  CA_utilities_compensation_fee_fixed_indexation_type_fixed: number

  CA_utilities_compensation_fee_prepayment_or_postpayment: string
  CA_utilities_compensation_fee_advance_payment_day: number
  CA_utilities_compensation_fee_post_payment_day: number

  guarantee_deposit_required: boolean
  guarantee_deposit_coverage_number_of_periods: number
  guarantee_deposit_type: string
  guarantee_deposit_amount: number
  guarantee_deposit_contract_providing_date: Date
  guarantee_deposit_actual_providing_date: Date
  guarantee_bank_guarantee_expiration_date: Date

  insurance_required: boolean
  insurance_contract_providing_date: Date
  insurance_actual_providing_date: Date
  insurance_expiration_date: Date

  last_updated: Date
  user_updated: string
}

export interface RentalContractModelExpanded extends RentalContractModel{
  tenant_contractor_company_name: string
  premise_number: string[]
  brand_name: string
}

export interface AdditionalAgreementModel{
  id: number
  rent_contract_id: number
  additional_agreement_number: string
  additional_agreement_signing_date: Date
  additional_agreement_expiration_date: Date

  premise_id: number
  contracted_area: number
  tenant_contractor_id: number
  brand: string

  act_of_transfer_date: Date
  rent_start_date: Date
  premise_return_date: Date
  stop_billing_date: Date

  fixed_rent_calculation_period: string
  fixed_rent_payment_period: string

  fixed_rent_per_sqm: number
  fixed_rent_total_payment: number
  fixed_rent_advance_payment_day: number
  fixed_rent_post_payment_day: number
  fixed_rent_indexation_type: string
  fixed_rent_indexation_fixed: number

  turnover_fee: number
  turnover_fee_period: number
  turnover_data_providing_day: number
  turnover_fee_payment_day: number

  CA_utilities_compensation_type: string
  CA_utilities_compensation_fixed_indexation_type: string

  CA_utilities_compensation_fee_fixed: number
  CA_utilities_compensation_fee_fixed_indexation_type_fixed: number
  CA_utilities_compensation_fee_payment_day: number

  guarantee_deposit_required: boolean
  guarantee_deposit_coverage_number_of_periods: number
  guarantee_deposit_type: string
  guarantee_deposit_amount: number
  guarantee_deposit_contract_providing_date: Date
  guarantee_deposit_actual_providing_date: Date
  guarantee_bank_guarantee_expiration_date: Date

  insurance_required: boolean
  insurance_contract_providing_date: Date
  insurance_actual_providing_date: Date
  insurance_expiration_date: Date

  last_updated: Date
  user_updated: string
}

export interface RentalContractPeriodicalFeeModel{
  id: number
  rent_contract_id: number
  rent_contract_additional_agreement_id: string
  periodical_fee_name: string
  periodical_fee_calculation_period: string
  periodical_fee_payment_period: string
  periodical_fee_calculation_method: string
  periodical_fee_per_sqm: number
  periodical_fee_total_payment: number
  periodical_fee_prepayment_or_postpayment: string
  periodical_fee_advance_payment_day: number
  periodical_fee_post_payment_day: number
  periodical_fee_indexation_type: string
  periodical_payment_indexation_fixed: number
  last_updated: Date
  user_updated: string
}

export interface RentalContractOneTimeFeeModel{
  id: number
  rent_contract_id: number
  rent_contract_additional_agreement_id: string
  one_time_fee_name: string
  one_time_fee_calculation_method: string
  one_time_fee_payment_term: string
  one_time_fee_payment_triggering_event: string
  one_time_fee_per_sqm: number
  one_time_fee_total_payment: number
  one_time_fee_contract_payment_date: Date
  one_time_fee_contract_triggering_event_related_payment_day: number
  last_updated: Date
  user_updated: string
  }

export interface RentalContractUtilityFeeModel{
  id: number
  rent_contract_id: number
  rent_contract_additional_agreement_id: string
  utility_name: string
  compensation_type: string
  // counter_id: number[]
  compensation_calculation_period: string
  compensation_payment_period: string
  compensation_fixed_fee: number
  compensation_fixed_fee_indexation_type: string
  compensation_fixed_fee_indexation_fixed: number
  compensation_fixed_fee_prepayment_or_postpayment: string
  compensation_advance_payment_day: number
  compensation_counter_data_providing_day: number
  compensation_post_payment_day: number
  last_updated: Date
  user_updated: string
}

export interface RentalContractSetupModel {
  id: number
  building_id: number

  fixed_rent_name: string
  fixed_rent_calculation_method: string
  fixed_rent_calculation_period: string
  fixed_rent_payment_period: string

  fixed_rent_per_sqm: number
  fixed_rent_total_payment: number

  fixed_rent_prepayment_or_postpayment: string
  fixed_rent_advance_payment_day: number
  fixed_rent_post_payment_day: number

  fixed_rent_indexation_type: string
  fixed_rent_indexation_fixed: number

  turnover_fee_is_applicable: boolean
  turnover_fee: number
  turnover_fee_period: string
  turnover_data_providing_day: number
  turnover_fee_payment_day: number

  CA_utilities_compensation_is_applicable: boolean
  CA_utilities_compensation_type: string
  CA_utilities_compensation_fixed_indexation_type: string

  CA_utilities_compensation_fee_fixed: number
  CA_utilities_compensation_fee_fixed_indexation_type_fixed: number

  CA_utilities_compensation_fee_prepayment_or_postpayment: string
  CA_utilities_compensation_fee_advance_payment_day: number
  CA_utilities_compensation_fee_post_payment_day: number


  guarantee_deposit_required: boolean
  guarantee_deposit_coverage_number_of_periods: number

  insurance_required: boolean

  last_updated: Date
  user_updated: string

}

export interface RentalContractPeriodicalFeeSetupModel {
  id: number
  rent_contract_setup_id: number
  periodical_fee_name: string
  periodical_fee_calculation_period: string
  periodical_fee_payment_period: string
  periodical_fee_calculation_method: string
  periodical_fee_per_sqm: number
  periodical_fee_total_payment: number
  periodical_fee_prepayment_or_postpayment: string
  periodical_fee_advance_payment_day: number
  periodical_fee_post_payment_day: number
  periodical_fee_indexation_type: string
  periodical_payment_indexation_fixed: number
  last_updated: Date
  user_updated: string
}

export interface RentalContractOneTimeFeeSetupModel {
  id: number
  rent_contract_setup_id: number
  one_time_fee_name: string
  one_time_fee_calculation_method: string
  one_time_fee_payment_term: string
  one_time_fee_payment_triggering_event: string
  one_time_fee_per_sqm: number
  one_time_fee_total_payment: number
  one_time_fee_contract_payment_date: Date
  one_time_fee_contract_triggering_event_related_payment_day: number
  last_updated: Date
  user_updated: string
}

export interface RentalContractUtilityFeeSetupModel {
  id: number
  rent_contract_setup_id: number
  utility_name: string
  compensation_type: string
  compensation_calculation_period: string
  compensation_payment_period: string
  compensation_fixed_fee: number
  compensation_fixed_fee_indexation_type: string
  compensation_fixed_fee_indexation_fixed: number
  compensation_fixed_fee_prepayment_or_postpayment: string
  compensation_advance_payment_day: number
  compensation_counter_data_providing_day: number
  compensation_post_payment_day: number
  last_updated: Date
  user_updated: string
}

export interface Select {
  value: string
  viewValue: string
}

export interface BuildingSetup {
  building_id: number
  rental_contract_setup_exist: boolean
}

export interface Counter {
  id: number
  counter_number: string
  counter_utility_type: string
  counter_description: string
  last_updated: Date
  user_updated: string
}
