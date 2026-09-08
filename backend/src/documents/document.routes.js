import { Router } from 'express';
import { documentService } from './document.service.js';

const router = Router();

router.get('/:offboardingId/resignation-acceptance', async (req, res, next) => {
  try {
    const pdfBuffer = await documentService.generateResignationAcceptance(req.params.offboardingId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="Resignation_Acceptance_${req.params.offboardingId}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  } catch (err) {
    next(err);
  }
});

router.get('/:offboardingId/noc-certificate', async (req, res, next) => {
  try {
    const pdfBuffer = await documentService.generateNocCertificate(req.params.offboardingId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="NOC_Clearance_${req.params.offboardingId}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  } catch (err) {
    next(err);
  }
});

router.get('/:offboardingId/relieving-letter', async (req, res, next) => {
  try {
    const pdfBuffer = await documentService.generateRelievingLetter(req.params.offboardingId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="Relieving_Letter_${req.params.offboardingId}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  } catch (err) {
    next(err);
  }
});

export default router;
