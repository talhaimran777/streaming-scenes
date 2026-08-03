import { notFound } from "next/navigation";
import { isSceneId } from "@/lib/scenes";
import { SceneView } from "@/components/SceneView";

export default async function ScenePage({
  params,
  searchParams,
}: {
  params: Promise<{ scene: string }>;
  searchParams: Promise<{ o?: string }>;
}) {
  const { scene } = await params;
  const { o } = await searchParams;
  if (!isSceneId(scene)) notFound();

  return <SceneView scene={scene} forceOrientation={o ?? null} />;
}
