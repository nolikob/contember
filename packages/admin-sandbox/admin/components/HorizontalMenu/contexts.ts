import { createContext } from '@contember/react-utils'
import { HorizontalMenuContainerProps } from './types'

export const defaultHorizontalMenuProps = {
	componentClassName: 'horizontal-menu',
	horizontal: true,
	hover: true,
	itemsContentHorizontal: true,
	itemsIconsScale: 1.25,
	itemsSizeEvenly: false,
}

export const [HorizontalMenuContext, useHorizontalMenuContext] = createContext<HorizontalMenuContainerProps>('HorizontalMenuContainer', defaultHorizontalMenuProps)
