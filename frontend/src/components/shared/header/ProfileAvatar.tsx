interface ProfileAvatarProps {
  src?: string
  alt: string
  size?: string
}

const ProfileAvatar = ({ src, alt, size = 'w-8 h-8' }: ProfileAvatarProps) => {
  return (
    <div
      className={`${size} rounded-full overflow-hidden ring-2 ring-white/20 transition-transform hover:scale-110`}
    >
      <img
        src={src || '/api/placeholder/40/40'}
        alt={alt}
        className="w-full h-full object-cover"
        onError={(e) => {
          ;(e.target as HTMLImageElement).src = '/api/placeholder/40/40'
        }}
      />
    </div>
  )
}

export default ProfileAvatar
