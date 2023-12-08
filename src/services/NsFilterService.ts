import { DeRedisOptions } from "../models/DeRedisOptions";
import { BaseRedis } from "./BaseRedis";
import { INsFilter } from "../interfaces/INsFilter";
import _ from "lodash";

/**
 *	@class
 */
export class NsFilterService extends BaseRedis implements INsFilter
{
	/**
	 *	@param [portOrPath]	{number | string}
	 *	@param [hostOrOptions]	{string | DeRedisOptions}
	 *	@param [options]	{DeRedisOptions}
	 */
	constructor
	(
		portOrPath ? : number | string,
		hostOrOptions ? : string | DeRedisOptions,
		options ? : DeRedisOptions
	)
	{
		super( portOrPath, hostOrOptions, options );
	}

	/**
	 *	@param namespace	{string}
	 *	@param hash		{string}
	 *	@returns {Promise<number>}
	 */
	public add( namespace : string, hash : string ) : Promise<number>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				if ( ! this.redis )
				{
					return reject( `${ this.constructor.name } :: not initialized` );
				}

				const key : string = this.calcKey( namespace, hash );

				//
				//	set if the key does not exist, and return 1
				//	do nothing if the key already existed, and return 0
				//
				const result : number = await this.redis.setnx( key, `1` );
				if ( 1 === result )
				{
					await this.redis.expire( key, this.maxStorageSeconds );
				}

				resolve( result );
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}

	/**
	 *	@param namespace	{string}
	 *	@param hash		{string}
	 *	@returns {Promise<boolean>}
	 */
	public has( namespace : string, hash : string ) : Promise<boolean>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				if ( ! this.redis )
				{
					return reject( `${ this.constructor.name } :: not initialized` );
				}

				const key : string = this.calcKey( namespace, hash );

				//
				//	1 - exists
				//	0 - no exists
				//
				const exists : number = await this.redis.exists( key );
				resolve( 1 === exists );
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}


	/**
	 *	@param namespace	{string}
	 *	@param hash		{string}
	 *	@return {string}
	 *	@private
	 */
	private calcKey( namespace : string, hash : string ) : string
	{
		if ( ! _.isString( namespace ) || _.isEmpty( namespace ) )
		{
			throw `invalid namespace`;
		}
		if ( ! _.isString( hash ) || _.isEmpty( hash ) )
		{
			throw `invalid hash`;
		}

		return `ns-filter-${ namespace }.${ hash }`;
	}
}
