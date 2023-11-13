import Redis from "ioredis";
import _ from 'lodash';
import { ITsQueue } from "../interfaces/ITsQueue";
import {
	TsQueueConnectOptions,
	TsQueueMember,
	TsQueuePullOptions,
	TsQueuePullOrder,
	TsQueuePullResult
} from "../models/TsQueueModels";
import { PageUtil, TypeUtil } from "denetwork-utils";
import { defaultTsQueuePullResult } from "../constants/TsQueueContants";
import { TsQueueMemberEncoder } from "../utils/TsQueueMemberEncoder";
import { RedisOptions } from "ioredis/built/redis/RedisOptions";


/**
 * 	class TsQueueService
 */
export class TsQueueService implements ITsQueue
{
	/**
	 *	@protected
	 */
	protected redis : Redis | null = null;

	/**
	 * 	Maximum storage days
	 *	@protected
	 */
	protected maxStorageDays : number = 90;



	constructor
	(
		portOrPath ?: number | string,
		hostOrOptions ?: string | TsQueueConnectOptions,
		options ?: TsQueueConnectOptions
	)
	{
		if ( 'number' === typeof portOrPath )
		{
			//	portOrPath is number of port
			const port = Number( portOrPath );

			if ( 'string' === typeof hostOrOptions )
			{
				//	hostOrOptions is a string of host
				const host : string = String( hostOrOptions );
				if ( options )
				{
					this.redis = new Redis( port, host, options );
				}
				else
				{
					this.redis = new Redis( port, host );
				}
			}
			else if ( hostOrOptions )
			{
				//	hostOrOptions is options
				const redisOptions: RedisOptions = hostOrOptions;
				this.redis = new Redis( port, redisOptions );
			}
		}
		else if ( TypeUtil.isString( portOrPath ) )
		{
			//	a socket path
			//	e.g. : new Redis( "/tmp/redis.sock" );
			const socketPath = String( portOrPath );
			this.redis = new Redis( socketPath );
		}
		else
		{
			this.redis = new Redis();
		}
	}

	/**
	 *	@param value
	 *	@returns {void}
	 *	@returns {void}
	 */
	public setMaxStorageDays( value : number ) : void
	{
		if ( ! _.isNumber( value ) || value <= 0 )
		{
			throw new Error( `invalid value` );
		}

		this.maxStorageDays = value;
	}

