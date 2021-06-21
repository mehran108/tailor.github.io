import { SharedService } from 'src/EliCamps/services/shared.service';
import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  Agent,
  Group,
  LookupTable,
  Student,
  SubProgram,
  Program,
  Campus
} from 'src/EliCamps/EliCamps-Models/Elicamps';
import { ListService } from 'src/EliCamps/services/list.service';
import { Location } from '@angular/common';
import { LookupEnum } from 'src/EliCamps/common/lookup.enums';
import { LocalstorageService } from 'src/EliCamps/services/localstorage.service';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-program-information',
  templateUrl: './program-information.component.html',
  styleUrls: ['./program-information.component.css']
})
export class ProgramInformationComponent implements OnInit, OnChanges, OnDestroy {
  @Input() student: Student;
  // tslint:disable-next-line: no-output-on-prefix
  @Output() onStudentRegistration: EventEmitter<any> = new EventEmitter<any>();
  @Output() programUpdated: EventEmitter<any> = new EventEmitter<any>();
  public registerForm: FormGroup;
  public submitted = false;
  public agentList: Agent[] = [];
  public groupReuestModel: Group;
  public mealPlanList: LookupTable[] = [];
  public studentId: number;
  public isEdit = false;
  public selectedAgent: Agent;
  public loading = false;
  public campusList: Campus[] = [];
  public addinsList: [] = [];
  public selectedIndex = 4;
  public programList: Program[] = [];
  public subProgramList: SubProgram[] = [];
  public formatList: LookupTable[] = [];
  public groupSubscription: Subscription;
  public shareObservable: Subscription;
  public chapProgramList: LookupTable[] = [];
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    public listService: ListService,
    public location: Location,
    public shared: SharedService,
    public toastr: ToastrService
  ) { }
  // convenience getter for easy access to form fields
  get f() {
    return this.registerForm;
  }
  ngOnInit() {
    this.getParams();
    this.initializeDropDowns();
    this.initializeForm();
    this.f.valueChanges.subscribe(res => {
      this.shared.setProgramInfoState(this.f.value);
    });
    if (this.student) {
      this.populateStudentForm(this.student);
      this.isEdit = true;
    }
    this.groupSubscription = this.shared.getGroupInfoState().subscribe((res: any) => {
      if (res) {
        this.populateStudentFormByGroup(res);
      }
    });
    this.shareObservable = this.shared.getObservable().subscribe(res => {
      if (res) {
        this.populateStudentForm(res);
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
    this.groupSubscription.unsubscribe();
    this.shareObservable.unsubscribe();
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
    const params = {
      active: true
    };
    this.listService.getAllCampus(params).subscribe(res => {
      this.campusList = res.data;
    });
    this.listService.getAll(LookupEnum.MEALPLAN).subscribe(res => {
      this.mealPlanList = res;
    });
    this.listService.getAll(LookupEnum.FORMAT).subscribe(res => {
      this.formatList = res;
    });
    this.listService.getAll(LookupEnum.CHAPPROGRAM).subscribe(res => {
      this.chapProgramList = res;
    });
    this.listService.getAllAddins(params).subscribe(res => {
      this.addinsList = res.data;
      const defaultAddins = this.addinsList.filter((addin: any) => addin.isDefault).map((add: any) => add.id);
      if (this.f.controls.programeAddins.value && this.f.controls.programeAddins.value.length > 0) {
        this.f.controls.programeAddins.setValue(this.f.controls.programeAddins.value);
      } else {
        this.f.controls.programeAddins.setValue(defaultAddins);
      }
    });
    this.listService.getAllProgram(params).subscribe(res => {
      this.programList = res.data;
      const defaultProgram = this.programList.find(program => program.isDefault);
      if (this.f.controls.programID.value) {
        this.f.controls.programID.setValue(this.f.controls.programID.value);
        this.getSubProgram(this.f.controls.programID.value);
      } else {
        this.f.controls.programID.setValue(defaultProgram.id);
        this.getSubProgram({ value: defaultProgram.id });
      }
    });
  }
  initializeForm() {
    this.registerForm = this.formBuilder.group({
      programeStartDate: [''],
      programeEndDate: [''],
      campus: [''],
      programeAddins: [null],
      mealPlan: ['Full Board'],
      programID: [null],
      subProgramID: [null],
      format: [1020],
      chapFamily: ['Student']
    });
  }
  public getSubProgram = (program) => {
    this.listService.getSubProgramByProgramId(program.value).subscribe(res => {
      this.subProgramList = res.data;
    });
  }
  Cancel_Click() {
    this.router.navigate(['/students']);
  }
  onSubmit() {
    if (this.f.valid) {
      if (this.isEdit === false) {
        this.submitted = true;
        this.shared.setProgramInfoState(this.f.value);
        this.onStudentRegistration.emit(8);
      } else if (this.isEdit === true) {
        const model = {
          ...this.student,
          ...this.f.value
        };
        model.programeStartDate = model.programeStartDate ? moment(model.programeStartDate).format('MM/DD/YYYY') : '';
        model.programeEndDate = model.programeEndDate ? moment(model.programeEndDate).format('MM/DD/YYYY') : '';
        this.listService.updateStudentInfo(model).subscribe(res => {
          this.programUpdated.emit(true);
          this.toastr.success('Program Information Section Updated', 'Success');
        });
      }
    }
  }
  public populateStudentForm = (student: Student) => {
    if (student.programID) {
      this.getSubProgram({ value: student.programID });
    }
    const keys = ['arrivalTime', 'flightDepartureTime'];
    Object.keys(this.f.controls).forEach(key => {
      if (student[key] && !keys.includes(key)) {
        this.f.controls[key].setValue(student[key]);
      }
    });
    // if (student.arrivalDate) {
    //   this.f.controls.programeStartDate.setValue(new Date(student.arrivalDate));
    // }
    // if (student.departureDate) {
    //   this.f.controls.programeEndDate.setValue(new Date(student.departureDate));
    // }
    this.shared.setProgramInfoState(this.f.value);
  }
  public populateStudentFormByGroup = (student: any) => {
    if (student.arrivalDate) {
      this.f.controls.programeStartDate.setValue(new Date(student.arrivalDate));
    }
    if (student.departureDate) {
      this.f.controls.programeEndDate.setValue(new Date(student.departureDate));
    }
    const keys = ['arrivalTime', 'flightDepartureTime'];
    Object.keys(this.f.controls).forEach(key => {
      if (student[key] && !this.f.controls[key].value && !keys.includes(key)) {
        this.f.controls[key].setValue(student[key]);
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
