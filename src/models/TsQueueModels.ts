export enum TsQueuePullOrder
{
	/**
	 * 	sort by score in ascending order
	 */
	ASC = 1,

	/**
	 * 	sort by score in descending order
	 */
	DESC = 2
}

export type TsQueueMember =
{
	channel : string,
	timestamp : number,
	data : object,
};

export type TsQueuePullOptions =
{
	pageNo ?: number,
	pageSize ?: number,
	pageKey ?: number,

	/**
	 * 	direction of sorting by score value
	 */
	order ?: TsQueuePullOrder
};

export type TsQueuePullResult =
{
	total : number,
	pageKey : number,
	list : Array< TsQueueMember | null >,
};
