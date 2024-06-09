import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  AddEvent,
  CancelEvent,
  EditEvent,
  GridComponent,
  RemoveEvent,
  SaveEvent
} from '@progress/kendo-angular-grid';
import { Subject, takeUntil } from 'rxjs';
import { DashboardData } from './dashboard-data.interface';
import { DashboardService } from './dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  data: DashboardData[] = [];
  formGroup?: FormGroup;
  private editedRowIndex?: number;
  private readonly destroyed$ = new Subject<void>();

  constructor(private readonly dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService
      .getData()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((data) => {
        this.data = data;
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  public addHandler(args: AddEvent): void {
    this.closeEditor(args.sender);
    this.formGroup = new FormGroup({
      ProductID: new FormControl(),
      ProductName: new FormControl('', Validators.required),
      UnitPrice: new FormControl(0),
      UnitsInStock: new FormControl(
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern('^[0-9]{1,3}')
        ])
      ),
      Discontinued: new FormControl(false)
    });
    args.sender.addRow(this.formGroup);
  }

  public editHandler(args: EditEvent): void {
    const { dataItem } = args;
    this.closeEditor(args.sender);
    this.formGroup = new FormGroup({
      ProductID: new FormControl(dataItem.ProductID),
      ProductName: new FormControl(dataItem.ProductName, Validators.required),
      UnitPrice: new FormControl(dataItem.UnitPrice),
      UnitsInStock: new FormControl(
        dataItem.UnitsInStock,
        Validators.compose([
          Validators.required,
          Validators.pattern('^[0-9]{1,3}')
        ])
      ),
      Discontinued: new FormControl(dataItem.Discontinued)
    });
    this.editedRowIndex = args.rowIndex;
    args.sender.editRow(args.rowIndex, this.formGroup);
  }

  public removeHandler({ dataItem }: RemoveEvent): void {
    // Request to delete data
    this.data = this.data.filter(
      (item) => item.ProductID !== dataItem.ProductID
    );
  }

  public saveHandler({ sender, rowIndex, formGroup, isNew }: SaveEvent): void {
    const value: DashboardData = formGroup.value;
    if (isNew) {
      // Request to add data
      value.ProductID =
        Math.max(...this.data.map((item) => item.ProductID)) + 1;
      this.data = this.data.concat(value);
    } else {
      const itemIndex = this.data.findIndex(
        (item) => item.ProductID === value.ProductID
      );
      if (itemIndex >= 0) {
        // Request for data change
        this.data[itemIndex] = value;
        this.data = [...this.data];
      }
    }
    sender.closeRow(rowIndex);
  }

  public cancelHandler(args: CancelEvent): void {
    this.closeEditor(args.sender, args.rowIndex);
  }

  private closeEditor(grid: GridComponent, rowIndex = this.editedRowIndex) {
    grid.closeRow(rowIndex);
    this.editedRowIndex = undefined;
    this.formGroup = undefined;
  }
}
