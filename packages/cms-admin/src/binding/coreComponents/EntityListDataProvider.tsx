import { GraphQlBuilder } from 'cms-client'
import { Input } from 'cms-common'
import * as React from 'react'
import Dimensions from '../../components/Dimensions'
import { SelectedDimension } from '../../state/request'
import { EntityName, FieldName } from '../bindingTypes'
import { EnvironmentContext } from '../coreComponents'
import { Environment, MarkerTreeRoot } from '../dao'
import { DefaultRenderer } from '../facade/renderers'
import { MarkerTreeGenerator } from '../model'
import { DataRendererProps, getDataProvider } from './DataProvider'
import { EnforceSubtypeRelation } from './EnforceSubtypeRelation'
import { MarkerTreeRootProvider } from './MarkerProvider'

interface EntityListDataProviderProps<DRP> {
	name: EntityName
	associatedField?: FieldName
	filter?: Input.Where<GraphQlBuilder.Literal>
	renderer?: React.ComponentClass<DRP & DataRendererProps>
	rendererProps?: DRP
}

export class EntityListDataProvider<DRP> extends React.Component<EntityListDataProviderProps<DRP>> {
	public static displayName = 'EntityListDataProvider'

	public render() {
		return (
			<Dimensions>
				{(dimensions: SelectedDimension) => {
					const environment = new Environment({ dimensions })
					const Renderer = this.props.renderer || DefaultRenderer
					const markerTreeGenerator = new MarkerTreeGenerator(
						<EntityListDataProvider {...this.props}>
							<Renderer {...this.props.rendererProps} data={undefined}>
								{this.props.children}
							</Renderer>
						</EntityListDataProvider>,
						environment
					)
					const DataProvider = getDataProvider<DRP>()

					return (
						<EnvironmentContext.Provider value={environment}>
							<DataProvider
								markerTree={markerTreeGenerator.generate()}
								renderer={this.props.renderer}
								rendererProps={this.props.rendererProps}
							>
								{this.props.children}
							</DataProvider>
						</EnvironmentContext.Provider>
					)
				}}
			</Dimensions>
		)
	}

	public static generateMarkerTreeRoot(
		props: EntityListDataProviderProps<unknown>,
		fields: MarkerTreeRoot['fields']
	): MarkerTreeRoot {
		return new MarkerTreeRoot(
			props.name,
			fields,
			{
				filter: props.filter,
				whereType: 'nonUnique'
			},
			props.associatedField
		)
	}
}

type EnforceDataBindingCompatibility = EnforceSubtypeRelation<
	typeof EntityListDataProvider,
	MarkerTreeRootProvider<EntityListDataProviderProps<any>>
>
