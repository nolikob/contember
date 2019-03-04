import Project from '../../src/config/Project'
import KnexWrapper from '../../src/core/knex/KnexWrapper'
import CreateStageCommand from '../../src/system-api/model/commands/CreateStageCommand'
import MigrationFilesManager from '../../src/migrations/MigrationFilesManager'
import StageMigrator from '../../src/system-api/StageMigrator'
import knex from 'knex'
import MigrationsRunner from '../../src/migrations/MigrationsRunner'
import { setupSystemVariables } from '../../src/system-api/SystemVariablesSetupHelper'
import CreateInitEventCommand from '../../src/system-api/model/commands/CreateInitEventCommand'
import { graphql, GraphQLSchema } from 'graphql'
import SchemaVersionBuilder from '../../src/content-schema/SchemaVersionBuilder'
import GraphQlSchemaBuilderFactory from '../../src/content-api/graphQLSchema/GraphQlSchemaBuilderFactory'
import AllowAllPermissionFactory from '../../src/acl/AllowAllPermissionFactory'
import { Context as ContentContext } from '../../src/content-api/types'
import { formatSchemaName } from '../../src/system-api/model/helpers/stageHelpers'
import SchemaMigrationDiffsResolver from '../../src/content-schema/SchemaMigrationDiffsResolver'
import { createMock } from '../../src/utils/testing'
import S3 from '../../src/utils/S3'
import systemTypeDefs from '../../src/system-api/schema/system.graphql'
import { makeExecutableSchema } from 'graphql-tools'
import SystemContainerFactory from '../../src/system-api/SystemContainerFactory'
import ResolverContext from '../../src/system-api/resolvers/ResolverContext'
import 'mocha'
import PermissionsByIdentityFactory from '../../src/acl/PermissionsByIdentityFactory'
import Authorizator from '../../src/core/authorization/Authorizator'
import { testUuid } from './testUuid'
import Identity from '../../src/common/auth/Identity'
import { maskErrors } from 'graphql-errors'
import ExecutionContainerFactory from '../../src/content-api/graphQlResolver/ExecutionContainerFactory'
import LatestMigrationByStageQuery from '../../src/system-api/model/queries/LatestMigrationByStageQuery'
import FileNameHelper from '../../src/migrations/FileNameHelper'
import SystemExecutionContainer from '../../src/system-api/SystemExecutionContainer'

export class ApiTester {
	private knownStages: { [stageSlug: string]: Project.Stage } = {}

	constructor(
		private readonly projectDb: KnexWrapper,
		private readonly schemaVersionBuilder: SchemaVersionBuilder,
		private readonly graphQlSchemaBuilderFactory: GraphQlSchemaBuilderFactory,
		private readonly systemSchema: GraphQLSchema,
		private readonly authorizator: Authorizator,
		private readonly systemExecutionContainer: SystemExecutionContainer
	) {}

	public async createStage(stage: Project.Stage): Promise<void> {
		await new CreateStageCommand(stage).execute(this.projectDb)
		this.knownStages[stage.slug] = stage
	}

	public async migrateStage(slug: string, version: string): Promise<void> {
		const migrationFilesManager = ApiTester.createProjectMigrationFilesManager()
		const stageMigrator = new StageMigrator(migrationFilesManager)
		const stage = this.getStage(slug)
		await stageMigrator.migrate({ ...stage, migration: version }, this.projectDb, () => null)
		this.knownStages[slug] = { ...stage, migration: version }
	}

	private getStage(slug: string): Project.Stage {
		const stage = this.knownStages[slug]
		if (!stage) {
			throw new Error(`Unknown stage ${stage}`)
		}
		return stage
	}

	public async queryContent(stageSlug: string, gql: string, variables?: { [key: string]: any }): Promise<any> {
		await setupSystemVariables(this.projectDb, '11111111-1111-1111-1111-111111111111')
		const stage = this.getStage(stageSlug)
		if (!stage.migration) {
			throw new Error(`Unknown migration version for stage ${stageSlug}`)
		}
		const model = await this.schemaVersionBuilder.buildSchema(stage.migration)
		const permissions = new AllowAllPermissionFactory().create(model)
		const gqlSchemaBuilder = this.graphQlSchemaBuilderFactory.create(model, permissions)
		const schema = gqlSchemaBuilder.build()
		const db = this.projectDb.forSchema(formatSchemaName(stage))

		const executionContainer = new ExecutionContainerFactory(model, permissions).create({
			db,
			identityVariables: {},
		})
		const context: ContentContext = {
			db,
			identityVariables: {},
			executionContainer,
			errorHandler: () => null,
			timer: async (label, cb) => cb ? await cb() : undefined as any,
		}
		return await graphql(schema, gql, null, context, variables)
	}

