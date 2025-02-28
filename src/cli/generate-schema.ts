// import commandLineArgs from 'command-line-args';
import { printSchema } from 'graphql';
import path from 'path';

import {
  buildGraphqlSchemaFromDb,
  createDatabaseConnection,
  loadModelsFromPath,
} from '@core/infrastructure/database';
import {
  buildSchema,
  loadInputsFromPath,
  loadResolversFromPath,
} from '@core/interfaces/gql';
import { outputFileSync } from '@shared/utils';

const generatedSchemaWarning = /* graphql */ `\
# -------------------------------------------------------------
# !!! THIS WAS AUTO-GENERATED FROM THE MODELS AND RESOLVERS !!!
# !!!          DO NOT MODIFY THIS FILE BY YOURSELF          !!!
# -------------------------------------------------------------

`;

export default function (outputPath: string): void {
  const modelsPath = path.join(__dirname, '../modules/**/*.model.{ts,js}');
  const inputsPath = path.join(__dirname, '../modules/**/*.input.{ts,js}');
  const resolversPath = path.join(__dirname, '../modules/**/*.resolver.{ts,js}');

  const models = loadModelsFromPath(modelsPath);
  const inputs = loadInputsFromPath(inputsPath);
  const db = createDatabaseConnection(models);

  const {
    entities: { types, enums },
  } = buildGraphqlSchemaFromDb(db);

  const { queries, mutations } = loadResolversFromPath(
    resolversPath,
    { ...types, ...enums },
    inputs,
  );

  const schema = buildSchema(queries, mutations, types, {});
  const schemaFileContent = generatedSchemaWarning + printSchema(schema);

  outputFileSync(outputPath, schemaFileContent);
}
