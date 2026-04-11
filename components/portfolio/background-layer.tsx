export function BackgroundLayer() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat opacity-36"
        style={{ backgroundImage: "url('/bg.jpg')" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(244,74,34,0.18),transparent_24%),radial-gradient(circle_at_82%_14%,rgba(255,145,77,0.18),transparent_22%),linear-gradient(180deg,rgba(8,8,8,0.44),rgba(11,11,11,0.88)),rgba(11,11,11,0.38)] backdrop-blur-[10px]"
      />
    </>
  );
}