	public async querySystem(gql: string, variables?: { [key: string]: any }): Promise<any> {
		await setupSystemVariables(this.projectDb, '11111111-1111-1111-1111-111111111111')
		const context: ResolverContext = new ResolverContext(
			new Identity.StaticIdentity(testUuid(888), [Identity.SystemRole.SUPER_ADMIN], {}),
			{},
			this.authorizator,
			this.systemExecutionContainer,
			() => null
		)

		return await graphql(this.systemSchema, gql, null, context, variables)
	}

	public async refreshStagesVersion() {
		const queryHandler = this.projectDb.createQueryHandler()
		for (let stage in this.knownStages) {
			const stageObj = this.knownStages[stage]
			const latestMigration = await queryHandler.fetch(new LatestMigrationByStageQuery(stageObj.uuid))
			this.knownStages[stage] = {
				...stageObj,
				migration: latestMigration ? FileNameHelper.extractVersion(latestMigration.data.file) : undefined,
			}
		}
	}

	public static async create(): Promise<ApiTester> {
		const dbCredentials = (dbName: string) => {
			return {
				host: String(process.env.TEST_DB_HOST),
				port: Number(process.env.TEST_DB_PORT),
				user: String(process.env.TEST_DB_USER),
				password: String(process.env.TEST_DB_PASSWORD),
				database: dbName,
			}
		}

		const createConnection = (dbName: string): knex => {
			return knex({
				debug: false,
				client: 'pg',
				connection: dbCredentials(dbName),
			})
		}

		const connection = createConnection(process.env.TEST_DB_MAINTENANCE_NAME || 'postgres')

		const dbName = String(process.env.TEST_DB_NAME)
		await connection.raw('DROP DATABASE IF EXISTS ?? ', [dbName])
		await connection.raw('CREATE DATABASE ?? ', [dbName])

		const migrationsRunner = new MigrationsRunner()
		const systemMigrationsManager = new MigrationFilesManager(
			process.cwd() + (process.env.TEST_CWD_SUFFIX || '') + '/migrations/project'
		)
		await migrationsRunner.migrate(dbCredentials(dbName), 'system', systemMigrationsManager.directory, false)
		await connection.destroy()

		const projectDb = new KnexWrapper(createConnection(dbName), 'system')

		await setupSystemVariables(projectDb, '11111111-1111-1111-1111-111111111111')

		await new CreateInitEventCommand().execute(projectDb)

		const projectMigrationFilesManager = ApiTester.createProjectMigrationFilesManager()
		const schemaMigrationDiffsResolver = new SchemaMigrationDiffsResolver(projectMigrationFilesManager)
		const diffs = schemaMigrationDiffsResolver.resolve()
		const schemaVersionBuilder = new SchemaVersionBuilder(projectDb.createQueryHandler(), diffs)
		const gqlSchemaBuilderFactory = new GraphQlSchemaBuilderFactory(
			createMock<S3>({
				formatPublicUrl() {
					throw new Error()
				},
				getSignedUrl() {
					throw new Error()
				},
			})
		)

		const systemContainerFactory = new SystemContainerFactory()
		const systemContainer = systemContainerFactory.create({
			schemaMigrationDiffsResolver: schemaMigrationDiffsResolver,
			migrationFilesManager: projectMigrationFilesManager,
			permissionsByIdentityFactory: new PermissionsByIdentityFactory([
				new PermissionsByIdentityFactory.SuperAdminPermissionFactory(),
				new PermissionsByIdentityFactory.RoleBasedPermissionFactory(),
			]),
			aclSchema: {
				variables: {},
				roles: {},
			},
		})

		const systemExecutionContainer = systemContainer.executionContainerFactory.create(projectDb)

		const systemSchema = makeExecutableSchema({
			typeDefs: systemTypeDefs,
			resolvers: systemContainer.get('systemResolvers'),
		})
		maskErrors(systemSchema)

		after(async () => {
			await projectDb.knex.destroy()
		})

		return new ApiTester(
			projectDb,
			schemaVersionBuilder,
			gqlSchemaBuilderFactory,
			systemSchema,
			systemContainer.get('authorizator'),
			systemExecutionContainer
		)
	}

	private static createProjectMigrationFilesManager(): MigrationFilesManager {
		return new MigrationFilesManager(
			process.cwd() + (process.env.TEST_CWD_SUFFIX || '') + '/tests/example-project/migrations'
		)
	}
}