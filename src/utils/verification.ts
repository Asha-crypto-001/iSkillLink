import { Verification } from '../types';

export type VerificationStepKey = 'national_id' | 'background_check' | 'interview' | 'skill_assessment';

export interface VerificationStep {
  key: VerificationStepKey;
  field: keyof Pick<Verification, 'national_id_status' | 'background_check_status' | 'interview_status' | 'skill_assessment_status'>;
  /** Status value that counts as passed (the interview is "completed", the rest "verified"). */
  passedStatus: 'verified' | 'completed';
  label: string;
  adminDetail: string;
  adminAction: string;
  /** What the applicant should expect while this check is open. */
  applicantDetail: string;
}

// The four checks every educator passes before going live. The server activates the
// educator automatically once all four have passed (see PATCH /api/admin/verification-step).
export const VERIFICATION_STEPS: VerificationStep[] = [
  {
    key: 'national_id', field: 'national_id_status', passedStatus: 'verified',
    label: 'National ID', adminDetail: 'NIN checked against the ID card', adminAction: 'Mark ID verified',
    applicantDetail: 'We match your NIN to your national ID card.'
  },
  {
    key: 'background_check', field: 'background_check_status', passedStatus: 'verified',
    label: 'Background check', adminDetail: 'LC1 letter and police clearance', adminAction: 'Mark cleared',
    applicantDetail: 'Bring an LC1 letter and police clearance to your interview.'
  },
  {
    key: 'interview', field: 'interview_status', passedStatus: 'completed',
    label: 'Interview', adminDetail: 'Phone or in-person conversation', adminAction: 'Mark interview done',
    applicantDetail: 'We call you on WhatsApp to arrange a short conversation.'
  },
  {
    key: 'skill_assessment', field: 'skill_assessment_status', passedStatus: 'verified',
    label: 'Workshop visit', adminDetail: 'See the bench, tools and finished work', adminAction: 'Mark workshop approved',
    applicantDetail: 'We visit your workshop to see your tools and finished work.'
  }
];

export function isStepPassed(verification: Verification | undefined, step: VerificationStep): boolean {
  return verification?.[step.field] === step.passedStatus;
}

export function verificationProgress(verification: Verification | undefined) {
  const passed = VERIFICATION_STEPS.filter(step => isStepPassed(verification, step)).length;
  return { passed, total: VERIFICATION_STEPS.length };
}

/** Placeholder values stored before an applicant has provided their NIN. */
export function hasSubmittedNationalId(verification: Verification | undefined): boolean {
  const nin = verification?.national_id_number || '';
  return nin !== '' && !/^CM-(PENDING|APP-PENDING|NOT)/.test(nin);
}
