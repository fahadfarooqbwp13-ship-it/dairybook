// Stand-in "photo": species emoji on a soft tinted circle, with the tag number.
// In v0.1 we don't store real images yet; this keeps the herd recognisable.
export default function AnimalAvatar({ animal, size = 56, showTag = true }) {
  const px = size
  return (
    <div className="relative shrink-0" style={{ width: px, height: px }}>
      <div
        className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
        style={{ background: animal.tint }}
      >
        {animal.photo ? (
          <img src={animal.photo} alt="" className="w-full h-full object-cover" />
        ) : (
          <span style={{ fontSize: px * 0.5 }}>{animal.emoji}</span>
        )}
      </div>
      {showTag && (
        <span className="num absolute -bottom-1 -end-1 bg-primary text-white text-xs font-bold rounded-full px-1.5 py-0.5 shadow">
          {animal.tag}
        </span>
      )}
    </div>
  )
}
