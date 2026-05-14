import React from 'react'

import { Community } from '../components/community'
import { CTA } from '../components/cta'
import { Features } from '../components/Features'
import { Hero } from '../components/hero'
import { HowItWorks } from '../components/HitW'
import { Testimonials } from '../components/testimonials'

const HomePage = () => {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <Community />
      <Testimonials />
      <CTA />
    </>
  )
}

export default HomePage
