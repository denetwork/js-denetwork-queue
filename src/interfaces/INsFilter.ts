/**
 * 	@interface
 * 	@description namespace filter
 */
export interface INsFilter
{
	add( namespace : string, hash : string ) : Promise<number>;
	has( namespace : string, hash : string ) : Promise<boolean>;
}
