/**
 * 	define
 */
export type ChSubCallback = ( channel: string, message: string | object | null, options ?: any ) => void;

export interface ChSubOptions
{
	parseJSON ?: boolean
}
