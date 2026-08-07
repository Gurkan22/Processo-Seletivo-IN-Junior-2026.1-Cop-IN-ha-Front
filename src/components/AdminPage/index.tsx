import type { ReactNode } from 'react';
import './adminPage.css';

interface AdminPageProps {
  title: string;
  children: ReactNode;
}

export function AdminPage({ title, children }: AdminPageProps) {
  return (
    <div className="admin-page">
      <header className="admin-page-topbar">
        <h1>{title}</h1>
      </header>
      <div className="admin-page-content">{children}</div>
    </div>
  );
}
