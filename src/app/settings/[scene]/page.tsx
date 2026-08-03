import { notFound } from "next/navigation";
import { isSceneId } from "@/lib/scenes";
import { SceneSettingsPage } from "@/components/admin/SceneSettingsPage";

export default async function Page({
  params,
}: {
  params: Promise<{ scene: string }>;
}) {
  const { scene } = await params;
  if (!isSceneId(scene)) notFound();
  return <SceneSettingsPage scene={scene} />;
}