	/**
	 * 	@returns {Promise<boolean>}
	 */
	public async close() : Promise<boolean>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				if ( this.redis )
				{
					await this.redis.quit();
					resolve( true );
				}
				else
				{
					reject( `not initialized` );
				}
			}
			catch ( err )
			{
				reject( err );
			}
		});
	}

	/**
	 * 	Enqueue : insert a time serial data at the end of the queue
	 *	@param channel		{string}
	 *	@param timestamp	{number} timestamp in millisecond
	 *	@param data		{object}
	 *	@returns {Promise<number>}
	 */
	public async push( channel : string, timestamp : number, data : object ) : Promise<number>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				if ( ! this.redis )
				{
					return reject( `not initialized` );
				}

				const member : TsQueueMember = {
					channel : channel,
					timestamp : timestamp,
					data : data,
				};
				const json : string | null = TsQueueMemberEncoder.encode( member );
				if ( null === json )
				{
					return reject( `invalid data` );
				}

				//
				//	remove expired data automatically
				//
				const expiredTimestamp = new Date( new Date().getTime() - ( this.maxStorageDays * 24 * 60 * 60 * 1000 ) ).getTime();
				await this.removeFromHead( channel, expiredTimestamp );

				//	...
				const result : number = await this.redis.zadd( channel, timestamp, json );
				resolve( result );
			}
			catch ( err )
			{
				reject( err );
			}
		});
	}

	/**
	 *	@param channel		{string}
	 *	@param startTimestamp	{number} timestamp in millisecond. 0 means the beginning of the list
	 *	@param endTimestamp	{number} timestamp in millisecond. -1 means the last of the list
	 *	@param options		{TsQueuePullOptions}
	 *	@returns {Promise<TsQueuePullResult>}
	 */
	public async pull
		(
			channel : string,
			startTimestamp : number,
			endTimestamp : number,
			options ?: TsQueuePullOptions
		) : Promise<TsQueuePullResult>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				if ( ! this.redis )
				{
					return reject( `not initialized` );
				}

				//	...
				if ( -1 === startTimestamp )
				{
					startTimestamp = new Date().getTime();
				}
				if ( -1 === endTimestamp )
				{
					endTimestamp = new Date().getTime();
				}

				if ( startTimestamp < 0 )
				{
					return reject( `invalid startTimestamp` );
				}
				if ( endTimestamp < startTimestamp )
				{
					return reject( `invalid endTimestamp, must be greater than or equal to startTimestamp` );
				}

				const pageNo : number = PageUtil.getSafePageNo( options?.pageNo );
				const pageSize : number = PageUtil.getSafePageSize( options?.pageSize );
				const startOffset : number = ( pageNo - 1 ) * pageSize;
				const direction : TsQueuePullOrder = ( undefined !== options?.order && ( options?.order in TsQueuePullOrder ) ) ? options.order : TsQueuePullOrder.ASC;
				let list : Array<string> = [];
				if ( TsQueuePullOrder.ASC === direction )
				{
					//
					//	Return a range of members in a sorted set,
					//		by score,
					//		with scores ordered from low to high
					//
					//	key, min, max
					//
					list = await this.redis.zrangebyscore
					(
						channel,
						startTimestamp,
						endTimestamp,
						"LIMIT",
						startOffset,
						pageSize
					);
				}
				else
				{
					//
					//	Return a range of members in a sorted set,
					//		by score,
					//		with scores ordered from high to low
					//
					//	key, max, min
					//
					list = await this.redis.zrevrangebyscore
					(
						channel,
						endTimestamp,
						startTimestamp,
						"LIMIT",
						startOffset,
						pageSize
					);
				}

				if ( Array.isArray( list ) && list.length > 0 )
				{
					let pageKey : number = 0;
					let memberList : Array< TsQueueMember | null > = [];
					for ( const str of list )
					{
						const member : TsQueueMember | null = TsQueueMemberEncoder.decode( str );
						pageKey = ( null !== member ) ? member.timestamp : 0;

						//	...
						memberList.push( member );
					}

					return resolve( {
						total : memberList.length,
						pageKey : pageKey,
						list : memberList,
					});
				}

				resolve( defaultTsQueuePullResult );
			}
			catch ( err )
			{
				reject( err );
			}
		});
	}

	/**
	 * 	Dequeue : remove data from the head of the queue
	 *
	 *	remove all the members from head in a sorted set within the given scores
	 * 	@param channel		{string}
	 * 	@param endTimestamp	{number} timestamp in millisecond
	 * 	@returns {Promise<number>}
	 */
	public removeFromHead( channel : string, endTimestamp : number ) : Promise<number>
	{
		return this.remove( channel, 0, endTimestamp );
	}

	/**
	 * 	remove all the members in a sorted set within the given scores
	 *	@param channel		{string}
	 *	@param startTimestamp	{number} timestamp in millisecond
	 *	@param endTimestamp	{number} timestamp in millisecond
	 *	@returns {Promise<number>}
	 */
	public remove( channel : string, startTimestamp : number, endTimestamp : number ) : Promise<number>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				if ( ! this.redis )
				{
					return reject( `not initialized` );
				}
				if ( startTimestamp < 0 )
				{
					return reject( `invalid startTimestamp` );
				}
				if ( endTimestamp < startTimestamp )
				{
					return reject( `invalid endTimestamp` );
				}

				const result : number = await this.redis.zremrangebyscore( channel, startTimestamp, endTimestamp );
				resolve( result );
			}
			catch ( err )
			{
				reject( err );
			}
		});
	}
}
