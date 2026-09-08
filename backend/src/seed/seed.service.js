import { Employee } from '../employee/employee.model.js';
import { OffboardingRequest } from '../offboarding/offboardingRequest.model.js';
import { offboardingService } from '../offboarding/offboarding.service.js';

export const seedService = {
  async seedDemoData() {
    console.log('🌱 Clearing existing demo data for clean state...');
    await Employee.deleteMany({});
    await OffboardingRequest.deleteMany({});

    // 1. Create Admins & Managers
    const hr = await Employee.create({
      employeeId: 'EMP-HR-01',
      name: 'Sarah Jenkins',
      email: 'sarah.hr@blazeup.test',
      department: 'Human Resources',
      designation: 'VP of Human Resources',
      joiningDate: new Date('2019-04-01'),
      role: 'HR_ADMIN',
      status: 'ACTIVE',
      phone: '+1 (555) 019-2834',
    });

    const manager = await Employee.create({
      employeeId: 'EMP-MGR-01',
      name: 'Marcus Vance',
      email: 'marcus.vance@blazeup.test',
      department: 'Engineering',
      designation: 'Director of Engineering',
      joiningDate: new Date('2020-01-15'),
      role: 'REPORTING_MANAGER',
      status: 'ACTIVE',
      phone: '+1 (555) 018-9921',
    });

    const adminSystems = await Employee.create({
      employeeId: 'EMP-IT-01',
      name: 'Alex Rivera',
      email: 'alex.it@blazeup.test',
      department: 'Admin & Systems',
      designation: 'IT Systems Infrastructure Lead',
      joiningDate: new Date('2020-06-10'),
      role: 'ADMIN_SYSTEMS',
      status: 'ACTIVE',
      phone: '+1 (555) 017-4829',
    });

    const accounts = await Employee.create({
      employeeId: 'EMP-ACC-01',
      name: 'Priya Sharma',
      email: 'priya.finance@blazeup.test',
      department: 'Accounts & Finance',
      designation: 'Head of Financial Operations',
      joiningDate: new Date('2021-02-20'),
      role: 'ACCOUNTS',
      status: 'ACTIVE',
      phone: '+1 (555) 016-3392',
    });

    const personnel = await Employee.create({
      employeeId: 'EMP-FAC-01',
      name: 'David Chen',
      email: 'david.facilities@blazeup.test',
      department: 'Personnel & Facilities',
      designation: 'Facilities & Asset Manager',
      joiningDate: new Date('2021-08-01'),
      role: 'PERSONNEL',
      status: 'ACTIVE',
      phone: '+1 (555) 015-7744',
    });

    // 2. Regular Employees
    const devon = await Employee.create({
      employeeId: 'EMP-1042',
      name: 'Devon Miller',
      email: 'devon.miller@blazeup.test',
      department: 'Engineering',
      designation: 'Staff Cloud Architect',
      joiningDate: new Date('2022-03-15'),
      reportingManagerId: manager._id,
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      phone: '+1 (555) 012-3456',
    });

    const rachel = await Employee.create({
      employeeId: 'EMP-1043',
      name: 'Rachel Green',
      email: 'rachel.green@blazeup.test',
      department: 'Design & UX',
      designation: 'Lead Product Designer',
      joiningDate: new Date('2022-07-01'),
      reportingManagerId: manager._id,
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      phone: '+1 (555) 013-9876',
    });

    const elena = await Employee.create({
      employeeId: 'EMP-1044',
      name: 'Elena Rostova',
      email: 'elena.rostova@blazeup.test',
      department: 'Engineering',
      designation: 'Senior Backend Engineer',
      joiningDate: new Date('2021-11-10'),
      reportingManagerId: manager._id,
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      phone: '+1 (555) 014-5566',
    });

    const rahul = await Employee.create({
      employeeId: 'EMP-1045',
      name: 'Rahul Kumar',
      email: 'rahul.kumar@blazeup.test',
      department: 'Engineering',
      designation: 'Senior Full-Stack Engineer',
      joiningDate: new Date('2022-01-10'),
      reportingManagerId: manager._id,
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      phone: '+1 (555) 019-3321',
    });

    // Ensure workflow definition exists
    await offboardingService.ensureWorkflowDefinitionExists();

    // =========================================================================
    // CASE 1: Devon Miller — Freshly Initiated (Pending Manager Clearance Step 1)
    // =========================================================================
    await offboardingService.initiateOffboarding({
      employeeId: devon._id.toString(),
      resignationDate: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
      lastWorkingDay: new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0],
      reason: 'Pursuing higher studies in Computer Science',
      notes: 'Requested early release if KT completed early.',
      initiatedById: hr._id.toString(),
    });

    // =========================================================================
    // CASE 2: Rachel Green — In Parallel Clearances (Step 2: Admin, Accounts, Personnel)
    // =========================================================================
    const rachelCase = await offboardingService.initiateOffboarding({
      employeeId: rachel._id.toString(),
      resignationDate: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
      lastWorkingDay: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      reason: 'Accepted offer as Design Principal at another firm',
      notes: 'URGENT: Notice period ends in 48 hours.',
      initiatedById: hr._id.toString(),
    });

    // Advance Step 1 (Manager Clears)
    await offboardingService.submitDepartmentClearance(rachelCase._id.toString(), 'REPORTING_MANAGER_CLEARANCE', {
      decision: 'APPROVE',
      remarks: 'Design Figma files, design system tokens, and client assets successfully transferred.',
      actorUserId: manager._id.toString(),
      actorRole: 'REPORTING_MANAGER',
      actorName: manager.name,
      checklistData: { projectCompleted: true, knowledgeTransferDone: true, clientAccessRemoved: true },
    });

    // Accounts clears ahead of others in parallel
    await offboardingService.submitDepartmentClearance(rachelCase._id.toString(), 'ACCOUNTS_CLEARANCE', {
      decision: 'APPROVE',
      remarks: 'Travel advances cleared and no outstanding loans. Full final settlement approved.',
      actorUserId: accounts._id.toString(),
      actorRole: 'ACCOUNTS',
      actorName: accounts.name,
      checklistData: {
        travelAdvancesCleared: true,
        travelAdvanceAmount: 0,
        staffLoansCleared: true,
        staffLoanAmount: 0,
        salaryAdvancesCleared: true,
        salaryAdvanceAmount: 0,
        imprestSettled: true,
        imprestAmount: 0,
      },
    });

    // =========================================================================
    // CASE 3: Elena Rostova — Fully Completed & Cleared (All PDFs generated)
    // =========================================================================
    const elenaCase = await offboardingService.initiateOffboarding({
      employeeId: elena._id.toString(),
      resignationDate: new Date(Date.now() - 35 * 86400000).toISOString().split('T')[0],
      lastWorkingDay: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
      reason: 'Relocating to London for family reasons',
      notes: 'Full tenure served with excellence.',
      initiatedById: hr._id.toString(),
    });

    const elenaId = elenaCase._id.toString();

    // Step 1: Manager
    await offboardingService.submitDepartmentClearance(elenaId, 'REPORTING_MANAGER_CLEARANCE', {
      decision: 'APPROVE',
      remarks: 'All backend microservices and architecture blueprints handed over to team.',
      actorUserId: manager._id.toString(),
      actorRole: 'REPORTING_MANAGER',
      actorName: manager.name,
      checklistData: { projectCompleted: true, knowledgeTransferDone: true, clientAccessRemoved: true },
    });

    // Step 2: Admin & Systems
    await offboardingService.submitDepartmentClearance(elenaId, 'ADMIN_SYSTEMS_CLEARANCE', {
      decision: 'APPROVE',
      remarks: 'MacBook Pro M2, charger, access tokens, and security keys returned.',
      actorUserId: adminSystems._id.toString(),
      actorRole: 'ADMIN_SYSTEMS',
      actorName: adminSystems.name,
      checklistData: {
        laptopReturned: true,
        chargerReturned: true,
        phoneReturned: true,
        dataCardReturned: true,
        keysReturned: true,
        emailDeactivated: true,
        systemAccessRevoked: true,
      },
    });

    // Step 2: Accounts
    await offboardingService.submitDepartmentClearance(elenaId, 'ACCOUNTS_CLEARANCE', {
      decision: 'APPROVE',
      remarks: 'Nil balances across all ledgers. No advances or equipment charges.',
      actorUserId: accounts._id.toString(),
      actorRole: 'ACCOUNTS',
      actorName: accounts.name,
      checklistData: {
        travelAdvancesCleared: true,
        travelAdvanceAmount: 0,
        staffLoansCleared: true,
        staffLoanAmount: 0,
        salaryAdvancesCleared: true,
        salaryAdvanceAmount: 0,
        imprestSettled: true,
        imprestAmount: 0,
      },
    });

    // Step 2: Personnel
    await offboardingService.submitDepartmentClearance(elenaId, 'PERSONNEL_CLEARANCE', {
      decision: 'APPROVE',
      remarks: 'Physical badge surrendered and gym locker keys returned.',
      actorUserId: personnel._id.toString(),
      actorRole: 'PERSONNEL',
      actorName: personnel.name,
      checklistData: { idCardReturned: true, accessCardReturned: true, businessCardsSurrendered: true },
    });

    // Step 3: HR Final Clearance
    await offboardingService.submitDepartmentClearance(elenaId, 'HR_FINAL_CLEARANCE', {
      decision: 'APPROVE',
      remarks: 'Comprehensive exit interview completed. Experience & Relieving letter verified.',
      actorUserId: hr._id.toString(),
      actorRole: 'HR_ADMIN',
      actorName: hr.name,
      checklistData: { exitInterviewCompleted: true, resignationAcceptanceSigned: true, finalSettlementApproved: true },
    });

    console.log('✅ Demo seed complete in pure JavaScript! 8 employees & 3 live offboarding cases.');
    return { success: true, message: 'Demo data seeded successfully.' };
  },
};
