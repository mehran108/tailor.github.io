import { Component, OnInit } from '@angular/core';
import { AllCommunityModules } from '@ag-grid-community/all-modules';
import { ChipRendererComponent } from 'src/EliCamps/ag-grid/renderers/chip-renderer/chip-renderer.component';
import { ListService } from 'src/EliCamps/services/list.service';
import { AIRPORT_REPORT_COL_DEFS } from 'src/EliCamps/common/elicamps-column-definitions';
import { throwError } from 'rxjs';
import { HomeStay, Room } from 'src/EliCamps/EliCamps-Models/Elicamps';
@Component({
  selector: 'app-airport-transfer-report',
  templateUrl: './airport-transfer-report.component.html',
  styleUrls: ['./airport-transfer-report.component.css']
})
export class AirportTransferReportComponent implements OnInit {
  public columnDefs = AIRPORT_REPORT_COL_DEFS;
  public gridOptions: any;
  public info: string;
  private gridApi: any;
  public paymentReport = [];
  public modules = AllCommunityModules;
  public gridColumnApi: any;
  public pinnedBottomRowData: any;
  public getRowStyle: any;
  public homestayList: HomeStay[];
  public rooms: Room[];
  public startDate;
  public endDate;
  public reportType;
  constructor(public listService: ListService
  ) {
    this.gridOptions = {
      frameworkComponents: {
        chiprenderer: ChipRendererComponent,
      },
      pagination: true,
      paginationAutoPageSize: true,
    };
  }
  async ngOnInit() {
    const homestayList = await this.listService.getAllHomeStay().toPromise().catch(error => throwError(error));
    if (homestayList) {
      this.homestayList = homestayList.data;
    }
    const roomList = await this.listService.getAllRoomList().toPromise().catch(error => throwError(error));
    if (roomList) {
      this.rooms = roomList.data;
    }
    this.getAgentList();
    this.getRowStyle = (params) => {
      if (params.node.rowPinned) {
        return { 'font-weight': 'bold' };
      }
    };
  }
  public getAgentList = () => {
    const params = {
      active: true
    };
    this.listService.getInsuranceReport().subscribe(res => {
      this.paymentReport = res.map(row => ({
        ...row,
        accAddress: this.getAccAddress(row)
      }));
    });
  }
  public getAccAddress = (student) => {
    if (student) {
      switch (student.homestayOrResi) {
        case '1': {
          const home = this.homestayList.find(stay => stay.homeId === student.homestayID);
          return home ? home.address : '';
        }
        case '2': {
          const selectedRoom = this.rooms.find(stay => stay.id === student.roomID);
          return selectedRoom ? `${selectedRoom.roomID}, ${selectedRoom.building}` : '';
        }
      }
    }
  }
  public getCommision = () => {
    return this.paymentReport.reduce((a, b) => +a + +b.commision, 0);
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
      fileName: `InsuranceReport${new Date().toLocaleString()}`,
    };
    this.gridApi.exportDataAsCsv(params);
  }
  public filterData = () => {
    if (this.startDate && this.endDate) {
      const list = this.paymentReport.filter(row => new Date(row.programeStartDate) >= this.startDate && new Date(row.programeEndDate) <= this.endDate)
      this.gridOptions.api.setRowData(list);
    }
     switch(this.reportType) {
      case 1: {
        const columns = this.columnDefs.filter(column => {
         return !(column.field === 'programeEndDate' || column.field === 'flightDepartureTime' || column.field === 'departureFlightNumber' || column.field === 'departureTerminal');
        })
        this.gridOptions.api.setColumnDefs(columns);
        break;
      }
      case 2: {
        const columns = this.columnDefs.filter(column => {
         return !(column.field === 'programeStartDate' || column.field === 'arrivalTime' || column.field === 'flightNumber' || column.field === 'terminal');
        });
        this.gridOptions.api.setColumnDefs(columns);
        break;
      }
      case 3: {
        this.gridOptions.api.setColumnDefs(this.columnDefs);
        break;
      }
    }

  }
  clear = () => {
    this.startDate = null;
    this.endDate = null;
    this.reportType = 0;
    this.gridOptions.api.setColumnDefs(this.columnDefs);
    this.gridOptions.api.setRowData(this.paymentReport);
  }
}
