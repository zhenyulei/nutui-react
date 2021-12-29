import React, { FunctionComponent, useState, useEffect, useRef } from 'react'
import './drag.scss'
import bem from '@/utils/bem'
import { useDrag } from '@use-gesture/react'
import { useSpring, animated } from '@react-spring/web'

export interface DragProps {
  attract: boolean
  direction: undefined | string
  boundary: {
    top: number
    left: number
    right: number
    bottom: number
  }
  className: string
  style: React.CSSProperties
}
const defaultProps = {
  attract: false,
  direction: undefined,
  boundary: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  className: '',
} as DragProps
export const Drag: FunctionComponent<Partial<DragProps> & React.HTMLAttributes<HTMLDivElement>> = (
  props
) => {
  const { attract, direction, boundary, children, className, style, ...reset } = {
    ...defaultProps,
    ...props,
  }
  const b = bem('drag')
  const [boundaryState, setBoundaryState] = useState(boundary)
  const myDrag = useRef<HTMLDivElement>(null)
  const [currstyle, api] = useSpring(() => ({
    x: 0,
    y: 0,
  }))
  const screen = useRef({
    clientWidth: 0,
    clientHeight: 0,
  })
  const element = useRef({
    offsetWidth: 0,
    offsetHeight: 0,
  })

  const getInfo = () => {
    const el = myDrag.current
    if (el) {
      const { offsetWidth, offsetHeight, offsetTop, offsetLeft } = el
      const { clientWidth, clientHeight } = document.documentElement
      const { top, left, bottom, right } = boundary
      element.current = {
        offsetWidth: offsetWidth,
        offsetHeight: offsetHeight,
      }
      screen.current = {
        clientWidth: clientWidth,
        clientHeight: clientHeight,
      }
      setBoundaryState({
        top: -offsetTop + top,
        left: -offsetLeft + left,
        bottom: clientHeight - offsetHeight - offsetTop - bottom,
        right: clientWidth - offsetWidth - offsetLeft - right,
      })
    }
  }

  const bind = useDrag(
    ({ down, last, offset: [x, y] }) => {
      api.start({ x, y, immediate: down })
      if (last) {
        if (props.direction != 'y' && props.attract) {
          if (x < (screen.current.clientWidth - element.current.offsetWidth) / 2) {
            console.log(x)
            window.requestAnimationFrame(() => {
              api.start({ x: boundaryState.left, y, immediate: down })
            })
          } else {
            window.requestAnimationFrame(() => {
              api.start({
                x: screen.current.clientWidth - element.current.offsetWidth + boundaryState.left,
                y,
                immediate: down,
              })
            })
          }
        }
      }
    },
    {
      from: () => [currstyle.x.get(), currstyle.y.get()],
      axis: direction,
      bounds: boundaryState,
    }
  )

  useEffect(() => {
    getInfo()
  }, [myDrag])

  return (
    <div style={style} className={`${b()} ${className}`} {...reset} ref={myDrag}>
      <animated.div style={currstyle} {...bind()}>
        {children}
      </animated.div>
    </div>
  )
}

Drag.defaultProps = defaultProps
Drag.displayName = 'NutDrag'
