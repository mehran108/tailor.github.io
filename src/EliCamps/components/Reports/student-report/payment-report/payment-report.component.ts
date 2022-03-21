import { Component, OnInit } from "@angular/core";
import { AllCommunityModules } from "@ag-grid-community/all-modules";
import { ChipRendererComponent } from "src/EliCamps/ag-grid/renderers/chip-renderer/chip-renderer.component";
import {
  ADDINS_COL_DEFS,
  PAYMENT_REPORT_COL_DEFS,
} from "src/EliCamps/common/elicamps-column-definitions";
import { ListService } from "src/EliCamps/services/list.service";

@Component({
  selector: "app-payment-report",
  templateUrl: "./payment-report.component.html",
  styleUrls: ["./payment-report.component.css"],
})
export class PaymentReportComponent implements OnInit {
  public columnDefs = PAYMENT_REPORT_COL_DEFS;
  public gridOptions: any;
  public info: string;
  private gridApi: any;
  public paymentReport;
  public yearList = [];
  public modules = AllCommunityModules;
  public gridColumnApi: any;
  public pinnedBottomRowData: any;
  public getRowStyle: any;
  public defaultColDef;
  public selectedYear = 2020;
  constructor(public listService: ListService) {
    this.gridOptions = {
      frameworkComponents: {
        chiprenderer: ChipRendererComponent,
      },
      pagination: true,
      paginationAutoPageSize: true,
    };
    this.defaultColDef = {
      resizable: true,
      sortable: true,
      filter: true,
    };
  }
  ngOnInit() {
    this.getPaymentSummaryReport(this.selectedYear);
    this.getRowStyle = (params) => {
      if (params.node.rowPinned) {
        return { "font-weight": "bold" };
      }
    };
  }
  public getPaymentSummaryReport = (year) => {
    const params = {
      active: true,
    };
    this.listService.getPaymentReport(year).subscribe((res) => {
      this.paymentReport = (res as any).data;
      this.yearList = [];
      this.paymentReport = this.paymentReport.map((report) => {
        if (!this.yearList.includes(report.year)) {
          this.yearList.push(report.year);
        }
        return {
          ...report,
          studentName: `${report.firstName} ${report.lastName}`,
          commision: report.commision
            ? (report.commision / 100) * report.totalGrossPrice
            : 0,
        };
      });
      this.selectedYear = this.yearList[0];
      this.pinnedBottomRowData = [
        {
          totalGrossPrice: res.totalGrossPriceCalculated,
          netPrice: res.totalNetPriceCalculated,
          paid: res.totalPaidPriceCalculated,
          balance: res.totalBalanceCalculated,
          commision: this.getCommision(),
        },
      ];
    });
  };
  public getCommision = () => {
    return this.paymentReport.reduce((a, b) => +a + +b.commision, 0);
  };
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
      fileName: `PaymentSummaryReport${new Date().toLocaleString()}`,
    };
    this.gridApi.exportDataAsCsv(params);
  }
  public show() {
    this.getPaymentSummaryReport(this.selectedYear);
  }
  public applyDefaultValue(value: string) {
    if (!value) {
      setTimeout(() => {
        this.selectedYear = 2018;
      }, 1);
    }
  }
}
