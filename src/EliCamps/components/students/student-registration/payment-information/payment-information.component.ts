import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ListService } from 'src/EliCamps/services/list.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location, DatePipe } from '@angular/common';
import { Agent, Group, Student } from 'src/EliCamps/EliCamps-Models/Elicamps';
import { SharedService } from 'src/EliCamps/services/shared.service';
import { environment } from 'src/environments/environment';
import { GroupService } from 'src/EliCamps/services/group.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { ChipRendererComponent } from 'src/EliCamps/ag-grid/renderers/chip-renderer/chip-renderer.component';
import { AllCommunityModules } from '@ag-grid-community/all-modules';
import { STUDENT_PAYMENT_COL_DEFS } from 'src/EliCamps/common/elicamps-column-definitions';
import { StudentPaymentComponent } from './student-payment/student-payment.component';
import { MatDialog, MatDialogRef } from '@angular/material';
import * as moment from 'moment';
import { DeleteConfirmationDialogComponent } from 'src/EliCamps/components/confirmation-dialog/delete-confirmation-dialog.component';
import { ButtonRendererComponent } from 'src/EliCamps/ag-grid/renderers/button-renderer.component';
import { LocalstorageService } from 'src/EliCamps/services/localstorage.service';
import { Keys } from 'src/EliCamps/common/lookup.enums';
@Component({
  selector: 'app-payment-information',
  templateUrl: './payment-information.component.html',
  styleUrls: ['./payment-information.component.css']
})
export class PaymentInformationComponent implements OnInit, OnChanges {
  // tslint:disable-next-line: no-output-on-prefix
  @Output() onStudentRegistration: EventEmitter<any> = new EventEmitter<any>();
  public paymentinfoform: FormGroup;
  public submitted = false;
  public agentList: Agent[] = [];
  @Input() student: Student;
  @Output() studentEvent: EventEmitter<any> = new EventEmitter();
  public groupReuestModel: Group;
  public studentId: number;
  public isEdit = false;
  public selectedAgent: Agent;
  public loading = false;
  public groupPaymentList = [];
  private gridApi: any;
  public columnDefs = STUDENT_PAYMENT_COL_DEFS;
  public gridOptions: any;
  public modules = AllCommunityModules;
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    public listService: ListService,
    public location: Location,
    public shared: SharedService,
    public studentService: GroupService,
    public toastr: ToastrService,
    public spinner: NgxSpinnerService,
    public dialog: MatDialog,
    public datePipe: DatePipe,
    public confirmationDialogRef: MatDialogRef<DeleteConfirmationDialogComponent>,
    public storage: LocalstorageService
  ) {
    this.gridOptions = {
      frameworkComponents: {
        chiprenderer: ChipRendererComponent,
        buttonRenderer: ButtonRendererComponent
      }
    };
  }
  // convenience getter for easy access to form fields
  get f() { return this.paymentinfoform; }
  ngOnInit() {
    const buttonRenderer = {
      headerName: '',
      field: 'cancel',
      cellRenderer: 'buttonRenderer',
      cellRendererParams: {
        onClick: this.openRemovePaymentDialog.bind(this),
      },
      width: 80
    };
    this.columnDefs = [];
    this.columnDefs.push(...STUDENT_PAYMENT_COL_DEFS, buttonRenderer as any);
    this.initializeForm();
    this.getParams();
    this.initializeDropDowns();
    this.f.valueChanges.subscribe(res => {
      this.shared.setpaymentInfoState(this.f.value);
    });
    if (this.student) {
      this.isEdit = true;
      this.populateStudentForm(this.student);
    }
    this.shared.getGroupInfoState().subscribe(res => {
      if (res) {
        this.populateStudentFormWithGroupValues(res);
      }
    });
    this.shared.getObservable().subscribe(res => {
      if (res) {
        this.populateNumberOfNights(res);
      }
    });
    this.populateNumberOfNights(this.student);
  }
  openRemovePaymentDialog(group: any): void {
    // tslint:disable-next-line: no-use-before-declare
    this.confirmationDialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '250px',
      data: { headerName: `${group.rowData.amount}` }
    });
    this.confirmationDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteGroupPayment(group.rowData);
      }
    });
  }
  deleteGroupPayment(rowData: any) {
    const row = {
      id: rowData.id,
      active: false,
    };
    this.spinner.show();
    this.listService.activatePaymentStudent(row).subscribe(res => {
      this.spinner.hide();
      this.getStudentPayments(this.studentId);
    }, error => {
      this.spinner.hide();
    });
  }
  populateStudentFormWithGroupValues(res: any) {
    //   Object.keys(this.f.controls).forEach(key => {
    //     // if (key === 'totalGrossPrice' && res.perStudent) {
    //     //   this.f.controls[key].setValue(res.perStudent);
    //     // }
    //     if (key === 'numberOfNights' && res.numberOfNights) {
    //       this.f.controls[key].setValue(res.numberOfNights);
    //     }
    //     // if (key === 'paid' && res.paid) {
    //     //   const singlePayment = res.paid / (res.numOfStudents + res.numOfGrpLeaders);
    //     //   this.f.controls[key].setValue(singlePayment);
    //     // }
    //   });
  }
  ngOnChanges(change: SimpleChanges) {
    if (this.f) {
      this.populateStudentForm(change.student.currentValue);
    }

  }
  public populateNumberOfNights = (student) => {
    if (student && student.programeStartDate && student.programeEndDate) {
      const date1 = new Date(student.programeStartDate);
      const date2 = new Date(student.programeEndDate);
      const timeDiff = Math.abs(date2.getTime() - date1.getTime());
      const numberOfNights = Math.ceil(timeDiff / (1000 * 3600 * 24));
      if (this.f && this.f.controls) {
        this.f.controls.numberOfNights.setValue(numberOfNights);
      }
    }
  }
  public getParams() {
    this.route.queryParams.subscribe(params => {
      if (params && params.studentId) {
        this.studentId = Number(atob(params.studentId));
        if (this.studentId) {
          this.isEdit = true;
          this.getSelectedAgent(this.studentId);
          this.getStudentPayments(this.studentId);
        }
      } else {
        const regFee = this.storage.get(Keys.REG_FEE);
        this.f.controls.registrationFee.setValue(regFee);
      }
    });
  }
  public getStudentPayments = (studentId: number) => {
    this.studentService.getAllPaymentStudentByStudentId(studentId).subscribe(res => {
      this.groupPaymentList = res;
      this.groupPaymentList.forEach(payment => {
        payment.date = this.datePipe.transform(payment.date, 'short');
      });
    });
  }
  public getSelectedAgent = (id: number) => {
    this.listService.getAgent(id).subscribe(res => {
      if (res) {
        this.selectedAgent = res;
        this.populateForm(this.selectedAgent);
      }

    });
  }
  public populateForm = (agent: Agent) => {
    Object.keys(this.f.controls).forEach(key => {
      if (key) {
        if (agent[key]) {
          this.f.controls[key].setValue(agent[key]);
        }
      }
    });
  }
  public initializeDropDowns = () => {
    this.listService.getAllAgent({ active: true }).subscribe(res => {
      this.agentList = res.data;
    });
  }
  initializeForm() {
    this.paymentinfoform = this.formBuilder.group({
      numberOfNights: [0],
      totalGrossPrice: [0],
      paid: [0],
      commision: [0],
      commissionAddins: [0],
      netPrice: [0],
      totalAddins: [0],
      balance: [0],
      registrationFee: [0],
      studentEmail: [],
      files: [],
      isAgentInvoice: [false],
      isStudentInvoice: [false],
      isLoaInvoice: [false],
      isLoaInvoiceWithNoPrice: [false],
      isStudentInvitation: [false],
      isStudentCertificate: [false],
      isAirportInvoice: [false],
      isLoaGroupInvoice: [false],
      active: [true],
      emailType: [null]
    });
  }

  Cancel_Click() {
    this.router.navigate(['/students']);
  }
  onSubmit() {
    if (this.f.valid) {
      const keys = ['totalGrossPrice', 'paid', 'commision', 'commissionAddins', 'balance'];
      keys.forEach(key => {
        if (!this.f.controls[key].value) {
          this.f.controls[key].setValue(0);
        }
      });
      if (this.isEdit === false) {
        this.submitted = true;
        this.loading = true;
        const selectedIndex = 7;
        // this.onStudentRegistration.emit(selectedIndex);
        this.shared.setpaymentInfoState(this.f.value);
        this.shared.saveRecord(true);
      } else if (this.isEdit === true) {
        const model = {
          ...this.student,
          ...this.f.value
        };
        this.listService.updateStudentInfo(model).subscribe(res => {
          const Index = 7;
          this.toastr.success('Payment Information Section Updated', 'Success');
          // this.onStudentRegistration.emit(Index);
        });
      }

    }
  }

  public populateStudentForm = (student: any) => {
    const keys = ['arrivalTime', 'flightDepartureTime'];
    Object.keys(this.f.controls).forEach(key => {
      if (student[key] !== null && !keys.includes(key)) {
        this.f.controls[key].setValue(student[key]);
      }
    });
    if (student.programeStartDate && student.programeEndDate) {
      const startDate = new Date(student.programeStartDate);
      const endDate = new Date(student.programeEndDate);
      if (startDate && endDate) {
        const timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
        const numberOfNights = Math.ceil(timeDiff / (1000 * 3600 * 24));
        this.paymentinfoform.controls.numberOfNights.setValue(numberOfNights);
      }
    }
    this.shared.setpaymentInfoState(this.f.value);
    this.calculate();
  }
  public navigateByURL = (url: string, priceSection: boolean) => {
    // window.open(
    //   `${environment.appURL}/#/registerStudent/${url}?studentId=${btoa(this.studentId.toString())}&section=${priceSection}`, '_blank');
    const model = {
      studentId: this.studentId,
      isAgentInvoice: url === 'agent-invoice' ? true : false,
      isStudentInvoice: url === 'student-Loa' ? true : false,
      isLoaInvoice: url === 'loa-invoice-with-price' ? true : false,
      isLoaInvoiceWithNoPrice: url === 'loa-invoice-no-price' ? true : false,
      isStudentInvitation: url === 'student-invitation' ? true : false,
      isStudentCertificate: url === 'student-certificate' ? true : false,
      isAirportInvoice: url === 'student-Airport-Invoice' ? true : false,
      isLoaGroupInvoice: url === 'loa-group-invoice' ? true : false,
      studentEmail: '',
      registrationFee: this.f.value.registrationFee
    };
    this.spinner.show();
    this.studentService.documentGetByStudentId(model).subscribe((res: any) => {
      res.name = 'Invoice.pdf';
      this.spinner.hide();
      const link = window.URL.createObjectURL(res);
      window.open(link, '_blank');
    }, error => {
      this.spinner.hide();
      // window.open(error.error.text as any, '_blank');
    });
  }
  public sendEmail = () => {
    if (this.f.controls.studentEmail.value) {
      const model = {
        studentID: this.student.id,
        ...this.f.value,
        emailBody: ''
      };
      this.spinner.show();
      this.studentService.sendEmail(model).subscribe(res => {
        if (res) {
          this.toastr.success(`An email has sent at ${this.f.get('studentEmail').value}.`, 'Success');
          this.spinner.hide();
          this.clearEmail();
        } else {
          this.toastr.error(`Something went wrong email not sent Please check if email is valid and try again`, 'Error');
          this.spinner.hide();
        }

      }, error => {
        this.spinner.hide();
      });
    }
  }
  public clearEmail = () => {
    if (this.f.controls.isAgentInvoice.value) {
      this.f.controls.isAgentInvoice.setValue(false);
    }
    if (this.f.controls.isStudentInvoice.value) {
      this.f.controls.isStudentInvoice.setValue(false);
    }
    if (this.f.controls.isLoaInvoice.value) {
      this.f.controls.isLoaInvoice.setValue(false);
    }
    if (this.f.controls.isLoaInvoiceWithNoPrice.value) {
      this.f.controls.isLoaInvoiceWithNoPrice.setValue(false);
    }
    if (this.f.controls.isStudentInvitation.value) {
      this.f.controls.isStudentInvitation.setValue(false);
    }
    if (this.f.controls.isStudentCertificate.value) {
      this.f.controls.isStudentCertificate.setValue(false);
    }
    if (this.f.controls.isAirportInvoice.value) {
      this.f.controls.isAirportInvoice.setValue(false);
    }
    if (this.f.controls.isLoaGroupInvoice.value) {
      this.f.controls.isLoaGroupInvoice.setValue(false);
    }
    this.f.controls.studentEmail.setValue(null);
  }
  calculate = () => {
    let totalGross = this.f.controls.totalGrossPrice.value;
    if (totalGross && !this.f.controls.netPrice.value) {
      this.f.controls.netPrice.setValue(totalGross);
      this.f.controls.balance.setValue(totalGross);
    }
    if (this.f.controls.totalAddins.value && !this.f.controls.commision.value) {
      totalGross = totalGross + this.f.controls.totalAddins.value;
      this.f.controls.netPrice.setValue(totalGross);
    }
    const commisionToSubtract = ((this.f.controls.commision.value / 100) * totalGross);
    if (commisionToSubtract > -1) {
      let calculatedCommission = totalGross - commisionToSubtract;
      calculatedCommission = calculatedCommission + this.f.controls.totalAddins.value;
      if (calculatedCommission) {
        this.f.controls.netPrice.setValue(calculatedCommission);
      }
    }
    if (this.f.controls.commissionAddins.value) {
      const setTotalNetValue = this.f.controls.netPrice.value - this.f.controls.commissionAddins.value;
      this.f.controls.netPrice.setValue(setTotalNetValue);
    }
    if (this.f.controls.netPrice.value) {
      this.f.controls.balance.setValue(this.f.controls.netPrice.value - this.f.controls.paid.value);
    }
  }
  onCellClicked = ($event) => {
    this.openPaymentDialog($event.data.id);
  }
  openPaymentDialog(id?: number): void {
    const dialogRef = this.dialog.open(StudentPaymentComponent, {
      data: {
        ...this.student,
        paymentStudentID: id
      }
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        dialogRef.close();
        this.studentEvent.emit(true);
        this.calculate();
        this.getStudentPayments(this.studentId);
      }
    });
  }
  onGridReady(params) {
    this.gridApi = params.api;
    // params.api.sizeColumnsToFit();
  }
  public saveAndClose = () => {
    const data = this.shared.getCompleteState();
    data.arrivalTime = data.arrivalTime ? moment(data.arrivalTime).format('YYYY-MM-DD HH:mm:ss') : '';
    data.flightDepartureTime =
      data.flightDepartureTime ? moment(data.flightDepartureTime).format('YYYY-MM-DD HH:mm:ss') : '';
    data.programeStartDate = data.programeStartDate ? moment(data.programeStartDate).format('MM/DD/YYYY') : '';
    data.programeEndDate = data.programeEndDate ? moment(data.programeEndDate).format('MM/DD/YYYY') : '';
    data.arrivalDate = data.arrivalDate ? moment(data.arrivalDate).format('MM/DD/YYYY') : '';
    data.departureDate = data.departureDate ? moment(data.departureDate).format('MM/DD/YYYY') : '';
    if (!this.isEdit) {
      const studentInfo = this.shared.getStudentInfoState();
      const flightInfo = this.shared.getflightInfotate();
      const medicalInfo = this.shared.getmedicalInfotate();
      const programInfo = this.shared.getProgramInfoState();
      const model = {
        ...studentInfo,
        ...flightInfo,
        ...medicalInfo,
        ...programInfo,
      };
      this.listService.addStudentInfo(model).subscribe(res => {
        data.id = res;
        this.listService.updateStudentInfo(data).subscribe(update => {
          this.location.back();
        });
      });
    } else {
      this.listService.updateStudentInfo(data).subscribe(res => {
        this.location.back();
      });
    }
  }
}
