import type { UserProfile } from './user';

export interface OnboardingStepProps {
  draft: UserProfile;
  update: (patch: Partial<UserProfile>) => void;
}