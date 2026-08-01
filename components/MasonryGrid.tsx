export default function MasonryGrid({ children }: { children: React.ReactNode }) {
  return <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4">{children}</div>;
}
