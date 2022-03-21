import { Injectable } from '@angular/core';
import {Select} from "../../models/models";

@Injectable({
  providedIn: 'root'
})
export class EnumService {

  constructor() { }

  indexationType: Select[] = [
    {value: 'Fixed', viewValue: 'Фиксированный %'},
    {value: 'CPI', viewValue: 'Индекс потребительских цен'},
    // {value: 'Revisable', viewValue: 'Пересматривается ежегодно'},
    {value: 'Non_Indexable', viewValue: 'Не индексируется'}
  ]

  tenantUtilitiesCompensationType: Select[] = [
    {value: 'By_counters', viewValue: 'По прибору учета'},
    {value: 'Fixed', viewValue: 'Фиксированная плата'},
    {value: 'None', viewValue: 'Не оплачивает'},
  ]

  caUtilitiesCompensationType: Select[] = [
    {value: 'Proportional_to_GLA', viewValue: 'Пропорционально аренднопригодной площади'},
    {value: 'Proportional_to_leased_area', viewValue: 'Пропорционально фактически арендуемой площади'},
    // {value: 'Fixed', viewValue: 'Фиксированная компенсация'},
    // {value: 'None', viewValue: 'Не компенсируется'}
  ]

  guaranteeDepositTypes: Select[] = [
    {value: 'Cash', viewValue: 'Перечисление на счёт арендодателя'},
    {value: 'Bank_guarantee', viewValue: 'Банковская гарантия'},
    {value: 'Corporate_guarantee', viewValue: 'Корпоративная гарантия'},
    // {value: 'None', viewValue: 'Не предусмотрено'},
  ]

  requiredTypes: Select[] = [
    {value: 'Required', viewValue: 'Требуется'},
    {value: 'Not_required', viewValue: 'Не требуется'},
  ]

  CalculationMethod: Select[] = [
    {value: 'Per_sqm', viewValue: 'За 1 кв. м. помещения'},
    {value: 'Total', viewValue: 'За всё помещение полностью'},
  ]

  CalculationPeriod: Select[] = [
    {value: 'Month', viewValue: 'Месяц'},
    {value: 'Year', viewValue: 'Год'},
    // {value: '6_months', viewValue: 'Шесть месяцев'},
    // {value: 'Day', viewValue: 'День'},
    // {value: 'Week', viewValue: 'Неделя'},
    // {value: '3_months', viewValue: 'Три месяца'},
    ]

  turnoverFeePeriods: Select[] = [
    {value: 'Month', viewValue: 'Один месяц'},
    // {value: 'Day', viewValue: 'День'},
    // {value: 'Week', viewValue: 'Неделя'},
    {value: '3_months', viewValue: 'Три месяца'},
    {value: '6_months', viewValue: 'Шесть месяцев'},
    {value: 'Year', viewValue: 'Один год'},

  ]

  PrepaymentOrPostpayment: Select[] = [
    {value: 'Prepayment', viewValue: 'Предоплата'},
    {value: 'Postpayment', viewValue: 'Постоплата'},
  ]

  paymentTerm: Select[] = [
    {value: 'Fixed_date', viewValue: 'Определенная дата'},
    {value: 'Triggering_event_date', viewValue: 'Срок после определенного события'},
    {value: 'Not_fixed', viewValue: 'Не фиксируется в договоре'},
  ]

  triggeringEvent: Select[] = [
    {value: 'Contract_signing_date', viewValue: 'Дата договора'},
    {value: 'Premise_transfer_date', viewValue: 'Дата передачи помещения Арендатору'},
    {value: 'Start_of_commercial_activity', viewValue: 'Дата начала коммерческой деятельности'},
  ]

  monthDays: Select[] = [
    {value: '1', viewValue: '1'},
    {value: '2', viewValue: '2'},
    {value: '3', viewValue: '3'},
    {value: '4', viewValue: '4'},
    {value: '5', viewValue: '5'},
    {value: '6', viewValue: '6'},
    {value: '7', viewValue: '7'},
    {value: '8', viewValue: '8'},
    {value: '9', viewValue: '9'},
    {value: '10', viewValue: '10'},
    {value: '11', viewValue: '11'},
    {value: '12', viewValue: '12'},
    {value: '13', viewValue: '13'},
    {value: '14', viewValue: '14'},
    {value: '15', viewValue: '15'},
    {value: '16', viewValue: '16'},
    {value: '17', viewValue: '17'},
    {value: '18', viewValue: '18'},
    {value: '19', viewValue: '19'},
    {value: '20', viewValue: '20'},
    {value: '21', viewValue: '21'},
    {value: '22', viewValue: '22'},
    {value: '23', viewValue: '23'},
    {value: '24', viewValue: '24'},
    {value: '25', viewValue: '25'},
    {value: '26', viewValue: '26'},
    {value: '27', viewValue: '27'},
    {value: '28', viewValue: '28'},
    {value: '29', viewValue: '29'},
    {value: '30', viewValue: '30'},
  ]


}
