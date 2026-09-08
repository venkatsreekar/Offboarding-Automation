import mongoose from 'mongoose';

const ReportingManagerClearanceSchema = new mongoose.Schema(
  {
    projectCompleted: { type: Boolean, default: false },
    knowledgeTransferDone: { type: Boolean, default: false },
    clientAccessRemoved: { type: Boolean, default: false },
    cleared: { type: Boolean, default: false },
    clearedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    clearedByName: { type: String },
    clearedAt: { type: Date },
    remarks: { type: String },
  },
  { _id: false }
);

const AdminSystemsClearanceSchema = new mongoose.Schema(
  {
    laptopReturned: { type: Boolean, default: false },
    chargerReturned: { type: Boolean, default: false },
    phoneReturned: { type: Boolean, default: false },
    dataCardReturned: { type: Boolean, default: false },
    keysReturned: { type: Boolean, default: false },
    emailDeactivated: { type: Boolean, default: false },
    systemAccessRevoked: { type: Boolean, default: false },
    accessRevocationTimestamp: { type: Date },
    accessRevokedBy: { type: String },
    technicalNotes: { type: String },
    cleared: { type: Boolean, default: false },
    clearedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    clearedByName: { type: String },
    clearedAt: { type: Date },
    remarks: { type: String },
  },
  { _id: false }
);

const AccountsClearanceSchema = new mongoose.Schema(
  {
    travelAdvancesCleared: { type: Boolean, default: false },
    travelAdvanceAmount: { type: Number, default: 0 },
    staffLoansCleared: { type: Boolean, default: false },
    staffLoanAmount: { type: Number, default: 0 },
    salaryAdvancesCleared: { type: Boolean, default: false },
    salaryAdvanceAmount: { type: Number, default: 0 },
    imprestSettled: { type: Boolean, default: false },
    imprestAmount: { type: Number, default: 0 },
    cleared: { type: Boolean, default: false },
    clearedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    clearedByName: { type: String },
    clearedAt: { type: Date },
    remarks: { type: String },
  },
  { _id: false }
);

const PersonnelClearanceSchema = new mongoose.Schema(
  {
    idCardReturned: { type: Boolean, default: false },
    accessCardReturned: { type: Boolean, default: false },
    businessCardsSurrendered: { type: Boolean, default: false },
    cleared: { type: Boolean, default: false },
    clearedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    clearedByName: { type: String },
    clearedAt: { type: Date },
    remarks: { type: String },
  },
  { _id: false }
);

const HRClearanceSchema = new mongoose.Schema(
  {
    exitInterviewCompleted: { type: Boolean, default: false },
    resignationAcceptanceSigned: { type: Boolean, default: false },
    finalSettlementApproved: { type: Boolean, default: false },
    cleared: { type: Boolean, default: false },
    clearedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    clearedByName: { type: String },
    clearedAt: { type: Date },
    remarks: { type: String },
  },
  { _id: false }
);

const GeneratedDocumentSchema = new mongoose.Schema(
  {
    docType: { type: String, required: true },
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    generatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const OffboardingReminderSchema = new mongoose.Schema(
  {
    stageKey: { type: String, required: true },
    sentBy: { type: String, required: true },
    sentByName: { type: String },
    note: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const OffboardingRequestSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    resignationDate: { type: Date, required: true },
    lastWorkingDay: { type: Date, required: true },
    reason: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
    initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    status: {
      type: String,
      enum: ['INITIATED', 'IN_PROGRESS', 'CLEARED', 'REJECTED', 'WITHDRAWN'],
      default: 'INITIATED',
    },
    workflowInstanceId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkflowInstance' },
    reportingManagerClearance: { type: ReportingManagerClearanceSchema, default: () => ({}) },
    adminSystemsClearance: { type: AdminSystemsClearanceSchema, default: () => ({}) },
    accountsClearance: { type: AccountsClearanceSchema, default: () => ({}) },
    personnelClearance: { type: PersonnelClearanceSchema, default: () => ({}) },
    hrClearance: { type: HRClearanceSchema, default: () => ({}) },
    generatedDocuments: [GeneratedDocumentSchema],
    reminders: [OffboardingReminderSchema],
  },
  { timestamps: true, collection: 'offboarding_requests' }
);

export const OffboardingRequest = mongoose.model('OffboardingRequest', OffboardingRequestSchema);
