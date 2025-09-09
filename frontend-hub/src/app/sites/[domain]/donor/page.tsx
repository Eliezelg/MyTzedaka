import { DonorPortal } from '@/components/sites/donor/DonorPortal';
import { AuthProvider } from '@/providers/auth-provider';

export default function DonorPage() {
  return (
    <AuthProvider>
      <DonorPortal />
    </AuthProvider>
  );
}