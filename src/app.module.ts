import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { ProjectsModule } from './projects/projects.module'
import { CompanyModule } from './company/company.module'
import { LocationsModule } from './locations/locations.module'
import { DepartmentsModule } from './departments/departments.module'
import { DesignationsModule } from './designations/designations.module'
import { ShiftsModule } from './shifts/shifts.module'
import { LeavePoliciesModule } from './leave-policies/leave-policies.module'
import { LeaveApplicationsModule } from './leave-applications/leave-applications.module'
import { LeaveBalancesModule } from './leave-balances/leave-balances.module'
import { LeaveEncashmentsModule } from './leave-encashments/leave-encashments.module'
import { HolidaysModule } from './holidays/holidays.module'
import { RolesModule } from './roles/roles.module'
import { UserRoleAssignmentsModule } from './user-role-assignments/user-role-assignments.module'
import { AssetCategoriesModule } from './asset-categories/asset-categories.module'
import { ProjectCategoriesModule } from './project-categories/project-categories.module'
import { SalaryTemplatesModule } from './salary-templates/salary-templates.module'
import { ManagerAssignmentsModule } from './manager-assignments/manager-assignments.module';
import { EmployeeAssignmentsModule } from './employee-assignments/employee-assignments.module';
import { BudgetItemsModule } from './budget-items/budget-items.module';
import { ShiftAssignmentsModule } from './shift-assignments/shift-assignments.module';
import { ProjectDocumentsModule } from './project-documents/project-documents.module';
import { DailyLogsModule } from './daily-logs/daily-logs.module';
import { EmployeeMastersModule } from './employee-masters/employee-masters.module';
import { KYCVerificationsModule } from './kyc-verifications/kyc-verifications.module';
import { EmployeeDocumentsModule } from './employee-documents/employee-documents.module';
import { EmploymentHistoryModule } from './employment-history/employment-history.module';
import { IDCardTemplatesModule } from './id-card-templates/id-card-templates.module';
import { GeneratedIDCardsModule } from './generated-id-cards/generated-id-cards.module';
import { UniformItemsModule } from './uniform-items/uniform-items.module';
import { UniformAllocationsModule } from './uniform-allocations/uniform-allocations.module';
import { AssetItemsModule } from './asset-items/asset-items.module';
import { EmployeeAssetsModule } from './employee-assets/employee-assets.module';
import { FaceEnrollmentsModule } from './face-enrollments/face-enrollments.module';
import { FingerprintEnrollmentsModule } from './fingerprint-enrollments/fingerprint-enrollments.module';
import { FingerprintLogsModule } from './fingerprint-logs/fingerprint-logs.module';
import { FingerprintValidationAlertsModule } from './fingerprint-validation-alerts/fingerprint-validation-alerts.module';
import { CameraDevicesModule } from './camera-devices/camera-devices.module';
import { FingerprintDevicesModule } from './fingerprint-devices/fingerprint-devices.module';
import { FaceRecognitionLogsModule } from './face-recognition-logs/face-recognition-logs.module';
import { AntiSpoofingAlertsModule } from './anti-spoofing-alerts/anti-spoofing-alerts.module';
import { AttendanceLogsModule } from './attendance-logs/attendance-logs.module';
import { DailyAttendanceModule } from './daily-attendance/daily-attendance.module';
import { CheckInOutLogsModule } from './check-in-out-logs/check-in-out-logs.module';
import { OvertimeRecordsModule } from './overtime-records/overtime-records.module';
import { AttendanceRegularizationsModule } from './attendance-regularizations/attendance-regularizations.module';
import { ProjectHoursModule } from './project-hours/project-hours.module';
import { NightShiftAllowancesModule } from './night-shift-allowances/night-shift-allowances.module';
import { LeaveDeductionsModule } from './leave-deductions/leave-deductions.module';
import { NotificationTemplatesModule } from './notification-templates/notification-templates.module';
import { SMSAlertsModule } from './sms-alerts/sms-alerts.module';
import { WhatsAppNotificationsModule } from './whatsapp-notifications/whatsapp-notifications.module';
import { EmailAlertsModule } from './email-alerts/email-alerts.module';
import { PushNotificationsModule } from './push-notifications/push-notifications.module';
import { GeofenceAreasModule } from './geofence-areas/geofence-areas.module';
import { GeofenceProjectAssignmentsModule } from './geofence-project-assignments/geofence-project-assignments.module';
import { GPSPunchesModule } from './gps-punches/gps-punches.module';
import { GPSRouteLogsModule } from './gps-route-logs/gps-route-logs.module';
import { LocationDeviationAlertsModule } from './location-deviation-alerts/location-deviation-alerts.module';
import { HRTicketsModule } from './hr-tickets/hr-tickets.module';
import { JobOpeningsModule } from './job-openings/job-openings.module';
import { CandidateApplicationsModule } from './candidate-applications/candidate-applications.module';
import { InterviewsModule } from './interviews/interviews.module';
import { OfferLettersModule } from './offer-letters/offer-letters.module';
import { CandidateOnboardingsModule } from './candidate-onboardings/candidate-onboardings.module';
import { KpisModule } from './kpis/kpis.module';
import { KpiAssignmentsModule } from './kpi-assignments/kpi-assignments.module';
import { MonthlyEvaluationsModule } from './monthly-evaluations/monthly-evaluations.module';
import { ManagerReviewsModule } from './manager-reviews/manager-reviews.module';
import { SelfReviewsModule } from './self-reviews/self-reviews.module';
import { AppraisalCyclesModule } from './appraisal-cycles/appraisal-cycles.module';
import { PromotionRecommendationsModule } from './promotion-recommendations/promotion-recommendations.module';
import { PfRegisterModule } from './pf-register/pf-register.module';
import { EsicRegisterModule } from './esic-register/esic-register.module';
import { WageComplianceModule } from './wage-compliance/wage-compliance.module';
import { AttendancePayrollMatchModule } from './attendance-payroll-match/attendance-payroll-match.module';
import { ContractLabourReportsModule } from './contract-labour-reports/contract-labour-reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    CompanyModule,
    LocationsModule,
    DepartmentsModule,
    DesignationsModule,
    ShiftsModule,
    LeavePoliciesModule,
    LeaveApplicationsModule,
    LeaveBalancesModule,
    LeaveEncashmentsModule,
    HolidaysModule,
    RolesModule,
    UserRoleAssignmentsModule,
    AssetCategoriesModule,
    ProjectCategoriesModule,
    SalaryTemplatesModule,
    ManagerAssignmentsModule,
    EmployeeAssignmentsModule,
    BudgetItemsModule,
    ShiftAssignmentsModule,
    ProjectDocumentsModule,
    DailyLogsModule,
    EmployeeMastersModule,
    KYCVerificationsModule,
    EmployeeDocumentsModule,
    EmploymentHistoryModule,
    IDCardTemplatesModule,
    GeneratedIDCardsModule,
    UniformItemsModule,
    UniformAllocationsModule,
    AssetItemsModule,
    EmployeeAssetsModule,
    FaceEnrollmentsModule,
    CameraDevicesModule,
    FingerprintDevicesModule,
    FingerprintEnrollmentsModule,
    FingerprintLogsModule,
    FingerprintValidationAlertsModule,
    FaceRecognitionLogsModule,
    AntiSpoofingAlertsModule,
    AttendanceLogsModule,
    DailyAttendanceModule,
    CheckInOutLogsModule,
    OvertimeRecordsModule,
    AttendanceRegularizationsModule,
    ProjectHoursModule,
    NightShiftAllowancesModule,
    LeaveDeductionsModule,
    NotificationTemplatesModule,
    SMSAlertsModule,
    WhatsAppNotificationsModule,
    EmailAlertsModule,
    PushNotificationsModule,
    GeofenceAreasModule,
    GeofenceProjectAssignmentsModule,
    GPSPunchesModule,
    GPSRouteLogsModule,
    LocationDeviationAlertsModule,
    HRTicketsModule,
    JobOpeningsModule,
    CandidateApplicationsModule,
    InterviewsModule,
    OfferLettersModule,
    CandidateOnboardingsModule,
    KpisModule,
    KpiAssignmentsModule,
    MonthlyEvaluationsModule,
    ManagerReviewsModule,
    SelfReviewsModule,
    AppraisalCyclesModule,
    PromotionRecommendationsModule,
    PfRegisterModule,
    EsicRegisterModule,
    WageComplianceModule,
    AttendancePayrollMatchModule,
    ContractLabourReportsModule,
  ],
})
export class AppModule {}

