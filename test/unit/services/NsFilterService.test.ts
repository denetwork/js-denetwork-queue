import { describe, expect } from '@jest/globals';
import { TsQueuePullOptions, TsQueuePullResult, TsQueueService } from "../../../src";
import { TestUtil } from "denetwork-utils";
import { NsFilterService } from "../../../src/services/NsFilterService";



/**
 *	unit test
 */
describe( "NsFilterService", () =>
{
	beforeAll( async () =>
	{
	} );
	afterAll( async () =>
	{
	} );

	describe( "add/has", () =>
	{
		const namespace = 'chat';
		const hash = '0x25feff05b0415388d62d238099570cc4f585bf3ead086123f241d2ba45e8281c';

		it( "should return true within 3 seconds", async () =>
		{
			const nsFilterService = new NsFilterService();
			nsFilterService.setMaxStorageSeconds( 3 );
			await nsFilterService.add( namespace, hash );

			await TestUtil.sleep( 2000 );
			const exists = await nsFilterService.has( namespace, hash );
			expect( exists ).toBeTruthy();

			//	...
			await nsFilterService.close();

		}, 60 * 10e3 );

		it( "should return false after more than 3 seconds", async () =>
		{
			const nsFilterService = new NsFilterService();
			nsFilterService.setMaxStorageSeconds( 3 );
			await nsFilterService.add( namespace, hash );

			await TestUtil.sleep( 5000 );
			const exists = await nsFilterService.has( namespace, hash );
			expect( exists ).toBeFalsy();

			//	...
			await nsFilterService.close();

		}, 60 * 10e3 );
	} );
} );
