import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {
  BrandModel,
  PremiseModel,
  RentalContractModel,
  RentalContractModelExpanded,
  TenantModel,

  BuildingModel,
  CounterModel,
  BrandCategoryTagModel,
  AdditionalAgreementModel,
  RentalContractSetupModel,
  RentalContractPeriodicalFeeSetupModel,
  RentalContractOneTimeFeeSetupModel,
  RentalContractUtilityFeeSetupModel,
  RentalContractUtilityFeeModel,
  RentalContractPeriodicalFeeModel,
  RentalContractOneTimeFeeModel, FixedRentStepModel
} from "../../models/models";

interface TenantContactsModelApi{
  id: number
  tenant_contractor_id: number
  contact_person_name: string
  contact_person_position: string
  contact_person_email: string
  contact_person_phone: string
  contact_person_mobile1: string
  contact_person_mobile2: string
}

interface TenantContactsModelApi extends Array<TenantContactsModelApi>{}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  baseUrl = 'https://rebackend22.herokuapp.com/'

  baseBuildingUrl = `${this.baseUrl}api/buildings/`;

  baseBrandUrl = `${this.baseUrl}api/brands/`;
  baseBrandCategoryTagUrl = `${this.baseUrl}api/brand-category-tags/`;

  basePremiseUrl = `${this.baseUrl}api/premises/`;
  baseCounterUrl = `${this.baseUrl}api/counters/`;

  baseTenantUrl = `${this.baseUrl}api/tenants/`;
  baseTenantContactsUrl = `${this.baseUrl}api/tenant-contacts/`;
  baseLastTenantUrl = `${this.baseUrl}api/lasttenant`;
  baseLastBrandUrl = `${this.baseUrl}api/lastbrand`;

  baseRentalContractUrl = `${this.baseUrl}api/rent-contracts/`;
  baseAdditionalAgreementUrl = `${this.baseUrl}api/additional-agreements/`;

  baseRentalContractPeriodicalFeeUrl = `${this.baseUrl}api/rent-contract-periodical-fee/`;
  baseRentalContractOneTimeFeeUrl = `${this.baseUrl}api/rent-contract-one-time-fee/`;
  baseRentalContractUtilityFeeUrl = `${this.baseUrl}api/rent-contract-utility-fee/`;

  baseRentalContractSetupUrl = `${this.baseUrl}api/rent-contract-setup/`;
  baseRentalContractPeriodicalFeeSetupUrl = `${this.baseUrl}api/rent-contract-periodical-fee-setup/`;
  baseRentalContractOneTimeFeeSetupUrl = `${this.baseUrl}api/rent-contract-one-time-fee-setup/`;
  baseRentalContractUtilityFeeSetupUrl = `${this.baseUrl}api/rent-contract-utility-fee-setup/`;

  baseFixedRentStepUrl = `${this.baseUrl}api/fixed-rent-step/`;

  headers = new HttpHeaders({
    'Content-type': 'application/json',
    Authorization: 'Token'
  })

  constructor(private httpClient: HttpClient) {
  }

  //Buildings
  getBuildings() {
    return this.httpClient.get<BuildingModel>(this.baseBuildingUrl, {headers: this.headers})
  }

  getBuilding(id: number) {
    return this.httpClient.get<BuildingModel>(`${this.baseBuildingUrl}${id}/`)
  }

  createBuilding(data: BuildingModel) {
    const body = JSON.stringify(data)
    return this.httpClient.post(this.baseBuildingUrl, body, {headers: this.headers})
  }

  updateBuilding(id: number, data: BuildingModel) {
    const body = JSON.stringify(data);
    return this.httpClient.put(`${this.baseBuildingUrl}${id}/`, body, {headers: this.headers});
  }

  deleteBuilding(id: number) {
    return this.httpClient.delete(`${this.baseBuildingUrl}${id}/`, {headers: this.headers});
  }

  // BrandCategoryTags

  getBrandCategoryTags() {
    return this.httpClient.get<BrandCategoryTagModel>(this.baseBrandCategoryTagUrl, {headers: this.headers})
  }

  getBrandCategoryTag(id: number) {
    return this.httpClient.get<BrandCategoryTagModel>(`${this.baseBrandCategoryTagUrl}${id}`)
  }

  createBrandCategoryTag(data: BrandCategoryTagModel) {
    const body = JSON.stringify(data)
    return this.httpClient.post(this.baseBrandCategoryTagUrl, body, {headers: this.headers})
  }

  updateBrandCategoryTag(id: number, data: BrandCategoryTagModel) {
    const body = JSON.stringify(data);
    return this.httpClient.put(`${this.baseBrandCategoryTagUrl}${id}/`, body, {headers: this.headers});
  }

  deleteBrandCategoryTag(id: number) {
    return this.httpClient.delete(`${this.baseBrandCategoryTagUrl}${id}/`, {headers: this.headers});
  }

  // Brands

  getBrands() {
    return this.httpClient.get<BrandModel[]>(this.baseBrandUrl, {headers: this.headers})
  }

  getLastBrand() {
    return this.httpClient.get<BrandModel>(this.baseLastBrandUrl, {headers: this.headers})
  }

  getBrand(id: number) {
    return this.httpClient.get<BrandModel>(`${this.baseBrandUrl}${id}`)
  }

  createBrand(data: BrandModel) {
    const body = JSON.stringify(data)
    return this.httpClient.post(this.baseBrandUrl, body, {headers: this.headers})
  }

  updateBrand(id: number, data: BrandModel) {
    const body = JSON.stringify(data);
    return this.httpClient.put(`${this.baseBrandUrl}${id}/`, body, {headers: this.headers});
  }

  deleteBrand(id: number) {
    return this.httpClient.delete(`${this.baseBrandUrl}${id}/`, {headers: this.headers});
  }

  //Premises
  getPremises() {
    return this.httpClient.get<PremiseModel[]>(this.basePremiseUrl, {headers: this.headers})
  }

  getPremise(id: number) {
    return this.httpClient.get<PremiseModel>(`${this.basePremiseUrl}${id}/`)
  }

  createPremise(data: PremiseModel) {
    const body = JSON.stringify(data)
    return this.httpClient.post(this.basePremiseUrl, body, {headers: this.headers})
  }

  updatePremise(id: number, data: PremiseModel) {
    const body = JSON.stringify(data);
    return this.httpClient.put(`${this.basePremiseUrl}${id}/`, body, {headers: this.headers});
  }

  deletePremise(id: number) {
    return this.httpClient.delete(`${this.basePremiseUrl}${id}/`, {headers: this.headers});
  }

  //Counters
  getCounters() {
    return this.httpClient.get<CounterModel>(this.baseCounterUrl, {headers: this.headers})
  }

  getCounter(id: number) {
    return this.httpClient.get<CounterModel>(`${this.baseCounterUrl}${id}/`)
  }

  createCounter(data: CounterModel) {
    const body = JSON.stringify(data)
    return this.httpClient.post(this.baseCounterUrl, body, {headers: this.headers})
  }

  updateCounter(id: number, data: CounterModel) {
    const body = JSON.stringify(data);
    return this.httpClient.put(`${this.baseCounterUrl}${id}/`, body, {headers: this.headers});
  }

  deleteCounter(id: number) {
    return this.httpClient.delete(`${this.baseCounterUrl}${id}/`, {headers: this.headers});
  }

  //Tenants
  getTenants() {
    return this.httpClient.get<TenantModel[]>(this.baseTenantUrl, {headers: this.headers})
  }

  getTenant(id: number) {
    return this.httpClient.get<TenantModel>(`${this.baseTenantUrl}${id}/`)
  }

  getLastTenant() {
    return this.httpClient.get(this.baseLastTenantUrl, {headers: this.headers})
  }

  createTenant(data: TenantModel) {
    const body = JSON.stringify(data)
    return this.httpClient.post(this.baseTenantUrl, body, {headers: this.headers})
  }

  updateTenant(id: number, data: TenantModel) {
    const body = JSON.stringify(data);
    return this.httpClient.put(`${this.baseTenantUrl}${id}/`, body, {headers: this.headers});
  }

  deleteTenant(id: number) {
    return this.httpClient.delete(`${this.baseTenantUrl}${id}/`, {headers: this.headers});
  }

  // TenantContacts
  getTenantContacts() {
  return this.httpClient.get<TenantContactsModelApi>(this.baseTenantContactsUrl, {headers: this.headers})
}

  getTenantContact(tenant_contractor_id: number) {
  return this.httpClient.get<TenantContactsModelApi>(`${this.baseTenantContactsUrl}?tenant_contractor_id=${tenant_contractor_id}`)
}

  createTenantContact(data: TenantContactsModelApi) {
  const body = JSON.stringify(data)
  return this.httpClient.post(this.baseTenantContactsUrl, body, {headers: this.headers})
}

  updateTenantContact(id: number, data: TenantContactsModelApi) {
  const body = JSON.stringify(data);
  return this.httpClient.put(`${this.baseTenantContactsUrl}${id}/`, body, {headers: this.headers});
}

  deleteTenantContact(id: number) {
  return this.httpClient.delete(`${this.baseTenantContactsUrl}${id}/`, {headers: this.headers});
}

  // RentalContracts
  getRentalContracts() {
    return this.httpClient.get<RentalContractModelExpanded[]>(this.baseRentalContractUrl, {headers: this.headers})
  }

  getRentalContract(id: number) {
    return this.httpClient.get<RentalContractModelExpanded>(`${this.baseRentalContractUrl}?id=${id}`)
  }

  createRentalContract(data: RentalContractModel) {
    const body = JSON.stringify(data)
    return this.httpClient.post(this.baseRentalContractUrl, body, {headers: this.headers})
  }

  updateRentalContract(id: number, data: RentalContractModel) {
    const body = JSON.stringify(data);
    return this.httpClient.put(`${this.baseRentalContractUrl}${id}/`, body, {headers: this.headers});
  }

  deleteRentalContract(id: number) {
    return this.httpClient.delete(`${this.baseRentalContractUrl}${id}/`, {headers: this.headers});
  }

  // AdditionalAgreements
  getAdditionalAgreements() {
    return this.httpClient.get<AdditionalAgreementModel[]>(this.baseAdditionalAgreementUrl, {headers: this.headers})
  }

  getAdditionalAgreementsByRentalContract(rent_contract_id: number) {
    return this.httpClient.get<AdditionalAgreementModel[]>(`${this.baseAdditionalAgreementUrl}?rent_contract_id=${rent_contract_id}`)
  }

  getAdditionalAgreement(id: number) {
    return this.httpClient.get<AdditionalAgreementModel>(`${this.baseAdditionalAgreementUrl}?id=${id}`)
  }

  createAdditionalAgreement(data: AdditionalAgreementModel) {
    const body = JSON.stringify(data)
    return this.httpClient.post(this.baseAdditionalAgreementUrl, body, {headers: this.headers})
  }

  updateAdditionalAgreement(id: number, data: AdditionalAgreementModel) {
    const body = JSON.stringify(data);
    return this.httpClient.put(`${this.baseAdditionalAgreementUrl}${id}/`, body, {headers: this.headers});
  }

  deleteAdditionalAgreement(id: number) {
    return this.httpClient.delete(`${this.baseAdditionalAgreementUrl}${id}/`, {headers: this.headers});
  }


  // RentalContractPeriodicalFee

  getRentalContractPeriodicalFees() {
    return this.httpClient.get<RentalContractPeriodicalFeeModel[]>(this.baseRentalContractPeriodicalFeeUrl, {headers: this.headers})
  }

  getRentalContractPeriodicalFee(id: number) {
    return this.httpClient.get<RentalContractPeriodicalFeeModel>(`${this.baseRentalContractPeriodicalFeeUrl}?id=${id}`)
  }

  getRentalContractPeriodicalFeeByRentalContract(rent_contract_id: number) {
    return this.httpClient.get<RentalContractPeriodicalFeeModel[]>(`${this.baseRentalContractPeriodicalFeeUrl}?rent_contract_id=${rent_contract_id}`)
  }

  getRentalContractPeriodicalFeeByAdditionalAgreement(rent_contract_additional_agreement_id: number) {
    return this.httpClient.get<RentalContractPeriodicalFeeModel[]>(`${this.baseRentalContractPeriodicalFeeUrl}?rent_contract_additional_agreement_id=${rent_contract_additional_agreement_id}`)
  }

  createRentalContractPeriodicalFee(data: RentalContractPeriodicalFeeModel) {
    const body = JSON.stringify(data)
    return this.httpClient.post(this.baseRentalContractPeriodicalFeeUrl, body, {headers: this.headers})
  }

  updateRentalContractPeriodicalFee(id: number, data: RentalContractPeriodicalFeeModel) {
    const body = JSON.stringify(data);
    return this.httpClient.put(`${this.baseRentalContractPeriodicalFeeUrl}${id}/`, body, {headers: this.headers});
  }

  deleteRentalContractPeriodicalFee(id: number) {
    return this.httpClient.delete(`${this.baseRentalContractPeriodicalFeeUrl}${id}/`, {headers: this.headers});
  }

  // RentalContractOneTimeFee

  getRentalContractOneTimeFees() {
    return this.httpClient.get<RentalContractOneTimeFeeModel[]>(this.baseRentalContractOneTimeFeeUrl, {headers: this.headers})
  }

  getRentalContractOneTimeFee(id: number) {
    return this.httpClient.get<RentalContractOneTimeFeeModel>(`${this.baseRentalContractOneTimeFeeUrl}?id=${id}`)
  }

  getRentalContractOneTimeFeeByRentalContract(rent_contract_id: number) {
    return this.httpClient.get<RentalContractOneTimeFeeModel[]>(`${this.baseRentalContractOneTimeFeeUrl}?rent_contract_id=${rent_contract_id}`)
  }

  getRentalContractOneTimeFeeByAdditionalAgreement(rent_contract_additional_agreement_id: number) {
    return this.httpClient.get<RentalContractOneTimeFeeModel[]>(`${this.baseRentalContractOneTimeFeeUrl}?rent_contract_id=${rent_contract_additional_agreement_id}`)
  }

  createRentalContractOneTimeFee(data: RentalContractOneTimeFeeModel) {
    const body = JSON.stringify(data)
    return this.httpClient.post(this.baseRentalContractOneTimeFeeUrl, body, {headers: this.headers})
  }

  updateRentalContractOneTimeFee(id: number, data: RentalContractOneTimeFeeModel) {
    const body = JSON.stringify(data);
    return this.httpClient.put(`${this.baseRentalContractOneTimeFeeUrl}${id}/`, body, {headers: this.headers});
  }

  deleteRentalContractOneTimeFee(id: number) {
    return this.httpClient.delete(`${this.baseRentalContractOneTimeFeeUrl}${id}/`, {headers: this.headers});
  }

  // RentalContractUtilityFee

  getRentalContractUtilityFees() {
    return this.httpClient.get<RentalContractUtilityFeeModel[]>(this.baseRentalContractUtilityFeeUrl, {headers: this.headers})
  }

  getRentalContractUtilityFee(id: number) {
    return this.httpClient.get<RentalContractUtilityFeeModel>(`${this.baseRentalContractUtilityFeeUrl}?id=${id}`)
  }

  getRentalContractUtilityFeeByRentalContract(rent_contract_id: number) {
    return this.httpClient.get<RentalContractUtilityFeeModel[]>(`${this.baseRentalContractUtilityFeeUrl}?rent_contract_id=${rent_contract_id}`)
  }

  getRentalContractUtilityFeeByAdditionalAgreement(rent_contract_additional_agreement_id: number) {
    return this.httpClient.get<RentalContractUtilityFeeModel[]>(`${this.baseRentalContractUtilityFeeUrl}?rent_contract_additional_agreement_id=${rent_contract_additional_agreement_id}`)
  }

  createRentalContractUtilityFee(data: RentalContractUtilityFeeModel) {
    const body = JSON.stringify(data)
    return this.httpClient.post(this.baseRentalContractUtilityFeeUrl, body, {headers: this.headers})
  }

  updateRentalContractUtilityFee(id: number, data: RentalContractUtilityFeeModel) {
    const body = JSON.stringify(data);
    return this.httpClient.put(`${this.baseRentalContractUtilityFeeUrl}${id}/`, body, {headers: this.headers});
  }

  deleteRentalContractUtilityFee(id: number) {
    return this.httpClient.delete(`${this.baseRentalContractUtilityFeeUrl}${id}/`, {headers: this.headers});
  }

  // RentalContractSetup

  getRentalContractSetups() {
    return this.httpClient.get<RentalContractSetupModel>(`${this.baseRentalContractSetupUrl}`, {headers: this.headers})
  }

  getRentalContractSetup(id: number) {
    return this.httpClient.get<RentalContractSetupModel>(`${this.baseRentalContractSetupUrl}?id=${id}`)
  }

  getRentalContractSetupByBuilding(building_id: number) {
    return this.httpClient.get<RentalContractSetupModel[]>(`${this.baseRentalContractSetupUrl}?building_id=${building_id}`)
  }

  createRentalContractSetup(data: RentalContractSetupModel) {
    const body = JSON.stringify(data)
    return this.httpClient.post(this.baseRentalContractSetupUrl, body, {headers: this.headers})
  }

  updateRentalContractSetup(id: number, data: RentalContractSetupModel) {
    const body = JSON.stringify(data);
    return this.httpClient.put(`${this.baseRentalContractSetupUrl}${id}/`, body, {headers: this.headers});
  }

  deleteRentalContractSetup(id: number) {
    return this.httpClient.delete(`${this.baseRentalContractSetupUrl}${id}/`, {headers: this.headers});
  }

  // RentalContractPeriodicalFeeSetup

  getRentalContractPeriodicalFeeSetups() {
    return this.httpClient.get<RentalContractPeriodicalFeeSetupModel[]>(this.baseRentalContractPeriodicalFeeSetupUrl, {headers: this.headers})
  }

  getRentalContractPeriodicalFeeSetup(id: number) {
    return this.httpClient.get<RentalContractPeriodicalFeeSetupModel>(`${this.baseRentalContractPeriodicalFeeSetupUrl}?id=${id}`)
  }

  getRentalContractPeriodicalFeeSetupByRentalContractSetup(rent_contract_setup_id: number) {
    return this.httpClient.get<RentalContractPeriodicalFeeSetupModel[]>
    (`${this.baseRentalContractPeriodicalFeeSetupUrl}?rent_contract_setup_id=${rent_contract_setup_id}`)
  }

  createRentalContractPeriodicalFeeSetup(data: RentalContractPeriodicalFeeSetupModel) {
    const body = JSON.stringify(data)
    return this.httpClient.post(this.baseRentalContractPeriodicalFeeSetupUrl, body, {headers: this.headers})
  }

  updateRentalContractPeriodicalFeeSetup(id: number, data: RentalContractPeriodicalFeeSetupModel) {
    const body = JSON.stringify(data);
    return this.httpClient.put(`${this.baseRentalContractPeriodicalFeeSetupUrl}${id}/`, body, {headers: this.headers});
  }

  deleteRentalContractPeriodicalFeeSetup(id: number) {
    return this.httpClient.delete(`${this.baseRentalContractPeriodicalFeeSetupUrl}${id}/`, {headers: this.headers});
  }

  // RentalContractOneTimeFeeSetup

  getRentalContractOneTimeFeeSetups() {
    return this.httpClient.get<RentalContractOneTimeFeeSetupModel[]>(this.baseRentalContractOneTimeFeeSetupUrl, {headers: this.headers})
  }

  getRentalContractOneTimeFeeSetup(id: number) {
    return this.httpClient.get<RentalContractOneTimeFeeSetupModel>(`${this.baseRentalContractOneTimeFeeSetupUrl}?id=${id}`)
  }

  getRentalContractOneTimeFeeSetupByRentalContractSetup(rent_contract_setup_id: number) {
    return this.httpClient.get<RentalContractOneTimeFeeSetupModel[]>(`${this.baseRentalContractOneTimeFeeSetupUrl}?rent_contract_setup_id=${rent_contract_setup_id}`)
  }

  createRentalContractOneTimeFeeSetup(data: RentalContractOneTimeFeeSetupModel) {
    const body = JSON.stringify(data)
    return this.httpClient.post(this.baseRentalContractOneTimeFeeSetupUrl, body, {headers: this.headers})
  }

  updateRentalContractOneTimeFeeSetup(id: number, data: RentalContractOneTimeFeeSetupModel) {
    const body = JSON.stringify(data);
    return this.httpClient.put(`${this.baseRentalContractOneTimeFeeSetupUrl}${id}/`, body, {headers: this.headers});
  }

  deleteRentalContractOneTimeFeeSetup(id: number) {
    return this.httpClient.delete(`${this.baseRentalContractOneTimeFeeSetupUrl}${id}/`, {headers: this.headers});
  }

  // RentalContractUtilityFeeSetup

  getRentalContractUtilityFeeSetups() {
    return this.httpClient.get<RentalContractUtilityFeeSetupModel[]>(this.baseRentalContractUtilityFeeSetupUrl, {headers: this.headers})
  }

  getRentalContractUtilityFeeSetup(id: number) {
    return this.httpClient.get<RentalContractUtilityFeeSetupModel>(`${this.baseRentalContractUtilityFeeSetupUrl}?id=${id}`)
  }

  getRentalContractUtilityFeeSetupByRentalContractSetup(rent_contract_setup_id: number) {
    return this.httpClient.get<RentalContractUtilityFeeSetupModel[]>(`${this.baseRentalContractUtilityFeeSetupUrl}?rent_contract_setup_id=${rent_contract_setup_id}`)
  }

  createRentalContractUtilityFeeSetup(data: RentalContractUtilityFeeSetupModel) {
    const body = JSON.stringify(data)
    return this.httpClient.post(this.baseRentalContractUtilityFeeSetupUrl, body, {headers: this.headers})
  }

  updateRentalContractUtilityFeeSetup(id: number, data: RentalContractUtilityFeeSetupModel) {
    const body = JSON.stringify(data);
    return this.httpClient.put(`${this.baseRentalContractUtilityFeeSetupUrl}${id}/`, body, {headers: this.headers});
  }

  deleteRentalContractUtilityFeeSetup(id: number) {
    return this.httpClient.delete(`${this.baseRentalContractUtilityFeeSetupUrl}${id}/`, {headers: this.headers});
  }

  // FixedRentFeeStep

  getFixedRentFeeSteps() {
    return this.httpClient.get<FixedRentStepModel[]>(this.baseFixedRentStepUrl, {headers: this.headers})
  }

  getFixedRentFeeStep(id: number) {
    return this.httpClient.get<FixedRentStepModel>(`${this.baseFixedRentStepUrl}?id=${id}`)
  }


  getFixedRentFeeStepsByRentalContract(rent_contract_id: number) {
    return this.httpClient.get<FixedRentStepModel[]>(`${this.baseFixedRentStepUrl}?rent_contract_id=${rent_contract_id}`)
  }

  getFixedRentFeeStepsByAdditionalAgreement(rent_contract_additional_agreement_id: number) {
    return this.httpClient.get<FixedRentStepModel[]>(`${this.baseFixedRentStepUrl}?rent_contract_additional_agreement_id=${rent_contract_additional_agreement_id}`)
  }

  createFixedRentFeeStep(data: FixedRentStepModel) {
    const body = JSON.stringify(data)
    return this.httpClient.post(this.baseFixedRentStepUrl, body, {headers: this.headers})
  }

  updateFixedRentFeeStep(id: number, data: FixedRentStepModel) {
    const body = JSON.stringify(data);
    return this.httpClient.put(`${this.baseFixedRentStepUrl}${id}/`, body, {headers: this.headers});
  }

  deleteFixedRentFeeStep(id: number) {
    return this.httpClient.delete(`${this.baseFixedRentStepUrl}${id}/`, {headers: this.headers});
  }


}
