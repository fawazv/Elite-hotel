// Type definition for ServiceCard component props
interface ServiceCardProps {
  icon: string
  title: string
  description: string
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  icon,
  title,
  description,
}) => {
  return (
    <div className="group p-8 rounded-2xl bg-gray-50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
      <div className="w-16 h-16 bg-primary-700 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
        <svg
          className="w-8 h-8 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={icon}
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

export default ServiceCard
