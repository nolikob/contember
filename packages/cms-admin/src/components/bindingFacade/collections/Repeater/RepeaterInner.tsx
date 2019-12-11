import * as React from 'react'
import { Axis, SortEndHandler } from 'react-sortable-hoc'
import {
	Entity,
	EntityListAccessor,
	SugaredRelativeSingleField,
	useMutationState,
	useSortedEntities,
} from '../../../../binding'
import { RepeaterContainer, RepeaterContainerProps } from './RepeaterContainer'
import { RepeaterHandle } from './RepeaterHandle'
import { RepeaterItem, RepeaterItemProps } from './RepeaterItem'
import { SortableRepeaterContainer } from './SortableRepeaterContainer'
import { SortableRepeaterItem } from './SortableRepeaterItem'
import { SortableRepeaterItemHandle } from './SortableRepeaterItemHandle'

// TODO alt content for collapsing
export interface RepeaterInnerProps
	extends Omit<RepeaterContainerProps, 'children' | 'entities' | 'addNew' | 'isEmpty'>,
		Omit<RepeaterItemProps, 'children' | 'canBeRemoved' | 'label'> {
	entityList: EntityListAccessor
	children: React.ReactNode

	sortableBy?: SugaredRelativeSingleField['field']

	enableRemovingLast?: boolean

	containerComponent?: React.ComponentType<RepeaterContainerProps & any>
	containerComponentExtraProps?: {}

	itemComponent?: React.ComponentType<RepeaterItemProps & any>
	itemComponentExtraProps?: {}

	unstable__sortAxis?: Axis
}

export const RepeaterInner = React.memo((props: RepeaterInnerProps) => {
	const isMutating = useMutationState()
	const { entities, moveEntity, appendNew } = useSortedEntities(props.entityList, props.sortableBy)
	const onSortEnd = React.useCallback<SortEndHandler>(
		({ oldIndex, newIndex }) => {
			moveEntity(oldIndex, newIndex)
		},
		[moveEntity],
	)

	const Handle: React.ComponentType = props.dragHandleComponent || RepeaterHandle
	const Item: React.ComponentType<RepeaterItemProps> = props.itemComponent || RepeaterItem
	const Container: React.ComponentType<RepeaterContainerProps> = props.containerComponent || RepeaterContainer

	const isEmpty = entities.length === 0
	const itemRemovingEnabled = entities.length > 1 || !!props.enableRemovingLast

	const sortableHandle = React.useCallback(
		() => (
			<SortableRepeaterItemHandle>
				<Handle />
			</SortableRepeaterItemHandle>
		),
		[],
	)

	if (props.sortableBy === undefined) {
		return (
			<Container {...props.containerComponentExtraProps} {...props} isEmpty={isEmpty} addNew={appendNew}>
				{entities.map(entity => (
					<Entity accessor={entity} key={entity.getKey()}>
						<Item
							{...props.itemComponentExtraProps}
							removalType={props.removalType}
							canBeRemoved={itemRemovingEnabled}
							dragHandleComponent={undefined}
						>
							{props.children}
						</Item>
					</Entity>
				))}
			</Container>
		)
	}

	const axis = props.unstable__sortAxis || 'y'

	return (
		<SortableRepeaterContainer
			axis={axis}
			lockAxis={axis}
			lockToContainerEdges={true}
			useDragHandle={true}
			onSortEnd={onSortEnd}
		>
			<Container {...props.containerComponentExtraProps} {...props} isEmpty={isEmpty} addNew={appendNew}>
				{entities.map((entity, i) => (
					<SortableRepeaterItem index={i} key={entity.getKey()} disabled={isMutating}>
						<Entity accessor={entity}>
							<Item
								{...props.itemComponentExtraProps}
								removalType={props.removalType}
								canBeRemoved={itemRemovingEnabled}
								dragHandleComponent={sortableHandle}
							>
								{props.children}
							</Item>
						</Entity>
					</SortableRepeaterItem>
				))}
			</Container>
		</SortableRepeaterContainer>
	)
})
RepeaterInner.displayName = 'RepeaterInner'
