import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges, OnChanges, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Group } from '@syncfusion/ej2-data';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ListService } from 'src/EliCamps/services/list.service';
import { Agent, Student } from 'src/EliCamps/EliCamps-Models/Elicamps';
import { LocalstorageService } from 'src/EliCamps/services/localstorage.service';
import { SharedService } from 'src/EliCamps/services/shared.service';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-flight-information',
  templateUrl: './flight-information.component.html',
  styleUrls: ['./flight-information.component.css']
})
export class FlightInformationComponent implements OnInit, OnChanges, OnDestroy {
  // tslint:disable-next-line: no-output-on-prefix
  @Output() onStudentRegistration: EventEmitter<any> = new EventEmitter<any>();
  @Input() student: Student;
  public registerForm: FormGroup;
  public submitted = false;
  public agentList: Agent[] = [];
  public groupReuestModel: Group;
  public studentId: number;
  public isEdit = false;
  public selectedAgent: Agent;
  public loading = false;
  public groupSubscription: Subscription;
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    public listService: ListService,
    public location: Location,
    public shared: SharedService,
    public taostr: ToastrService
  ) {
  }
  // convenience getter for easy access to form fields
  get f() { return this.registerForm; }
  ngOnInit() {
    this.getParams();
    this.initializeDropDowns();
    this.initializeForm();
    this.f.valueChanges.subscribe(res => {
      this.shared.setflightInfoState(this.f.value);
      this.shared.setObservable(this.f.value);
    });
    if (this.student) {
      this.isEdit = true;
      this.populateStudentForm(this.student);
    }
    this.groupSubscription = this.shared.getGroupInfoState().subscribe(res => {
      if (res) {
        this.populateStudentFormByGroup(res);
      }
    });
  }
  public getParams() {
    this.route.queryParams.subscribe(params => {
      if (params && params.studentId) {
        this.studentId = Number(atob(params.studentId));
        if (this.studentId) {
          this.isEdit = true;
          this.getSelectedAgent(this.studentId);
        }
      }
    });
  }
  ngOnChanges(change: SimpleChanges) {
    if (this.f) {
      this.populateStudentForm(change.student.currentValue);
    }
  }
  ngOnDestroy() {
    this.groupSubscription.unsubscribe();
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
  }
  initializeForm() {
    this.registerForm = this.formBuilder.group({

      programeStartDate: [''],
      programeEndDate: [''],
      terminal: [''],
      departureTerminal: [''],
      flightNumber: [''],
      departureFlightNumber: [''],
      destinationFrom: [''],
      destinationTo: [''],
      arrivalTime: [''],
      flightDepartureTime: [''],
      active: [true],
    });
  }

  Cancel_Click() {
    this.router.navigate(['/students']);
  }
  onSubmit() {
    if (this.f.valid) {
      if (this.isEdit === false) {
        const model = {
          ...this.f.value
        };
        const selectedIndex = 2;
        model.arrivalTime = model.arrivalTime ? moment(model.arrivalTime).format('YYYY-MM-DD HH:mm:ss') : '';
        model.flightDepartureTime = model.flightDepartureTime ? moment(model.flightDepartureTime).format('YYYY-MM-DD HH:mm:ss') : '';
        model.arrivalDate = model.arrivalDate ? moment(model.arrivalDate).format('MM/DD/YYYY') : '';
        model.departureDate = model.departureDate ? moment(model.departureDate).format('MM/DD/YYYY') : '';
        this.shared.setflightInfoState(model);
        this.onStudentRegistration.emit(selectedIndex);
      } else if (this.isEdit === true) {
        const model = {
          ...this.student,
          ...this.f.value
        };
        model.arrivalTime = model.arrivalTime ? moment(model.arrivalTime).format('YYYY-MM-DD HH:mm:ss') : '';
        model.flightDepartureTime = model.flightDepartureTime ? moment(model.flightDepartureTime).format('YYYY-MM-DD HH:mm:ss') : '';
        model.programeStartDate = model.programeStartDate ? moment(model.programeStartDate).format('MM/DD/YYYY') : '';
        model.programeEndDate = model.programeEndDate ? moment(model.programeEndDate).format('MM/DD/YYYY') : '';
        this.listService.updateStudentInfo(model).subscribe(res => {
          const Index = 2;
          this.taostr.success('Flight Information Section Updated', 'Success');
        });
      }
    }
  }
  public populateStudentForm = (student: Student) => {
    const keys = ['arrivalTime', 'flightDepartureTime'];
    Object.keys(this.f.controls).forEach(key => {
      if (student[key] && !keys.includes(key)) {
        this.f.controls[key].setValue(student[key]);
      }
    });
    keys.forEach(res => {
      this.f.controls[res].setValue(new Date(student[res]));
    });
    this.shared.setflightInfoState(this.f.value);
  }
  public populateStudentFormByGroup = (student: any) => {
    const keys = ['arrivalTime', 'flightDepartureTime'];
    student.programeStartDate = student.programeStartDate ? student.programeStartDate : student.arrivalDate;
    student.programeEndDate = student.programeEndDate ? student.programeEndDate : student.departureDate;
    Object.keys(this.f.controls).forEach(key => {
      if (student[key] && !keys.includes(key)) {
        if (student[key]) {
          this.f.controls[key].setValue(student[key]);
        }
      }
    });
    keys.forEach(res => {
      if (student[res]) {
        this.f.controls[res].setValue(new Date(`2019-01-01T${student[res]}`));
      }
    });
    this.shared.setProgramInfoState(this.f.value);
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
