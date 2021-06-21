import { ListService } from 'src/EliCamps/services/list.service';
import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Campus, Student } from 'src/EliCamps/EliCamps-Models/Elicamps';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from 'src/EliCamps/services/shared.service';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import { Location } from '@angular/common';
@Component({
  selector: 'app-accomodation',
  templateUrl: './accomodation.component.html',
  styleUrls: ['./accomodation.component.css']
})
export class AccomodationComponent implements OnInit, OnChanges {
  // tslint:disable-next-line: no-output-on-prefix
  @Output() onStudentRegistration: EventEmitter<any> = new EventEmitter<any>();

  public accomodationForm: FormGroup;
  public showHomeStay = false;
  public showRooms = false;
  public homeStayList = [];
  public roomList: any = [];
  public studentId: number;
  public campusList: Campus[];
  @Input() student: Student;
  public isEdit = false;
  public homeStayOrResidenceList: any = [];
  constructor(
    public listService: ListService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    public shared: SharedService,
    public taostr: ToastrService,
    public location: Location
  ) { }
  get f() { return this.accomodationForm; }
  ngOnInit() {
    this.initializeForm();
    this.populateHomeStayDropdown();
    this.populateRoomListDropdown();
    this.getCampusList();
    this.getParams();
    this.f.valueChanges.subscribe(res => {
      this.shared.setaccomodationInfoState(this.f.value);
    });
    this.homeStayOrResidenceList = [
      { value: 1, name: 'HomeStay' },
      { value: 2, name: 'Residence' },
      { value: 3, name: 'No Accommodation' }];
    if (this.student) {
      this.isEdit = true;
      this.populateStudentForm(this.student);
    }

  }
  public getParams() {
    this.route.queryParams.subscribe(params => {
      if (params && params.studentId) {
        this.studentId = Number(atob(params.studentId));
        if (this.studentId) {
          this.isEdit = true;
        }
      }
    });
  }
  ngOnChanges(change: SimpleChanges) {
    if (this.f) {
      this.populateStudentForm(change.student.currentValue);
    }
  }
  onSubmit = () => {
    if (this.f.valid) {
      if (this.isEdit === true) {
        const model = {
          ...this.student,
          ...this.f.value
        };
        this.listService.updateStudentInfo(model).subscribe(res => {
          const Index = 5;
          this.taostr.success('Accomodation Section Updated', 'Success');
          // this.onStudentRegistration.emit(Index);
        });
      } else {
        this.shared.setaccomodationInfoState(this.f.value);
        const Index = 5;
        this.onStudentRegistration.emit(Index);
      }
    }
  }

  initializeForm() {
    this.accomodationForm = this.formBuilder.group({

      homestayOrResi: [''],
      homestayID: [''],
      roomID: [''],
      roomSearchTo: [''],
      roomSearchFrom: [''],
      roomSearchCampus: ['']
    });
  }

  Cancel_Click() {
    this.router.navigate(['/students']);
  }
  gethoomeStaylist = ($event) => {
    if ($event.value === 1) {
      this.showHomeStay = true;
      this.showRooms = false;
    } else if ($event.value === 2) {
      this.showRooms = true;
      this.showHomeStay = false;
    } else if ($event.value === 3) {
      this.showRooms = false;
      this.showHomeStay = false;
    }
  }

  public getCampusList = () => {
    const params = {
      active: true
    };
    this.listService.getAllCampus(params).subscribe(res => {
      this.campusList = (res as any).data;
    });
  }

  populateHomeStayDropdown = () => {
    this.listService.getAllHomeStay().subscribe(res => {
      this.homeStayList = res.data;
    });
  }

  populateRoomListDropdown = () => {
    this.listService.getAllRoomList().subscribe(res => {
      this.roomList = res.data;
    });
  }

  public populateStudentForm = (student: Student) => {
    const keys = ['arrivalTime', 'flightDepartureTime'];
    if (student.homestayID) {
      this.f.controls.homestayOrResi.setValue(1);
      this.showHomeStay = true;
      this.showRooms = false;
    } else if (student.roomID) {
      this.f.controls.homestayOrResi.setValue(2);
      this.showHomeStay = false;
      this.showRooms = true;
    } else {
      this.showHomeStay = false;
      this.showRooms = false;
    }
    Object.keys(this.f.controls).forEach(key => {
      if (student[key] && !this.f.controls[key].value && !keys.includes(key)) {
        this.f.controls[key].setValue(student[key]);
      }
    });
    this.shared.setaccomodationInfoState(this.f.value);
  }
  public getHTML = (value: number) => {
    if (this.homeStayList.find(res => res.homeId === value)) {
      return this.homeStayList.find(res => res.homeId === value).homeStayLocationURL || '';
    }
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
