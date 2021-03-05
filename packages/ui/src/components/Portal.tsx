import { memo, ReactNode } from 'react'
import ReactDOM from 'react-dom'

export interface PortalProps {
	to?: HTMLElement
	children: ReactNode
}

export const Portal = memo((props: PortalProps) => ReactDOM.createPortal(props.children, props.to ?? document.body))
Portal.displayName = 'Portal'
