import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ListService } from '../../services/list.service';
import { Campus } from '../../EliCamps-Models/Elicamps';
import { CAMPUS_COL_DEFS } from '../../common/elicamps-column-definitions';
import { ChipRendererComponent } from 'src/EliCamps/ag-grid/renderers/chip-renderer/chip-renderer.component';
import {AllCommunityModules} from '@ag-grid-community/all-modules';

@Component({
  selector: 'app-campus',
  templateUrl: './campus.component.html',
  styleUrls: ['./campus.component.css']
})
export class CampusComponent implements OnInit {

  public columnDefs = CAMPUS_COL_DEFS;
  public gridOptions: any;
  public info: string;
  private gridApi: any;
  public campusList: Campus[];
  public modules = AllCommunityModules;
  public gridColumnApi: any;
  constructor(public router: Router, public listService: ListService) {
    this.gridOptions = {
      frameworkComponents: {
        chiprenderer: ChipRendererComponent,
      },
      pagination: true,
      paginationAutoPageSize: true,
    };
  }
  ngOnInit() {
    this.getCampusList();
  }
  public getCampusList = () => {
    const params = {
      active: true
    };
    this.listService.getAllCampus({}).subscribe(res => {
      this.campusList = (res as any).data;
      this.gridColumnApi.getColumn('active').setSort('desc');
    });
  }
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    // params.api.sizeColumnsToFit();
  }

  onFilterTextBoxChanged(event) {
    this.gridOptions.api.setQuickFilter(event.target.value);
  }
  onBtnExport(): void {
    const params = {
      columnGroups: true,
      allColumns: true,
      fileName: `Campus${new Date().toLocaleString()}`,
    };
    this.gridApi.exportDataAsCsv(params);
  }
  onCellClicked($event) {

    this.router.navigate(['addCampus'], {
      queryParams: {
        id: btoa($event.data.id)
      }
    });

  }
}
