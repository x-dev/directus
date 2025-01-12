import knex, { Knex } from 'knex';
import { getTracker, MockClient, Tracker } from 'knex-mock-client';
import { afterEach, beforeAll, beforeEach, describe, expect, it, MockedFunction, vi } from 'vitest';
import { CollectionsService, FieldsService, RelationsService, SpecificationService } from '../../src/services';
import { Collection } from '../types';

class Client_PG extends MockClient {}

describe('Integration Tests', () => {
	let db: MockedFunction<Knex>;
	let tracker: Tracker;

	beforeAll(async () => {
		db = vi.mocked(knex({ client: Client_PG }));
		tracker = getTracker();
	});

	afterEach(() => {
		tracker.reset();
		vi.clearAllMocks();
	});

	describe('Services / Specifications', () => {
		describe('oas', () => {
			describe('generate', () => {
				let service: SpecificationService;

				beforeEach(() => {
					service = new SpecificationService({
						knex: db,
						schema: { collections: {}, relations: [] },
						accountability: { role: 'admin', admin: true },
					});
				});

				describe('schema', () => {
					it('returns untyped schema for json fields', async () => {
						vi.spyOn(CollectionsService.prototype, 'readByQuery').mockResolvedValue([
							{
								collection: 'test_table',
								meta: {
									accountability: 'all',
									collection: 'test_table',
									group: null,
									hidden: false,
									icon: null,
									item_duplication_fields: null,
									note: null,
									singleton: false,
									translations: null,
								},
								schema: {
									name: 'test_table',
								},
							},
						] as any[]);

						vi.spyOn(FieldsService.prototype, 'readAll').mockResolvedValue([
							{
								collection: 'test_table',
								field: 'id',
								name: 'id',
								type: 'integer',
								meta: {
									id: 1,
									collection: 'test_table',
									conditions: null,
									display: null,
									display_options: null,
									field: 'id',
									group: null,
									hidden: true,
									interface: null,
									note: null,
									options: null,
									readonly: false,
									required: false,
									sort: null,
									special: null,
									translations: null,
									validation: null,
									validation_message: null,
									width: 'full',
								},
								schema: {
									comment: null,
									data_type: 'integer',
									default_value: null,
									foreign_key_column: null,
									foreign_key_schema: null,
									foreign_key_table: null,
									generation_expression: null,
									has_auto_increment: false,
									is_generated: false,
									is_nullable: false,
									is_primary_key: true,
									is_unique: true,
									max_length: null,
									name: 'id',
									numeric_precision: null,
									numeric_scale: null,
									table: 'test_table',
								},
							},
							{
								collection: 'test_table',
								field: 'blob',
								name: 'blob',
								type: 'json',
								meta: {
									id: 2,
									collection: 'test_table',
									conditions: null,
									display: null,
									display_options: null,
									field: 'blob',
									group: null,
									hidden: true,
									interface: null,
									note: null,
									options: null,
									readonly: false,
									required: false,
									sort: null,
									special: null,
									translations: null,
									validation: null,
									validation_message: null,
									width: 'full',
								},
								schema: {
									comment: null,
									data_type: 'json',
									default_value: null,
									foreign_key_column: null,
									foreign_key_schema: null,
									foreign_key_table: null,
									generation_expression: null,
									has_auto_increment: false,
									is_generated: false,
									is_nullable: true,
									is_primary_key: false,
									is_unique: false,
									max_length: null,
									name: 'blob',
									numeric_precision: null,
									numeric_scale: null,
									table: 'test_table',
								},
							},
						]);
						vi.spyOn(RelationsService.prototype, 'readAll').mockResolvedValue([]);

						const spec = await service.oas.generate();
						expect(spec.components?.schemas).toEqual({
							ItemsTestTable: {
								type: 'object',
								properties: {
									id: {
										nullable: false,
										type: 'integer',
									},
									blob: {
										nullable: true,
									},
								},
								'x-collection': 'test_table',
							},
						});
					});
				});

				describe('path', () => {
					it('requestBody for CreateItems POST path should not have type in schema', async () => {
						const collection: Collection = {
							collection: 'test_table',
							meta: {
								accountability: 'all',
								collection: 'test_table',
								group: null,
								hidden: false,
								icon: null,
								item_duplication_fields: null,
								note: null,
								singleton: false,
								translations: {},
							},
							schema: {
								name: 'test_table',
							},
						};

						vi.spyOn(CollectionsService.prototype, 'readByQuery').mockResolvedValue([collection]);

						vi.spyOn(FieldsService.prototype, 'readAll').mockResolvedValue([
							{
								collection: collection.collection,
								field: 'id',
								name: 'id',
								type: 'integer',
								meta: {
									id: 1,
									collection: 'test_table',
									conditions: null,
									display: null,
									display_options: null,
									field: 'id',
									group: null,
									hidden: true,
									interface: null,
									note: null,
									options: null,
									readonly: false,
									required: false,
									sort: null,
									special: null,
									translations: null,
									validation: null,
									validation_message: null,
									width: 'full',
								},
								schema: {
									comment: null,
									data_type: 'integer',
									default_value: null,
									foreign_key_column: null,
									foreign_key_schema: null,
									foreign_key_table: null,
									generation_expression: null,
									has_auto_increment: false,
									is_generated: false,
									is_nullable: false,
									is_primary_key: true,
									is_unique: true,
									max_length: null,
									name: 'id',
									numeric_precision: null,
									numeric_scale: null,
									table: 'test_table',
								},
							},
						]);
						vi.spyOn(RelationsService.prototype, 'readAll').mockResolvedValue([]);

						const spec = await service.oas.generate();

						const targetSchema =
							spec.paths[`/items/${collection.collection}`].post.requestBody.content['application/json'].schema;

						expect(targetSchema).toHaveProperty('oneOf');
						expect(targetSchema).not.toHaveProperty('type');
					});
				});
			});
		});
	});
});
