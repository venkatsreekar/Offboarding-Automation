import mongoose from 'mongoose';

const EmployeeSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    department: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    joiningDate: { type: Date, required: true },
    reportingManagerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    role: {
      type: String,
      enum: ['EMPLOYEE', 'REPORTING_MANAGER', 'ADMIN_SYSTEMS', 'ACCOUNTS', 'PERSONNEL', 'HR_ADMIN', 'SUPER_ADMIN'],
      default: 'EMPLOYEE',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'IN_OFFBOARDING', 'OFFBOARDED'],
      default: 'ACTIVE',
    },
    phone: { type: String, trim: true },
    avatarUrl: { type: String, trim: true },
  },
  { timestamps: true, collection: 'employees' }
);

export const Employee = mongoose.model('Employee', EmployeeSchema);
