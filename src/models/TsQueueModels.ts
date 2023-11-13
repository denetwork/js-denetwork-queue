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

export type TsQueueConnectOptions =
{
	port ?: number,		// Redis port, default : 6379
	host ?: string,		// Redis host, default : '127.0.0.1'
	username ?: string,	// needs Redis >= 6
	password ?: string,
	db ?: number,		// database, default : to 0
}
