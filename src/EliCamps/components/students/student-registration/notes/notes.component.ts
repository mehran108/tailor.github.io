import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit, Input } from '@angular/core';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SharedService } from 'src/EliCamps/services/shared.service';
import { ListService } from 'src/EliCamps/services/list.service';
import { Student } from 'src/EliCamps/EliCamps-Models/Elicamps';
import { NgxSpinnerService } from 'ngx-spinner';
import * as moment from 'moment';
import { Location } from '@angular/common';
@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css']
})
export class NotesComponent implements OnInit {
  @Input() student: Student;
  public Editor = ClassicEditor;
  isEdit = false;
  public registerForm: FormGroup;
  public submitted = false;
  public loading = false;
  public id: number;
  constructor(
    private formBuilder: FormBuilder,
    public shared: SharedService,
    private route: ActivatedRoute,
    public listService: ListService,
    private router: Router,
    public spinner: NgxSpinnerService,
    public location: Location) { }
  get f() {
    return this.registerForm;
  }
  ngOnInit() {
    this.initializeForm();
    this.getParams();
    this.shared.getRecord().subscribe(res => {
      if (res) {
        this.onSubmit();
      }
    });
  }
  public getParams() {
    this.route.queryParams.subscribe(params => {
      if (params && params.studentId) {
        this.id = Number(atob(params.studentId));
        if (this.id) {
          this.isEdit = true;
        }
      }
    });
  }
  initializeForm() {
    this.registerForm = this.formBuilder.group({
      extraNotes: ['']
    });
  }

  onSubmit() {
    if (this.f.valid) {
      if (this.isEdit === false) {
        this.spinner.show();
        this.submitted = true;
        this.loading = true;
        const studentInfo = this.shared.getStudentInfoState();
        const flightInfo = this.shared.getflightInfotate();
        const medicalInfo = this.shared.getmedicalInfotate();
        const programInfo = this.shared.getProgramInfoState();
        const paymentInfo = this.shared.getpaymentInfoState();
        const accomodation = this.shared.getProgramInfoState();
        const tripManager = this.shared.getTripsManagerInfoState();
        let model = {
          ...studentInfo,
          ...flightInfo,
          ...medicalInfo,
          ...programInfo,
        };
        this.listService.addStudentInfo(model).subscribe(res => {
          model = {
            ...model,
            ...this.f.value,
            ...paymentInfo,
            ...accomodation,
            ...tripManager
          };
          model.id = res;
          this.spinner.hide();
          this.listService.updateStudentInfo(model).subscribe(id => {
            this.spinner.hide();
            this.router.navigate(['registerStudent'], {
              queryParams: {
                studentId: btoa(model.id.toString())
              }
            });
          }, error => {
            this.spinner.hide();
          });
        }, error => {
          this.spinner.hide();
        });
      } else if (this.isEdit === true) {
        this.spinner.show();
        const model = {
          ...this.student,
          ...this.f.value
        };
        this.listService.updateStudentInfo(model).subscribe(res => {
          this.spinner.hide();
          this.router.navigate(['registerStudent'], {
            queryParams: {
              studentId: btoa(model.id.toString())
            }
          });
        }, error => {
          this.spinner.hide();
        });
      }
    }
  }
  Cancel_Click() {
    this.router.navigate(['students']);
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
        this.router.navigate(['registerStudent'], {
          queryParams: {
            studentId: btoa(data.id.toString())
          }
        });
        this.listService.updateStudentInfo(data).subscribe(update => {
        });
      });
    } else {
      data.id = data.id ? data.id : this.id;
      this.listService.updateStudentInfo(data).subscribe(res => {
        this.router.navigate(['students']);
      });
    }
  }
}
