/**
 * Example of an 'loader' which is a repo that exposes data for a
 * selected table via raw sql in support of the strategy for
 * bulk loading data.
 *
 * In an actual implementation, this would be achieved through TypeORM
 * as followd, where the resulting data would be marshalled into an
 * interface.
 *
 * Example:
 *
 *  interface WidgetWrapper { ... }
 *
 *  const result = await myDataSource.manager.query<WidgetWrapper[]>(
 *    `select * from widget`
 *  );
 *
 * For the purposes of this project, we return an empty array just to
 * illustrate how mocks can be used for tests, overridding this logic
 * represented in this file.
 */
import MovementQueryResult from "@repos/loaders/query-result/movement-query-result";

export const loadAllMovements = (): Array<MovementQueryResult> => {
  return [];
};
