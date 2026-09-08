import mongoose from 'mongoose';
import { Employee } from './employee.model.js';

export const employeeService = {
  async findAll({ department, status, role, search } = {}) {
    const query = {};
    if (department) query.department = department;
    if (status) query.status = status;
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    return Employee.find(query)
      .populate('reportingManagerId', 'name email designation employeeId')
      .sort({ name: 1 });
  },

  async findById(id) {
    let emp = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      emp = await Employee.findById(id).populate('reportingManagerId', 'name email designation employeeId');
    }
    if (!emp) {
      emp = await Employee.findOne({
        $or: [{ employeeId: id.toString().toUpperCase() }, { employeeId: id.toString() }],
      }).populate('reportingManagerId', 'name email designation employeeId');
    }
    if (!emp) {
      const error = new Error(`Employee with ID '${id}' not found.`);
      error.status = 404;
      throw error;
    }
    return emp;
  },

  async findByEmployeeId(empId) {
    return Employee.findOne({ employeeId: empId.toUpperCase() }).populate('reportingManagerId', 'name email designation employeeId');
  },

  async getReportingManager(employeeId) {
    const emp = await this.findById(employeeId);
    if (!emp.reportingManagerId) return null;
    return Employee.findById(emp.reportingManagerId);
  },

  async create(data) {
    const created = new Employee(data);
    return created.save();
  },

  async updateStatus(id, status) {
    const emp = await this.findById(id);
    emp.status = status;
    return emp.save();
  },
};
