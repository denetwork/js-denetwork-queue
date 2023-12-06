import _ from "lodash";
import { TsQueueConnectOptions } from "../models/TsQueueModels";
import { BaseRedis } from "./BaseRedis";

/**
 *	@class
 */
export class ChPubService extends BaseRedis
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
	 *	@param message		{any}
	 *	@returns {Promise<boolean>}
	 */
	public publish( channel : string, message : any ) : Promise<boolean>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				if ( ! this.redis )
				{
					return reject( `${ this.constructor.name }.publish not initialized` );
				}
				if ( ! _.isString( channel ) || _.isEmpty( channel ) )
				{
					return reject( `${ this.constructor.name }.publish invalid channel` );
				}

				if ( _.isObject( message ) )
				{
					message = JSON.stringify( message );
				}
				if ( ! _.isString( message ) || _.isEmpty( message ) )
				{
					return reject( `${ this.constructor.name }.publish invalid message` );
				}

				/**
				 * 	publish
				 */
				await this.redis.publish( channel, message );

				//	...
				resolve( true );
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}
}
