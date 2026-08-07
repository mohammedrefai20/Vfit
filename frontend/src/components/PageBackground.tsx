export default function PageBackground({ image }: { image: string }) {
  return (
    <div className="fixed inset-0 overflow-hidden" style={{ zIndex: -1 }}>
      <img src={image} alt="" className="w-full h-full object-cover opacity-[0.08]" />
      <div className="absolute inset-0 bg-bg/92" />
    </div>
  );
}