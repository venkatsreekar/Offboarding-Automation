import PDFDocument from 'pdfkit';
import { OffboardingRequest } from '../offboarding/offboardingRequest.model.js';
import { eventBus } from '../events/eventBus.js';

export const documentService = {
  async getPopulatedOffboarding(id) {
    const offboarding = await OffboardingRequest.findById(id).populate('employeeId').populate('initiatedBy');
    if (!offboarding) {
      const error = new Error(`Offboarding request '${id}' not found.`);
      error.status = 404;
      throw error;
    }
    return offboarding;
  },

  drawCorporateHeader(doc, title) {
    doc.rect(0, 0, 612, 10).fill('#2563eb');
    doc.y = 35;
    doc.font('Helvetica-Bold').fontSize(18).fillColor('#1e40af').text('TERRALOGIC', { align: 'left' });
    doc.font('Helvetica').fontSize(9).fillColor('#64748b').text('BlazeUp Human Resource Operating System (HROS)', { align: 'left' });
    doc.moveDown(0.5);

    doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor('#e2e8f0').stroke();
    doc.moveDown(1);

    doc.font('Helvetica-Bold').fontSize(13).fillColor('#0f172a').text(title, { align: 'center' });
    doc.moveDown(1);
  },

  /**
   * Generates official Resignation Acceptance Letter with Non-Compete & Non-Solicitation clauses.
   */
  async generateResignationAcceptance(offboardingId) {
    const offboarding = await this.getPopulatedOffboarding(offboardingId);
    const emp = offboarding.employeeId;

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      this.drawCorporateHeader(doc, 'RESIGNATION ACCEPTANCE & EXIT COVENANT');

      doc.fontSize(10).fillColor('#475569');
      doc.text(`Reference No: BLZ-HR-ACC-${offboarding._id.toString().slice(-6).toUpperCase()}`);
      doc.text(`Date of Issuance: ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}`);
      doc.moveDown(1.5);

      doc.fontSize(11).fillColor('#0f172a').font('Helvetica-Bold');
      doc.text(`To,`);
      doc.text(`${emp.name} (Emp ID: ${emp.employeeId})`);
      doc.font('Helvetica').fontSize(10).fillColor('#334155');
      doc.text(`Designation: ${emp.designation}`);
      doc.text(`Department: ${emp.department}`);
      doc.text(`Email: ${emp.email}`);
      doc.moveDown(1.5);

      doc.font('Helvetica-Bold').fontSize(11).fillColor('#0f172a');
      doc.text(`Subject: Formal Acceptance of Resignation and Notice Period Details`, { underline: true });
      doc.moveDown(1);

      doc.font('Helvetica').fontSize(10.5).fillColor('#1e293b').lineGap(4);
      doc.text(
        `Dear ${emp.name},\n\nWe refer to your resignation letter tendered on ${new Date(
          offboarding.resignationDate
        ).toLocaleDateString('en-US', {
          dateStyle: 'medium',
        })}. We hereby formally accept your resignation from your position as ${emp.designation} at Terralogic Technologies / BlazeUp HROS.`
      );
      doc.moveDown(0.8);

      doc.text(
        `As agreed upon, your Last Working Day (LWD) with the organization shall be ${new Date(
          offboarding.lastWorkingDay
        ).toLocaleDateString('en-US', {
          dateStyle: 'long',
        })}. During this period, you are required to ensure a smooth, complete knowledge transfer and fulfill departmental clearance obligations.`
      );
      doc.moveDown(1.5);

      doc.font('Helvetica-Bold').fontSize(11).fillColor('#0f172a');
      doc.text('POST-EMPLOYMENT OBLIGATIONS & RESTRICTIVE COVENANTS');
      doc.moveDown(0.5);

      doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#b91c1c').text('1. Non-Compete Clause:');
      doc.font('Helvetica').fontSize(9).fillColor('#334155').text(
        `For a period of twelve (12) months following your Last Working Day, you covenant and agree that you shall not directly or indirectly engage, consult, or provide services to any competitor entity operating in the direct domain of Terralogic proprietary technology or clients without prior written consent.`
      );
      doc.moveDown(0.8);

      doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#b91c1c').text('2. Non-Solicitation Clause:');
      doc.font('Helvetica').fontSize(9).fillColor('#334155').text(
        `You agree that for a period of twelve (12) months following separation, you shall not, directly or indirectly, induce, recruit, or solicit any current employee, consultant, or client of the company to terminate their relationship with Terralogic.`
      );
      doc.moveDown(0.8);

      doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#334155').text('3. Confidentiality & IP Rights:');
      doc.font('Helvetica').fontSize(9).text(
        `All intellectual property, source code, client records, and proprietary assets must be surrendered prior to clearance. Obligations of non-disclosure survive in perpetuity.`
      );
      doc.moveDown(2);

      doc.font('Helvetica').fontSize(10).fillColor('#0f172a');
      doc.text(`Sincerely,\n\n`);
      doc.font('Helvetica-Bold').text(`Human Resources Directorate`);
      doc.font('Helvetica').fontSize(9).fillColor('#64748b').text(`BlazeUp HROS - Terralogic Technologies Inc.`);

      doc.end();
    });
  },

  /**
   * Generates official No Objection Certificate (NOC) with consolidated departmental sign-offs.
   */
  async generateNocCertificate(offboardingId) {
    const offboarding = await this.getPopulatedOffboarding(offboardingId);
    const emp = offboarding.employeeId;

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      this.drawCorporateHeader(doc, 'NO OBJECTION CERTIFICATE (NOC) & CLEARANCE RECORD');

      doc.fontSize(9.5).fillColor('#475569');
      doc.text(`Certificate No: NOC-${offboarding._id.toString().slice(-8).toUpperCase()}`);
      doc.text(`Clearance Timestamp: ${new Date().toLocaleString('en-US')}`);
      doc.moveDown(1);

      doc.rect(40, doc.y, 515, 60).fillAndStroke('#f1f5f9', '#cbd5e1');
      const boxY = doc.y + 10;
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#0f172a');
      doc.text(`Employee Name: ${emp.name}`, 55, boxY);
      doc.text(`Designation: ${emp.designation}`, 320, boxY);
      doc.font('Helvetica').fontSize(9.5).fillColor('#334155');
      doc.text(`Employee ID: ${emp.employeeId}`, 55, boxY + 18);
      doc.text(`Department: ${emp.department}`, 320, boxY + 18);
      doc.text(`Last Working Day: ${new Date(offboarding.lastWorkingDay).toLocaleDateString()}`, 55, boxY + 34);
      doc.text(`Status: FULLY CLEARED`, 320, boxY + 34);

      doc.y = boxY + 55;
      doc.moveDown(1);

      doc.font('Helvetica-Bold').fontSize(11).fillColor('#0f172a');
      doc.text('DEPARTMENTAL CLEARANCE VERIFICATION RECORD:');
      doc.moveDown(0.5);

      const depts = [
        {
          name: '1. Project / Reporting Manager Clearance',
          cleared: offboarding.reportingManagerClearance?.cleared,
          by: offboarding.reportingManagerClearance?.clearedByName || 'Assigned Manager',
          date: offboarding.reportingManagerClearance?.clearedAt,
          items: 'Knowledge Transfer (KT) Completed, Repositories Handed Over, Client Access Removed',
          remarks: offboarding.reportingManagerClearance?.remarks,
        },
        {
          name: '2. Admin & Systems Clearance',
          cleared: offboarding.adminSystemsClearance?.cleared,
          by: offboarding.adminSystemsClearance?.clearedByName || 'Admin Systems Team',
          date: offboarding.adminSystemsClearance?.clearedAt,
          items: 'Laptop, Charger, Phone, Data Card, Keys Returned. Email & VPN Deactivated',
          remarks: offboarding.adminSystemsClearance?.remarks,
        },
        {
          name: '3. Accounts & Finance Clearance',
          cleared: offboarding.accountsClearance?.cleared,
          by: offboarding.accountsClearance?.clearedByName || 'Finance Officer',
          date: offboarding.accountsClearance?.clearedAt,
          items: 'Travel Advances, Staff Loans, Salary Dues, and Imprest Balance Settled (INR 0.00 Due)',
          remarks: offboarding.accountsClearance?.remarks,
        },
        {
          name: '4. Personnel / Facilities Clearance',
          cleared: offboarding.personnelClearance?.cleared,
          by: offboarding.personnelClearance?.clearedByName || 'Personnel Officer',
          date: offboarding.personnelClearance?.clearedAt,
          items: 'Physical ID Card, Facility Swipe Badge, and Business Cards Surrendered',
          remarks: offboarding.personnelClearance?.remarks,
        },
        {
          name: '5. Human Resources Final Certification',
          cleared: offboarding.hrClearance?.cleared,
          by: offboarding.hrClearance?.clearedByName || 'HR Director',
          date: offboarding.hrClearance?.clearedAt,
          items: 'Exit Interview Completed, Resignation Form Signed, Final Clearance Certified',
          remarks: offboarding.hrClearance?.remarks,
        },
      ];

      for (const d of depts) {
        const itemY = doc.y;
        doc.rect(40, itemY, 515, 52).fillAndStroke(d.cleared ? '#f0fdf4' : '#fef2f2', d.cleared ? '#86efac' : '#fca5a5');
        doc.font('Helvetica-Bold').fontSize(10).fillColor(d.cleared ? '#15803d' : '#b91c1c');
        doc.text(`${d.name} — [${d.cleared ? 'APPROVED / CLEARED' : 'PENDING'}]`, 50, itemY + 8);

        doc.font('Helvetica').fontSize(8.5).fillColor('#334155');
        doc.text(`Verification: ${d.items}`, 50, itemY + 22, { width: 495 });
        doc.font('Helvetica-Oblique').fontSize(8).fillColor('#64748b');
        doc.text(
          `Cleared By: ${d.by} | Date: ${d.date ? new Date(d.date).toLocaleDateString() : 'N/A'} | Remarks: ${
            d.remarks || 'None'
          }`,
          50,
          itemY + 36
        );

        doc.y = itemY + 58;
      }

      doc.moveDown(1.5);
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#0f172a');
      doc.text('CERTIFICATION:');
      doc.font('Helvetica').fontSize(9).fillColor('#334155');
      doc.text(
        'This certifies that the employee named above has completed all required clearance formalities and holds NO OUTSTANDING DUES or assets across Terralogic Technologies departments.'
      );

      doc.end();
    });
  },

  /**
   * Generates official Experience & Relieving Certificate.
   */
  async generateRelievingLetter(offboardingId) {
    const offboarding = await this.getPopulatedOffboarding(offboardingId);
    const emp = offboarding.employeeId;

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      this.drawCorporateHeader(doc, 'EXPERIENCE & RELIEVING CERTIFICATE');

      doc.fontSize(10).fillColor('#475569');
      doc.text(`Certificate No: EXP-REL-${offboarding._id.toString().slice(-6).toUpperCase()}`);
      doc.text(`Date of Issue: ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}`);
      doc.moveDown(2);

      doc.font('Helvetica-Bold').fontSize(12).fillColor('#0f172a');
      doc.text(`TO WHOMSOEVER IT MAY CONCERN`, { align: 'center' });
      doc.moveDown(1.5);

      const joining = new Date(emp.joiningDate).toLocaleDateString('en-US', { dateStyle: 'long' });
      const lwd = new Date(offboarding.lastWorkingDay).toLocaleDateString('en-US', { dateStyle: 'long' });

      doc.font('Helvetica').fontSize(11).fillColor('#1e293b').lineGap(6);
      doc.text(
        `This is to certify that Mr./Ms. ${emp.name} (Employee Code: ${emp.employeeId}) was employed with Terralogic Technologies Inc. / BlazeUp HROS from ${joining} to ${lwd}.`
      );
      doc.moveDown(0.8);

      doc.text(
        `During the tenure of employment, ${emp.name} served as ${emp.designation} within the ${emp.department} Department.`
      );
      doc.moveDown(0.8);

      doc.text(
        `During their association with us, we found ${emp.name} to be diligent, dedicated, and professional in performing their duties. The employee has been relieved from all service responsibilities at the close of working hours on ${lwd} following the successful completion of the clearance and handover process.`
      );
      doc.moveDown(0.8);

      doc.text(`We thank ${emp.name} for their contributions and wish them every success in their future endeavors.`);
      doc.moveDown(3);

      doc.font('Helvetica-Bold').fontSize(11).fillColor('#0f172a');
      doc.text(`For Terralogic Technologies Inc.`);
      doc.moveDown(2);
      doc.text(`Authorized Signatory`);
      doc.font('Helvetica').fontSize(9.5).fillColor('#64748b');
      doc.text(`Global Head of Human Resources & People Operations`);

      doc.end();
    });
  },
};

