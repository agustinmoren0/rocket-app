'use client'

interface DesktopGridProps {
  children: React.ReactNode;
  cols?: 2 | 3 | 4;
}

export default function DesktopGrid({ children, cols = 2 }: DesktopGridProps) {
  const colsClass = {
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
  }[cols];

  return (
    <div className={`grid grid-cols-1 ${colsClass} gap-6`}>
      {children}
    </div>
  );
}
