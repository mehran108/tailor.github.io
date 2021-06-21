import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { GroupService } from 'src/EliCamps/services/group.service';
import { ListService } from 'src/EliCamps/services/list.service';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { SharedService } from 'src/EliCamps/services/shared.service';
@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css']
})
export class ConfirmationDialogComponent implements OnInit {
  public isEdit = false;
  public studentId = '';
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public groupService: ListService,
    public location: Location,
    public route: ActivatedRoute,
    public shared: SharedService,
    public router: Router) { }

  ngOnInit() {
    this.route.queryParams.subscribe(res => {
      if (res.studentId) {
        this.studentId = atob(res.studentId);
        this.isEdit = true;
      }
    });
  }
  public saveAndClose = () => {
    this.data.arrivalTime = this.data.arrivalTime ? moment(this.data.arrivalTime).format('YYYY-MM-DD HH:mm:ss') : '';
    this.data.flightDepartureTime =
      this.data.flightDepartureTime ? moment(this.data.flightDepartureTime).format('YYYY-MM-DD HH:mm:ss') : '';
    this.data.programeStartDate = this.data.programeStartDate ? moment(this.data.programeStartDate).format('MM/DD/YYYY') : '';
    this.data.programeEndDate = this.data.programeEndDate ? moment(this.data.programeEndDate).format('MM/DD/YYYY') : '';
    this.data.arrivalDate = this.data.arrivalDate ? moment(this.data.arrivalDate).format('MM/DD/YYYY') : '';
    this.data.departureDate = this.data.departureDate ? moment(this.data.departureDate).format('MM/DD/YYYY') : '';
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
      this.groupService.addStudentInfo(model).subscribe(res => {
        this.data.id = res;
        this.groupService.updateStudentInfo(this.data).subscribe(update => {
          this.dialogRef.close();
          this.router.navigate(['students']);
        });
      });
    } else {
      this.data.id = this.data.id ? this.data.id : this.studentId;
      this.groupService.updateStudentInfo(this.data).subscribe(res => {
        this.dialogRef.close();
        this.router.navigate(['students']);
      });
    }
  }
  public onNoClick = () => {
    this.dialogRef.close();
    this.shared.setObservable(null);
    this.shared.setgroupInfoState(null);
    this.shared.setCompleteStateToNull();
    this.router.navigate(['students']);
  }
}
