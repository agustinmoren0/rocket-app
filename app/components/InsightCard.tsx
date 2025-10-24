// components/InsightCard.tsx
'use client'

type Props = {
  icon: string;
  title: string;
  description: string;
};

export default function InsightCard({ icon, title, description }: Props) {
  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 flex items-start gap-4">
      <span className="text-3xl">{icon}</span>
      <div className="flex-1">
        <h3 className="font-semibold text-amber-900 mb-1">{title}</h3>
        <p className="text-sm text-amber-800">{description}</p>
      </div>
    </div>
  );
}
