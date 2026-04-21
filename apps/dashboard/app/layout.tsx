import './global.css';

import { AppLayout } from '@repo/ui';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <AppLayout>
          {children}
        </AppLayout>
      </body>
    </html>
  );
}