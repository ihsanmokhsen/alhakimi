export function BackgroundLayer() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-20 scale-105 bg-cover bg-center bg-no-repeat opacity-34 blur-xl"
        style={{ backgroundImage: "url('/wpp.jpg')" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(244,74,34,0.12),transparent_24%),radial-gradient(circle_at_82%_14%,rgba(255,145,77,0.1),transparent_22%),linear-gradient(180deg,rgba(8,8,8,0.52),rgba(11,11,11,0.9)),rgba(11,11,11,0.42)]"
      />
    </>
  );
}
