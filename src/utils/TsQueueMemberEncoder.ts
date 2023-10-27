import { TsQueueMember } from "../models/TsQueueModels";
import { TypeUtil } from "denetwork-utils";

export class TsQueueMemberEncoder
{
	/**
	 *	@param member	{TsQueueMember}
	 *	@returns {string | null}
	 */
	public static encode( member : TsQueueMember ) : string | null
	{
		try
		{
			if ( ! TypeUtil.isObject( member.data ) )
			{
				member.data = {};
			}

			//	...
			return JSON.stringify( member );
		}
		catch ( err )
		{
			return null;
		}
	}

	/**
	 *	@param json	{string}
	 *	@returns {TsQueueMember | null}
	 */
	public static decode( json : string ) : TsQueueMember | null
	{
		try
		{
			const decoded : any = JSON.parse( json );
			if ( decoded && this.isValidTsQueueMember( decoded ) )
			{
				return {
					channel : decoded.channel,
					timestamp : decoded.timestamp,
					data : decoded.data,
				}
			}
		}
		catch ( err )
		{
		}

		return null;
	}

	/**
	 *	@param value	{any}
	 *	@returns {boolean}
	 */
	public static isValidTsQueueMember( value : any ) : boolean
	{
		return value &&
			TypeUtil.isNotNullObjectWithKeys( value, [ 'channel', 'timestamp', 'data' ] ) &&
			TypeUtil.isNotEmptyString( value.channel ) &&
			TypeUtil.isNumeric( value.timestamp ) &&
			TypeUtil.isObject( value.data )
		;
	}
}
