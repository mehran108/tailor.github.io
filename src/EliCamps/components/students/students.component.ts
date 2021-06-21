import { Component, OnInit } from '@angular/core';
import { GROUPS_COL_DEFS, STUDENT_COL_DEFS } from 'src/EliCamps/common/elicamps-column-definitions';
import { Group, Student } from 'src/EliCamps/EliCamps-Models/Elicamps';
import { AllCommunityModules } from '@ag-grid-community/all-modules';
import { GroupService } from 'src/EliCamps/services/group.service';
import { Router } from '@angular/router';
import { ChipRendererComponent } from 'src/EliCamps/ag-grid/renderers/chip-renderer/chip-renderer.component';
import { ButtonRendererComponent } from 'src/EliCamps/ag-grid/renderers/button-renderer.component';
import { ConfirmationDialogComponent } from './student-registration/confirmation-dialog/confirmation-dialog.component';
import { MatDialogRef, MatDialog } from '@angular/material';
import { ListService } from 'src/EliCamps/services/list.service';
import { DeleteConfirmationDialogComponent } from '../confirmation-dialog/delete-confirmation-dialog.component';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css']
})
export class StudentsComponent implements OnInit {
  public columnDefs = STUDENT_COL_DEFS;
  public rowData: any[];
  public gridOptions: any;
  public info: string;
  private gridApi: any;
  public studentList: Student[] = [];
  public gridColumnApi: any;
  public modules = AllCommunityModules;
  constructor(
    private groupService: GroupService,
    public router: Router,
    public confirmationDialogRef: MatDialogRef<DeleteConfirmationDialogComponent>,
    public dialog: MatDialog,
    public listService: ListService,
    public spinner: NgxSpinnerService) {

  }

  ngOnInit() {
    const buttonRenderer = {
      headerName: '',
      field: 'cancel',
      cellRenderer: 'buttonRenderer',
      cellRendererParams: {
        onClick: this.openRemoveStudentDialog.bind(this),
      },
      pinned: 'right',
      width: 80
    };
    this.columnDefs = [];
    this.columnDefs.push(...STUDENT_COL_DEFS, buttonRenderer as any);
    this.gridOptions = {
      frameworkComponents: {
        chiprenderer: ChipRendererComponent,
        buttonRenderer: ButtonRendererComponent
      },
      pagination: true,
      paginationAutoPageSize: true,
    };
  }
  openRemoveStudentDialog(student: any): void {
    // tslint:disable-next-line: no-use-before-declare
    this.confirmationDialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '250px',
      data: { headerName: `${student.rowData.firstName} ${student.rowData.lastName}` }
    });

    this.confirmationDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.delete(student.rowData);
      }
    });
  }
  delete(rowData: any) {
    const row = {
      id: rowData.id,
      active: false,
    };
    this.spinner.show();
    this.listService.activateStudent(row).subscribe(res => {
      this.spinner.hide();
      this.getStudentList();
    }, error => {
      this.spinner.hide();
    });
  }
  /**
   * Get Group List
   */
  public getStudentList = () => {
    const params = {
      active: true
    };
    this.groupService.getAllElicampsStudents({}).subscribe((studentList: Student[]) => {
      this.studentList = ((studentList as any).data || []).sort((a, b) => a.active > b.active ? -1 : 0);
      this.autoSizeAll(false);
    });
  }
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.getStudentList();
  }

  onFilterTextBoxChanged(event) {
    this.gridOptions.api.setQuickFilter(event.target.value);
  }
  autoSizeAll(skipHeader) {
    const allColumnIds = [];
    this.gridColumnApi.getAllColumns().forEach((column) => {
      allColumnIds.push(column.colId);
    });
    this.gridColumnApi.autoSizeColumns(allColumnIds, skipHeader);
  }
  onCellClicked($event) {

    this.router.navigate(['registerStudent'], {
      queryParams: {
        studentId: btoa($event.data.id.toString())
      }
    });

  }
  onBtnExport(): void {
    const params = {
      columnGroups: true,
      allColumns: true,
      fileName: `Students${new Date().toLocaleString()}`,
    };
    this.gridApi.exportDataAsCsv(params);
  }
}
