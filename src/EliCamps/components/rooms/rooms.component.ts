import { Component, OnInit } from '@angular/core';
import { ROOMS_COL_DEFS } from '../../common/elicamps-column-definitions';
import { Group, Room } from '../../EliCamps-Models/Elicamps';
import { Router } from '@angular/router';
import { ListService } from '../../services/list.service';
import { ChipRendererComponent } from 'src/EliCamps/ag-grid/renderers/chip-renderer/chip-renderer.component';
import { AllCommunityModules } from '@ag-grid-community/all-modules';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.css']
})
export class RoomsComponent implements OnInit {
  public columnDefs = ROOMS_COL_DEFS;
  public rowData: any[];
  public gridOptions: any;
  public info: string;
  private gridApi: any;
  public roomList: Room[] = [];
  public isEdit = false;
  public id: number;
  public gridColumnApi: any;
  public modules  = AllCommunityModules;
  constructor(
    private listService: ListService,
    public router: Router) {
    this.gridOptions = {
      frameworkComponents: {
        chiprenderer: ChipRendererComponent,
      },
      pagination: true,
      paginationAutoPageSize: true,
    };
  }

  ngOnInit() {
  }
  public getRoomList = () => {
    this.listService.getAllRoomList().subscribe(res => {
      this.roomList = (res.data || []);
      this.autoSizeAll(false);
      this.gridColumnApi.getColumn('active').setSort('desc');
    });
  }
  autoSizeAll(skipHeader) {
    const allColumnIds = [];
    this.gridColumnApi.getAllColumns().forEach((column) => {
      allColumnIds.push(column.colId);
    });
    this.gridColumnApi.autoSizeColumns(allColumnIds, skipHeader);
  }
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.getRoomList();
  }

  onFilterTextBoxChanged(event) {
    this.gridOptions.api.setQuickFilter(event.target.value);
  }
  onBtnExport(): void {
    const params = {
      columnGroups: true,
      allColumns: true,
      fileName: `Rooms${new Date().toLocaleString()}`,
    };
    this.gridApi.exportDataAsCsv(params);
  }
  onCellClicked($event) {

    this.router.navigate(['addRoom'], {
      queryParams: {
        id: btoa($event.data.id)
      }
    });

  }

}
