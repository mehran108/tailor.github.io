import { Group, StudentDocuments } from './../../../../EliCamps-Models/Elicamps';
import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as moment from 'moment';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LookupTable, Agent, Student } from 'src/EliCamps/EliCamps-Models/Elicamps';
import { Router, ActivatedRoute } from '@angular/router';
import { GroupService } from 'src/EliCamps/services/group.service';
import { MatDialog } from '@angular/material';
import { TripManagerComponent } from 'src/EliCamps/components/groups/group-add-edit/trip-manager/trip-manager.component';
import { GroupProgrameComponent } from 'src/EliCamps/components/groups/group-add-edit/group-programe/group-programe.component';
import { GroupPaymentComponent } from 'src/EliCamps/components/groups/group-add-edit/group-payment/group-payment.component';
import { LookupEnum } from 'src/EliCamps/common/lookup.enums';
import { ListService } from 'src/EliCamps/services/list.service';
import { Location } from '@angular/common';
import { LocalstorageService } from 'src/EliCamps/services/localstorage.service';
import { SharedService } from 'src/EliCamps/services/shared.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-student-information',
  templateUrl: './student-information.component.html',
  styleUrls: ['./student-information.component.css']
})
export class StudentInformationComponent implements OnInit, OnChanges {
  // tslint:disable-next-line: no-output-on-prefix
  @Output() onStudentRegistration: EventEmitter<any> = new EventEmitter<any>();
  @Input() student: Student;
  public studentRegisterForm: FormGroup;
  public submitted = false;
  public agentList: Agent[] = [];
  public documentId = null;
  public selectedGroup: Group;
  public studentId: number;
  public isEdit = false;
  public loading = false;
  public selectedStudent: Student;
  public groupList: Group[] = [];
  public campList: LookupTable[] = [];
  public yearList = [{ value: 2020, name: '2020' }, { value: 2021, name: '2021' }];
  public genderList = [{ value: 1, name: 'Male' }, { value: 2, name: 'Female' }];
  fileData: File = null;
  previewUrl: any = null;
  fileUploadProgress: string = null;
  uploadedFilePath: string = null;
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    public groupService: GroupService,
    public dialog: MatDialog,
    public listService: ListService,
    public location: Location,
    public storage: LocalstorageService,
    public shared: SharedService,
    public toastr: ToastrService
  ) {
  }
  // convenience getter for easy access to form fields
  get f() { return this.studentRegisterForm; }
  ngOnInit() {
    this.initializeDropDowns();
    this.initializeForm();
    this.getParams();
    this.getGroupList();
    this.f.valueChanges.subscribe(res => {
      this.shared.setStudentInfoState(this.f.value);
    });
  }

  public populateStudentForm = (student: Student) => {
    const keys = ['arrivalTime', 'flightDepartureTime'];
    Object.keys(this.f.controls).forEach(key => {
      if (key === 'active') {
        this.f.controls[key].setValue(student[key]);
      }
      if (student[key] && !this.f.controls[key].value) {
        if (key === 'groupRef') {
          this.f.controls[key].setValue(+student[key]);
        } else {
          this.f.controls[key].setValue(student[key]);
        }
      }
    });
    this.calculateAge();
    this.shared.setStudentInfoState(this.f.value);
  }
  ngOnChanges(change: SimpleChanges) {
    if (this.f) {
      this.populateStudentForm(change.student.currentValue);
    }
  }
  selectValue = (value) => {
    if (value) {
      const agentToFind = this.agentList.find(agent => agent.id === value);
      if (agentToFind) {
        this.f.controls.country.setValue(agentToFind.country);
      }
    }
  }
  public populateStudentGroupForm = (student: any) => {
    const keys = ['arrivalTime', 'flightDepartureTime'];
    Object.keys(this.f.controls).forEach(key => {
      if (student[key] && !this.f.controls[key].value && !keys.includes(key)) {
        this.f.controls[key].setValue(student[key]);
      }
    });
  }
  public initializeDropDowns = () => {
    const params = {
      active: true
    };
    this.listService.getAllAgent(params).subscribe(res => {
      this.agentList = res.data;
    });
    this.listService.getAll(LookupEnum.CAMPS).subscribe(res => {
      this.campList = res;
    });
  }
  initializeForm() {
    this.studentRegisterForm = this.formBuilder.group({
      id: [0],
      reg_Ref: [''],
      year: [new Date().getFullYear()],
      groupID: [0],
      passportNumber: [''],
      firstName: [''],
      lastName: [''],
      gender: [''],
      dob: [''],
      age: [''],
      homeAddress: [''],
      country: [''],
      city: [''],
      state: [''],
      postCode: [''],
      phone: [''],
      email: [''],
      agencyID: [''],
      emergencyContact: [''],
      active: [true]
    });
  }

  Cancel_Click() {
    this.router.navigate(['/students']);
  }
  public onSubmit() {
    if (this.f.valid) {
      if (this.isEdit === false) {
        this.f.removeControl('id');
        const selectedIndex = 1;
        this.onStudentRegistration.emit(selectedIndex);
        this.shared.setStudentInfoState(this.f.value);
      }
      if (this.isEdit === true) {
        const model = {
          ...this.student,
          ...this.f.value,
          documentId: this.documentId
        };
        this.shared.setStudentInfoState(model);
        this.listService.updateStudentInfo(model).subscribe(res => {
          const Index = 1;
          this.toastr.success('Student Information Section Updated', 'Success');
          // this.onStudentRegistration.emit(Index);
        });
      }
    }
  }
  clean(obj) {
    for (var propName in obj) {
      if (obj[propName] === null || obj[propName] === undefined) {
        delete obj[propName];
      }
    }
  }
  public getParams() {
    this.route.queryParams.subscribe(params => {
      if (params && params.studentId) {
        this.studentId = Number(atob(params.studentId));
        if (this.studentId) {
          this.isEdit = true;
          this.getSelectedStuent(this.studentId);
        }
      }
    });
  }
  public getGroupList = () => {
    const params = {
      active: true
    };
    this.groupService.getAllElicampsGroups(params).subscribe((groupList: Group[]) => {
      this.groupList = ((groupList as any).data || []);
    });
  }
  public getSelectedStuent = (studentId: number) => {
    this.loading = true;
    this.groupService.getElicampsStudent(studentId).subscribe((student: any) => {
      if (student) {
        this.loading = false;
        this.f.controls.id.setValue(studentId);
        student.groupID = student.groupRef ? +student.groupRef : +student.groupID;
        this.selectedStudent = student;
        this.populateStudentForm(this.selectedStudent);
        this.previewUrl = this.selectedStudent.documentPath;
      }
      this.loading = false;
    }, error => {
      this.loading = false;
    });
  }

  public getBygroupId = () => {
    const groupId = this.f.controls.groupID.value;
    this.loading = true;
    this.groupService.getElicampsGroup(groupId).subscribe((group: Group) => {
      if (group) {
        this.f.controls.agencyID.setValue(group.agentID);
        this.f.controls.country.setValue(group.country);
        this.shared.setObservable(group);
        this.shared.setgroupInfoState(group);
      }
      this.loading = false;
    }, error => {
      this.loading = false;
    });
  }
  fileProgress(fileInput: any) {
    this.fileData = <File>fileInput.target.files[0];
    this.preview();
  }

  preview() {
    // Show preview
    const mimeType = this.fileData.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(this.fileData);
    reader.onload = (_event) => {
      this.previewUrl = reader.result;
      this.upload();
    };
  }
  public calculateAge = () => {
    const now = moment(new Date()); // todays date
    const duration = moment.duration(now.diff(this.f.controls.dob.value));
    const years = duration.asYears();
    if (years) {
      this.f.controls.age.setValue(Math.floor(years));
    }
  }

  upload() {

    const model: any = {
      ProfilePic: this.fileData
    };
    this.listService.uploadStudentProfile(model).subscribe(res => {
      if (res) {
        this.documentId = +res;
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
      data.active = this.f.controls.active.value;
      this.listService.updateStudentInfo(data).subscribe(res => {
        this.location.back();
      });
    }
  }

}
