import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("common");
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <span className="font-mono text-8xl font-bold text-accent-blue/30">
        404
      </span>
      <h1 className="font-heading font-bold text-3xl text-text-primary">
        Page Not Found
      </h1>
      <Link href="/" className="text-accent-blue hover:underline">
        {t("backToHome")}
      </Link>
    </div>
  );
}
