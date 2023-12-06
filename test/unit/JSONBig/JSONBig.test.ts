import { describe, expect } from '@jest/globals';
import JSONBig from "json-bigint";


/**
 *	unit test
 */
describe( "JSONBig", () =>
{
	beforeAll( async () =>
	{
	} );
	afterAll( async () =>
	{
	} );

	describe( "stringify/parse", () =>
	{
		const channel = 'chat-1998';

		it( "should stringify and parse json object with BigInt item", async () =>
		{
			const json = '{ "value" : 9223372036854775807, "v2": 123 }';
			//console.log( 'Input:', json );
			//console.log( '' );

			//console.log( 'node.js built-in JSON:' );
			// const r = JSON.parse( json );
			// console.log( 'JSON.parse(input).value : ', r.value.toString() );
			// console.log( 'JSON.stringify(JSON.parse(input)):', JSON.stringify( r ) );

			//console.log( '\n\nbig number JSON:' );
			const r1 = JSONBig.parse( json );
			expect( r1 ).toBeDefined();
			expect( r1 ).toHaveProperty( `value` );
			expect( r1 ).toHaveProperty( `v2` );
			expect( typeof r1.value ).toBe( 'object' );
			expect( BigInt( r1.value ) ).toBe( BigInt( "9223372036854775807" ) );

		}, 60 * 10e3 );

	} );
} );
