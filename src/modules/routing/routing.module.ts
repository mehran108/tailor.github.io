import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { GroupsComponent } from 'src/EliCamps/components/groups/groups.component';
import { AgentsComponent } from 'src/EliCamps/components/agents/agents.component';
import { HomeStaysComponent } from 'src/EliCamps/components/home-stays/home-stays.component';
import { RoomsComponent } from 'src/EliCamps/components/rooms/rooms.component';
import { TripsComponent } from 'src/EliCamps/components/trips/trips.component';
import { GroupAddEditComponent } from 'src/EliCamps/components/groups/group-add-edit/group-add-edit.component';
import { AgentAddEditComponent } from 'src/EliCamps/components/agents/agent-add-edit/agent-add-edit.component';
import { RoomsAddEditComponent } from 'src/EliCamps/components/rooms/rooms-add-edit/rooms-add-edit.component';
import { ProgrameAddinsComponent } from 'src/EliCamps/components/programe-addins/programe-addins.component';
import { AddEditAddinsComponent } from 'src/EliCamps/components/programe-addins/add-edit-addins/add-edit-addins.component';
import { CampusComponent } from 'src/EliCamps/components/campus/campus.component';
import { CampusAddEditComponent } from 'src/EliCamps/components/campus/campus-add-edit/campus-add-edit.component';
import { AddEditHomestayComponent } from 'src/EliCamps/components/home-stays/add-edit-homestay/add-edit-homestay.component';
import { LayoutComponent } from 'src/EliCamps/components/layout/layout.component';
import { LoginComponent } from 'src/EliCamps/components/login/login.component';
import { StudentRegistrationComponent } from 'src/EliCamps/components/students/student-registration/student-registration.component';
import { StudentsComponent } from 'src/EliCamps/components/students/students.component';
import { ForgetPasswordComponent } from 'src/EliCamps/components/login/forget-password/forget-password.component';
import { AppMasterGuard } from 'src/guards/app-master.guard';
import { ProgramComponent } from 'src/EliCamps/components/program/program.component';
import { AddEditProgramComponent } from 'src/EliCamps/components/program/add-edit-program/add-edit-program.component';
import { SubProgramComponent } from 'src/EliCamps/components/program/sub-program/sub-program.component';
// tslint:disable-next-line: max-line-length
import { AddEditSubProgramComponent } from 'src/EliCamps/components/program/sub-program/add-edit-sub-program/add-edit-sub-program.component';
import { StudentReportComponent } from 'src/EliCamps/components/Reports/student-report/student-report.component';
import { GroupReportComponent } from 'src/EliCamps/components/Reports/student-report/group-report/group-report.component';
import { TripReportComponent } from 'src/EliCamps/components/Reports/student-report/trip-report/trip-report.component';
import { HomestayReportComponent } from 'src/EliCamps/components/Reports/student-report/homestay-report/homestay-report.component';
import { UsersComponent } from 'src/EliCamps/components/users/users.component';
import { AgentInvoiceComponent } from 'src/EliCamps/components/Invoices/agent-invoice/agent-invoice.component';
import { StudentCertificateComponent } from 'src/EliCamps/components/Invoices/student-certificate/student-certificate.component';
import { StudentInvitationComponent } from 'src/EliCamps/components/Invoices/student-invitation/student-invitation.component';
import { StudentLoaInvoiceComponent } from 'src/EliCamps/components/Invoices/student-loa-invoice/student-loa-invoice.component';
import { LoaInvoiceComponent } from 'src/EliCamps/components/Invoices/agent-invoice/loa-invoice/loa-invoice.component';
// tslint:disable-next-line: max-line-length
import { StudentAirportInvoiceComponent } from 'src/EliCamps/components/Invoices/agent-invoice/student-airport-invoice/student-airport-invoice.component';
import { TripsManagerComponent } from 'src/EliCamps/components/students/student-registration/trips-manager/trips-manager.component';
import { TripAddEditComponent } from 'src/EliCamps/components/trips/trip-add-edit/trip-add-edit.component';
import { GroupInvoiceComponent } from 'src/EliCamps/components/Invoices/group-invoice/group-invoice.component';
import { GroupPaymentComponent } from 'src/EliCamps/components/groups/group-add-edit/group-payment/group-payment.component';
import { GroupProgrameComponent } from 'src/EliCamps/components/groups/group-add-edit/group-programe/group-programe.component';
import { LoaGroupInvoiceComponent } from 'src/EliCamps/components/Invoices/loa-group-invoice/loa-group-invoice.component';
import { PaymentReportComponent } from 'src/EliCamps/components/Reports/student-report/payment-report/payment-report.component';
import { InsuranceReportComponent } from 'src/EliCamps/components/Reports/insurance-report/insurance-report.component';
import { AirportTransferReportComponent } from 'src/EliCamps/components/Reports/airport-transfer-report/airport-transfer-report.component';
const routes: Routes = [
  { path: 'registerStudent/agent-invoice', canActivate: [AppMasterGuard], component: AgentInvoiceComponent },
  { path: 'registerStudent/student-certificate', canActivate: [AppMasterGuard], component: StudentCertificateComponent },
  { path: 'registerStudent/student-invitation', canActivate: [AppMasterGuard], component: StudentInvitationComponent },
  { path: 'registerStudent/student-Loa', canActivate: [AppMasterGuard], component: StudentLoaInvoiceComponent },
  { path: 'registerStudent/loa-invoice', canActivate: [AppMasterGuard], component: LoaInvoiceComponent },
  { path: 'registerStudent/student-Airport-Invoice', canActivate: [AppMasterGuard], component: StudentAirportInvoiceComponent },
  { path: 'registerStudent/loa-group-invoice', canActivate: [AppMasterGuard], component: LoaGroupInvoiceComponent },
  { path: 'group-invoice', canActivate: [AppMasterGuard], component: GroupInvoiceComponent },
  { path: 'login', component: LoginComponent },
  { path: 'forgetPassword', component: ForgetPasswordComponent },
  {
    path: '', component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'groups', pathMatch: 'full' },
      { path: 'users', canActivate: [AppMasterGuard], component: UsersComponent },
      { path: 'groups', canActivate: [AppMasterGuard], component: GroupsComponent },
      { path: 'agents', canActivate: [AppMasterGuard], component: AgentsComponent },
      { path: 'homestays', canActivate: [AppMasterGuard], component: HomeStaysComponent },
      { path: 'rooms', canActivate: [AppMasterGuard], component: RoomsComponent },
      { path: 'trips', canActivate: [AppMasterGuard], component: TripsComponent },
      { path: 'addTrip', canActivate: [AppMasterGuard], component: TripAddEditComponent },
      { path: 'addGroup', canActivate: [AppMasterGuard], component: GroupAddEditComponent },
      { path: 'addAgent', canActivate: [AppMasterGuard], component: AgentAddEditComponent },
      { path: 'addRoom', canActivate: [AppMasterGuard], component: RoomsAddEditComponent },
      { path: 'addins', canActivate: [AppMasterGuard], component: ProgrameAddinsComponent },
      { path: 'addAddins', canActivate: [AppMasterGuard], component: AddEditAddinsComponent },
      { path: 'campus', canActivate: [AppMasterGuard], component: CampusComponent },
      { path: 'addCampus', canActivate: [AppMasterGuard], component: CampusAddEditComponent },
      { path: 'addHomeStay', canActivate: [AppMasterGuard], component: AddEditHomestayComponent },
      { path: 'students', canActivate: [AppMasterGuard], component: StudentsComponent },
      { path: 'registerStudent', canActivate: [AppMasterGuard], component: StudentRegistrationComponent },
      { path: 'programs', canActivate: [AppMasterGuard], component: ProgramComponent },
      { path: 'addProgram', canActivate: [AppMasterGuard], component: AddEditProgramComponent },
      { path: 'subPrograms', canActivate: [AppMasterGuard], component: SubProgramComponent },
      { path: 'addSubProgram', canActivate: [AppMasterGuard], component: AddEditSubProgramComponent },
      { path: 'site-report', canActivate: [AppMasterGuard], component: StudentReportComponent },
      { path: 'group-report', canActivate: [AppMasterGuard], component: GroupReportComponent },
      { path: 'trip-report', canActivate: [AppMasterGuard], component: TripReportComponent },
      { path: 'homestay-report', canActivate: [AppMasterGuard], component: HomestayReportComponent },
      { path: 'group-payment', canActivate: [AppMasterGuard], component: GroupPaymentComponent },
      { path: 'group-program', canActivate: [AppMasterGuard], component: GroupProgrameComponent },
      { path: 'payment-summary-report', canActivate: [AppMasterGuard], component: PaymentReportComponent },
      { path: 'insurance-report', canActivate: [AppMasterGuard], component: InsuranceReportComponent },
      { path: 'airport-report', canActivate: [AppMasterGuard], component: AirportTransferReportComponent }
    ]
  }
];
@NgModule({
  imports: [CommonModule, RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
  declarations: []
})
export class AppRoutingModule { }
