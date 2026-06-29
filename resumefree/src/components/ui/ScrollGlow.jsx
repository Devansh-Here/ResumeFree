// src/components/ui/ScrollGlow.jsx
import { useEffect, useRef, useState } from 'react'

export default function ScrollGlow({ position = 'top-right', opacity = 0.07, delay = 0 }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  /* Position — always hugging the edge */
  const styles = {
    'top-right':    { top: '-200px',    right: '-200px'  },
    'top-left':     { top: '-200px',    left:  '-200px'  },
    'bottom-right': { bottom: '-200px', right: '-200px'  },
    'bottom-left':  { bottom: '-200px', left:  '-200px'  },
    'center-right': { top: '50%',       right: '-250px', transform: 'translateY(-50%)' },
    'center-left':  { top: '50%',       left:  '-250px', transform: 'translateY(-50%)' },
  }

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute w-[600px] h-[600px]"
      style={{
        ...styles[position],
        background: `radial-gradient(ellipse 50% 50% at 50% 50%, rgba(5,150,105,${opacity}) 0%, transparent 70%)`,
        opacity:    visible ? 1 : 0,
        transition: `opacity 1.5s ease ${delay}ms`,
        zIndex: 0,
      }}
    />
  )
}