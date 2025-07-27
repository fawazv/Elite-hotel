import HeroContent from '../../layout/Hero/HeroContent'
import ScrollIndicator from '../../layout/Hero/ScrollIndicator'

const Hero = () => {
  return (
    <>
      <img
        src="/Hero1.avif"
        alt="Hero1"
        className="absolute inset-0 bg-cover object-cover w-full h-full bg-center bg-no-repeat opacity-20"
      />
      {/* Hero Content */}
      <HeroContent />
      {/* Scroll Indicator */}
      <ScrollIndicator />
    </>
  )
}

export default Hero
