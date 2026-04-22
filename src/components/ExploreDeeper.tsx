import Link from 'next/link';

interface Props {
  href:  string;
  label: string;
}

export default function ExploreDeeper({ href, label }: Props) {
  return (
    <Link href={href}
      className="flex items-center gap-1.5 text-[0.76rem] text-sage-dark font-medium no-underline mt-2 group">
      <span className="group-hover:underline">{label}</span>
      <span className="transition-transform group-hover:translate-x-0.5">→</span>
    </Link>
  );
}
