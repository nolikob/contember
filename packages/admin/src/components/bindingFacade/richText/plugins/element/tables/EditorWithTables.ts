import { Node as SlateNode } from 'slate'
import { BaseEditor, ElementNode, ElementSpecifics, WithAnotherNodeType } from '../../../baseEditor'
import { TableCellElement } from './TableCellElement'
import { TableElement } from './TableElement'
import { TableRowElement } from './TableRowElement'

export interface WithTables<
	E extends WithAnotherNodeType<BaseEditor, TableElement | TableRowElement | TableCellElement>
> {
	isTable: (element: ElementNode | SlateNode, suchThat?: ElementSpecifics<TableElement>) => element is TableElement
	isTableRow: (
		element: ElementNode | SlateNode,
		suchThat?: ElementSpecifics<TableRowElement>,
	) => element is TableRowElement
	isTableCell: (
		element: ElementNode | SlateNode,
		suchThat?: ElementSpecifics<TableCellElement>,
	) => element is TableCellElement
	createEmptyTableElement: (rowCount?: number, columnCount?: number) => TableElement
	createEmptyTableRowElement: (columnCount?: number) => TableRowElement
	createEmptyTableCellElement: () => TableCellElement

	getTableCellCoordinates: (element: TableCellElement) => [number, number] // RC
	getTableRowNumber: (element: TableRowElement | TableCellElement) => number

	addTableRow: (element: TableElement, index?: number) => void
	addTableColumn: (element: TableElement, index?: number) => void
	deleteTableRow: (element: TableElement, index?: number) => void
	deleteTableColumn: (element: TableElement, index?: number) => void
}

export type EditorWithTables<E extends BaseEditor> = WithAnotherNodeType<
	E,
	TableElement | TableRowElement | TableCellElement
> &
	WithTables<WithAnotherNodeType<E, TableElement | TableRowElement | TableCellElement>>