// Event listeners for automatic document entry creation
eventBus.on('offboarding.initiated', async (event) => {
  try {
    const offboarding = await OffboardingRequest.findById(event.offboardingId);
    if (!offboarding) return;

    offboarding.generatedDocuments.push({
      docType: 'RESIGNATION_ACCEPTANCE',
      title: 'Resignation Acceptance Letter',
      fileUrl: `/api/v1/documents/${event.offboardingId}/resignation-acceptance`,
      generatedAt: new Date(),
    });

    await offboarding.save();
  } catch (err) {
    console.error('Failed to register resignation acceptance document:', err.message);
  }
});

eventBus.on('workflow.completed', async (event) => {
  try {
    if (event.targetEntityType === 'OFFBOARDING_REQUEST') {
      const offboarding = await OffboardingRequest.findById(event.targetEntityId);
      if (!offboarding) return;

      offboarding.generatedDocuments.push({
        docType: 'NOC_CERTIFICATE',
        title: 'No Objection Certificate (NOC)',
        fileUrl: `/api/v1/documents/${event.targetEntityId}/noc-certificate`,
        generatedAt: new Date(),
      });

      offboarding.generatedDocuments.push({
        docType: 'RELIEVING_LETTER',
        title: 'Experience & Relieving Certificate',
        fileUrl: `/api/v1/documents/${event.targetEntityId}/relieving-letter`,
        generatedAt: new Date(),
      });

      await offboarding.save();
    }
  } catch (err) {
    console.error('Failed to register NOC & Relieving documents:', err.message);
  }
});
