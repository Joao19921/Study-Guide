import StudyModule from "@/components/StudyModule";

export default async function ModulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <StudyModule path={`/${slug}`} />;
}
