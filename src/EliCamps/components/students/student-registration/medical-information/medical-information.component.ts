import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Agent, Group, Student } from 'src/EliCamps/EliCamps-Models/Elicamps';
import { Location } from '@angular/common';
import { ListService } from 'src/EliCamps/services/list.service';
import { LocalstorageService } from 'src/EliCamps/services/localstorage.service';
import { SharedService } from 'src/EliCamps/services/shared.service';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
@Component({
  selector: 'app-medical-information',
  templateUrl: './medical-information.component.html',
  styleUrls: ['./medical-information.component.css']
})
export class MedicalInformationComponent implements OnInit, OnChanges {
  // tslint:disable-next-line: no-ou@Input () student: Student;tput-on-prefix
  // tslint:disable-next-line: no-output-on-prefix
  @Output() onStudentRegistration: EventEmitter<any> = new EventEmitter<any>();
  @Input() student: Student;
  public registerForm: FormGroup;
  public submitted = false;
  public agentList: Agent[] = [];
  public groupReuestModel: Group;
  public id: number;
  public isEdit = false;
  public selectedAgent: Agent;
  public loading = false;
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    public listService: ListService,
    public location: Location,
    public storage: LocalstorageService,
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
      this.shared.setmedicalInfoState(this.f.value);
    });
    if (this.student) {
      this.isEdit = true;
      this.populateStudentForm(this.student);
    }
  }
  public getParams() {
    this.route.queryParams.subscribe(params => {
      if (params && params.id) {
        this.id = Number(atob(params.id));
        if (this.id) {
          this.isEdit = true;
          this.getSelectedAgent(this.id);
        }
      }
    });
  }
  ngOnChanges(change: SimpleChanges) {
    if (this.f) {
      this.populateStudentForm(change.student.currentValue);
    }
    if (change.student.currentValue) {
      this.isEdit = true;
      this.populateStudentForm(this.student);
    }
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
    this.shared.setmedicalInfoState(this.f.value);
  }
  public initializeDropDowns = () => {
  }
  initializeForm() {
    this.registerForm = this.formBuilder.group({
      dietaryNeeds: [''],
      allergies: [''],
      medicalNotes: [''],
      medicalConditon: ['']
    });
  }

  Cancel_Click() {
    this.router.navigate(['/students']);
  }
  onSubmit() {
    if (this.f.valid) {
      if (this.isEdit === false) {
        const selectedIndex = 3;
        this.shared.setmedicalInfoState(this.f.value);
        this.onStudentRegistration.emit(selectedIndex);
        this.shared.setmedicalInfoState(this.f.value);
      } else if (this.isEdit === true) {
        const model = {
          ...this.student,
          ...this.f.value
        };
        this.listService.updateStudentInfo(model).subscribe(res => {
          const Index = 3;
          this.taostr.success('Medical Information Section Updated', 'Success');
          //  this.onStudentRegistration.emit(Index);
        });
      }
    }
  }

  public populateStudentForm = (student: Student) => {
    const keys = ['arrivalTime', 'flightDepartureTime'];
    Object.keys(this.f.controls).forEach(key => {
      if (student[key] && !this.f.controls[key].value && !keys.includes(key)) {
        this.f.controls[key].setValue(student[key]);
      }
    });
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
