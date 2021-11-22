import cn from 'classnames'
import { createContext, memo, ReactNode } from 'react'
import { useClassNamePrefix } from '../../auxiliary'
import type { Justification, Size } from '../../types'
import { toEnumViewClass } from '../../utils'
import { Box } from '../Containers/Box'

export const UseTableElementContext = createContext(true)

export interface TableProps {
	children?: ReactNode
	heading?: ReactNode
	tableHead?: ReactNode
	size?: Size
	justification?: Justification
	bare?: boolean
	//useTableElement?: boolean
}

export const Table = memo(({ /*useTableElement = true, */ bare, ...props }: TableProps) => {
	const prefix = useClassNamePrefix()
	const className = cn(
		`${prefix}table`,
		toEnumViewClass(props.size),
		toEnumViewClass(props.justification, 'justifyStart'),
	)

	const table = (
		<div className={`${prefix}table-wrapper`}>
			{/*{useTableElement ? (*/}
			<table className={className}>
				{props.tableHead && <thead>{props.tableHead}</thead>}
				<tbody>{props.children}</tbody>
			</table>
			{/*) : (*/}
			{/*	<div className={className}>{props.children}</div>*/}
			{/*)}*/}
		</div>
	)

	return (
		<UseTableElementContext.Provider value={/*useTableElement*/ true}>
			{bare ? table : <Box heading={props.heading}>{table}</Box>}
		</UseTableElementContext.Provider>
	)
})
Table.displayName = 'Table'
