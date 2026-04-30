import Link from "next/link";

interface BeaconLogoProps {
  href?: string;
  size?: "sm" | "md" | "lg";
}

export function BeaconLogo({ href = "/", size = "md" }: BeaconLogoProps) {
  const sizes = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  };

  const logo = (
    <span className={`font-bold tracking-tight text-slate-900 ${sizes[size]}`}>
      <span className="text-blue-600">⬡</span> Beacon
    </span>
  );

  if (href) {
    return <Link href={href}>{logo}</Link>;
  }
  return logo;
}
