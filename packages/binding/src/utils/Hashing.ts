import { MarkerSubTreeParameters, ReferenceMarker } from '../markers'
import { ExpectedEntityCount, Filter, UniqueWhere } from '../treeParameters'
import { assertNever } from './assertNever'

export class Hashing {
	public static hashReferenceConstraints(constraints: ReferenceMarker.ReferenceConstraints): number {
		const where: Array<Filter | UniqueWhere | ExpectedEntityCount | undefined> = [
			constraints.filter,
			constraints.reducedBy,
			constraints.expectedCount,
		]

		return Hashing.hashArray(where)
	}

	public static hashMarkerTreeParameters(parameters: MarkerSubTreeParameters): number {
		switch (parameters.type) {
			case 'unique':
				return Hashing.hashArray([parameters.type, parameters.where, parameters.entityName, parameters.filter])
			case 'nonUnique':
				return Hashing.hashArray([
					parameters.type,
					parameters.entityName,
					parameters.filter,
					parameters.orderBy,
					parameters.offset,
					parameters.limit,
					parameters.connectTo,
				])
			case 'unconstrainedUnique':
			case 'unconstrainedNonUnique':
				return Hashing.hashArray([parameters.type, parameters.entityName, parameters.connectTo])
		}
		return assertNever(parameters)
	}

	private static hashArray(array: any[]): number {
		const json = array.map(item => JSON.stringify(item)).join('_')
		return Hashing.hash(json)
	}

	// Taken from Java
	public static hash(str: string): number {
		let hash = 0
		if (str.length === 0) {
			return hash
		}
		for (let i = 0; i < str.length; i++) {
			hash = (hash << 5) - hash + str.charCodeAt(i)
			hash = hash & hash // Convert to 32bit integer
		}
		return Math.abs(hash)
	}
}
