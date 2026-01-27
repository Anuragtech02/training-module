import MainLayout from 'src/layouts/main';
import RenewalView from 'src/sections/_elearning/view/elearning-renewal-view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Certificate Renewal',
};

export default function RenewalPage() {
  return (
    <MainLayout>
      <RenewalView />
    </MainLayout>
  );
}
