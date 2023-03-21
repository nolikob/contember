import { Component, Field, FieldBasicProps } from '@contember/binding'
import { ReactNode } from 'react'

export type HiddenFieldProps =
	& FieldBasicProps
	& {
		/**
		 * @deprecated label makes no sense for hidden field
		 */
		label?: ReactNode
	}

export const HiddenField = Component<HiddenFieldProps>(
	() => null,
	props => (
		<Field
			defaultValue={props.defaultValue}
			field={props.field}
			isNonbearing={props.isNonbearing ?? true}
		/>
	),
	'HiddenField',
)
