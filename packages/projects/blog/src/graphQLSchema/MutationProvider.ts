import { acceptFieldVisitor, getEntity, Schema } from "../model";
import { GraphQLFieldConfig, GraphQLFieldConfigMap, GraphQLInputFieldConfigMap, GraphQLInputObjectType, GraphQLNonNull } from "graphql";
import singletonFactory from "../utils/singletonFactory";
import { capitalizeFirstLetter } from "../utils/strings";
import { Context } from "../types";
import joinMonster from "join-monster";
import { JoinMonsterFieldMapping } from "../joinMonsterHelpers";
import { escapeParameter } from "../sql/utils";
import insertData from "../sql/mapper";
import WhereTypeProvider from "./WhereTypeProvider";
import EntityTypeProvider from "./EntityTypeProvider";
import ColumnTypeResolver from "./ColumnTypeResolver";
import ConnectInputVisitor from "./mutations/create/ConnectInputVisitor";
import InputFieldVisitor from "./mutations/create/InputFieldVisitor";

type RelationDefinition = { entityName: string, relationName: string }

export default class MutationProvider
{
  private schema: Schema
  private whereTypeProvider: WhereTypeProvider
  private entityTypeProvider: EntityTypeProvider
  private columnTypeResolver: ColumnTypeResolver

  private createEntityInputs = singletonFactory<GraphQLInputObjectType, { entityName: string, withoutRelation?: string }>(id =>
    this.createCreateEntityInput(id.entityName, id.withoutRelation)
  )

  private createEntityConnectionInputs = singletonFactory((id: RelationDefinition) => this.createCreateEntityConnectionInput(id.entityName, id.relationName))

  constructor(schema: Schema, whereTypeProvider: WhereTypeProvider, entityTypeProvider: EntityTypeProvider, columnTypeResolver: ColumnTypeResolver)
  {
    this.schema = schema
    this.whereTypeProvider = whereTypeProvider
    this.entityTypeProvider = entityTypeProvider
    this.columnTypeResolver = columnTypeResolver
  }

  getCreateMutation(entityName: string): GraphQLFieldConfig<any, any> & JoinMonsterFieldMapping<any, any>
  {
    return {
      type: new GraphQLNonNull(this.entityTypeProvider.getEntity(entityName)),
      args: {
        data: {type: new GraphQLNonNull(this.getCreateEntityInput(entityName))}
      },
      where: (tableName: string, args: any, context: any) => {
        const primary = this.schema.entities[entityName].primaryColumn
        return `${tableName}.${primary} = ${escapeParameter(context.primary)}`
      },
      resolve: async (parent, args, context: Context, resolveInfo) => {
        const primary = await insertData(this.schema, context.db)(entityName, args.data)
        return await joinMonster(resolveInfo, {...context, primary}, (sql) => {
          return context.db.raw(sql)
        }, {dialect: 'pg'})
      },
    }
  }

  getDeleteMutation(entityName: string): GraphQLFieldConfig<any, any> & JoinMonsterFieldMapping<any, any>
  {
    return {
      type: this.entityTypeProvider.getEntity(entityName),
      args: {
        where: {type: new GraphQLNonNull(this.whereTypeProvider.getEntityUniqueWhereType(entityName))},
      },
      where: (tableName: string, args: any, context: any) => {
        const entity = this.schema.entities[entityName];
        const primary = entity.primaryColumn
        return `${tableName}.${primary} = ${escapeParameter(args.where[entity.primary])}`
      },
      resolve: async (parent, args, context: Context, resolveInfo) => {
        const response = await joinMonster(resolveInfo, context, (sql) => {
          return context.db.raw(sql)
        }, {dialect: 'pg'})
        const entity = getEntity(this.schema, entityName)
        await context.db(entity.tableName).andWhere(entity.primaryColumn, args.where[entity.primary]).delete()

        return response
      },
    }
  }

  getMutations(entityName: string): GraphQLFieldConfigMap<any, any>
  {
    return {
      [`create${entityName}`]: this.getCreateMutation(entityName),
      [`delete${entityName}`]: this.getDeleteMutation(entityName),
    }
  }

  getCreateEntityInput(entityName: string, withoutRelation?: string): GraphQLInputObjectType
  {
    return this.createEntityInputs({entityName, withoutRelation})
  }

  createCreateEntityInput(entityName: string, withoutRelation?: string)
  {
    const withoutSuffix = withoutRelation ? "Without" + capitalizeFirstLetter(withoutRelation) : ''

    return new GraphQLInputObjectType({
      name: capitalizeFirstLetter(entityName) + withoutSuffix + "CreateInput",
      fields: () => {
        const fields: GraphQLInputFieldConfigMap = {}
        let entity = getEntity(this.schema, entityName);
        for (let fieldName in entity.fields) {
          if (withoutRelation && fieldName === withoutRelation) {
            continue
          }
          if (fieldName === entity.primary) {
            continue //todo maybe optional?
          }
          fields[fieldName] = acceptFieldVisitor(this.schema, entityName, fieldName, new InputFieldVisitor(this.columnTypeResolver, this))
        }

        return fields
      }
    })
  }

  getCreateEntityConnectionInput(entityName: string, relationName: string)
  {
    return this.createEntityConnectionInputs({entityName, relationName})
  }

  createCreateEntityConnectionInput(entityName: string, relationName: string): GraphQLInputObjectType
  {
    return acceptFieldVisitor(this.schema, entityName, relationName, new ConnectInputVisitor(this.schema, this.whereTypeProvider, this))
  }
}