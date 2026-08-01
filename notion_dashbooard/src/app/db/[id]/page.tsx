import { DatabaseView } from "@/components/DatabaseView";

export default async function DatabasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DatabaseView databaseId={id} />;
}
