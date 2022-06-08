import { Client, Connection } from '../client/index.js'

export async function* asyncIterableTransaction<T>(db: Client, cb: (db2: Client<Connection.TransactionLike>) => AsyncIterable<T>): AsyncIterable<T> {
	yield* await new Promise<AsyncIterable<T>>(async (resolveOuter) => {
		await db.transaction((db2: Client<Connection.TransactionLike>) => {
			return new Promise<void>((resolveInner, rejectInner) => {
				resolveOuter((async function* () {
					try {
						yield* cb(db2)
						resolveInner()

					} catch (e) {
						rejectInner(e)
					}
				})())
			})
		})
	})
}
