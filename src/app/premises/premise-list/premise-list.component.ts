import {
  Component,
  OnInit,
  ViewChild
} from '@angular/core';
import {ApiService} from "../../shared/services/api.service";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {NotificationService} from "../../shared/notification.service";
import {PremiseModel, PremiseModelStep1, PremiseModelStep2} from "../../models/models";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {MatPaginator} from "@angular/material/paginator";
import {PremiseFormComponent} from "../premise-form/premise-form.component";
import {PremiseService} from "../../shared/services/premise.service";


@Component({
  selector: 'app-premise-list',
  templateUrl: './premise-list.component.html',
  styleUrls: ['./premise-list.component.sass']
})
export class PremiseListComponent implements OnInit {

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    private service:PremiseService,
    private notificationService: NotificationService,
  ) { }

   premiseTable: PremiseModel[] = [];
  displayedColumns: string[] = ['number', 'floor', 'measured_area', 'contracted', 'actions'];
  // @ts-ignore
  tableData: MatTableDataSource<any>
  searchKey: String = ''

  // @ts-ignore
  @ViewChild(MatSort) sort: MatSort;
  // @ts-ignore
  @ViewChild(MatPaginator) paginator: MatPaginator;


  ngOnInit(): void {
    this.apiService.getPremises()
      .subscribe(
      (data: PremiseModel[]) => {
        this.premiseTable = data
        this.tableData = new MatTableDataSource(this.premiseTable)
        this.tableData.sort = this.sort
        this.tableData.paginator = this.paginator
        console.log(this.tableData.data.length)
      },
    )
    this.newRow()
    this.updateRow()
  }

  applyFilter() {
    this.tableData.filter = this.searchKey.trim().toLowerCase()
  }

  onCreate() {
    this.service.premiseFormIsLoaded$.next(false)
    const dialogConfig = new MatDialogConfig()
    dialogConfig.disableClose = false
    dialogConfig.autoFocus = true
    dialogConfig.width = '1400px'
    dialogConfig.maxHeight = '90%'
    this.dialog.open(PremiseFormComponent, dialogConfig)
    this.service.initializeFormGroup()
  }

  onEdit(premise: PremiseModel) {
    this.service.premiseFormIsLoaded$.next(false)
    const dialogConfig = new MatDialogConfig()
    dialogConfig.disableClose = false
    dialogConfig.autoFocus = true
    dialogConfig.width = '1400px'
    dialogConfig.maxHeight = '90%'
    this.dialog.open(PremiseFormComponent, dialogConfig)
    this.service.populateForm(premise)
  }

  onDelete(premise: PremiseModel) {
    this.apiService.deletePremise(premise.id)
      .subscribe(
        () => {
          let index = this.premiseTable.findIndex(d => d.id === premise.id); //find index in your array
          this.premiseTable.splice(index, 1);//remove element from array
          this.tableData = new MatTableDataSource(this.premiseTable)
        })
    this.notificationService.warn('Помещение удалено');
  }

  newRow(){
    this.service.newRow$.subscribe(
      premise => {
        if (premise.id) {
          console.log(premise)
          this.premiseTable.push(premise)
          this.tableData = new MatTableDataSource(this.premiseTable)
          this.tableData.sort = this.sort
          this.tableData.paginator = this.paginator
        }}
    )
  }

  updateRow() {
    this.service.updateRow$.subscribe(
      premise => {
        if (premise.id) {
          let index = this.premiseTable.findIndex(d => d.id === premise.id);//find index in your array
          this.premiseTable[index].id = premise.id
          this.premiseTable[index].number = premise.number
          this.premiseTable[index].floor = premise.floor
          this.premiseTable[index].premise_type = premise.premise_type
          this.premiseTable[index].measured_area = premise.measured_area
          this.premiseTable[index].measurement_date = premise.measurement_date
          this.premiseTable[index].description = premise.description
          this.premiseTable[index].contracted = premise.contracted
          this.premiseTable[index].user_updated = premise.user_updated
          this.premiseTable[index].last_updated = premise.last_updated
          this.premiseTable[index].ceiling_height = premise.ceiling_height
          this.premiseTable[index].facade_length = premise.facade_length
          this.premiseTable[index].fitout_condition = premise.fitout_condition
          this.premiseTable[index].electric_capacity = premise.electric_capacity
          this.premiseTable[index].cooling_capacity = premise.cooling_capacity
          this.premiseTable[index].water_supply = premise.water_supply
        }
      }
    )
  }
}
