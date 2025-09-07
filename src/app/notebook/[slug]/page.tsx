export default async function NotebookPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	return <div>My Notebook: {slug}</div>;
}
