import { describe, expect } from '@jest/globals';
import { TestUtil } from "denetwork-utils";
import { NsFilterService } from "../../../src";
import { ChPubService } from "../../../src/services/ChPubService";
import { ChSubService } from "../../../src/services/ChSubService";



/**
 *	unit test
 */
describe( "ChPubSubService", () =>
{
	beforeAll( async () =>
	{
	} );
	afterAll( async () =>
	{
	} );

	describe( "Pub/Sub", () =>
	{
		const tag = `ioredis`;
		const subTopic = `redis-topic`;

		it( "should publish messages to subscribed channel and receive them", async () =>
		{
			const pub = new ChPubService();
			const sub = new ChSubService();

			await sub.subscribe( subTopic, ( channel : string, message : string | object | null ) =>
			{
				//console.log( `received message from channel: ${ channel } :`, message );
				expect( channel ).toBeDefined();
				expect( channel ).toBe( subTopic );

				expect( message ).toBeDefined();
				expect( message ).toHaveProperty( `tag` );
				expect( message ).toHaveProperty( `now` );

				const obj : any = message;
				expect( obj.tag ).toBe( tag );
				expect( obj.now ).toBeGreaterThan( 0 );
				expect( obj.now ).toBeLessThanOrEqual( new Date().getTime() );

			}, { parseJSON : true } );
			for ( let i = 0; i < 10; i ++ )
			{
				await pub.publish( subTopic, { tag : tag, now : new Date().getTime() } );
			}

			//	...
			await TestUtil.sleep( 2000 );

			//	...
			await pub.close();
			await sub.close();

		}, 60 * 10e3 );
	} );
} );
