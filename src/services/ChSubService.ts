import { TsQueueConnectOptions } from "../models/TsQueueModels";
import { BaseRedis } from "./BaseRedis";
import _ from "lodash";
import { ChSubCallback, ChSubOptions } from "../models/ChSubModels";

/**
 *	@class
 */
export class ChSubService extends BaseRedis
{
	/**
	 *	@param [portOrPath]	{number | string}
	 *	@param [hostOrOptions]	{string | TsQueueConnectOptions}
	 *	@param [options]	{TsQueueConnectOptions}
	 */
	constructor
	(
		portOrPath ? : number | string,
		hostOrOptions ? : string | TsQueueConnectOptions,
		options ? : TsQueueConnectOptions
	)
	{
		super( portOrPath, hostOrOptions, options );
	}

	/**
	 *	@param channel		{string}
	 *	@param callback		{ChSubCallback}
	 *	@param [options]	{ChSubOptions}
	 *	@returns {Promise<boolean>}
	 */
	public subscribe( channel : string, callback : ChSubCallback, options ?: ChSubOptions ) : Promise<boolean>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				if ( ! this.redis )
				{
					return reject( `${ this.constructor.name }.subscribe not initialized` );
				}
				if ( ! _.isString( channel ) || _.isEmpty( channel ) )
				{
					return reject( `${ this.constructor.name }.subscribe invalid channel` );
				}
				if ( ! _.isFunction( callback ) )
				{
					return reject( `${ this.constructor.name }.subscribe invalid callback` );
				}

				/**
				 * 	subscribe
				 */
				this.redis.subscribe( channel, ( err, _count ) =>
				{
					if ( err )
					{
						//
						//	Just like other commands, subscribe() can fail for some reasons,
						//	e.g.: network issues.
						//
						return reject( `${ this.constructor.name }.subscribe failed to subscribe: ${ err.message }` );
					}

					// `count` represents the number of channels this client are currently subscribed to.
					// console.log(
					// 	`Subscribed successfully! This client is currently subscribed to ${count} channels.`
					// );

					if ( ! this.redis )
					{
						return reject( `${ this.constructor.name }.subscribe not initialized` );
					}
					this.redis.on( `message`, ( channel : string, message : string ) =>
					{
						//	console.log(`Received ${message} from ${channel}`);
						if ( true === options?.parseJSON )
						{
							if ( ! _.isString( message ) )
							{
								return callback( channel, null );
							}
							if ( _.isEmpty( message ) )
							{
								return callback( channel, `` );
							}

							let jsonObject;
							try
							{
								jsonObject = JSON.parse( message );
							}
							catch ( err )
							{
								jsonObject = {};
							}

							//	...
							return callback( channel, jsonObject );
						}

						//	...
						callback( channel, message );
					});

					//	...
					resolve( true );
				});
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}

	/**
	 *	@param channel		{string}
	 *	@param callback		{ChSubCallback}
	 *	@returns {Promise<boolean>}
	 */
	public unsubscribe( channel : string, callback : ChSubCallback ) : Promise<boolean>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				if ( ! this.redis )
				{
					return reject( `${ this.constructor.name }.unsubscribe not initialized` );
				}
				if ( ! _.isString( channel ) || _.isEmpty( channel ) )
				{
					return reject( `${ this.constructor.name }.unsubscribe invalid channel` );
				}
				if ( ! _.isFunction( callback ) )
				{
					return reject( `${ this.constructor.name }.unsubscribe invalid callback` );
				}

				/**
				 * 	unsubscribe
				 */
				this.redis.unsubscribe( channel, ( err ) =>
				{
					if ( err )
					{
						//
						//	Just like other commands, subscribe() can fail for some reasons,
						//	e.g.: network issues.
						//
						return reject( `${ this.constructor.name }.unsubscribe failed to unsubscribe: ${ err.message }` );
					}

					//	...
					resolve( true );
				});
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}
}
