const Redis = require( 'ioredis' );
const redis = new Redis();

const key = 'mykey';
const value = 'myvalue';
const expireInSeconds = 3; // 设置为60秒

// 设置 key 的值
redis.setnx( key, value ).then( result =>
{
	console.log( `setnx 1 result : `, result );

} ).catch( error =>
{
	console.log( `error in setnx 1: `, error );
} );

redis.setnx( key, value ).then( result =>
{
	console.log( `setnx 2 result : `, result );

} ).catch( error =>
{
	console.log( `error in setnx 2: `, error );
} );


//	setup the expire for the key
redis.expire( key, expireInSeconds ).then( result =>
{
	console.log( `redis.expire result: ${ result }` );

} ).catch( error =>
{
	console.error( `error in redis.expire: ${ error }` );
} );


//	set a timer and then check if the key exits
setTimeout( () =>
{
	redis.exists( key )
		.then( result =>
		{
			console.log( `key exists: ${ result }` );
		} )
		.finally( () =>
		{
			redis.quit();
		} );
}, 5000 );
