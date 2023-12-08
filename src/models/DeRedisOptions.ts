export interface DeRedisOptions
{
	port ?: number;		//	Redis port, default : 6379
	host ?: string;		//	Redis host, default : '127.0.0.1'
	username ?: string;	//	needs Redis >= 6
	password ?: string;	//	default
	db ?: number;		//	database, default : to 0
}
