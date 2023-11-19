import Redis from "ioredis";
import { TsQueueConnectOptions } from "../models/TsQueueModels";
import { RedisOptions } from "ioredis/built/redis/RedisOptions";
import { TypeUtil } from "denetwork-utils";
import _ from "lodash";

/**
 * 	@class
 */
export class BaseRedis
{
	/**
	 *	@protected
	 */
	protected redis : Redis | null = null;

	/**
	 * 	Maximum storage seconds, default value is 90 days
	 *	@protected
	 */
	protected maxStorageSeconds : number = 90 * 24 * 60 * 60;


	/**
	 *	@param [portOrPath]	{number | string}
	 *	@param [hostOrOptions]	{string | TsQueueConnectOptions}
	 *	@param [options]	{TsQueueConnectOptions}
	 */
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
	 *	@param value	{number}	- seconds
	 *	@returns {void}
	 */
	public setMaxStorageSeconds( value : number ) : void
	{
		if ( ! _.isNumber( value ) || value <= 0 )
		{
			throw new Error( `invalid value` );
		}

		this.maxStorageSeconds = value;
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
}
