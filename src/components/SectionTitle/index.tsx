import { ChevronRight } from 'lucide-react';
import './sectionTitle.css';

interface SectionTitleProps {
  children: string;
}

export function SectionTitle({ children }: SectionTitleProps) {
  return (
    <div className="section-title">
      <h2>{children}</h2>
      <span className="section-title-line" aria-hidden />
      <ChevronRight size={20} className="section-title-arrow" aria-hidden />
    </div>
  );
}
