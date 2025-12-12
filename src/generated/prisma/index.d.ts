
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Service
 * 
 */
export type Service = $Result.DefaultSelection<Prisma.$ServicePayload>
/**
 * Model Visitor
 * 
 */
export type Visitor = $Result.DefaultSelection<Prisma.$VisitorPayload>
/**
 * Model Queue
 * 
 */
export type Queue = $Result.DefaultSelection<Prisma.$QueuePayload>
/**
 * Model QRCode
 * 
 */
export type QRCode = $Result.DefaultSelection<Prisma.$QRCodePayload>
/**
 * Model TempVisitorLink
 * 
 */
export type TempVisitorLink = $Result.DefaultSelection<Prisma.$TempVisitorLinkPayload>
/**
 * Model Notification
 * 
 */
export type Notification = $Result.DefaultSelection<Prisma.$NotificationPayload>
/**
 * Model Guest
 * 
 */
export type Guest = $Result.DefaultSelection<Prisma.$GuestPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const Role: {
  SUPERADMIN: 'SUPERADMIN',
  ADMIN: 'ADMIN'
};

export type Role = (typeof Role)[keyof typeof Role]


export const QueueStatus: {
  WAITING: 'WAITING',
  SERVING: 'SERVING',
  COMPLETED: 'COMPLETED',
  CANCELED: 'CANCELED'
};

export type QueueStatus = (typeof QueueStatus)[keyof typeof QueueStatus]


export const ServiceStatus: {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
};

export type ServiceStatus = (typeof ServiceStatus)[keyof typeof ServiceStatus]


export const QueueType: {
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE'
};

export type QueueType = (typeof QueueType)[keyof typeof QueueType]


export const Gender: {
  MALE: 'MALE',
  FEMALE: 'FEMALE'
};

export type Gender = (typeof Gender)[keyof typeof Gender]


export const LastEducation: {
  SD: 'SD',
  SMP: 'SMP',
  SMA_SMK: 'SMA_SMK',
  D1: 'D1',
  D2: 'D2',
  D3: 'D3',
  D4_S1: 'D4_S1',
  S2: 'S2',
  S3: 'S3',
  LAINNYA: 'LAINNYA'
};

export type LastEducation = (typeof LastEducation)[keyof typeof LastEducation]


export const Purpose: {
  KONSULTASI_STATISTIK: 'KONSULTASI_STATISTIK',
  PERPUSTAKAAN: 'PERPUSTAKAAN',
  REKOMENDASI_STATISTIK: 'REKOMENDASI_STATISTIK',
  LAINNYA: 'LAINNYA'
};

export type Purpose = (typeof Purpose)[keyof typeof Purpose]

}

export type Role = $Enums.Role

export const Role: typeof $Enums.Role

export type QueueStatus = $Enums.QueueStatus

export const QueueStatus: typeof $Enums.QueueStatus

export type ServiceStatus = $Enums.ServiceStatus

export const ServiceStatus: typeof $Enums.ServiceStatus

export type QueueType = $Enums.QueueType

export const QueueType: typeof $Enums.QueueType

export type Gender = $Enums.Gender

export const Gender: typeof $Enums.Gender

export type LastEducation = $Enums.LastEducation

export const LastEducation: typeof $Enums.LastEducation

export type Purpose = $Enums.Purpose

export const Purpose: typeof $Enums.Purpose

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.service`: Exposes CRUD operations for the **Service** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Services
    * const services = await prisma.service.findMany()
    * ```
    */
  get service(): Prisma.ServiceDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.visitor`: Exposes CRUD operations for the **Visitor** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Visitors
    * const visitors = await prisma.visitor.findMany()
    * ```
    */
  get visitor(): Prisma.VisitorDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.queue`: Exposes CRUD operations for the **Queue** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Queues
    * const queues = await prisma.queue.findMany()
    * ```
    */
  get queue(): Prisma.QueueDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.qRCode`: Exposes CRUD operations for the **QRCode** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more QRCodes
    * const qRCodes = await prisma.qRCode.findMany()
    * ```
    */
  get qRCode(): Prisma.QRCodeDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tempVisitorLink`: Exposes CRUD operations for the **TempVisitorLink** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TempVisitorLinks
    * const tempVisitorLinks = await prisma.tempVisitorLink.findMany()
    * ```
    */
  get tempVisitorLink(): Prisma.TempVisitorLinkDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.notification`: Exposes CRUD operations for the **Notification** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Notifications
    * const notifications = await prisma.notification.findMany()
    * ```
    */
  get notification(): Prisma.NotificationDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.guest`: Exposes CRUD operations for the **Guest** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Guests
    * const guests = await prisma.guest.findMany()
    * ```
    */
  get guest(): Prisma.GuestDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.19.1
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    Service: 'Service',
    Visitor: 'Visitor',
    Queue: 'Queue',
    QRCode: 'QRCode',
    TempVisitorLink: 'TempVisitorLink',
    Notification: 'Notification',
    Guest: 'Guest'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "service" | "visitor" | "queue" | "qRCode" | "tempVisitorLink" | "notification" | "guest"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Service: {
        payload: Prisma.$ServicePayload<ExtArgs>
        fields: Prisma.ServiceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ServiceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ServiceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicePayload>
          }
          findFirst: {
            args: Prisma.ServiceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ServiceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicePayload>
          }
          findMany: {
            args: Prisma.ServiceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicePayload>[]
          }
          create: {
            args: Prisma.ServiceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicePayload>
          }
          createMany: {
            args: Prisma.ServiceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ServiceCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicePayload>[]
          }
          delete: {
            args: Prisma.ServiceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicePayload>
          }
          update: {
            args: Prisma.ServiceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicePayload>
          }
          deleteMany: {
            args: Prisma.ServiceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ServiceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ServiceUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicePayload>[]
          }
          upsert: {
            args: Prisma.ServiceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicePayload>
          }
          aggregate: {
            args: Prisma.ServiceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateService>
          }
          groupBy: {
            args: Prisma.ServiceGroupByArgs<ExtArgs>
            result: $Utils.Optional<ServiceGroupByOutputType>[]
          }
          count: {
            args: Prisma.ServiceCountArgs<ExtArgs>
            result: $Utils.Optional<ServiceCountAggregateOutputType> | number
          }
        }
      }
      Visitor: {
        payload: Prisma.$VisitorPayload<ExtArgs>
        fields: Prisma.VisitorFieldRefs
        operations: {
          findUnique: {
            args: Prisma.VisitorFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VisitorPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.VisitorFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VisitorPayload>
          }
          findFirst: {
            args: Prisma.VisitorFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VisitorPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.VisitorFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VisitorPayload>
          }
          findMany: {
            args: Prisma.VisitorFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VisitorPayload>[]
          }
          create: {
            args: Prisma.VisitorCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VisitorPayload>
          }
          createMany: {
            args: Prisma.VisitorCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.VisitorCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VisitorPayload>[]
          }
          delete: {
            args: Prisma.VisitorDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VisitorPayload>
          }
          update: {
            args: Prisma.VisitorUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VisitorPayload>
          }
          deleteMany: {
            args: Prisma.VisitorDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.VisitorUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.VisitorUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VisitorPayload>[]
          }
          upsert: {
            args: Prisma.VisitorUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VisitorPayload>
          }
          aggregate: {
            args: Prisma.VisitorAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateVisitor>
          }
          groupBy: {
            args: Prisma.VisitorGroupByArgs<ExtArgs>
            result: $Utils.Optional<VisitorGroupByOutputType>[]
          }
          count: {
            args: Prisma.VisitorCountArgs<ExtArgs>
            result: $Utils.Optional<VisitorCountAggregateOutputType> | number
          }
        }
      }
      Queue: {
        payload: Prisma.$QueuePayload<ExtArgs>
        fields: Prisma.QueueFieldRefs
        operations: {
          findUnique: {
            args: Prisma.QueueFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QueuePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.QueueFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QueuePayload>
          }
          findFirst: {
            args: Prisma.QueueFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QueuePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.QueueFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QueuePayload>
          }
          findMany: {
            args: Prisma.QueueFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QueuePayload>[]
          }
          create: {
            args: Prisma.QueueCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QueuePayload>
          }
          createMany: {
            args: Prisma.QueueCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.QueueCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QueuePayload>[]
          }
          delete: {
            args: Prisma.QueueDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QueuePayload>
          }
          update: {
            args: Prisma.QueueUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QueuePayload>
          }
          deleteMany: {
            args: Prisma.QueueDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.QueueUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.QueueUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QueuePayload>[]
          }
          upsert: {
            args: Prisma.QueueUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QueuePayload>
          }
          aggregate: {
            args: Prisma.QueueAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateQueue>
          }
          groupBy: {
            args: Prisma.QueueGroupByArgs<ExtArgs>
            result: $Utils.Optional<QueueGroupByOutputType>[]
          }
          count: {
            args: Prisma.QueueCountArgs<ExtArgs>
            result: $Utils.Optional<QueueCountAggregateOutputType> | number
          }
        }
      }
      QRCode: {
        payload: Prisma.$QRCodePayload<ExtArgs>
        fields: Prisma.QRCodeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.QRCodeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QRCodePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.QRCodeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QRCodePayload>
          }
          findFirst: {
            args: Prisma.QRCodeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QRCodePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.QRCodeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QRCodePayload>
          }
          findMany: {
            args: Prisma.QRCodeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QRCodePayload>[]
          }
          create: {
            args: Prisma.QRCodeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QRCodePayload>
          }
          createMany: {
            args: Prisma.QRCodeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.QRCodeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QRCodePayload>[]
          }
          delete: {
            args: Prisma.QRCodeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QRCodePayload>
          }
          update: {
            args: Prisma.QRCodeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QRCodePayload>
          }
          deleteMany: {
            args: Prisma.QRCodeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.QRCodeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.QRCodeUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QRCodePayload>[]
          }
          upsert: {
            args: Prisma.QRCodeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QRCodePayload>
          }
          aggregate: {
            args: Prisma.QRCodeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateQRCode>
          }
          groupBy: {
            args: Prisma.QRCodeGroupByArgs<ExtArgs>
            result: $Utils.Optional<QRCodeGroupByOutputType>[]
          }
          count: {
            args: Prisma.QRCodeCountArgs<ExtArgs>
            result: $Utils.Optional<QRCodeCountAggregateOutputType> | number
          }
        }
      }
      TempVisitorLink: {
        payload: Prisma.$TempVisitorLinkPayload<ExtArgs>
        fields: Prisma.TempVisitorLinkFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TempVisitorLinkFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TempVisitorLinkPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TempVisitorLinkFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TempVisitorLinkPayload>
          }
          findFirst: {
            args: Prisma.TempVisitorLinkFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TempVisitorLinkPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TempVisitorLinkFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TempVisitorLinkPayload>
          }
          findMany: {
            args: Prisma.TempVisitorLinkFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TempVisitorLinkPayload>[]
          }
          create: {
            args: Prisma.TempVisitorLinkCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TempVisitorLinkPayload>
          }
          createMany: {
            args: Prisma.TempVisitorLinkCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TempVisitorLinkCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TempVisitorLinkPayload>[]
          }
          delete: {
            args: Prisma.TempVisitorLinkDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TempVisitorLinkPayload>
          }
          update: {
            args: Prisma.TempVisitorLinkUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TempVisitorLinkPayload>
          }
          deleteMany: {
            args: Prisma.TempVisitorLinkDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TempVisitorLinkUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TempVisitorLinkUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TempVisitorLinkPayload>[]
          }
          upsert: {
            args: Prisma.TempVisitorLinkUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TempVisitorLinkPayload>
          }
          aggregate: {
            args: Prisma.TempVisitorLinkAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTempVisitorLink>
          }
          groupBy: {
            args: Prisma.TempVisitorLinkGroupByArgs<ExtArgs>
            result: $Utils.Optional<TempVisitorLinkGroupByOutputType>[]
          }
          count: {
            args: Prisma.TempVisitorLinkCountArgs<ExtArgs>
            result: $Utils.Optional<TempVisitorLinkCountAggregateOutputType> | number
          }
        }
      }
      Notification: {
        payload: Prisma.$NotificationPayload<ExtArgs>
        fields: Prisma.NotificationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.NotificationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.NotificationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          findFirst: {
            args: Prisma.NotificationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.NotificationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          findMany: {
            args: Prisma.NotificationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>[]
          }
          create: {
            args: Prisma.NotificationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          createMany: {
            args: Prisma.NotificationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.NotificationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>[]
          }
          delete: {
            args: Prisma.NotificationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          update: {
            args: Prisma.NotificationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          deleteMany: {
            args: Prisma.NotificationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.NotificationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.NotificationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>[]
          }
          upsert: {
            args: Prisma.NotificationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          aggregate: {
            args: Prisma.NotificationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateNotification>
          }
          groupBy: {
            args: Prisma.NotificationGroupByArgs<ExtArgs>
            result: $Utils.Optional<NotificationGroupByOutputType>[]
          }
          count: {
            args: Prisma.NotificationCountArgs<ExtArgs>
            result: $Utils.Optional<NotificationCountAggregateOutputType> | number
          }
        }
      }
      Guest: {
        payload: Prisma.$GuestPayload<ExtArgs>
        fields: Prisma.GuestFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GuestFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuestPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GuestFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuestPayload>
          }
          findFirst: {
            args: Prisma.GuestFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuestPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GuestFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuestPayload>
          }
          findMany: {
            args: Prisma.GuestFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuestPayload>[]
          }
          create: {
            args: Prisma.GuestCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuestPayload>
          }
          createMany: {
            args: Prisma.GuestCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.GuestCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuestPayload>[]
          }
          delete: {
            args: Prisma.GuestDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuestPayload>
          }
          update: {
            args: Prisma.GuestUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuestPayload>
          }
          deleteMany: {
            args: Prisma.GuestDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GuestUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.GuestUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuestPayload>[]
          }
          upsert: {
            args: Prisma.GuestUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuestPayload>
          }
          aggregate: {
            args: Prisma.GuestAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGuest>
          }
          groupBy: {
            args: Prisma.GuestGroupByArgs<ExtArgs>
            result: $Utils.Optional<GuestGroupByOutputType>[]
          }
          count: {
            args: Prisma.GuestCountArgs<ExtArgs>
            result: $Utils.Optional<GuestCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    service?: ServiceOmit
    visitor?: VisitorOmit
    queue?: QueueOmit
    qRCode?: QRCodeOmit
    tempVisitorLink?: TempVisitorLinkOmit
    notification?: NotificationOmit
    guest?: GuestOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    queues: number
    notifications: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    queues?: boolean | UserCountOutputTypeCountQueuesArgs
    notifications?: boolean | UserCountOutputTypeCountNotificationsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountQueuesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: QueueWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountNotificationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: NotificationWhereInput
  }


  /**
   * Count Type ServiceCountOutputType
   */

  export type ServiceCountOutputType = {
    queues: number
  }

  export type ServiceCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    queues?: boolean | ServiceCountOutputTypeCountQueuesArgs
  }

  // Custom InputTypes
  /**
   * ServiceCountOutputType without action
   */
  export type ServiceCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceCountOutputType
     */
    select?: ServiceCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ServiceCountOutputType without action
   */
  export type ServiceCountOutputTypeCountQueuesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: QueueWhereInput
  }


  /**
   * Count Type VisitorCountOutputType
   */

  export type VisitorCountOutputType = {
    queues: number
  }

  export type VisitorCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    queues?: boolean | VisitorCountOutputTypeCountQueuesArgs
  }

  // Custom InputTypes
  /**
   * VisitorCountOutputType without action
   */
  export type VisitorCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VisitorCountOutputType
     */
    select?: VisitorCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * VisitorCountOutputType without action
   */
  export type VisitorCountOutputTypeCountQueuesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: QueueWhereInput
  }


  /**
   * Count Type GuestCountOutputType
   */

  export type GuestCountOutputType = {
    queues: number
  }

  export type GuestCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    queues?: boolean | GuestCountOutputTypeCountQueuesArgs
  }

  // Custom InputTypes
  /**
   * GuestCountOutputType without action
   */
  export type GuestCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GuestCountOutputType
     */
    select?: GuestCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * GuestCountOutputType without action
   */
  export type GuestCountOutputTypeCountQueuesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: QueueWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    username: string | null
    password: string | null
    name: string | null
    role: $Enums.Role | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    username: string | null
    password: string | null
    name: string | null
    role: $Enums.Role | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    username: number
    password: number
    name: number
    role: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    username?: true
    password?: true
    name?: true
    role?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    username?: true
    password?: true
    name?: true
    role?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    username?: true
    password?: true
    name?: true
    role?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    username: string
    password: string
    name: string
    role: $Enums.Role
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    username?: boolean
    password?: boolean
    name?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    queues?: boolean | User$queuesArgs<ExtArgs>
    notifications?: boolean | User$notificationsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    username?: boolean
    password?: boolean
    name?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    username?: boolean
    password?: boolean
    name?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    username?: boolean
    password?: boolean
    name?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "username" | "password" | "name" | "role" | "createdAt" | "updatedAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    queues?: boolean | User$queuesArgs<ExtArgs>
    notifications?: boolean | User$notificationsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      queues: Prisma.$QueuePayload<ExtArgs>[]
      notifications: Prisma.$NotificationPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      username: string
      password: string
      name: string
      role: $Enums.Role
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    queues<T extends User$queuesArgs<ExtArgs> = {}>(args?: Subset<T, User$queuesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$QueuePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    notifications<T extends User$notificationsArgs<ExtArgs> = {}>(args?: Subset<T, User$notificationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly username: FieldRef<"User", 'String'>
    readonly password: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'Role'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.queues
   */
  export type User$queuesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Queue
     */
    select?: QueueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Queue
     */
    omit?: QueueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QueueInclude<ExtArgs> | null
    where?: QueueWhereInput
    orderBy?: QueueOrderByWithRelationInput | QueueOrderByWithRelationInput[]
    cursor?: QueueWhereUniqueInput
    take?: number
    skip?: number
    distinct?: QueueScalarFieldEnum | QueueScalarFieldEnum[]
  }

  /**
   * User.notifications
   */
  export type User$notificationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    where?: NotificationWhereInput
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    cursor?: NotificationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: NotificationScalarFieldEnum | NotificationScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Service
   */

  export type AggregateService = {
    _count: ServiceCountAggregateOutputType | null
    _min: ServiceMinAggregateOutputType | null
    _max: ServiceMaxAggregateOutputType | null
  }

  export type ServiceMinAggregateOutputType = {
    id: string | null
    name: string | null
    status: $Enums.ServiceStatus | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ServiceMaxAggregateOutputType = {
    id: string | null
    name: string | null
    status: $Enums.ServiceStatus | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ServiceCountAggregateOutputType = {
    id: number
    name: number
    status: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ServiceMinAggregateInputType = {
    id?: true
    name?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ServiceMaxAggregateInputType = {
    id?: true
    name?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ServiceCountAggregateInputType = {
    id?: true
    name?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ServiceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Service to aggregate.
     */
    where?: ServiceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Services to fetch.
     */
    orderBy?: ServiceOrderByWithRelationInput | ServiceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ServiceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Services from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Services.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Services
    **/
    _count?: true | ServiceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ServiceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ServiceMaxAggregateInputType
  }

  export type GetServiceAggregateType<T extends ServiceAggregateArgs> = {
        [P in keyof T & keyof AggregateService]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateService[P]>
      : GetScalarType<T[P], AggregateService[P]>
  }




  export type ServiceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ServiceWhereInput
    orderBy?: ServiceOrderByWithAggregationInput | ServiceOrderByWithAggregationInput[]
    by: ServiceScalarFieldEnum[] | ServiceScalarFieldEnum
    having?: ServiceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ServiceCountAggregateInputType | true
    _min?: ServiceMinAggregateInputType
    _max?: ServiceMaxAggregateInputType
  }

  export type ServiceGroupByOutputType = {
    id: string
    name: string
    status: $Enums.ServiceStatus
    createdAt: Date
    updatedAt: Date
    _count: ServiceCountAggregateOutputType | null
    _min: ServiceMinAggregateOutputType | null
    _max: ServiceMaxAggregateOutputType | null
  }

  type GetServiceGroupByPayload<T extends ServiceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ServiceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ServiceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ServiceGroupByOutputType[P]>
            : GetScalarType<T[P], ServiceGroupByOutputType[P]>
        }
      >
    >


  export type ServiceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    queues?: boolean | Service$queuesArgs<ExtArgs>
    _count?: boolean | ServiceCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["service"]>

  export type ServiceSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["service"]>

  export type ServiceSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["service"]>

  export type ServiceSelectScalar = {
    id?: boolean
    name?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ServiceOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "status" | "createdAt" | "updatedAt", ExtArgs["result"]["service"]>
  export type ServiceInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    queues?: boolean | Service$queuesArgs<ExtArgs>
    _count?: boolean | ServiceCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ServiceIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type ServiceIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ServicePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Service"
    objects: {
      queues: Prisma.$QueuePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      status: $Enums.ServiceStatus
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["service"]>
    composites: {}
  }

  type ServiceGetPayload<S extends boolean | null | undefined | ServiceDefaultArgs> = $Result.GetResult<Prisma.$ServicePayload, S>

  type ServiceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ServiceFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ServiceCountAggregateInputType | true
    }

  export interface ServiceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Service'], meta: { name: 'Service' } }
    /**
     * Find zero or one Service that matches the filter.
     * @param {ServiceFindUniqueArgs} args - Arguments to find a Service
     * @example
     * // Get one Service
     * const service = await prisma.service.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ServiceFindUniqueArgs>(args: SelectSubset<T, ServiceFindUniqueArgs<ExtArgs>>): Prisma__ServiceClient<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Service that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ServiceFindUniqueOrThrowArgs} args - Arguments to find a Service
     * @example
     * // Get one Service
     * const service = await prisma.service.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ServiceFindUniqueOrThrowArgs>(args: SelectSubset<T, ServiceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ServiceClient<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Service that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceFindFirstArgs} args - Arguments to find a Service
     * @example
     * // Get one Service
     * const service = await prisma.service.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ServiceFindFirstArgs>(args?: SelectSubset<T, ServiceFindFirstArgs<ExtArgs>>): Prisma__ServiceClient<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Service that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceFindFirstOrThrowArgs} args - Arguments to find a Service
     * @example
     * // Get one Service
     * const service = await prisma.service.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ServiceFindFirstOrThrowArgs>(args?: SelectSubset<T, ServiceFindFirstOrThrowArgs<ExtArgs>>): Prisma__ServiceClient<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Services that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Services
     * const services = await prisma.service.findMany()
     * 
     * // Get first 10 Services
     * const services = await prisma.service.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const serviceWithIdOnly = await prisma.service.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ServiceFindManyArgs>(args?: SelectSubset<T, ServiceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Service.
     * @param {ServiceCreateArgs} args - Arguments to create a Service.
     * @example
     * // Create one Service
     * const Service = await prisma.service.create({
     *   data: {
     *     // ... data to create a Service
     *   }
     * })
     * 
     */
    create<T extends ServiceCreateArgs>(args: SelectSubset<T, ServiceCreateArgs<ExtArgs>>): Prisma__ServiceClient<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Services.
     * @param {ServiceCreateManyArgs} args - Arguments to create many Services.
     * @example
     * // Create many Services
     * const service = await prisma.service.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ServiceCreateManyArgs>(args?: SelectSubset<T, ServiceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Services and returns the data saved in the database.
     * @param {ServiceCreateManyAndReturnArgs} args - Arguments to create many Services.
     * @example
     * // Create many Services
     * const service = await prisma.service.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Services and only return the `id`
     * const serviceWithIdOnly = await prisma.service.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ServiceCreateManyAndReturnArgs>(args?: SelectSubset<T, ServiceCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Service.
     * @param {ServiceDeleteArgs} args - Arguments to delete one Service.
     * @example
     * // Delete one Service
     * const Service = await prisma.service.delete({
     *   where: {
     *     // ... filter to delete one Service
     *   }
     * })
     * 
     */
    delete<T extends ServiceDeleteArgs>(args: SelectSubset<T, ServiceDeleteArgs<ExtArgs>>): Prisma__ServiceClient<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Service.
     * @param {ServiceUpdateArgs} args - Arguments to update one Service.
     * @example
     * // Update one Service
     * const service = await prisma.service.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ServiceUpdateArgs>(args: SelectSubset<T, ServiceUpdateArgs<ExtArgs>>): Prisma__ServiceClient<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Services.
     * @param {ServiceDeleteManyArgs} args - Arguments to filter Services to delete.
     * @example
     * // Delete a few Services
     * const { count } = await prisma.service.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ServiceDeleteManyArgs>(args?: SelectSubset<T, ServiceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Services.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Services
     * const service = await prisma.service.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ServiceUpdateManyArgs>(args: SelectSubset<T, ServiceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Services and returns the data updated in the database.
     * @param {ServiceUpdateManyAndReturnArgs} args - Arguments to update many Services.
     * @example
     * // Update many Services
     * const service = await prisma.service.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Services and only return the `id`
     * const serviceWithIdOnly = await prisma.service.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ServiceUpdateManyAndReturnArgs>(args: SelectSubset<T, ServiceUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Service.
     * @param {ServiceUpsertArgs} args - Arguments to update or create a Service.
     * @example
     * // Update or create a Service
     * const service = await prisma.service.upsert({
     *   create: {
     *     // ... data to create a Service
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Service we want to update
     *   }
     * })
     */
    upsert<T extends ServiceUpsertArgs>(args: SelectSubset<T, ServiceUpsertArgs<ExtArgs>>): Prisma__ServiceClient<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Services.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceCountArgs} args - Arguments to filter Services to count.
     * @example
     * // Count the number of Services
     * const count = await prisma.service.count({
     *   where: {
     *     // ... the filter for the Services we want to count
     *   }
     * })
    **/
    count<T extends ServiceCountArgs>(
      args?: Subset<T, ServiceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ServiceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Service.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ServiceAggregateArgs>(args: Subset<T, ServiceAggregateArgs>): Prisma.PrismaPromise<GetServiceAggregateType<T>>

    /**
     * Group by Service.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ServiceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ServiceGroupByArgs['orderBy'] }
        : { orderBy?: ServiceGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ServiceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetServiceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Service model
   */
  readonly fields: ServiceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Service.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ServiceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    queues<T extends Service$queuesArgs<ExtArgs> = {}>(args?: Subset<T, Service$queuesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$QueuePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Service model
   */
  interface ServiceFieldRefs {
    readonly id: FieldRef<"Service", 'String'>
    readonly name: FieldRef<"Service", 'String'>
    readonly status: FieldRef<"Service", 'ServiceStatus'>
    readonly createdAt: FieldRef<"Service", 'DateTime'>
    readonly updatedAt: FieldRef<"Service", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Service findUnique
   */
  export type ServiceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Service
     */
    omit?: ServiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceInclude<ExtArgs> | null
    /**
     * Filter, which Service to fetch.
     */
    where: ServiceWhereUniqueInput
  }

  /**
   * Service findUniqueOrThrow
   */
  export type ServiceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Service
     */
    omit?: ServiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceInclude<ExtArgs> | null
    /**
     * Filter, which Service to fetch.
     */
    where: ServiceWhereUniqueInput
  }

  /**
   * Service findFirst
   */
  export type ServiceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Service
     */
    omit?: ServiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceInclude<ExtArgs> | null
    /**
     * Filter, which Service to fetch.
     */
    where?: ServiceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Services to fetch.
     */
    orderBy?: ServiceOrderByWithRelationInput | ServiceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Services.
     */
    cursor?: ServiceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Services from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Services.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Services.
     */
    distinct?: ServiceScalarFieldEnum | ServiceScalarFieldEnum[]
  }

  /**
   * Service findFirstOrThrow
   */
  export type ServiceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Service
     */
    omit?: ServiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceInclude<ExtArgs> | null
    /**
     * Filter, which Service to fetch.
     */
    where?: ServiceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Services to fetch.
     */
    orderBy?: ServiceOrderByWithRelationInput | ServiceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Services.
     */
    cursor?: ServiceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Services from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Services.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Services.
     */
    distinct?: ServiceScalarFieldEnum | ServiceScalarFieldEnum[]
  }

  /**
   * Service findMany
   */
  export type ServiceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Service
     */
    omit?: ServiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceInclude<ExtArgs> | null
    /**
     * Filter, which Services to fetch.
     */
    where?: ServiceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Services to fetch.
     */
    orderBy?: ServiceOrderByWithRelationInput | ServiceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Services.
     */
    cursor?: ServiceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Services from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Services.
     */
    skip?: number
    distinct?: ServiceScalarFieldEnum | ServiceScalarFieldEnum[]
  }

  /**
   * Service create
   */
  export type ServiceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Service
     */
    omit?: ServiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceInclude<ExtArgs> | null
    /**
     * The data needed to create a Service.
     */
    data: XOR<ServiceCreateInput, ServiceUncheckedCreateInput>
  }

  /**
   * Service createMany
   */
  export type ServiceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Services.
     */
    data: ServiceCreateManyInput | ServiceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Service createManyAndReturn
   */
  export type ServiceCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Service
     */
    omit?: ServiceOmit<ExtArgs> | null
    /**
     * The data used to create many Services.
     */
    data: ServiceCreateManyInput | ServiceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Service update
   */
  export type ServiceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Service
     */
    omit?: ServiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceInclude<ExtArgs> | null
    /**
     * The data needed to update a Service.
     */
    data: XOR<ServiceUpdateInput, ServiceUncheckedUpdateInput>
    /**
     * Choose, which Service to update.
     */
    where: ServiceWhereUniqueInput
  }

  /**
   * Service updateMany
   */
  export type ServiceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Services.
     */
    data: XOR<ServiceUpdateManyMutationInput, ServiceUncheckedUpdateManyInput>
    /**
     * Filter which Services to update
     */
    where?: ServiceWhereInput
    /**
     * Limit how many Services to update.
     */
    limit?: number
  }

  /**
   * Service updateManyAndReturn
   */
  export type ServiceUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Service
     */
    omit?: ServiceOmit<ExtArgs> | null
    /**
     * The data used to update Services.
     */
    data: XOR<ServiceUpdateManyMutationInput, ServiceUncheckedUpdateManyInput>
    /**
     * Filter which Services to update
     */
    where?: ServiceWhereInput
    /**
     * Limit how many Services to update.
     */
    limit?: number
  }

  /**
   * Service upsert
   */
  export type ServiceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Service
     */
    omit?: ServiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceInclude<ExtArgs> | null
    /**
     * The filter to search for the Service to update in case it exists.
     */
    where: ServiceWhereUniqueInput
    /**
     * In case the Service found by the `where` argument doesn't exist, create a new Service with this data.
     */
    create: XOR<ServiceCreateInput, ServiceUncheckedCreateInput>
    /**
     * In case the Service was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ServiceUpdateInput, ServiceUncheckedUpdateInput>
  }

  /**
   * Service delete
   */
  export type ServiceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Service
     */
    omit?: ServiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceInclude<ExtArgs> | null
    /**
     * Filter which Service to delete.
     */
    where: ServiceWhereUniqueInput
  }

  /**
   * Service deleteMany
   */
  export type ServiceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Services to delete
     */
    where?: ServiceWhereInput
    /**
     * Limit how many Services to delete.
     */
    limit?: number
  }

  /**
   * Service.queues
   */
  export type Service$queuesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Queue
     */
    select?: QueueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Queue
     */
    omit?: QueueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QueueInclude<ExtArgs> | null
    where?: QueueWhereInput
    orderBy?: QueueOrderByWithRelationInput | QueueOrderByWithRelationInput[]
    cursor?: QueueWhereUniqueInput
    take?: number
    skip?: number
    distinct?: QueueScalarFieldEnum | QueueScalarFieldEnum[]
  }

  /**
   * Service without action
   */
  export type ServiceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Service
     */
    omit?: ServiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceInclude<ExtArgs> | null
  }


  /**
   * Model Visitor
   */

  export type AggregateVisitor = {
    _count: VisitorCountAggregateOutputType | null
    _avg: VisitorAvgAggregateOutputType | null
    _sum: VisitorSumAggregateOutputType | null
    _min: VisitorMinAggregateOutputType | null
    _max: VisitorMaxAggregateOutputType | null
  }

  export type VisitorAvgAggregateOutputType = {
    age: number | null
  }

  export type VisitorSumAggregateOutputType = {
    age: number | null
  }

  export type VisitorMinAggregateOutputType = {
    id: string | null
    name: string | null
    phone: string | null
    address: string | null
    age: number | null
    gender: $Enums.Gender | null
    lastEducation: $Enums.LastEducation | null
    occupation: string | null
    institution: string | null
    email: string | null
    purpose: $Enums.Purpose | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type VisitorMaxAggregateOutputType = {
    id: string | null
    name: string | null
    phone: string | null
    address: string | null
    age: number | null
    gender: $Enums.Gender | null
    lastEducation: $Enums.LastEducation | null
    occupation: string | null
    institution: string | null
    email: string | null
    purpose: $Enums.Purpose | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type VisitorCountAggregateOutputType = {
    id: number
    name: number
    phone: number
    address: number
    age: number
    gender: number
    lastEducation: number
    occupation: number
    institution: number
    email: number
    purpose: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type VisitorAvgAggregateInputType = {
    age?: true
  }

  export type VisitorSumAggregateInputType = {
    age?: true
  }

  export type VisitorMinAggregateInputType = {
    id?: true
    name?: true
    phone?: true
    address?: true
    age?: true
    gender?: true
    lastEducation?: true
    occupation?: true
    institution?: true
    email?: true
    purpose?: true
    createdAt?: true
    updatedAt?: true
  }

  export type VisitorMaxAggregateInputType = {
    id?: true
    name?: true
    phone?: true
    address?: true
    age?: true
    gender?: true
    lastEducation?: true
    occupation?: true
    institution?: true
    email?: true
    purpose?: true
    createdAt?: true
    updatedAt?: true
  }

  export type VisitorCountAggregateInputType = {
    id?: true
    name?: true
    phone?: true
    address?: true
    age?: true
    gender?: true
    lastEducation?: true
    occupation?: true
    institution?: true
    email?: true
    purpose?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type VisitorAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Visitor to aggregate.
     */
    where?: VisitorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Visitors to fetch.
     */
    orderBy?: VisitorOrderByWithRelationInput | VisitorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: VisitorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Visitors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Visitors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Visitors
    **/
    _count?: true | VisitorCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: VisitorAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: VisitorSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: VisitorMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: VisitorMaxAggregateInputType
  }

  export type GetVisitorAggregateType<T extends VisitorAggregateArgs> = {
        [P in keyof T & keyof AggregateVisitor]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateVisitor[P]>
      : GetScalarType<T[P], AggregateVisitor[P]>
  }




  export type VisitorGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VisitorWhereInput
    orderBy?: VisitorOrderByWithAggregationInput | VisitorOrderByWithAggregationInput[]
    by: VisitorScalarFieldEnum[] | VisitorScalarFieldEnum
    having?: VisitorScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: VisitorCountAggregateInputType | true
    _avg?: VisitorAvgAggregateInputType
    _sum?: VisitorSumAggregateInputType
    _min?: VisitorMinAggregateInputType
    _max?: VisitorMaxAggregateInputType
  }

  export type VisitorGroupByOutputType = {
    id: string
    name: string
    phone: string
    address: string | null
    age: number | null
    gender: $Enums.Gender | null
    lastEducation: $Enums.LastEducation | null
    occupation: string | null
    institution: string | null
    email: string | null
    purpose: $Enums.Purpose | null
    createdAt: Date
    updatedAt: Date
    _count: VisitorCountAggregateOutputType | null
    _avg: VisitorAvgAggregateOutputType | null
    _sum: VisitorSumAggregateOutputType | null
    _min: VisitorMinAggregateOutputType | null
    _max: VisitorMaxAggregateOutputType | null
  }

  type GetVisitorGroupByPayload<T extends VisitorGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<VisitorGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof VisitorGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], VisitorGroupByOutputType[P]>
            : GetScalarType<T[P], VisitorGroupByOutputType[P]>
        }
      >
    >


  export type VisitorSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    phone?: boolean
    address?: boolean
    age?: boolean
    gender?: boolean
    lastEducation?: boolean
    occupation?: boolean
    institution?: boolean
    email?: boolean
    purpose?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    queues?: boolean | Visitor$queuesArgs<ExtArgs>
    _count?: boolean | VisitorCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["visitor"]>

  export type VisitorSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    phone?: boolean
    address?: boolean
    age?: boolean
    gender?: boolean
    lastEducation?: boolean
    occupation?: boolean
    institution?: boolean
    email?: boolean
    purpose?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["visitor"]>

  export type VisitorSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    phone?: boolean
    address?: boolean
    age?: boolean
    gender?: boolean
    lastEducation?: boolean
    occupation?: boolean
    institution?: boolean
    email?: boolean
    purpose?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["visitor"]>

  export type VisitorSelectScalar = {
    id?: boolean
    name?: boolean
    phone?: boolean
    address?: boolean
    age?: boolean
    gender?: boolean
    lastEducation?: boolean
    occupation?: boolean
    institution?: boolean
    email?: boolean
    purpose?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type VisitorOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "phone" | "address" | "age" | "gender" | "lastEducation" | "occupation" | "institution" | "email" | "purpose" | "createdAt" | "updatedAt", ExtArgs["result"]["visitor"]>
  export type VisitorInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    queues?: boolean | Visitor$queuesArgs<ExtArgs>
    _count?: boolean | VisitorCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type VisitorIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type VisitorIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $VisitorPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Visitor"
    objects: {
      queues: Prisma.$QueuePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      phone: string
      address: string | null
      age: number | null
      gender: $Enums.Gender | null
      lastEducation: $Enums.LastEducation | null
      occupation: string | null
      institution: string | null
      email: string | null
      purpose: $Enums.Purpose | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["visitor"]>
    composites: {}
  }

  type VisitorGetPayload<S extends boolean | null | undefined | VisitorDefaultArgs> = $Result.GetResult<Prisma.$VisitorPayload, S>

  type VisitorCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<VisitorFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: VisitorCountAggregateInputType | true
    }

  export interface VisitorDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Visitor'], meta: { name: 'Visitor' } }
    /**
     * Find zero or one Visitor that matches the filter.
     * @param {VisitorFindUniqueArgs} args - Arguments to find a Visitor
     * @example
     * // Get one Visitor
     * const visitor = await prisma.visitor.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends VisitorFindUniqueArgs>(args: SelectSubset<T, VisitorFindUniqueArgs<ExtArgs>>): Prisma__VisitorClient<$Result.GetResult<Prisma.$VisitorPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Visitor that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {VisitorFindUniqueOrThrowArgs} args - Arguments to find a Visitor
     * @example
     * // Get one Visitor
     * const visitor = await prisma.visitor.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends VisitorFindUniqueOrThrowArgs>(args: SelectSubset<T, VisitorFindUniqueOrThrowArgs<ExtArgs>>): Prisma__VisitorClient<$Result.GetResult<Prisma.$VisitorPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Visitor that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VisitorFindFirstArgs} args - Arguments to find a Visitor
     * @example
     * // Get one Visitor
     * const visitor = await prisma.visitor.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends VisitorFindFirstArgs>(args?: SelectSubset<T, VisitorFindFirstArgs<ExtArgs>>): Prisma__VisitorClient<$Result.GetResult<Prisma.$VisitorPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Visitor that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VisitorFindFirstOrThrowArgs} args - Arguments to find a Visitor
     * @example
     * // Get one Visitor
     * const visitor = await prisma.visitor.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends VisitorFindFirstOrThrowArgs>(args?: SelectSubset<T, VisitorFindFirstOrThrowArgs<ExtArgs>>): Prisma__VisitorClient<$Result.GetResult<Prisma.$VisitorPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Visitors that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VisitorFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Visitors
     * const visitors = await prisma.visitor.findMany()
     * 
     * // Get first 10 Visitors
     * const visitors = await prisma.visitor.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const visitorWithIdOnly = await prisma.visitor.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends VisitorFindManyArgs>(args?: SelectSubset<T, VisitorFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VisitorPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Visitor.
     * @param {VisitorCreateArgs} args - Arguments to create a Visitor.
     * @example
     * // Create one Visitor
     * const Visitor = await prisma.visitor.create({
     *   data: {
     *     // ... data to create a Visitor
     *   }
     * })
     * 
     */
    create<T extends VisitorCreateArgs>(args: SelectSubset<T, VisitorCreateArgs<ExtArgs>>): Prisma__VisitorClient<$Result.GetResult<Prisma.$VisitorPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Visitors.
     * @param {VisitorCreateManyArgs} args - Arguments to create many Visitors.
     * @example
     * // Create many Visitors
     * const visitor = await prisma.visitor.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends VisitorCreateManyArgs>(args?: SelectSubset<T, VisitorCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Visitors and returns the data saved in the database.
     * @param {VisitorCreateManyAndReturnArgs} args - Arguments to create many Visitors.
     * @example
     * // Create many Visitors
     * const visitor = await prisma.visitor.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Visitors and only return the `id`
     * const visitorWithIdOnly = await prisma.visitor.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends VisitorCreateManyAndReturnArgs>(args?: SelectSubset<T, VisitorCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VisitorPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Visitor.
     * @param {VisitorDeleteArgs} args - Arguments to delete one Visitor.
     * @example
     * // Delete one Visitor
     * const Visitor = await prisma.visitor.delete({
     *   where: {
     *     // ... filter to delete one Visitor
     *   }
     * })
     * 
     */
    delete<T extends VisitorDeleteArgs>(args: SelectSubset<T, VisitorDeleteArgs<ExtArgs>>): Prisma__VisitorClient<$Result.GetResult<Prisma.$VisitorPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Visitor.
     * @param {VisitorUpdateArgs} args - Arguments to update one Visitor.
     * @example
     * // Update one Visitor
     * const visitor = await prisma.visitor.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends VisitorUpdateArgs>(args: SelectSubset<T, VisitorUpdateArgs<ExtArgs>>): Prisma__VisitorClient<$Result.GetResult<Prisma.$VisitorPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Visitors.
     * @param {VisitorDeleteManyArgs} args - Arguments to filter Visitors to delete.
     * @example
     * // Delete a few Visitors
     * const { count } = await prisma.visitor.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends VisitorDeleteManyArgs>(args?: SelectSubset<T, VisitorDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Visitors.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VisitorUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Visitors
     * const visitor = await prisma.visitor.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends VisitorUpdateManyArgs>(args: SelectSubset<T, VisitorUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Visitors and returns the data updated in the database.
     * @param {VisitorUpdateManyAndReturnArgs} args - Arguments to update many Visitors.
     * @example
     * // Update many Visitors
     * const visitor = await prisma.visitor.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Visitors and only return the `id`
     * const visitorWithIdOnly = await prisma.visitor.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends VisitorUpdateManyAndReturnArgs>(args: SelectSubset<T, VisitorUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VisitorPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Visitor.
     * @param {VisitorUpsertArgs} args - Arguments to update or create a Visitor.
     * @example
     * // Update or create a Visitor
     * const visitor = await prisma.visitor.upsert({
     *   create: {
     *     // ... data to create a Visitor
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Visitor we want to update
     *   }
     * })
     */
    upsert<T extends VisitorUpsertArgs>(args: SelectSubset<T, VisitorUpsertArgs<ExtArgs>>): Prisma__VisitorClient<$Result.GetResult<Prisma.$VisitorPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Visitors.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VisitorCountArgs} args - Arguments to filter Visitors to count.
     * @example
     * // Count the number of Visitors
     * const count = await prisma.visitor.count({
     *   where: {
     *     // ... the filter for the Visitors we want to count
     *   }
     * })
    **/
    count<T extends VisitorCountArgs>(
      args?: Subset<T, VisitorCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], VisitorCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Visitor.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VisitorAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends VisitorAggregateArgs>(args: Subset<T, VisitorAggregateArgs>): Prisma.PrismaPromise<GetVisitorAggregateType<T>>

    /**
     * Group by Visitor.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VisitorGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends VisitorGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: VisitorGroupByArgs['orderBy'] }
        : { orderBy?: VisitorGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, VisitorGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetVisitorGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Visitor model
   */
  readonly fields: VisitorFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Visitor.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__VisitorClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    queues<T extends Visitor$queuesArgs<ExtArgs> = {}>(args?: Subset<T, Visitor$queuesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$QueuePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Visitor model
   */
  interface VisitorFieldRefs {
    readonly id: FieldRef<"Visitor", 'String'>
    readonly name: FieldRef<"Visitor", 'String'>
    readonly phone: FieldRef<"Visitor", 'String'>
    readonly address: FieldRef<"Visitor", 'String'>
    readonly age: FieldRef<"Visitor", 'Int'>
    readonly gender: FieldRef<"Visitor", 'Gender'>
    readonly lastEducation: FieldRef<"Visitor", 'LastEducation'>
    readonly occupation: FieldRef<"Visitor", 'String'>
    readonly institution: FieldRef<"Visitor", 'String'>
    readonly email: FieldRef<"Visitor", 'String'>
    readonly purpose: FieldRef<"Visitor", 'Purpose'>
    readonly createdAt: FieldRef<"Visitor", 'DateTime'>
    readonly updatedAt: FieldRef<"Visitor", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Visitor findUnique
   */
  export type VisitorFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Visitor
     */
    select?: VisitorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Visitor
     */
    omit?: VisitorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VisitorInclude<ExtArgs> | null
    /**
     * Filter, which Visitor to fetch.
     */
    where: VisitorWhereUniqueInput
  }

  /**
   * Visitor findUniqueOrThrow
   */
  export type VisitorFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Visitor
     */
    select?: VisitorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Visitor
     */
    omit?: VisitorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VisitorInclude<ExtArgs> | null
    /**
     * Filter, which Visitor to fetch.
     */
    where: VisitorWhereUniqueInput
  }

  /**
   * Visitor findFirst
   */
  export type VisitorFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Visitor
     */
    select?: VisitorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Visitor
     */
    omit?: VisitorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VisitorInclude<ExtArgs> | null
    /**
     * Filter, which Visitor to fetch.
     */
    where?: VisitorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Visitors to fetch.
     */
    orderBy?: VisitorOrderByWithRelationInput | VisitorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Visitors.
     */
    cursor?: VisitorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Visitors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Visitors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Visitors.
     */
    distinct?: VisitorScalarFieldEnum | VisitorScalarFieldEnum[]
  }

  /**
   * Visitor findFirstOrThrow
   */
  export type VisitorFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Visitor
     */
    select?: VisitorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Visitor
     */
    omit?: VisitorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VisitorInclude<ExtArgs> | null
    /**
     * Filter, which Visitor to fetch.
     */
    where?: VisitorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Visitors to fetch.
     */
    orderBy?: VisitorOrderByWithRelationInput | VisitorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Visitors.
     */
    cursor?: VisitorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Visitors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Visitors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Visitors.
     */
    distinct?: VisitorScalarFieldEnum | VisitorScalarFieldEnum[]
  }

  /**
   * Visitor findMany
   */
  export type VisitorFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Visitor
     */
    select?: VisitorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Visitor
     */
    omit?: VisitorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VisitorInclude<ExtArgs> | null
    /**
     * Filter, which Visitors to fetch.
     */
    where?: VisitorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Visitors to fetch.
     */
    orderBy?: VisitorOrderByWithRelationInput | VisitorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Visitors.
     */
    cursor?: VisitorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Visitors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Visitors.
     */
    skip?: number
    distinct?: VisitorScalarFieldEnum | VisitorScalarFieldEnum[]
  }

  /**
   * Visitor create
   */
  export type VisitorCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Visitor
     */
    select?: VisitorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Visitor
     */
    omit?: VisitorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VisitorInclude<ExtArgs> | null
    /**
     * The data needed to create a Visitor.
     */
    data: XOR<VisitorCreateInput, VisitorUncheckedCreateInput>
  }

  /**
   * Visitor createMany
   */
  export type VisitorCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Visitors.
     */
    data: VisitorCreateManyInput | VisitorCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Visitor createManyAndReturn
   */
  export type VisitorCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Visitor
     */
    select?: VisitorSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Visitor
     */
    omit?: VisitorOmit<ExtArgs> | null
    /**
     * The data used to create many Visitors.
     */
    data: VisitorCreateManyInput | VisitorCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Visitor update
   */
  export type VisitorUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Visitor
     */
    select?: VisitorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Visitor
     */
    omit?: VisitorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VisitorInclude<ExtArgs> | null
    /**
     * The data needed to update a Visitor.
     */
    data: XOR<VisitorUpdateInput, VisitorUncheckedUpdateInput>
    /**
     * Choose, which Visitor to update.
     */
    where: VisitorWhereUniqueInput
  }

  /**
   * Visitor updateMany
   */
  export type VisitorUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Visitors.
     */
    data: XOR<VisitorUpdateManyMutationInput, VisitorUncheckedUpdateManyInput>
    /**
     * Filter which Visitors to update
     */
    where?: VisitorWhereInput
    /**
     * Limit how many Visitors to update.
     */
    limit?: number
  }

  /**
   * Visitor updateManyAndReturn
   */
  export type VisitorUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Visitor
     */
    select?: VisitorSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Visitor
     */
    omit?: VisitorOmit<ExtArgs> | null
    /**
     * The data used to update Visitors.
     */
    data: XOR<VisitorUpdateManyMutationInput, VisitorUncheckedUpdateManyInput>
    /**
     * Filter which Visitors to update
     */
    where?: VisitorWhereInput
    /**
     * Limit how many Visitors to update.
     */
    limit?: number
  }

  /**
   * Visitor upsert
   */
  export type VisitorUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Visitor
     */
    select?: VisitorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Visitor
     */
    omit?: VisitorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VisitorInclude<ExtArgs> | null
    /**
     * The filter to search for the Visitor to update in case it exists.
     */
    where: VisitorWhereUniqueInput
    /**
     * In case the Visitor found by the `where` argument doesn't exist, create a new Visitor with this data.
     */
    create: XOR<VisitorCreateInput, VisitorUncheckedCreateInput>
    /**
     * In case the Visitor was found with the provided `where` argument, update it with this data.
     */
    update: XOR<VisitorUpdateInput, VisitorUncheckedUpdateInput>
  }

  /**
   * Visitor delete
   */
  export type VisitorDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Visitor
     */
    select?: VisitorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Visitor
     */
    omit?: VisitorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VisitorInclude<ExtArgs> | null
    /**
     * Filter which Visitor to delete.
     */
    where: VisitorWhereUniqueInput
  }

  /**
   * Visitor deleteMany
   */
  export type VisitorDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Visitors to delete
     */
    where?: VisitorWhereInput
    /**
     * Limit how many Visitors to delete.
     */
    limit?: number
  }

  /**
   * Visitor.queues
   */
  export type Visitor$queuesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Queue
     */
    select?: QueueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Queue
     */
    omit?: QueueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QueueInclude<ExtArgs> | null
    where?: QueueWhereInput
    orderBy?: QueueOrderByWithRelationInput | QueueOrderByWithRelationInput[]
    cursor?: QueueWhereUniqueInput
    take?: number
    skip?: number
    distinct?: QueueScalarFieldEnum | QueueScalarFieldEnum[]
  }

  /**
   * Visitor without action
   */
  export type VisitorDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Visitor
     */
    select?: VisitorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Visitor
     */
    omit?: VisitorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VisitorInclude<ExtArgs> | null
  }


  /**
   * Model Queue
   */

  export type AggregateQueue = {
    _count: QueueCountAggregateOutputType | null
    _avg: QueueAvgAggregateOutputType | null
    _sum: QueueSumAggregateOutputType | null
    _min: QueueMinAggregateOutputType | null
    _max: QueueMaxAggregateOutputType | null
  }

  export type QueueAvgAggregateOutputType = {
    queueNumber: number | null
  }

  export type QueueSumAggregateOutputType = {
    queueNumber: number | null
  }

  export type QueueMinAggregateOutputType = {
    id: string | null
    queueNumber: number | null
    status: $Enums.QueueStatus | null
    queueType: $Enums.QueueType | null
    queueDate: Date | null
    visitorId: string | null
    guestId: string | null
    serviceId: string | null
    adminId: string | null
    startTime: Date | null
    endTime: Date | null
    createdAt: Date | null
    updatedAt: Date | null
    tempUuid: string | null
    filledSKD: boolean | null
    trackingLink: string | null
  }

  export type QueueMaxAggregateOutputType = {
    id: string | null
    queueNumber: number | null
    status: $Enums.QueueStatus | null
    queueType: $Enums.QueueType | null
    queueDate: Date | null
    visitorId: string | null
    guestId: string | null
    serviceId: string | null
    adminId: string | null
    startTime: Date | null
    endTime: Date | null
    createdAt: Date | null
    updatedAt: Date | null
    tempUuid: string | null
    filledSKD: boolean | null
    trackingLink: string | null
  }

  export type QueueCountAggregateOutputType = {
    id: number
    queueNumber: number
    status: number
    queueType: number
    queueDate: number
    visitorId: number
    guestId: number
    serviceId: number
    adminId: number
    startTime: number
    endTime: number
    createdAt: number
    updatedAt: number
    tempUuid: number
    filledSKD: number
    trackingLink: number
    _all: number
  }


  export type QueueAvgAggregateInputType = {
    queueNumber?: true
  }

  export type QueueSumAggregateInputType = {
    queueNumber?: true
  }

  export type QueueMinAggregateInputType = {
    id?: true
    queueNumber?: true
    status?: true
    queueType?: true
    queueDate?: true
    visitorId?: true
    guestId?: true
    serviceId?: true
    adminId?: true
    startTime?: true
    endTime?: true
    createdAt?: true
    updatedAt?: true
    tempUuid?: true
    filledSKD?: true
    trackingLink?: true
  }

  export type QueueMaxAggregateInputType = {
    id?: true
    queueNumber?: true
    status?: true
    queueType?: true
    queueDate?: true
    visitorId?: true
    guestId?: true
    serviceId?: true
    adminId?: true
    startTime?: true
    endTime?: true
    createdAt?: true
    updatedAt?: true
    tempUuid?: true
    filledSKD?: true
    trackingLink?: true
  }

  export type QueueCountAggregateInputType = {
    id?: true
    queueNumber?: true
    status?: true
    queueType?: true
    queueDate?: true
    visitorId?: true
    guestId?: true
    serviceId?: true
    adminId?: true
    startTime?: true
    endTime?: true
    createdAt?: true
    updatedAt?: true
    tempUuid?: true
    filledSKD?: true
    trackingLink?: true
    _all?: true
  }

  export type QueueAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Queue to aggregate.
     */
    where?: QueueWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Queues to fetch.
     */
    orderBy?: QueueOrderByWithRelationInput | QueueOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: QueueWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Queues from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Queues.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Queues
    **/
    _count?: true | QueueCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: QueueAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: QueueSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: QueueMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: QueueMaxAggregateInputType
  }

  export type GetQueueAggregateType<T extends QueueAggregateArgs> = {
        [P in keyof T & keyof AggregateQueue]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateQueue[P]>
      : GetScalarType<T[P], AggregateQueue[P]>
  }




  export type QueueGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: QueueWhereInput
    orderBy?: QueueOrderByWithAggregationInput | QueueOrderByWithAggregationInput[]
    by: QueueScalarFieldEnum[] | QueueScalarFieldEnum
    having?: QueueScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: QueueCountAggregateInputType | true
    _avg?: QueueAvgAggregateInputType
    _sum?: QueueSumAggregateInputType
    _min?: QueueMinAggregateInputType
    _max?: QueueMaxAggregateInputType
  }

  export type QueueGroupByOutputType = {
    id: string
    queueNumber: number
    status: $Enums.QueueStatus
    queueType: $Enums.QueueType
    queueDate: Date
    visitorId: string
    guestId: string | null
    serviceId: string
    adminId: string | null
    startTime: Date | null
    endTime: Date | null
    createdAt: Date
    updatedAt: Date
    tempUuid: string | null
    filledSKD: boolean
    trackingLink: string | null
    _count: QueueCountAggregateOutputType | null
    _avg: QueueAvgAggregateOutputType | null
    _sum: QueueSumAggregateOutputType | null
    _min: QueueMinAggregateOutputType | null
    _max: QueueMaxAggregateOutputType | null
  }

  type GetQueueGroupByPayload<T extends QueueGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<QueueGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof QueueGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], QueueGroupByOutputType[P]>
            : GetScalarType<T[P], QueueGroupByOutputType[P]>
        }
      >
    >


  export type QueueSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    queueNumber?: boolean
    status?: boolean
    queueType?: boolean
    queueDate?: boolean
    visitorId?: boolean
    guestId?: boolean
    serviceId?: boolean
    adminId?: boolean
    startTime?: boolean
    endTime?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tempUuid?: boolean
    filledSKD?: boolean
    trackingLink?: boolean
    visitor?: boolean | VisitorDefaultArgs<ExtArgs>
    guest?: boolean | Queue$guestArgs<ExtArgs>
    service?: boolean | ServiceDefaultArgs<ExtArgs>
    admin?: boolean | Queue$adminArgs<ExtArgs>
  }, ExtArgs["result"]["queue"]>

  export type QueueSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    queueNumber?: boolean
    status?: boolean
    queueType?: boolean
    queueDate?: boolean
    visitorId?: boolean
    guestId?: boolean
    serviceId?: boolean
    adminId?: boolean
    startTime?: boolean
    endTime?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tempUuid?: boolean
    filledSKD?: boolean
    trackingLink?: boolean
    visitor?: boolean | VisitorDefaultArgs<ExtArgs>
    guest?: boolean | Queue$guestArgs<ExtArgs>
    service?: boolean | ServiceDefaultArgs<ExtArgs>
    admin?: boolean | Queue$adminArgs<ExtArgs>
  }, ExtArgs["result"]["queue"]>

  export type QueueSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    queueNumber?: boolean
    status?: boolean
    queueType?: boolean
    queueDate?: boolean
    visitorId?: boolean
    guestId?: boolean
    serviceId?: boolean
    adminId?: boolean
    startTime?: boolean
    endTime?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tempUuid?: boolean
    filledSKD?: boolean
    trackingLink?: boolean
    visitor?: boolean | VisitorDefaultArgs<ExtArgs>
    guest?: boolean | Queue$guestArgs<ExtArgs>
    service?: boolean | ServiceDefaultArgs<ExtArgs>
    admin?: boolean | Queue$adminArgs<ExtArgs>
  }, ExtArgs["result"]["queue"]>

  export type QueueSelectScalar = {
    id?: boolean
    queueNumber?: boolean
    status?: boolean
    queueType?: boolean
    queueDate?: boolean
    visitorId?: boolean
    guestId?: boolean
    serviceId?: boolean
    adminId?: boolean
    startTime?: boolean
    endTime?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tempUuid?: boolean
    filledSKD?: boolean
    trackingLink?: boolean
  }

  export type QueueOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "queueNumber" | "status" | "queueType" | "queueDate" | "visitorId" | "guestId" | "serviceId" | "adminId" | "startTime" | "endTime" | "createdAt" | "updatedAt" | "tempUuid" | "filledSKD" | "trackingLink", ExtArgs["result"]["queue"]>
  export type QueueInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    visitor?: boolean | VisitorDefaultArgs<ExtArgs>
    guest?: boolean | Queue$guestArgs<ExtArgs>
    service?: boolean | ServiceDefaultArgs<ExtArgs>
    admin?: boolean | Queue$adminArgs<ExtArgs>
  }
  export type QueueIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    visitor?: boolean | VisitorDefaultArgs<ExtArgs>
    guest?: boolean | Queue$guestArgs<ExtArgs>
    service?: boolean | ServiceDefaultArgs<ExtArgs>
    admin?: boolean | Queue$adminArgs<ExtArgs>
  }
  export type QueueIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    visitor?: boolean | VisitorDefaultArgs<ExtArgs>
    guest?: boolean | Queue$guestArgs<ExtArgs>
    service?: boolean | ServiceDefaultArgs<ExtArgs>
    admin?: boolean | Queue$adminArgs<ExtArgs>
  }

  export type $QueuePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Queue"
    objects: {
      visitor: Prisma.$VisitorPayload<ExtArgs>
      guest: Prisma.$GuestPayload<ExtArgs> | null
      service: Prisma.$ServicePayload<ExtArgs>
      admin: Prisma.$UserPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      queueNumber: number
      status: $Enums.QueueStatus
      queueType: $Enums.QueueType
      queueDate: Date
      visitorId: string
      guestId: string | null
      serviceId: string
      adminId: string | null
      startTime: Date | null
      endTime: Date | null
      createdAt: Date
      updatedAt: Date
      tempUuid: string | null
      filledSKD: boolean
      trackingLink: string | null
    }, ExtArgs["result"]["queue"]>
    composites: {}
  }

  type QueueGetPayload<S extends boolean | null | undefined | QueueDefaultArgs> = $Result.GetResult<Prisma.$QueuePayload, S>

  type QueueCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<QueueFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: QueueCountAggregateInputType | true
    }

  export interface QueueDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Queue'], meta: { name: 'Queue' } }
    /**
     * Find zero or one Queue that matches the filter.
     * @param {QueueFindUniqueArgs} args - Arguments to find a Queue
     * @example
     * // Get one Queue
     * const queue = await prisma.queue.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends QueueFindUniqueArgs>(args: SelectSubset<T, QueueFindUniqueArgs<ExtArgs>>): Prisma__QueueClient<$Result.GetResult<Prisma.$QueuePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Queue that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {QueueFindUniqueOrThrowArgs} args - Arguments to find a Queue
     * @example
     * // Get one Queue
     * const queue = await prisma.queue.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends QueueFindUniqueOrThrowArgs>(args: SelectSubset<T, QueueFindUniqueOrThrowArgs<ExtArgs>>): Prisma__QueueClient<$Result.GetResult<Prisma.$QueuePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Queue that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QueueFindFirstArgs} args - Arguments to find a Queue
     * @example
     * // Get one Queue
     * const queue = await prisma.queue.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends QueueFindFirstArgs>(args?: SelectSubset<T, QueueFindFirstArgs<ExtArgs>>): Prisma__QueueClient<$Result.GetResult<Prisma.$QueuePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Queue that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QueueFindFirstOrThrowArgs} args - Arguments to find a Queue
     * @example
     * // Get one Queue
     * const queue = await prisma.queue.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends QueueFindFirstOrThrowArgs>(args?: SelectSubset<T, QueueFindFirstOrThrowArgs<ExtArgs>>): Prisma__QueueClient<$Result.GetResult<Prisma.$QueuePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Queues that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QueueFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Queues
     * const queues = await prisma.queue.findMany()
     * 
     * // Get first 10 Queues
     * const queues = await prisma.queue.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const queueWithIdOnly = await prisma.queue.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends QueueFindManyArgs>(args?: SelectSubset<T, QueueFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$QueuePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Queue.
     * @param {QueueCreateArgs} args - Arguments to create a Queue.
     * @example
     * // Create one Queue
     * const Queue = await prisma.queue.create({
     *   data: {
     *     // ... data to create a Queue
     *   }
     * })
     * 
     */
    create<T extends QueueCreateArgs>(args: SelectSubset<T, QueueCreateArgs<ExtArgs>>): Prisma__QueueClient<$Result.GetResult<Prisma.$QueuePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Queues.
     * @param {QueueCreateManyArgs} args - Arguments to create many Queues.
     * @example
     * // Create many Queues
     * const queue = await prisma.queue.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends QueueCreateManyArgs>(args?: SelectSubset<T, QueueCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Queues and returns the data saved in the database.
     * @param {QueueCreateManyAndReturnArgs} args - Arguments to create many Queues.
     * @example
     * // Create many Queues
     * const queue = await prisma.queue.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Queues and only return the `id`
     * const queueWithIdOnly = await prisma.queue.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends QueueCreateManyAndReturnArgs>(args?: SelectSubset<T, QueueCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$QueuePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Queue.
     * @param {QueueDeleteArgs} args - Arguments to delete one Queue.
     * @example
     * // Delete one Queue
     * const Queue = await prisma.queue.delete({
     *   where: {
     *     // ... filter to delete one Queue
     *   }
     * })
     * 
     */
    delete<T extends QueueDeleteArgs>(args: SelectSubset<T, QueueDeleteArgs<ExtArgs>>): Prisma__QueueClient<$Result.GetResult<Prisma.$QueuePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Queue.
     * @param {QueueUpdateArgs} args - Arguments to update one Queue.
     * @example
     * // Update one Queue
     * const queue = await prisma.queue.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends QueueUpdateArgs>(args: SelectSubset<T, QueueUpdateArgs<ExtArgs>>): Prisma__QueueClient<$Result.GetResult<Prisma.$QueuePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Queues.
     * @param {QueueDeleteManyArgs} args - Arguments to filter Queues to delete.
     * @example
     * // Delete a few Queues
     * const { count } = await prisma.queue.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends QueueDeleteManyArgs>(args?: SelectSubset<T, QueueDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Queues.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QueueUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Queues
     * const queue = await prisma.queue.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends QueueUpdateManyArgs>(args: SelectSubset<T, QueueUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Queues and returns the data updated in the database.
     * @param {QueueUpdateManyAndReturnArgs} args - Arguments to update many Queues.
     * @example
     * // Update many Queues
     * const queue = await prisma.queue.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Queues and only return the `id`
     * const queueWithIdOnly = await prisma.queue.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends QueueUpdateManyAndReturnArgs>(args: SelectSubset<T, QueueUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$QueuePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Queue.
     * @param {QueueUpsertArgs} args - Arguments to update or create a Queue.
     * @example
     * // Update or create a Queue
     * const queue = await prisma.queue.upsert({
     *   create: {
     *     // ... data to create a Queue
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Queue we want to update
     *   }
     * })
     */
    upsert<T extends QueueUpsertArgs>(args: SelectSubset<T, QueueUpsertArgs<ExtArgs>>): Prisma__QueueClient<$Result.GetResult<Prisma.$QueuePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Queues.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QueueCountArgs} args - Arguments to filter Queues to count.
     * @example
     * // Count the number of Queues
     * const count = await prisma.queue.count({
     *   where: {
     *     // ... the filter for the Queues we want to count
     *   }
     * })
    **/
    count<T extends QueueCountArgs>(
      args?: Subset<T, QueueCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], QueueCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Queue.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QueueAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends QueueAggregateArgs>(args: Subset<T, QueueAggregateArgs>): Prisma.PrismaPromise<GetQueueAggregateType<T>>

    /**
     * Group by Queue.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QueueGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends QueueGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: QueueGroupByArgs['orderBy'] }
        : { orderBy?: QueueGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, QueueGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetQueueGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Queue model
   */
  readonly fields: QueueFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Queue.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__QueueClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    visitor<T extends VisitorDefaultArgs<ExtArgs> = {}>(args?: Subset<T, VisitorDefaultArgs<ExtArgs>>): Prisma__VisitorClient<$Result.GetResult<Prisma.$VisitorPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    guest<T extends Queue$guestArgs<ExtArgs> = {}>(args?: Subset<T, Queue$guestArgs<ExtArgs>>): Prisma__GuestClient<$Result.GetResult<Prisma.$GuestPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    service<T extends ServiceDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ServiceDefaultArgs<ExtArgs>>): Prisma__ServiceClient<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    admin<T extends Queue$adminArgs<ExtArgs> = {}>(args?: Subset<T, Queue$adminArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Queue model
   */
  interface QueueFieldRefs {
    readonly id: FieldRef<"Queue", 'String'>
    readonly queueNumber: FieldRef<"Queue", 'Int'>
    readonly status: FieldRef<"Queue", 'QueueStatus'>
    readonly queueType: FieldRef<"Queue", 'QueueType'>
    readonly queueDate: FieldRef<"Queue", 'DateTime'>
    readonly visitorId: FieldRef<"Queue", 'String'>
    readonly guestId: FieldRef<"Queue", 'String'>
    readonly serviceId: FieldRef<"Queue", 'String'>
    readonly adminId: FieldRef<"Queue", 'String'>
    readonly startTime: FieldRef<"Queue", 'DateTime'>
    readonly endTime: FieldRef<"Queue", 'DateTime'>
    readonly createdAt: FieldRef<"Queue", 'DateTime'>
    readonly updatedAt: FieldRef<"Queue", 'DateTime'>
    readonly tempUuid: FieldRef<"Queue", 'String'>
    readonly filledSKD: FieldRef<"Queue", 'Boolean'>
    readonly trackingLink: FieldRef<"Queue", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Queue findUnique
   */
  export type QueueFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Queue
     */
    select?: QueueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Queue
     */
    omit?: QueueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QueueInclude<ExtArgs> | null
    /**
     * Filter, which Queue to fetch.
     */
    where: QueueWhereUniqueInput
  }

  /**
   * Queue findUniqueOrThrow
   */
  export type QueueFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Queue
     */
    select?: QueueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Queue
     */
    omit?: QueueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QueueInclude<ExtArgs> | null
    /**
     * Filter, which Queue to fetch.
     */
    where: QueueWhereUniqueInput
  }

  /**
   * Queue findFirst
   */
  export type QueueFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Queue
     */
    select?: QueueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Queue
     */
    omit?: QueueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QueueInclude<ExtArgs> | null
    /**
     * Filter, which Queue to fetch.
     */
    where?: QueueWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Queues to fetch.
     */
    orderBy?: QueueOrderByWithRelationInput | QueueOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Queues.
     */
    cursor?: QueueWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Queues from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Queues.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Queues.
     */
    distinct?: QueueScalarFieldEnum | QueueScalarFieldEnum[]
  }

  /**
   * Queue findFirstOrThrow
   */
  export type QueueFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Queue
     */
    select?: QueueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Queue
     */
    omit?: QueueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QueueInclude<ExtArgs> | null
    /**
     * Filter, which Queue to fetch.
     */
    where?: QueueWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Queues to fetch.
     */
    orderBy?: QueueOrderByWithRelationInput | QueueOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Queues.
     */
    cursor?: QueueWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Queues from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Queues.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Queues.
     */
    distinct?: QueueScalarFieldEnum | QueueScalarFieldEnum[]
  }

  /**
   * Queue findMany
   */
  export type QueueFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Queue
     */
    select?: QueueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Queue
     */
    omit?: QueueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QueueInclude<ExtArgs> | null
    /**
     * Filter, which Queues to fetch.
     */
    where?: QueueWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Queues to fetch.
     */
    orderBy?: QueueOrderByWithRelationInput | QueueOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Queues.
     */
    cursor?: QueueWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Queues from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Queues.
     */
    skip?: number
    distinct?: QueueScalarFieldEnum | QueueScalarFieldEnum[]
  }

  /**
   * Queue create
   */
  export type QueueCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Queue
     */
    select?: QueueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Queue
     */
    omit?: QueueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QueueInclude<ExtArgs> | null
    /**
     * The data needed to create a Queue.
     */
    data: XOR<QueueCreateInput, QueueUncheckedCreateInput>
  }

  /**
   * Queue createMany
   */
  export type QueueCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Queues.
     */
    data: QueueCreateManyInput | QueueCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Queue createManyAndReturn
   */
  export type QueueCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Queue
     */
    select?: QueueSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Queue
     */
    omit?: QueueOmit<ExtArgs> | null
    /**
     * The data used to create many Queues.
     */
    data: QueueCreateManyInput | QueueCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QueueIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Queue update
   */
  export type QueueUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Queue
     */
    select?: QueueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Queue
     */
    omit?: QueueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QueueInclude<ExtArgs> | null
    /**
     * The data needed to update a Queue.
     */
    data: XOR<QueueUpdateInput, QueueUncheckedUpdateInput>
    /**
     * Choose, which Queue to update.
     */
    where: QueueWhereUniqueInput
  }

  /**
   * Queue updateMany
   */
  export type QueueUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Queues.
     */
    data: XOR<QueueUpdateManyMutationInput, QueueUncheckedUpdateManyInput>
    /**
     * Filter which Queues to update
     */
    where?: QueueWhereInput
    /**
     * Limit how many Queues to update.
     */
    limit?: number
  }

  /**
   * Queue updateManyAndReturn
   */
  export type QueueUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Queue
     */
    select?: QueueSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Queue
     */
    omit?: QueueOmit<ExtArgs> | null
    /**
     * The data used to update Queues.
     */
    data: XOR<QueueUpdateManyMutationInput, QueueUncheckedUpdateManyInput>
    /**
     * Filter which Queues to update
     */
    where?: QueueWhereInput
    /**
     * Limit how many Queues to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QueueIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Queue upsert
   */
  export type QueueUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Queue
     */
    select?: QueueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Queue
     */
    omit?: QueueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QueueInclude<ExtArgs> | null
    /**
     * The filter to search for the Queue to update in case it exists.
     */
    where: QueueWhereUniqueInput
    /**
     * In case the Queue found by the `where` argument doesn't exist, create a new Queue with this data.
     */
    create: XOR<QueueCreateInput, QueueUncheckedCreateInput>
    /**
     * In case the Queue was found with the provided `where` argument, update it with this data.
     */
    update: XOR<QueueUpdateInput, QueueUncheckedUpdateInput>
  }

  /**
   * Queue delete
   */
  export type QueueDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Queue
     */
    select?: QueueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Queue
     */
    omit?: QueueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QueueInclude<ExtArgs> | null
    /**
     * Filter which Queue to delete.
     */
    where: QueueWhereUniqueInput
  }

  /**
   * Queue deleteMany
   */
  export type QueueDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Queues to delete
     */
    where?: QueueWhereInput
    /**
     * Limit how many Queues to delete.
     */
    limit?: number
  }

  /**
   * Queue.guest
   */
  export type Queue$guestArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guest
     */
    select?: GuestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Guest
     */
    omit?: GuestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuestInclude<ExtArgs> | null
    where?: GuestWhereInput
  }

  /**
   * Queue.admin
   */
  export type Queue$adminArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * Queue without action
   */
  export type QueueDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Queue
     */
    select?: QueueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Queue
     */
    omit?: QueueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QueueInclude<ExtArgs> | null
  }


  /**
   * Model QRCode
   */

  export type AggregateQRCode = {
    _count: QRCodeCountAggregateOutputType | null
    _min: QRCodeMinAggregateOutputType | null
    _max: QRCodeMaxAggregateOutputType | null
  }

  export type QRCodeMinAggregateOutputType = {
    id: string | null
    staticUuid: string | null
    path: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type QRCodeMaxAggregateOutputType = {
    id: string | null
    staticUuid: string | null
    path: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type QRCodeCountAggregateOutputType = {
    id: number
    staticUuid: number
    path: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type QRCodeMinAggregateInputType = {
    id?: true
    staticUuid?: true
    path?: true
    createdAt?: true
    updatedAt?: true
  }

  export type QRCodeMaxAggregateInputType = {
    id?: true
    staticUuid?: true
    path?: true
    createdAt?: true
    updatedAt?: true
  }

  export type QRCodeCountAggregateInputType = {
    id?: true
    staticUuid?: true
    path?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type QRCodeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which QRCode to aggregate.
     */
    where?: QRCodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of QRCodes to fetch.
     */
    orderBy?: QRCodeOrderByWithRelationInput | QRCodeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: QRCodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` QRCodes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` QRCodes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned QRCodes
    **/
    _count?: true | QRCodeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: QRCodeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: QRCodeMaxAggregateInputType
  }

  export type GetQRCodeAggregateType<T extends QRCodeAggregateArgs> = {
        [P in keyof T & keyof AggregateQRCode]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateQRCode[P]>
      : GetScalarType<T[P], AggregateQRCode[P]>
  }




  export type QRCodeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: QRCodeWhereInput
    orderBy?: QRCodeOrderByWithAggregationInput | QRCodeOrderByWithAggregationInput[]
    by: QRCodeScalarFieldEnum[] | QRCodeScalarFieldEnum
    having?: QRCodeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: QRCodeCountAggregateInputType | true
    _min?: QRCodeMinAggregateInputType
    _max?: QRCodeMaxAggregateInputType
  }

  export type QRCodeGroupByOutputType = {
    id: string
    staticUuid: string
    path: string
    createdAt: Date
    updatedAt: Date
    _count: QRCodeCountAggregateOutputType | null
    _min: QRCodeMinAggregateOutputType | null
    _max: QRCodeMaxAggregateOutputType | null
  }

  type GetQRCodeGroupByPayload<T extends QRCodeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<QRCodeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof QRCodeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], QRCodeGroupByOutputType[P]>
            : GetScalarType<T[P], QRCodeGroupByOutputType[P]>
        }
      >
    >


  export type QRCodeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    staticUuid?: boolean
    path?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["qRCode"]>

  export type QRCodeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    staticUuid?: boolean
    path?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["qRCode"]>

  export type QRCodeSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    staticUuid?: boolean
    path?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["qRCode"]>

  export type QRCodeSelectScalar = {
    id?: boolean
    staticUuid?: boolean
    path?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type QRCodeOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "staticUuid" | "path" | "createdAt" | "updatedAt", ExtArgs["result"]["qRCode"]>

  export type $QRCodePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "QRCode"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      staticUuid: string
      path: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["qRCode"]>
    composites: {}
  }

  type QRCodeGetPayload<S extends boolean | null | undefined | QRCodeDefaultArgs> = $Result.GetResult<Prisma.$QRCodePayload, S>

  type QRCodeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<QRCodeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: QRCodeCountAggregateInputType | true
    }

  export interface QRCodeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['QRCode'], meta: { name: 'QRCode' } }
    /**
     * Find zero or one QRCode that matches the filter.
     * @param {QRCodeFindUniqueArgs} args - Arguments to find a QRCode
     * @example
     * // Get one QRCode
     * const qRCode = await prisma.qRCode.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends QRCodeFindUniqueArgs>(args: SelectSubset<T, QRCodeFindUniqueArgs<ExtArgs>>): Prisma__QRCodeClient<$Result.GetResult<Prisma.$QRCodePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one QRCode that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {QRCodeFindUniqueOrThrowArgs} args - Arguments to find a QRCode
     * @example
     * // Get one QRCode
     * const qRCode = await prisma.qRCode.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends QRCodeFindUniqueOrThrowArgs>(args: SelectSubset<T, QRCodeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__QRCodeClient<$Result.GetResult<Prisma.$QRCodePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first QRCode that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QRCodeFindFirstArgs} args - Arguments to find a QRCode
     * @example
     * // Get one QRCode
     * const qRCode = await prisma.qRCode.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends QRCodeFindFirstArgs>(args?: SelectSubset<T, QRCodeFindFirstArgs<ExtArgs>>): Prisma__QRCodeClient<$Result.GetResult<Prisma.$QRCodePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first QRCode that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QRCodeFindFirstOrThrowArgs} args - Arguments to find a QRCode
     * @example
     * // Get one QRCode
     * const qRCode = await prisma.qRCode.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends QRCodeFindFirstOrThrowArgs>(args?: SelectSubset<T, QRCodeFindFirstOrThrowArgs<ExtArgs>>): Prisma__QRCodeClient<$Result.GetResult<Prisma.$QRCodePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more QRCodes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QRCodeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all QRCodes
     * const qRCodes = await prisma.qRCode.findMany()
     * 
     * // Get first 10 QRCodes
     * const qRCodes = await prisma.qRCode.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const qRCodeWithIdOnly = await prisma.qRCode.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends QRCodeFindManyArgs>(args?: SelectSubset<T, QRCodeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$QRCodePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a QRCode.
     * @param {QRCodeCreateArgs} args - Arguments to create a QRCode.
     * @example
     * // Create one QRCode
     * const QRCode = await prisma.qRCode.create({
     *   data: {
     *     // ... data to create a QRCode
     *   }
     * })
     * 
     */
    create<T extends QRCodeCreateArgs>(args: SelectSubset<T, QRCodeCreateArgs<ExtArgs>>): Prisma__QRCodeClient<$Result.GetResult<Prisma.$QRCodePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many QRCodes.
     * @param {QRCodeCreateManyArgs} args - Arguments to create many QRCodes.
     * @example
     * // Create many QRCodes
     * const qRCode = await prisma.qRCode.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends QRCodeCreateManyArgs>(args?: SelectSubset<T, QRCodeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many QRCodes and returns the data saved in the database.
     * @param {QRCodeCreateManyAndReturnArgs} args - Arguments to create many QRCodes.
     * @example
     * // Create many QRCodes
     * const qRCode = await prisma.qRCode.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many QRCodes and only return the `id`
     * const qRCodeWithIdOnly = await prisma.qRCode.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends QRCodeCreateManyAndReturnArgs>(args?: SelectSubset<T, QRCodeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$QRCodePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a QRCode.
     * @param {QRCodeDeleteArgs} args - Arguments to delete one QRCode.
     * @example
     * // Delete one QRCode
     * const QRCode = await prisma.qRCode.delete({
     *   where: {
     *     // ... filter to delete one QRCode
     *   }
     * })
     * 
     */
    delete<T extends QRCodeDeleteArgs>(args: SelectSubset<T, QRCodeDeleteArgs<ExtArgs>>): Prisma__QRCodeClient<$Result.GetResult<Prisma.$QRCodePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one QRCode.
     * @param {QRCodeUpdateArgs} args - Arguments to update one QRCode.
     * @example
     * // Update one QRCode
     * const qRCode = await prisma.qRCode.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends QRCodeUpdateArgs>(args: SelectSubset<T, QRCodeUpdateArgs<ExtArgs>>): Prisma__QRCodeClient<$Result.GetResult<Prisma.$QRCodePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more QRCodes.
     * @param {QRCodeDeleteManyArgs} args - Arguments to filter QRCodes to delete.
     * @example
     * // Delete a few QRCodes
     * const { count } = await prisma.qRCode.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends QRCodeDeleteManyArgs>(args?: SelectSubset<T, QRCodeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more QRCodes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QRCodeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many QRCodes
     * const qRCode = await prisma.qRCode.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends QRCodeUpdateManyArgs>(args: SelectSubset<T, QRCodeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more QRCodes and returns the data updated in the database.
     * @param {QRCodeUpdateManyAndReturnArgs} args - Arguments to update many QRCodes.
     * @example
     * // Update many QRCodes
     * const qRCode = await prisma.qRCode.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more QRCodes and only return the `id`
     * const qRCodeWithIdOnly = await prisma.qRCode.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends QRCodeUpdateManyAndReturnArgs>(args: SelectSubset<T, QRCodeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$QRCodePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one QRCode.
     * @param {QRCodeUpsertArgs} args - Arguments to update or create a QRCode.
     * @example
     * // Update or create a QRCode
     * const qRCode = await prisma.qRCode.upsert({
     *   create: {
     *     // ... data to create a QRCode
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the QRCode we want to update
     *   }
     * })
     */
    upsert<T extends QRCodeUpsertArgs>(args: SelectSubset<T, QRCodeUpsertArgs<ExtArgs>>): Prisma__QRCodeClient<$Result.GetResult<Prisma.$QRCodePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of QRCodes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QRCodeCountArgs} args - Arguments to filter QRCodes to count.
     * @example
     * // Count the number of QRCodes
     * const count = await prisma.qRCode.count({
     *   where: {
     *     // ... the filter for the QRCodes we want to count
     *   }
     * })
    **/
    count<T extends QRCodeCountArgs>(
      args?: Subset<T, QRCodeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], QRCodeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a QRCode.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QRCodeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends QRCodeAggregateArgs>(args: Subset<T, QRCodeAggregateArgs>): Prisma.PrismaPromise<GetQRCodeAggregateType<T>>

    /**
     * Group by QRCode.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QRCodeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends QRCodeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: QRCodeGroupByArgs['orderBy'] }
        : { orderBy?: QRCodeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, QRCodeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetQRCodeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the QRCode model
   */
  readonly fields: QRCodeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for QRCode.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__QRCodeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the QRCode model
   */
  interface QRCodeFieldRefs {
    readonly id: FieldRef<"QRCode", 'String'>
    readonly staticUuid: FieldRef<"QRCode", 'String'>
    readonly path: FieldRef<"QRCode", 'String'>
    readonly createdAt: FieldRef<"QRCode", 'DateTime'>
    readonly updatedAt: FieldRef<"QRCode", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * QRCode findUnique
   */
  export type QRCodeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QRCode
     */
    select?: QRCodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the QRCode
     */
    omit?: QRCodeOmit<ExtArgs> | null
    /**
     * Filter, which QRCode to fetch.
     */
    where: QRCodeWhereUniqueInput
  }

  /**
   * QRCode findUniqueOrThrow
   */
  export type QRCodeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QRCode
     */
    select?: QRCodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the QRCode
     */
    omit?: QRCodeOmit<ExtArgs> | null
    /**
     * Filter, which QRCode to fetch.
     */
    where: QRCodeWhereUniqueInput
  }

  /**
   * QRCode findFirst
   */
  export type QRCodeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QRCode
     */
    select?: QRCodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the QRCode
     */
    omit?: QRCodeOmit<ExtArgs> | null
    /**
     * Filter, which QRCode to fetch.
     */
    where?: QRCodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of QRCodes to fetch.
     */
    orderBy?: QRCodeOrderByWithRelationInput | QRCodeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for QRCodes.
     */
    cursor?: QRCodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` QRCodes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` QRCodes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of QRCodes.
     */
    distinct?: QRCodeScalarFieldEnum | QRCodeScalarFieldEnum[]
  }

  /**
   * QRCode findFirstOrThrow
   */
  export type QRCodeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QRCode
     */
    select?: QRCodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the QRCode
     */
    omit?: QRCodeOmit<ExtArgs> | null
    /**
     * Filter, which QRCode to fetch.
     */
    where?: QRCodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of QRCodes to fetch.
     */
    orderBy?: QRCodeOrderByWithRelationInput | QRCodeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for QRCodes.
     */
    cursor?: QRCodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` QRCodes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` QRCodes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of QRCodes.
     */
    distinct?: QRCodeScalarFieldEnum | QRCodeScalarFieldEnum[]
  }

  /**
   * QRCode findMany
   */
  export type QRCodeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QRCode
     */
    select?: QRCodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the QRCode
     */
    omit?: QRCodeOmit<ExtArgs> | null
    /**
     * Filter, which QRCodes to fetch.
     */
    where?: QRCodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of QRCodes to fetch.
     */
    orderBy?: QRCodeOrderByWithRelationInput | QRCodeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing QRCodes.
     */
    cursor?: QRCodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` QRCodes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` QRCodes.
     */
    skip?: number
    distinct?: QRCodeScalarFieldEnum | QRCodeScalarFieldEnum[]
  }

  /**
   * QRCode create
   */
  export type QRCodeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QRCode
     */
    select?: QRCodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the QRCode
     */
    omit?: QRCodeOmit<ExtArgs> | null
    /**
     * The data needed to create a QRCode.
     */
    data: XOR<QRCodeCreateInput, QRCodeUncheckedCreateInput>
  }

  /**
   * QRCode createMany
   */
  export type QRCodeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many QRCodes.
     */
    data: QRCodeCreateManyInput | QRCodeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * QRCode createManyAndReturn
   */
  export type QRCodeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QRCode
     */
    select?: QRCodeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the QRCode
     */
    omit?: QRCodeOmit<ExtArgs> | null
    /**
     * The data used to create many QRCodes.
     */
    data: QRCodeCreateManyInput | QRCodeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * QRCode update
   */
  export type QRCodeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QRCode
     */
    select?: QRCodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the QRCode
     */
    omit?: QRCodeOmit<ExtArgs> | null
    /**
     * The data needed to update a QRCode.
     */
    data: XOR<QRCodeUpdateInput, QRCodeUncheckedUpdateInput>
    /**
     * Choose, which QRCode to update.
     */
    where: QRCodeWhereUniqueInput
  }

  /**
   * QRCode updateMany
   */
  export type QRCodeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update QRCodes.
     */
    data: XOR<QRCodeUpdateManyMutationInput, QRCodeUncheckedUpdateManyInput>
    /**
     * Filter which QRCodes to update
     */
    where?: QRCodeWhereInput
    /**
     * Limit how many QRCodes to update.
     */
    limit?: number
  }

  /**
   * QRCode updateManyAndReturn
   */
  export type QRCodeUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QRCode
     */
    select?: QRCodeSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the QRCode
     */
    omit?: QRCodeOmit<ExtArgs> | null
    /**
     * The data used to update QRCodes.
     */
    data: XOR<QRCodeUpdateManyMutationInput, QRCodeUncheckedUpdateManyInput>
    /**
     * Filter which QRCodes to update
     */
    where?: QRCodeWhereInput
    /**
     * Limit how many QRCodes to update.
     */
    limit?: number
  }

  /**
   * QRCode upsert
   */
  export type QRCodeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QRCode
     */
    select?: QRCodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the QRCode
     */
    omit?: QRCodeOmit<ExtArgs> | null
    /**
     * The filter to search for the QRCode to update in case it exists.
     */
    where: QRCodeWhereUniqueInput
    /**
     * In case the QRCode found by the `where` argument doesn't exist, create a new QRCode with this data.
     */
    create: XOR<QRCodeCreateInput, QRCodeUncheckedCreateInput>
    /**
     * In case the QRCode was found with the provided `where` argument, update it with this data.
     */
    update: XOR<QRCodeUpdateInput, QRCodeUncheckedUpdateInput>
  }

  /**
   * QRCode delete
   */
  export type QRCodeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QRCode
     */
    select?: QRCodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the QRCode
     */
    omit?: QRCodeOmit<ExtArgs> | null
    /**
     * Filter which QRCode to delete.
     */
    where: QRCodeWhereUniqueInput
  }

  /**
   * QRCode deleteMany
   */
  export type QRCodeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which QRCodes to delete
     */
    where?: QRCodeWhereInput
    /**
     * Limit how many QRCodes to delete.
     */
    limit?: number
  }

  /**
   * QRCode without action
   */
  export type QRCodeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QRCode
     */
    select?: QRCodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the QRCode
     */
    omit?: QRCodeOmit<ExtArgs> | null
  }


  /**
   * Model TempVisitorLink
   */

  export type AggregateTempVisitorLink = {
    _count: TempVisitorLinkCountAggregateOutputType | null
    _min: TempVisitorLinkMinAggregateOutputType | null
    _max: TempVisitorLinkMaxAggregateOutputType | null
  }

  export type TempVisitorLinkMinAggregateOutputType = {
    id: string | null
    uuid: string | null
    expiresAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
    used: boolean | null
  }

  export type TempVisitorLinkMaxAggregateOutputType = {
    id: string | null
    uuid: string | null
    expiresAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
    used: boolean | null
  }

  export type TempVisitorLinkCountAggregateOutputType = {
    id: number
    uuid: number
    expiresAt: number
    createdAt: number
    updatedAt: number
    used: number
    _all: number
  }


  export type TempVisitorLinkMinAggregateInputType = {
    id?: true
    uuid?: true
    expiresAt?: true
    createdAt?: true
    updatedAt?: true
    used?: true
  }

  export type TempVisitorLinkMaxAggregateInputType = {
    id?: true
    uuid?: true
    expiresAt?: true
    createdAt?: true
    updatedAt?: true
    used?: true
  }

  export type TempVisitorLinkCountAggregateInputType = {
    id?: true
    uuid?: true
    expiresAt?: true
    createdAt?: true
    updatedAt?: true
    used?: true
    _all?: true
  }

  export type TempVisitorLinkAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TempVisitorLink to aggregate.
     */
    where?: TempVisitorLinkWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TempVisitorLinks to fetch.
     */
    orderBy?: TempVisitorLinkOrderByWithRelationInput | TempVisitorLinkOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TempVisitorLinkWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TempVisitorLinks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TempVisitorLinks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TempVisitorLinks
    **/
    _count?: true | TempVisitorLinkCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TempVisitorLinkMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TempVisitorLinkMaxAggregateInputType
  }

  export type GetTempVisitorLinkAggregateType<T extends TempVisitorLinkAggregateArgs> = {
        [P in keyof T & keyof AggregateTempVisitorLink]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTempVisitorLink[P]>
      : GetScalarType<T[P], AggregateTempVisitorLink[P]>
  }




  export type TempVisitorLinkGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TempVisitorLinkWhereInput
    orderBy?: TempVisitorLinkOrderByWithAggregationInput | TempVisitorLinkOrderByWithAggregationInput[]
    by: TempVisitorLinkScalarFieldEnum[] | TempVisitorLinkScalarFieldEnum
    having?: TempVisitorLinkScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TempVisitorLinkCountAggregateInputType | true
    _min?: TempVisitorLinkMinAggregateInputType
    _max?: TempVisitorLinkMaxAggregateInputType
  }

  export type TempVisitorLinkGroupByOutputType = {
    id: string
    uuid: string
    expiresAt: Date
    createdAt: Date
    updatedAt: Date
    used: boolean
    _count: TempVisitorLinkCountAggregateOutputType | null
    _min: TempVisitorLinkMinAggregateOutputType | null
    _max: TempVisitorLinkMaxAggregateOutputType | null
  }

  type GetTempVisitorLinkGroupByPayload<T extends TempVisitorLinkGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TempVisitorLinkGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TempVisitorLinkGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TempVisitorLinkGroupByOutputType[P]>
            : GetScalarType<T[P], TempVisitorLinkGroupByOutputType[P]>
        }
      >
    >


  export type TempVisitorLinkSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    uuid?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    used?: boolean
  }, ExtArgs["result"]["tempVisitorLink"]>

  export type TempVisitorLinkSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    uuid?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    used?: boolean
  }, ExtArgs["result"]["tempVisitorLink"]>

  export type TempVisitorLinkSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    uuid?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    used?: boolean
  }, ExtArgs["result"]["tempVisitorLink"]>

  export type TempVisitorLinkSelectScalar = {
    id?: boolean
    uuid?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    used?: boolean
  }

  export type TempVisitorLinkOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "uuid" | "expiresAt" | "createdAt" | "updatedAt" | "used", ExtArgs["result"]["tempVisitorLink"]>

  export type $TempVisitorLinkPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TempVisitorLink"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      uuid: string
      expiresAt: Date
      createdAt: Date
      updatedAt: Date
      used: boolean
    }, ExtArgs["result"]["tempVisitorLink"]>
    composites: {}
  }

  type TempVisitorLinkGetPayload<S extends boolean | null | undefined | TempVisitorLinkDefaultArgs> = $Result.GetResult<Prisma.$TempVisitorLinkPayload, S>

  type TempVisitorLinkCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TempVisitorLinkFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TempVisitorLinkCountAggregateInputType | true
    }

  export interface TempVisitorLinkDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TempVisitorLink'], meta: { name: 'TempVisitorLink' } }
    /**
     * Find zero or one TempVisitorLink that matches the filter.
     * @param {TempVisitorLinkFindUniqueArgs} args - Arguments to find a TempVisitorLink
     * @example
     * // Get one TempVisitorLink
     * const tempVisitorLink = await prisma.tempVisitorLink.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TempVisitorLinkFindUniqueArgs>(args: SelectSubset<T, TempVisitorLinkFindUniqueArgs<ExtArgs>>): Prisma__TempVisitorLinkClient<$Result.GetResult<Prisma.$TempVisitorLinkPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one TempVisitorLink that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TempVisitorLinkFindUniqueOrThrowArgs} args - Arguments to find a TempVisitorLink
     * @example
     * // Get one TempVisitorLink
     * const tempVisitorLink = await prisma.tempVisitorLink.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TempVisitorLinkFindUniqueOrThrowArgs>(args: SelectSubset<T, TempVisitorLinkFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TempVisitorLinkClient<$Result.GetResult<Prisma.$TempVisitorLinkPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TempVisitorLink that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TempVisitorLinkFindFirstArgs} args - Arguments to find a TempVisitorLink
     * @example
     * // Get one TempVisitorLink
     * const tempVisitorLink = await prisma.tempVisitorLink.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TempVisitorLinkFindFirstArgs>(args?: SelectSubset<T, TempVisitorLinkFindFirstArgs<ExtArgs>>): Prisma__TempVisitorLinkClient<$Result.GetResult<Prisma.$TempVisitorLinkPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TempVisitorLink that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TempVisitorLinkFindFirstOrThrowArgs} args - Arguments to find a TempVisitorLink
     * @example
     * // Get one TempVisitorLink
     * const tempVisitorLink = await prisma.tempVisitorLink.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TempVisitorLinkFindFirstOrThrowArgs>(args?: SelectSubset<T, TempVisitorLinkFindFirstOrThrowArgs<ExtArgs>>): Prisma__TempVisitorLinkClient<$Result.GetResult<Prisma.$TempVisitorLinkPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more TempVisitorLinks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TempVisitorLinkFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TempVisitorLinks
     * const tempVisitorLinks = await prisma.tempVisitorLink.findMany()
     * 
     * // Get first 10 TempVisitorLinks
     * const tempVisitorLinks = await prisma.tempVisitorLink.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tempVisitorLinkWithIdOnly = await prisma.tempVisitorLink.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TempVisitorLinkFindManyArgs>(args?: SelectSubset<T, TempVisitorLinkFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TempVisitorLinkPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a TempVisitorLink.
     * @param {TempVisitorLinkCreateArgs} args - Arguments to create a TempVisitorLink.
     * @example
     * // Create one TempVisitorLink
     * const TempVisitorLink = await prisma.tempVisitorLink.create({
     *   data: {
     *     // ... data to create a TempVisitorLink
     *   }
     * })
     * 
     */
    create<T extends TempVisitorLinkCreateArgs>(args: SelectSubset<T, TempVisitorLinkCreateArgs<ExtArgs>>): Prisma__TempVisitorLinkClient<$Result.GetResult<Prisma.$TempVisitorLinkPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many TempVisitorLinks.
     * @param {TempVisitorLinkCreateManyArgs} args - Arguments to create many TempVisitorLinks.
     * @example
     * // Create many TempVisitorLinks
     * const tempVisitorLink = await prisma.tempVisitorLink.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TempVisitorLinkCreateManyArgs>(args?: SelectSubset<T, TempVisitorLinkCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TempVisitorLinks and returns the data saved in the database.
     * @param {TempVisitorLinkCreateManyAndReturnArgs} args - Arguments to create many TempVisitorLinks.
     * @example
     * // Create many TempVisitorLinks
     * const tempVisitorLink = await prisma.tempVisitorLink.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TempVisitorLinks and only return the `id`
     * const tempVisitorLinkWithIdOnly = await prisma.tempVisitorLink.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TempVisitorLinkCreateManyAndReturnArgs>(args?: SelectSubset<T, TempVisitorLinkCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TempVisitorLinkPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a TempVisitorLink.
     * @param {TempVisitorLinkDeleteArgs} args - Arguments to delete one TempVisitorLink.
     * @example
     * // Delete one TempVisitorLink
     * const TempVisitorLink = await prisma.tempVisitorLink.delete({
     *   where: {
     *     // ... filter to delete one TempVisitorLink
     *   }
     * })
     * 
     */
    delete<T extends TempVisitorLinkDeleteArgs>(args: SelectSubset<T, TempVisitorLinkDeleteArgs<ExtArgs>>): Prisma__TempVisitorLinkClient<$Result.GetResult<Prisma.$TempVisitorLinkPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one TempVisitorLink.
     * @param {TempVisitorLinkUpdateArgs} args - Arguments to update one TempVisitorLink.
     * @example
     * // Update one TempVisitorLink
     * const tempVisitorLink = await prisma.tempVisitorLink.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TempVisitorLinkUpdateArgs>(args: SelectSubset<T, TempVisitorLinkUpdateArgs<ExtArgs>>): Prisma__TempVisitorLinkClient<$Result.GetResult<Prisma.$TempVisitorLinkPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more TempVisitorLinks.
     * @param {TempVisitorLinkDeleteManyArgs} args - Arguments to filter TempVisitorLinks to delete.
     * @example
     * // Delete a few TempVisitorLinks
     * const { count } = await prisma.tempVisitorLink.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TempVisitorLinkDeleteManyArgs>(args?: SelectSubset<T, TempVisitorLinkDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TempVisitorLinks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TempVisitorLinkUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TempVisitorLinks
     * const tempVisitorLink = await prisma.tempVisitorLink.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TempVisitorLinkUpdateManyArgs>(args: SelectSubset<T, TempVisitorLinkUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TempVisitorLinks and returns the data updated in the database.
     * @param {TempVisitorLinkUpdateManyAndReturnArgs} args - Arguments to update many TempVisitorLinks.
     * @example
     * // Update many TempVisitorLinks
     * const tempVisitorLink = await prisma.tempVisitorLink.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more TempVisitorLinks and only return the `id`
     * const tempVisitorLinkWithIdOnly = await prisma.tempVisitorLink.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TempVisitorLinkUpdateManyAndReturnArgs>(args: SelectSubset<T, TempVisitorLinkUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TempVisitorLinkPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one TempVisitorLink.
     * @param {TempVisitorLinkUpsertArgs} args - Arguments to update or create a TempVisitorLink.
     * @example
     * // Update or create a TempVisitorLink
     * const tempVisitorLink = await prisma.tempVisitorLink.upsert({
     *   create: {
     *     // ... data to create a TempVisitorLink
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TempVisitorLink we want to update
     *   }
     * })
     */
    upsert<T extends TempVisitorLinkUpsertArgs>(args: SelectSubset<T, TempVisitorLinkUpsertArgs<ExtArgs>>): Prisma__TempVisitorLinkClient<$Result.GetResult<Prisma.$TempVisitorLinkPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of TempVisitorLinks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TempVisitorLinkCountArgs} args - Arguments to filter TempVisitorLinks to count.
     * @example
     * // Count the number of TempVisitorLinks
     * const count = await prisma.tempVisitorLink.count({
     *   where: {
     *     // ... the filter for the TempVisitorLinks we want to count
     *   }
     * })
    **/
    count<T extends TempVisitorLinkCountArgs>(
      args?: Subset<T, TempVisitorLinkCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TempVisitorLinkCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TempVisitorLink.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TempVisitorLinkAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TempVisitorLinkAggregateArgs>(args: Subset<T, TempVisitorLinkAggregateArgs>): Prisma.PrismaPromise<GetTempVisitorLinkAggregateType<T>>

    /**
     * Group by TempVisitorLink.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TempVisitorLinkGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TempVisitorLinkGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TempVisitorLinkGroupByArgs['orderBy'] }
        : { orderBy?: TempVisitorLinkGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TempVisitorLinkGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTempVisitorLinkGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TempVisitorLink model
   */
  readonly fields: TempVisitorLinkFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TempVisitorLink.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TempVisitorLinkClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TempVisitorLink model
   */
  interface TempVisitorLinkFieldRefs {
    readonly id: FieldRef<"TempVisitorLink", 'String'>
    readonly uuid: FieldRef<"TempVisitorLink", 'String'>
    readonly expiresAt: FieldRef<"TempVisitorLink", 'DateTime'>
    readonly createdAt: FieldRef<"TempVisitorLink", 'DateTime'>
    readonly updatedAt: FieldRef<"TempVisitorLink", 'DateTime'>
    readonly used: FieldRef<"TempVisitorLink", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * TempVisitorLink findUnique
   */
  export type TempVisitorLinkFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TempVisitorLink
     */
    select?: TempVisitorLinkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TempVisitorLink
     */
    omit?: TempVisitorLinkOmit<ExtArgs> | null
    /**
     * Filter, which TempVisitorLink to fetch.
     */
    where: TempVisitorLinkWhereUniqueInput
  }

  /**
   * TempVisitorLink findUniqueOrThrow
   */
  export type TempVisitorLinkFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TempVisitorLink
     */
    select?: TempVisitorLinkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TempVisitorLink
     */
    omit?: TempVisitorLinkOmit<ExtArgs> | null
    /**
     * Filter, which TempVisitorLink to fetch.
     */
    where: TempVisitorLinkWhereUniqueInput
  }

  /**
   * TempVisitorLink findFirst
   */
  export type TempVisitorLinkFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TempVisitorLink
     */
    select?: TempVisitorLinkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TempVisitorLink
     */
    omit?: TempVisitorLinkOmit<ExtArgs> | null
    /**
     * Filter, which TempVisitorLink to fetch.
     */
    where?: TempVisitorLinkWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TempVisitorLinks to fetch.
     */
    orderBy?: TempVisitorLinkOrderByWithRelationInput | TempVisitorLinkOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TempVisitorLinks.
     */
    cursor?: TempVisitorLinkWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TempVisitorLinks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TempVisitorLinks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TempVisitorLinks.
     */
    distinct?: TempVisitorLinkScalarFieldEnum | TempVisitorLinkScalarFieldEnum[]
  }

  /**
   * TempVisitorLink findFirstOrThrow
   */
  export type TempVisitorLinkFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TempVisitorLink
     */
    select?: TempVisitorLinkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TempVisitorLink
     */
    omit?: TempVisitorLinkOmit<ExtArgs> | null
    /**
     * Filter, which TempVisitorLink to fetch.
     */
    where?: TempVisitorLinkWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TempVisitorLinks to fetch.
     */
    orderBy?: TempVisitorLinkOrderByWithRelationInput | TempVisitorLinkOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TempVisitorLinks.
     */
    cursor?: TempVisitorLinkWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TempVisitorLinks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TempVisitorLinks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TempVisitorLinks.
     */
    distinct?: TempVisitorLinkScalarFieldEnum | TempVisitorLinkScalarFieldEnum[]
  }

  /**
   * TempVisitorLink findMany
   */
  export type TempVisitorLinkFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TempVisitorLink
     */
    select?: TempVisitorLinkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TempVisitorLink
     */
    omit?: TempVisitorLinkOmit<ExtArgs> | null
    /**
     * Filter, which TempVisitorLinks to fetch.
     */
    where?: TempVisitorLinkWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TempVisitorLinks to fetch.
     */
    orderBy?: TempVisitorLinkOrderByWithRelationInput | TempVisitorLinkOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TempVisitorLinks.
     */
    cursor?: TempVisitorLinkWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TempVisitorLinks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TempVisitorLinks.
     */
    skip?: number
    distinct?: TempVisitorLinkScalarFieldEnum | TempVisitorLinkScalarFieldEnum[]
  }

  /**
   * TempVisitorLink create
   */
  export type TempVisitorLinkCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TempVisitorLink
     */
    select?: TempVisitorLinkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TempVisitorLink
     */
    omit?: TempVisitorLinkOmit<ExtArgs> | null
    /**
     * The data needed to create a TempVisitorLink.
     */
    data: XOR<TempVisitorLinkCreateInput, TempVisitorLinkUncheckedCreateInput>
  }

  /**
   * TempVisitorLink createMany
   */
  export type TempVisitorLinkCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TempVisitorLinks.
     */
    data: TempVisitorLinkCreateManyInput | TempVisitorLinkCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TempVisitorLink createManyAndReturn
   */
  export type TempVisitorLinkCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TempVisitorLink
     */
    select?: TempVisitorLinkSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TempVisitorLink
     */
    omit?: TempVisitorLinkOmit<ExtArgs> | null
    /**
     * The data used to create many TempVisitorLinks.
     */
    data: TempVisitorLinkCreateManyInput | TempVisitorLinkCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TempVisitorLink update
   */
  export type TempVisitorLinkUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TempVisitorLink
     */
    select?: TempVisitorLinkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TempVisitorLink
     */
    omit?: TempVisitorLinkOmit<ExtArgs> | null
    /**
     * The data needed to update a TempVisitorLink.
     */
    data: XOR<TempVisitorLinkUpdateInput, TempVisitorLinkUncheckedUpdateInput>
    /**
     * Choose, which TempVisitorLink to update.
     */
    where: TempVisitorLinkWhereUniqueInput
  }

  /**
   * TempVisitorLink updateMany
   */
  export type TempVisitorLinkUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TempVisitorLinks.
     */
    data: XOR<TempVisitorLinkUpdateManyMutationInput, TempVisitorLinkUncheckedUpdateManyInput>
    /**
     * Filter which TempVisitorLinks to update
     */
    where?: TempVisitorLinkWhereInput
    /**
     * Limit how many TempVisitorLinks to update.
     */
    limit?: number
  }

  /**
   * TempVisitorLink updateManyAndReturn
   */
  export type TempVisitorLinkUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TempVisitorLink
     */
    select?: TempVisitorLinkSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TempVisitorLink
     */
    omit?: TempVisitorLinkOmit<ExtArgs> | null
    /**
     * The data used to update TempVisitorLinks.
     */
    data: XOR<TempVisitorLinkUpdateManyMutationInput, TempVisitorLinkUncheckedUpdateManyInput>
    /**
     * Filter which TempVisitorLinks to update
     */
    where?: TempVisitorLinkWhereInput
    /**
     * Limit how many TempVisitorLinks to update.
     */
    limit?: number
  }

  /**
   * TempVisitorLink upsert
   */
  export type TempVisitorLinkUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TempVisitorLink
     */
    select?: TempVisitorLinkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TempVisitorLink
     */
    omit?: TempVisitorLinkOmit<ExtArgs> | null
    /**
     * The filter to search for the TempVisitorLink to update in case it exists.
     */
    where: TempVisitorLinkWhereUniqueInput
    /**
     * In case the TempVisitorLink found by the `where` argument doesn't exist, create a new TempVisitorLink with this data.
     */
    create: XOR<TempVisitorLinkCreateInput, TempVisitorLinkUncheckedCreateInput>
    /**
     * In case the TempVisitorLink was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TempVisitorLinkUpdateInput, TempVisitorLinkUncheckedUpdateInput>
  }

  /**
   * TempVisitorLink delete
   */
  export type TempVisitorLinkDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TempVisitorLink
     */
    select?: TempVisitorLinkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TempVisitorLink
     */
    omit?: TempVisitorLinkOmit<ExtArgs> | null
    /**
     * Filter which TempVisitorLink to delete.
     */
    where: TempVisitorLinkWhereUniqueInput
  }

  /**
   * TempVisitorLink deleteMany
   */
  export type TempVisitorLinkDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TempVisitorLinks to delete
     */
    where?: TempVisitorLinkWhereInput
    /**
     * Limit how many TempVisitorLinks to delete.
     */
    limit?: number
  }

  /**
   * TempVisitorLink without action
   */
  export type TempVisitorLinkDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TempVisitorLink
     */
    select?: TempVisitorLinkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TempVisitorLink
     */
    omit?: TempVisitorLinkOmit<ExtArgs> | null
  }


  /**
   * Model Notification
   */

  export type AggregateNotification = {
    _count: NotificationCountAggregateOutputType | null
    _min: NotificationMinAggregateOutputType | null
    _max: NotificationMaxAggregateOutputType | null
  }

  export type NotificationMinAggregateOutputType = {
    id: string | null
    type: string | null
    title: string | null
    message: string | null
    isRead: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: string | null
  }

  export type NotificationMaxAggregateOutputType = {
    id: string | null
    type: string | null
    title: string | null
    message: string | null
    isRead: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: string | null
  }

  export type NotificationCountAggregateOutputType = {
    id: number
    type: number
    title: number
    message: number
    isRead: number
    createdAt: number
    updatedAt: number
    userId: number
    _all: number
  }


  export type NotificationMinAggregateInputType = {
    id?: true
    type?: true
    title?: true
    message?: true
    isRead?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
  }

  export type NotificationMaxAggregateInputType = {
    id?: true
    type?: true
    title?: true
    message?: true
    isRead?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
  }

  export type NotificationCountAggregateInputType = {
    id?: true
    type?: true
    title?: true
    message?: true
    isRead?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    _all?: true
  }

  export type NotificationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Notification to aggregate.
     */
    where?: NotificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notifications to fetch.
     */
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: NotificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Notifications
    **/
    _count?: true | NotificationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: NotificationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: NotificationMaxAggregateInputType
  }

  export type GetNotificationAggregateType<T extends NotificationAggregateArgs> = {
        [P in keyof T & keyof AggregateNotification]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateNotification[P]>
      : GetScalarType<T[P], AggregateNotification[P]>
  }




  export type NotificationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: NotificationWhereInput
    orderBy?: NotificationOrderByWithAggregationInput | NotificationOrderByWithAggregationInput[]
    by: NotificationScalarFieldEnum[] | NotificationScalarFieldEnum
    having?: NotificationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: NotificationCountAggregateInputType | true
    _min?: NotificationMinAggregateInputType
    _max?: NotificationMaxAggregateInputType
  }

  export type NotificationGroupByOutputType = {
    id: string
    type: string
    title: string
    message: string
    isRead: boolean
    createdAt: Date
    updatedAt: Date
    userId: string | null
    _count: NotificationCountAggregateOutputType | null
    _min: NotificationMinAggregateOutputType | null
    _max: NotificationMaxAggregateOutputType | null
  }

  type GetNotificationGroupByPayload<T extends NotificationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<NotificationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof NotificationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], NotificationGroupByOutputType[P]>
            : GetScalarType<T[P], NotificationGroupByOutputType[P]>
        }
      >
    >


  export type NotificationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    type?: boolean
    title?: boolean
    message?: boolean
    isRead?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    user?: boolean | Notification$userArgs<ExtArgs>
  }, ExtArgs["result"]["notification"]>

  export type NotificationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    type?: boolean
    title?: boolean
    message?: boolean
    isRead?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    user?: boolean | Notification$userArgs<ExtArgs>
  }, ExtArgs["result"]["notification"]>

  export type NotificationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    type?: boolean
    title?: boolean
    message?: boolean
    isRead?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    user?: boolean | Notification$userArgs<ExtArgs>
  }, ExtArgs["result"]["notification"]>

  export type NotificationSelectScalar = {
    id?: boolean
    type?: boolean
    title?: boolean
    message?: boolean
    isRead?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
  }

  export type NotificationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "type" | "title" | "message" | "isRead" | "createdAt" | "updatedAt" | "userId", ExtArgs["result"]["notification"]>
  export type NotificationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | Notification$userArgs<ExtArgs>
  }
  export type NotificationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | Notification$userArgs<ExtArgs>
  }
  export type NotificationIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | Notification$userArgs<ExtArgs>
  }

  export type $NotificationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Notification"
    objects: {
      user: Prisma.$UserPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      type: string
      title: string
      message: string
      isRead: boolean
      createdAt: Date
      updatedAt: Date
      userId: string | null
    }, ExtArgs["result"]["notification"]>
    composites: {}
  }

  type NotificationGetPayload<S extends boolean | null | undefined | NotificationDefaultArgs> = $Result.GetResult<Prisma.$NotificationPayload, S>

  type NotificationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<NotificationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: NotificationCountAggregateInputType | true
    }

  export interface NotificationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Notification'], meta: { name: 'Notification' } }
    /**
     * Find zero or one Notification that matches the filter.
     * @param {NotificationFindUniqueArgs} args - Arguments to find a Notification
     * @example
     * // Get one Notification
     * const notification = await prisma.notification.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends NotificationFindUniqueArgs>(args: SelectSubset<T, NotificationFindUniqueArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Notification that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {NotificationFindUniqueOrThrowArgs} args - Arguments to find a Notification
     * @example
     * // Get one Notification
     * const notification = await prisma.notification.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends NotificationFindUniqueOrThrowArgs>(args: SelectSubset<T, NotificationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Notification that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationFindFirstArgs} args - Arguments to find a Notification
     * @example
     * // Get one Notification
     * const notification = await prisma.notification.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends NotificationFindFirstArgs>(args?: SelectSubset<T, NotificationFindFirstArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Notification that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationFindFirstOrThrowArgs} args - Arguments to find a Notification
     * @example
     * // Get one Notification
     * const notification = await prisma.notification.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends NotificationFindFirstOrThrowArgs>(args?: SelectSubset<T, NotificationFindFirstOrThrowArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Notifications that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Notifications
     * const notifications = await prisma.notification.findMany()
     * 
     * // Get first 10 Notifications
     * const notifications = await prisma.notification.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const notificationWithIdOnly = await prisma.notification.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends NotificationFindManyArgs>(args?: SelectSubset<T, NotificationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Notification.
     * @param {NotificationCreateArgs} args - Arguments to create a Notification.
     * @example
     * // Create one Notification
     * const Notification = await prisma.notification.create({
     *   data: {
     *     // ... data to create a Notification
     *   }
     * })
     * 
     */
    create<T extends NotificationCreateArgs>(args: SelectSubset<T, NotificationCreateArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Notifications.
     * @param {NotificationCreateManyArgs} args - Arguments to create many Notifications.
     * @example
     * // Create many Notifications
     * const notification = await prisma.notification.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends NotificationCreateManyArgs>(args?: SelectSubset<T, NotificationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Notifications and returns the data saved in the database.
     * @param {NotificationCreateManyAndReturnArgs} args - Arguments to create many Notifications.
     * @example
     * // Create many Notifications
     * const notification = await prisma.notification.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Notifications and only return the `id`
     * const notificationWithIdOnly = await prisma.notification.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends NotificationCreateManyAndReturnArgs>(args?: SelectSubset<T, NotificationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Notification.
     * @param {NotificationDeleteArgs} args - Arguments to delete one Notification.
     * @example
     * // Delete one Notification
     * const Notification = await prisma.notification.delete({
     *   where: {
     *     // ... filter to delete one Notification
     *   }
     * })
     * 
     */
    delete<T extends NotificationDeleteArgs>(args: SelectSubset<T, NotificationDeleteArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Notification.
     * @param {NotificationUpdateArgs} args - Arguments to update one Notification.
     * @example
     * // Update one Notification
     * const notification = await prisma.notification.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends NotificationUpdateArgs>(args: SelectSubset<T, NotificationUpdateArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Notifications.
     * @param {NotificationDeleteManyArgs} args - Arguments to filter Notifications to delete.
     * @example
     * // Delete a few Notifications
     * const { count } = await prisma.notification.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends NotificationDeleteManyArgs>(args?: SelectSubset<T, NotificationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Notifications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Notifications
     * const notification = await prisma.notification.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends NotificationUpdateManyArgs>(args: SelectSubset<T, NotificationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Notifications and returns the data updated in the database.
     * @param {NotificationUpdateManyAndReturnArgs} args - Arguments to update many Notifications.
     * @example
     * // Update many Notifications
     * const notification = await prisma.notification.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Notifications and only return the `id`
     * const notificationWithIdOnly = await prisma.notification.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends NotificationUpdateManyAndReturnArgs>(args: SelectSubset<T, NotificationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Notification.
     * @param {NotificationUpsertArgs} args - Arguments to update or create a Notification.
     * @example
     * // Update or create a Notification
     * const notification = await prisma.notification.upsert({
     *   create: {
     *     // ... data to create a Notification
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Notification we want to update
     *   }
     * })
     */
    upsert<T extends NotificationUpsertArgs>(args: SelectSubset<T, NotificationUpsertArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Notifications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationCountArgs} args - Arguments to filter Notifications to count.
     * @example
     * // Count the number of Notifications
     * const count = await prisma.notification.count({
     *   where: {
     *     // ... the filter for the Notifications we want to count
     *   }
     * })
    **/
    count<T extends NotificationCountArgs>(
      args?: Subset<T, NotificationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], NotificationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Notification.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends NotificationAggregateArgs>(args: Subset<T, NotificationAggregateArgs>): Prisma.PrismaPromise<GetNotificationAggregateType<T>>

    /**
     * Group by Notification.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends NotificationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: NotificationGroupByArgs['orderBy'] }
        : { orderBy?: NotificationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, NotificationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetNotificationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Notification model
   */
  readonly fields: NotificationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Notification.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__NotificationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends Notification$userArgs<ExtArgs> = {}>(args?: Subset<T, Notification$userArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Notification model
   */
  interface NotificationFieldRefs {
    readonly id: FieldRef<"Notification", 'String'>
    readonly type: FieldRef<"Notification", 'String'>
    readonly title: FieldRef<"Notification", 'String'>
    readonly message: FieldRef<"Notification", 'String'>
    readonly isRead: FieldRef<"Notification", 'Boolean'>
    readonly createdAt: FieldRef<"Notification", 'DateTime'>
    readonly updatedAt: FieldRef<"Notification", 'DateTime'>
    readonly userId: FieldRef<"Notification", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Notification findUnique
   */
  export type NotificationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter, which Notification to fetch.
     */
    where: NotificationWhereUniqueInput
  }

  /**
   * Notification findUniqueOrThrow
   */
  export type NotificationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter, which Notification to fetch.
     */
    where: NotificationWhereUniqueInput
  }

  /**
   * Notification findFirst
   */
  export type NotificationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter, which Notification to fetch.
     */
    where?: NotificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notifications to fetch.
     */
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Notifications.
     */
    cursor?: NotificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Notifications.
     */
    distinct?: NotificationScalarFieldEnum | NotificationScalarFieldEnum[]
  }

  /**
   * Notification findFirstOrThrow
   */
  export type NotificationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter, which Notification to fetch.
     */
    where?: NotificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notifications to fetch.
     */
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Notifications.
     */
    cursor?: NotificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Notifications.
     */
    distinct?: NotificationScalarFieldEnum | NotificationScalarFieldEnum[]
  }

  /**
   * Notification findMany
   */
  export type NotificationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter, which Notifications to fetch.
     */
    where?: NotificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notifications to fetch.
     */
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Notifications.
     */
    cursor?: NotificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notifications.
     */
    skip?: number
    distinct?: NotificationScalarFieldEnum | NotificationScalarFieldEnum[]
  }

  /**
   * Notification create
   */
  export type NotificationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * The data needed to create a Notification.
     */
    data: XOR<NotificationCreateInput, NotificationUncheckedCreateInput>
  }

  /**
   * Notification createMany
   */
  export type NotificationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Notifications.
     */
    data: NotificationCreateManyInput | NotificationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Notification createManyAndReturn
   */
  export type NotificationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * The data used to create many Notifications.
     */
    data: NotificationCreateManyInput | NotificationCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Notification update
   */
  export type NotificationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * The data needed to update a Notification.
     */
    data: XOR<NotificationUpdateInput, NotificationUncheckedUpdateInput>
    /**
     * Choose, which Notification to update.
     */
    where: NotificationWhereUniqueInput
  }

  /**
   * Notification updateMany
   */
  export type NotificationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Notifications.
     */
    data: XOR<NotificationUpdateManyMutationInput, NotificationUncheckedUpdateManyInput>
    /**
     * Filter which Notifications to update
     */
    where?: NotificationWhereInput
    /**
     * Limit how many Notifications to update.
     */
    limit?: number
  }

  /**
   * Notification updateManyAndReturn
   */
  export type NotificationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * The data used to update Notifications.
     */
    data: XOR<NotificationUpdateManyMutationInput, NotificationUncheckedUpdateManyInput>
    /**
     * Filter which Notifications to update
     */
    where?: NotificationWhereInput
    /**
     * Limit how many Notifications to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Notification upsert
   */
  export type NotificationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * The filter to search for the Notification to update in case it exists.
     */
    where: NotificationWhereUniqueInput
    /**
     * In case the Notification found by the `where` argument doesn't exist, create a new Notification with this data.
     */
    create: XOR<NotificationCreateInput, NotificationUncheckedCreateInput>
    /**
     * In case the Notification was found with the provided `where` argument, update it with this data.
     */
    update: XOR<NotificationUpdateInput, NotificationUncheckedUpdateInput>
  }

  /**
   * Notification delete
   */
  export type NotificationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter which Notification to delete.
     */
    where: NotificationWhereUniqueInput
  }

  /**
   * Notification deleteMany
   */
  export type NotificationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Notifications to delete
     */
    where?: NotificationWhereInput
    /**
     * Limit how many Notifications to delete.
     */
    limit?: number
  }

  /**
   * Notification.user
   */
  export type Notification$userArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * Notification without action
   */
  export type NotificationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
  }


  /**
   * Model Guest
   */

  export type AggregateGuest = {
    _count: GuestCountAggregateOutputType | null
    _avg: GuestAvgAggregateOutputType | null
    _sum: GuestSumAggregateOutputType | null
    _min: GuestMinAggregateOutputType | null
    _max: GuestMaxAggregateOutputType | null
  }

  export type GuestAvgAggregateOutputType = {
    age: number | null
  }

  export type GuestSumAggregateOutputType = {
    age: number | null
  }

  export type GuestMinAggregateOutputType = {
    id: string | null
    fullName: string | null
    email: string | null
    address: string | null
    phone: string | null
    age: number | null
    institution: string | null
    gender: $Enums.Gender | null
    lastEducation: $Enums.LastEducation | null
    occupation: string | null
    purpose: $Enums.Purpose | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type GuestMaxAggregateOutputType = {
    id: string | null
    fullName: string | null
    email: string | null
    address: string | null
    phone: string | null
    age: number | null
    institution: string | null
    gender: $Enums.Gender | null
    lastEducation: $Enums.LastEducation | null
    occupation: string | null
    purpose: $Enums.Purpose | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type GuestCountAggregateOutputType = {
    id: number
    fullName: number
    email: number
    address: number
    phone: number
    age: number
    institution: number
    gender: number
    lastEducation: number
    occupation: number
    purpose: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type GuestAvgAggregateInputType = {
    age?: true
  }

  export type GuestSumAggregateInputType = {
    age?: true
  }

  export type GuestMinAggregateInputType = {
    id?: true
    fullName?: true
    email?: true
    address?: true
    phone?: true
    age?: true
    institution?: true
    gender?: true
    lastEducation?: true
    occupation?: true
    purpose?: true
    createdAt?: true
    updatedAt?: true
  }

  export type GuestMaxAggregateInputType = {
    id?: true
    fullName?: true
    email?: true
    address?: true
    phone?: true
    age?: true
    institution?: true
    gender?: true
    lastEducation?: true
    occupation?: true
    purpose?: true
    createdAt?: true
    updatedAt?: true
  }

  export type GuestCountAggregateInputType = {
    id?: true
    fullName?: true
    email?: true
    address?: true
    phone?: true
    age?: true
    institution?: true
    gender?: true
    lastEducation?: true
    occupation?: true
    purpose?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type GuestAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Guest to aggregate.
     */
    where?: GuestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Guests to fetch.
     */
    orderBy?: GuestOrderByWithRelationInput | GuestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GuestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Guests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Guests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Guests
    **/
    _count?: true | GuestCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: GuestAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: GuestSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GuestMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GuestMaxAggregateInputType
  }

  export type GetGuestAggregateType<T extends GuestAggregateArgs> = {
        [P in keyof T & keyof AggregateGuest]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGuest[P]>
      : GetScalarType<T[P], AggregateGuest[P]>
  }




  export type GuestGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GuestWhereInput
    orderBy?: GuestOrderByWithAggregationInput | GuestOrderByWithAggregationInput[]
    by: GuestScalarFieldEnum[] | GuestScalarFieldEnum
    having?: GuestScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GuestCountAggregateInputType | true
    _avg?: GuestAvgAggregateInputType
    _sum?: GuestSumAggregateInputType
    _min?: GuestMinAggregateInputType
    _max?: GuestMaxAggregateInputType
  }

  export type GuestGroupByOutputType = {
    id: string
    fullName: string
    email: string | null
    address: string | null
    phone: string
    age: number | null
    institution: string | null
    gender: $Enums.Gender | null
    lastEducation: $Enums.LastEducation | null
    occupation: string | null
    purpose: $Enums.Purpose | null
    createdAt: Date
    updatedAt: Date
    _count: GuestCountAggregateOutputType | null
    _avg: GuestAvgAggregateOutputType | null
    _sum: GuestSumAggregateOutputType | null
    _min: GuestMinAggregateOutputType | null
    _max: GuestMaxAggregateOutputType | null
  }

  type GetGuestGroupByPayload<T extends GuestGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GuestGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GuestGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GuestGroupByOutputType[P]>
            : GetScalarType<T[P], GuestGroupByOutputType[P]>
        }
      >
    >


  export type GuestSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    fullName?: boolean
    email?: boolean
    address?: boolean
    phone?: boolean
    age?: boolean
    institution?: boolean
    gender?: boolean
    lastEducation?: boolean
    occupation?: boolean
    purpose?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    queues?: boolean | Guest$queuesArgs<ExtArgs>
    _count?: boolean | GuestCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["guest"]>

  export type GuestSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    fullName?: boolean
    email?: boolean
    address?: boolean
    phone?: boolean
    age?: boolean
    institution?: boolean
    gender?: boolean
    lastEducation?: boolean
    occupation?: boolean
    purpose?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["guest"]>

  export type GuestSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    fullName?: boolean
    email?: boolean
    address?: boolean
    phone?: boolean
    age?: boolean
    institution?: boolean
    gender?: boolean
    lastEducation?: boolean
    occupation?: boolean
    purpose?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["guest"]>

  export type GuestSelectScalar = {
    id?: boolean
    fullName?: boolean
    email?: boolean
    address?: boolean
    phone?: boolean
    age?: boolean
    institution?: boolean
    gender?: boolean
    lastEducation?: boolean
    occupation?: boolean
    purpose?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type GuestOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "fullName" | "email" | "address" | "phone" | "age" | "institution" | "gender" | "lastEducation" | "occupation" | "purpose" | "createdAt" | "updatedAt", ExtArgs["result"]["guest"]>
  export type GuestInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    queues?: boolean | Guest$queuesArgs<ExtArgs>
    _count?: boolean | GuestCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type GuestIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type GuestIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $GuestPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Guest"
    objects: {
      queues: Prisma.$QueuePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      fullName: string
      email: string | null
      address: string | null
      phone: string
      age: number | null
      institution: string | null
      gender: $Enums.Gender | null
      lastEducation: $Enums.LastEducation | null
      occupation: string | null
      purpose: $Enums.Purpose | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["guest"]>
    composites: {}
  }

  type GuestGetPayload<S extends boolean | null | undefined | GuestDefaultArgs> = $Result.GetResult<Prisma.$GuestPayload, S>

  type GuestCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<GuestFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: GuestCountAggregateInputType | true
    }

  export interface GuestDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Guest'], meta: { name: 'Guest' } }
    /**
     * Find zero or one Guest that matches the filter.
     * @param {GuestFindUniqueArgs} args - Arguments to find a Guest
     * @example
     * // Get one Guest
     * const guest = await prisma.guest.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GuestFindUniqueArgs>(args: SelectSubset<T, GuestFindUniqueArgs<ExtArgs>>): Prisma__GuestClient<$Result.GetResult<Prisma.$GuestPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Guest that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {GuestFindUniqueOrThrowArgs} args - Arguments to find a Guest
     * @example
     * // Get one Guest
     * const guest = await prisma.guest.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GuestFindUniqueOrThrowArgs>(args: SelectSubset<T, GuestFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GuestClient<$Result.GetResult<Prisma.$GuestPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Guest that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuestFindFirstArgs} args - Arguments to find a Guest
     * @example
     * // Get one Guest
     * const guest = await prisma.guest.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GuestFindFirstArgs>(args?: SelectSubset<T, GuestFindFirstArgs<ExtArgs>>): Prisma__GuestClient<$Result.GetResult<Prisma.$GuestPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Guest that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuestFindFirstOrThrowArgs} args - Arguments to find a Guest
     * @example
     * // Get one Guest
     * const guest = await prisma.guest.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GuestFindFirstOrThrowArgs>(args?: SelectSubset<T, GuestFindFirstOrThrowArgs<ExtArgs>>): Prisma__GuestClient<$Result.GetResult<Prisma.$GuestPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Guests that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuestFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Guests
     * const guests = await prisma.guest.findMany()
     * 
     * // Get first 10 Guests
     * const guests = await prisma.guest.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const guestWithIdOnly = await prisma.guest.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GuestFindManyArgs>(args?: SelectSubset<T, GuestFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GuestPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Guest.
     * @param {GuestCreateArgs} args - Arguments to create a Guest.
     * @example
     * // Create one Guest
     * const Guest = await prisma.guest.create({
     *   data: {
     *     // ... data to create a Guest
     *   }
     * })
     * 
     */
    create<T extends GuestCreateArgs>(args: SelectSubset<T, GuestCreateArgs<ExtArgs>>): Prisma__GuestClient<$Result.GetResult<Prisma.$GuestPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Guests.
     * @param {GuestCreateManyArgs} args - Arguments to create many Guests.
     * @example
     * // Create many Guests
     * const guest = await prisma.guest.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GuestCreateManyArgs>(args?: SelectSubset<T, GuestCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Guests and returns the data saved in the database.
     * @param {GuestCreateManyAndReturnArgs} args - Arguments to create many Guests.
     * @example
     * // Create many Guests
     * const guest = await prisma.guest.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Guests and only return the `id`
     * const guestWithIdOnly = await prisma.guest.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends GuestCreateManyAndReturnArgs>(args?: SelectSubset<T, GuestCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GuestPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Guest.
     * @param {GuestDeleteArgs} args - Arguments to delete one Guest.
     * @example
     * // Delete one Guest
     * const Guest = await prisma.guest.delete({
     *   where: {
     *     // ... filter to delete one Guest
     *   }
     * })
     * 
     */
    delete<T extends GuestDeleteArgs>(args: SelectSubset<T, GuestDeleteArgs<ExtArgs>>): Prisma__GuestClient<$Result.GetResult<Prisma.$GuestPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Guest.
     * @param {GuestUpdateArgs} args - Arguments to update one Guest.
     * @example
     * // Update one Guest
     * const guest = await prisma.guest.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GuestUpdateArgs>(args: SelectSubset<T, GuestUpdateArgs<ExtArgs>>): Prisma__GuestClient<$Result.GetResult<Prisma.$GuestPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Guests.
     * @param {GuestDeleteManyArgs} args - Arguments to filter Guests to delete.
     * @example
     * // Delete a few Guests
     * const { count } = await prisma.guest.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GuestDeleteManyArgs>(args?: SelectSubset<T, GuestDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Guests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuestUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Guests
     * const guest = await prisma.guest.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GuestUpdateManyArgs>(args: SelectSubset<T, GuestUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Guests and returns the data updated in the database.
     * @param {GuestUpdateManyAndReturnArgs} args - Arguments to update many Guests.
     * @example
     * // Update many Guests
     * const guest = await prisma.guest.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Guests and only return the `id`
     * const guestWithIdOnly = await prisma.guest.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends GuestUpdateManyAndReturnArgs>(args: SelectSubset<T, GuestUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GuestPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Guest.
     * @param {GuestUpsertArgs} args - Arguments to update or create a Guest.
     * @example
     * // Update or create a Guest
     * const guest = await prisma.guest.upsert({
     *   create: {
     *     // ... data to create a Guest
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Guest we want to update
     *   }
     * })
     */
    upsert<T extends GuestUpsertArgs>(args: SelectSubset<T, GuestUpsertArgs<ExtArgs>>): Prisma__GuestClient<$Result.GetResult<Prisma.$GuestPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Guests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuestCountArgs} args - Arguments to filter Guests to count.
     * @example
     * // Count the number of Guests
     * const count = await prisma.guest.count({
     *   where: {
     *     // ... the filter for the Guests we want to count
     *   }
     * })
    **/
    count<T extends GuestCountArgs>(
      args?: Subset<T, GuestCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GuestCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Guest.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuestAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GuestAggregateArgs>(args: Subset<T, GuestAggregateArgs>): Prisma.PrismaPromise<GetGuestAggregateType<T>>

    /**
     * Group by Guest.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuestGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends GuestGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GuestGroupByArgs['orderBy'] }
        : { orderBy?: GuestGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, GuestGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGuestGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Guest model
   */
  readonly fields: GuestFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Guest.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GuestClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    queues<T extends Guest$queuesArgs<ExtArgs> = {}>(args?: Subset<T, Guest$queuesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$QueuePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Guest model
   */
  interface GuestFieldRefs {
    readonly id: FieldRef<"Guest", 'String'>
    readonly fullName: FieldRef<"Guest", 'String'>
    readonly email: FieldRef<"Guest", 'String'>
    readonly address: FieldRef<"Guest", 'String'>
    readonly phone: FieldRef<"Guest", 'String'>
    readonly age: FieldRef<"Guest", 'Int'>
    readonly institution: FieldRef<"Guest", 'String'>
    readonly gender: FieldRef<"Guest", 'Gender'>
    readonly lastEducation: FieldRef<"Guest", 'LastEducation'>
    readonly occupation: FieldRef<"Guest", 'String'>
    readonly purpose: FieldRef<"Guest", 'Purpose'>
    readonly createdAt: FieldRef<"Guest", 'DateTime'>
    readonly updatedAt: FieldRef<"Guest", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Guest findUnique
   */
  export type GuestFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guest
     */
    select?: GuestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Guest
     */
    omit?: GuestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuestInclude<ExtArgs> | null
    /**
     * Filter, which Guest to fetch.
     */
    where: GuestWhereUniqueInput
  }

  /**
   * Guest findUniqueOrThrow
   */
  export type GuestFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guest
     */
    select?: GuestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Guest
     */
    omit?: GuestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuestInclude<ExtArgs> | null
    /**
     * Filter, which Guest to fetch.
     */
    where: GuestWhereUniqueInput
  }

  /**
   * Guest findFirst
   */
  export type GuestFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guest
     */
    select?: GuestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Guest
     */
    omit?: GuestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuestInclude<ExtArgs> | null
    /**
     * Filter, which Guest to fetch.
     */
    where?: GuestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Guests to fetch.
     */
    orderBy?: GuestOrderByWithRelationInput | GuestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Guests.
     */
    cursor?: GuestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Guests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Guests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Guests.
     */
    distinct?: GuestScalarFieldEnum | GuestScalarFieldEnum[]
  }

  /**
   * Guest findFirstOrThrow
   */
  export type GuestFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guest
     */
    select?: GuestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Guest
     */
    omit?: GuestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuestInclude<ExtArgs> | null
    /**
     * Filter, which Guest to fetch.
     */
    where?: GuestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Guests to fetch.
     */
    orderBy?: GuestOrderByWithRelationInput | GuestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Guests.
     */
    cursor?: GuestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Guests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Guests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Guests.
     */
    distinct?: GuestScalarFieldEnum | GuestScalarFieldEnum[]
  }

  /**
   * Guest findMany
   */
  export type GuestFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guest
     */
    select?: GuestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Guest
     */
    omit?: GuestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuestInclude<ExtArgs> | null
    /**
     * Filter, which Guests to fetch.
     */
    where?: GuestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Guests to fetch.
     */
    orderBy?: GuestOrderByWithRelationInput | GuestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Guests.
     */
    cursor?: GuestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Guests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Guests.
     */
    skip?: number
    distinct?: GuestScalarFieldEnum | GuestScalarFieldEnum[]
  }

  /**
   * Guest create
   */
  export type GuestCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guest
     */
    select?: GuestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Guest
     */
    omit?: GuestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuestInclude<ExtArgs> | null
    /**
     * The data needed to create a Guest.
     */
    data: XOR<GuestCreateInput, GuestUncheckedCreateInput>
  }

  /**
   * Guest createMany
   */
  export type GuestCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Guests.
     */
    data: GuestCreateManyInput | GuestCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Guest createManyAndReturn
   */
  export type GuestCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guest
     */
    select?: GuestSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Guest
     */
    omit?: GuestOmit<ExtArgs> | null
    /**
     * The data used to create many Guests.
     */
    data: GuestCreateManyInput | GuestCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Guest update
   */
  export type GuestUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guest
     */
    select?: GuestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Guest
     */
    omit?: GuestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuestInclude<ExtArgs> | null
    /**
     * The data needed to update a Guest.
     */
    data: XOR<GuestUpdateInput, GuestUncheckedUpdateInput>
    /**
     * Choose, which Guest to update.
     */
    where: GuestWhereUniqueInput
  }

  /**
   * Guest updateMany
   */
  export type GuestUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Guests.
     */
    data: XOR<GuestUpdateManyMutationInput, GuestUncheckedUpdateManyInput>
    /**
     * Filter which Guests to update
     */
    where?: GuestWhereInput
    /**
     * Limit how many Guests to update.
     */
    limit?: number
  }

  /**
   * Guest updateManyAndReturn
   */
  export type GuestUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guest
     */
    select?: GuestSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Guest
     */
    omit?: GuestOmit<ExtArgs> | null
    /**
     * The data used to update Guests.
     */
    data: XOR<GuestUpdateManyMutationInput, GuestUncheckedUpdateManyInput>
    /**
     * Filter which Guests to update
     */
    where?: GuestWhereInput
    /**
     * Limit how many Guests to update.
     */
    limit?: number
  }

  /**
   * Guest upsert
   */
  export type GuestUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guest
     */
    select?: GuestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Guest
     */
    omit?: GuestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuestInclude<ExtArgs> | null
    /**
     * The filter to search for the Guest to update in case it exists.
     */
    where: GuestWhereUniqueInput
    /**
     * In case the Guest found by the `where` argument doesn't exist, create a new Guest with this data.
     */
    create: XOR<GuestCreateInput, GuestUncheckedCreateInput>
    /**
     * In case the Guest was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GuestUpdateInput, GuestUncheckedUpdateInput>
  }

  /**
   * Guest delete
   */
  export type GuestDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guest
     */
    select?: GuestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Guest
     */
    omit?: GuestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuestInclude<ExtArgs> | null
    /**
     * Filter which Guest to delete.
     */
    where: GuestWhereUniqueInput
  }

  /**
   * Guest deleteMany
   */
  export type GuestDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Guests to delete
     */
    where?: GuestWhereInput
    /**
     * Limit how many Guests to delete.
     */
    limit?: number
  }

  /**
   * Guest.queues
   */
  export type Guest$queuesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Queue
     */
    select?: QueueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Queue
     */
    omit?: QueueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QueueInclude<ExtArgs> | null
    where?: QueueWhereInput
    orderBy?: QueueOrderByWithRelationInput | QueueOrderByWithRelationInput[]
    cursor?: QueueWhereUniqueInput
    take?: number
    skip?: number
    distinct?: QueueScalarFieldEnum | QueueScalarFieldEnum[]
  }

  /**
   * Guest without action
   */
  export type GuestDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guest
     */
    select?: GuestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Guest
     */
    omit?: GuestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuestInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    username: 'username',
    password: 'password',
    name: 'name',
    role: 'role',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const ServiceScalarFieldEnum: {
    id: 'id',
    name: 'name',
    status: 'status',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ServiceScalarFieldEnum = (typeof ServiceScalarFieldEnum)[keyof typeof ServiceScalarFieldEnum]


  export const VisitorScalarFieldEnum: {
    id: 'id',
    name: 'name',
    phone: 'phone',
    address: 'address',
    age: 'age',
    gender: 'gender',
    lastEducation: 'lastEducation',
    occupation: 'occupation',
    institution: 'institution',
    email: 'email',
    purpose: 'purpose',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type VisitorScalarFieldEnum = (typeof VisitorScalarFieldEnum)[keyof typeof VisitorScalarFieldEnum]


  export const QueueScalarFieldEnum: {
    id: 'id',
    queueNumber: 'queueNumber',
    status: 'status',
    queueType: 'queueType',
    queueDate: 'queueDate',
    visitorId: 'visitorId',
    guestId: 'guestId',
    serviceId: 'serviceId',
    adminId: 'adminId',
    startTime: 'startTime',
    endTime: 'endTime',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    tempUuid: 'tempUuid',
    filledSKD: 'filledSKD',
    trackingLink: 'trackingLink'
  };

  export type QueueScalarFieldEnum = (typeof QueueScalarFieldEnum)[keyof typeof QueueScalarFieldEnum]


  export const QRCodeScalarFieldEnum: {
    id: 'id',
    staticUuid: 'staticUuid',
    path: 'path',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type QRCodeScalarFieldEnum = (typeof QRCodeScalarFieldEnum)[keyof typeof QRCodeScalarFieldEnum]


  export const TempVisitorLinkScalarFieldEnum: {
    id: 'id',
    uuid: 'uuid',
    expiresAt: 'expiresAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    used: 'used'
  };

  export type TempVisitorLinkScalarFieldEnum = (typeof TempVisitorLinkScalarFieldEnum)[keyof typeof TempVisitorLinkScalarFieldEnum]


  export const NotificationScalarFieldEnum: {
    id: 'id',
    type: 'type',
    title: 'title',
    message: 'message',
    isRead: 'isRead',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    userId: 'userId'
  };

  export type NotificationScalarFieldEnum = (typeof NotificationScalarFieldEnum)[keyof typeof NotificationScalarFieldEnum]


  export const GuestScalarFieldEnum: {
    id: 'id',
    fullName: 'fullName',
    email: 'email',
    address: 'address',
    phone: 'phone',
    age: 'age',
    institution: 'institution',
    gender: 'gender',
    lastEducation: 'lastEducation',
    occupation: 'occupation',
    purpose: 'purpose',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type GuestScalarFieldEnum = (typeof GuestScalarFieldEnum)[keyof typeof GuestScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Role'
   */
  export type EnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role'>
    


  /**
   * Reference to a field of type 'Role[]'
   */
  export type ListEnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'ServiceStatus'
   */
  export type EnumServiceStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ServiceStatus'>
    


  /**
   * Reference to a field of type 'ServiceStatus[]'
   */
  export type ListEnumServiceStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ServiceStatus[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Gender'
   */
  export type EnumGenderFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Gender'>
    


  /**
   * Reference to a field of type 'Gender[]'
   */
  export type ListEnumGenderFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Gender[]'>
    


  /**
   * Reference to a field of type 'LastEducation'
   */
  export type EnumLastEducationFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'LastEducation'>
    


  /**
   * Reference to a field of type 'LastEducation[]'
   */
  export type ListEnumLastEducationFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'LastEducation[]'>
    


  /**
   * Reference to a field of type 'Purpose'
   */
  export type EnumPurposeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Purpose'>
    


  /**
   * Reference to a field of type 'Purpose[]'
   */
  export type ListEnumPurposeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Purpose[]'>
    


  /**
   * Reference to a field of type 'QueueStatus'
   */
  export type EnumQueueStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueueStatus'>
    


  /**
   * Reference to a field of type 'QueueStatus[]'
   */
  export type ListEnumQueueStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueueStatus[]'>
    


  /**
   * Reference to a field of type 'QueueType'
   */
  export type EnumQueueTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueueType'>
    


  /**
   * Reference to a field of type 'QueueType[]'
   */
  export type ListEnumQueueTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueueType[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    username?: StringFilter<"User"> | string
    password?: StringFilter<"User"> | string
    name?: StringFilter<"User"> | string
    role?: EnumRoleFilter<"User"> | $Enums.Role
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    queues?: QueueListRelationFilter
    notifications?: NotificationListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    username?: SortOrder
    password?: SortOrder
    name?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    queues?: QueueOrderByRelationAggregateInput
    notifications?: NotificationOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    username?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    password?: StringFilter<"User"> | string
    name?: StringFilter<"User"> | string
    role?: EnumRoleFilter<"User"> | $Enums.Role
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    queues?: QueueListRelationFilter
    notifications?: NotificationListRelationFilter
  }, "id" | "username">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    username?: SortOrder
    password?: SortOrder
    name?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    username?: StringWithAggregatesFilter<"User"> | string
    password?: StringWithAggregatesFilter<"User"> | string
    name?: StringWithAggregatesFilter<"User"> | string
    role?: EnumRoleWithAggregatesFilter<"User"> | $Enums.Role
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type ServiceWhereInput = {
    AND?: ServiceWhereInput | ServiceWhereInput[]
    OR?: ServiceWhereInput[]
    NOT?: ServiceWhereInput | ServiceWhereInput[]
    id?: StringFilter<"Service"> | string
    name?: StringFilter<"Service"> | string
    status?: EnumServiceStatusFilter<"Service"> | $Enums.ServiceStatus
    createdAt?: DateTimeFilter<"Service"> | Date | string
    updatedAt?: DateTimeFilter<"Service"> | Date | string
    queues?: QueueListRelationFilter
  }

  export type ServiceOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    queues?: QueueOrderByRelationAggregateInput
  }

  export type ServiceWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ServiceWhereInput | ServiceWhereInput[]
    OR?: ServiceWhereInput[]
    NOT?: ServiceWhereInput | ServiceWhereInput[]
    name?: StringFilter<"Service"> | string
    status?: EnumServiceStatusFilter<"Service"> | $Enums.ServiceStatus
    createdAt?: DateTimeFilter<"Service"> | Date | string
    updatedAt?: DateTimeFilter<"Service"> | Date | string
    queues?: QueueListRelationFilter
  }, "id">

  export type ServiceOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ServiceCountOrderByAggregateInput
    _max?: ServiceMaxOrderByAggregateInput
    _min?: ServiceMinOrderByAggregateInput
  }

  export type ServiceScalarWhereWithAggregatesInput = {
    AND?: ServiceScalarWhereWithAggregatesInput | ServiceScalarWhereWithAggregatesInput[]
    OR?: ServiceScalarWhereWithAggregatesInput[]
    NOT?: ServiceScalarWhereWithAggregatesInput | ServiceScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Service"> | string
    name?: StringWithAggregatesFilter<"Service"> | string
    status?: EnumServiceStatusWithAggregatesFilter<"Service"> | $Enums.ServiceStatus
    createdAt?: DateTimeWithAggregatesFilter<"Service"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Service"> | Date | string
  }

  export type VisitorWhereInput = {
    AND?: VisitorWhereInput | VisitorWhereInput[]
    OR?: VisitorWhereInput[]
    NOT?: VisitorWhereInput | VisitorWhereInput[]
    id?: StringFilter<"Visitor"> | string
    name?: StringFilter<"Visitor"> | string
    phone?: StringFilter<"Visitor"> | string
    address?: StringNullableFilter<"Visitor"> | string | null
    age?: IntNullableFilter<"Visitor"> | number | null
    gender?: EnumGenderNullableFilter<"Visitor"> | $Enums.Gender | null
    lastEducation?: EnumLastEducationNullableFilter<"Visitor"> | $Enums.LastEducation | null
    occupation?: StringNullableFilter<"Visitor"> | string | null
    institution?: StringNullableFilter<"Visitor"> | string | null
    email?: StringNullableFilter<"Visitor"> | string | null
    purpose?: EnumPurposeNullableFilter<"Visitor"> | $Enums.Purpose | null
    createdAt?: DateTimeFilter<"Visitor"> | Date | string
    updatedAt?: DateTimeFilter<"Visitor"> | Date | string
    queues?: QueueListRelationFilter
  }

  export type VisitorOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    phone?: SortOrder
    address?: SortOrderInput | SortOrder
    age?: SortOrderInput | SortOrder
    gender?: SortOrderInput | SortOrder
    lastEducation?: SortOrderInput | SortOrder
    occupation?: SortOrderInput | SortOrder
    institution?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    purpose?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    queues?: QueueOrderByRelationAggregateInput
  }

  export type VisitorWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: VisitorWhereInput | VisitorWhereInput[]
    OR?: VisitorWhereInput[]
    NOT?: VisitorWhereInput | VisitorWhereInput[]
    name?: StringFilter<"Visitor"> | string
    phone?: StringFilter<"Visitor"> | string
    address?: StringNullableFilter<"Visitor"> | string | null
    age?: IntNullableFilter<"Visitor"> | number | null
    gender?: EnumGenderNullableFilter<"Visitor"> | $Enums.Gender | null
    lastEducation?: EnumLastEducationNullableFilter<"Visitor"> | $Enums.LastEducation | null
    occupation?: StringNullableFilter<"Visitor"> | string | null
    institution?: StringNullableFilter<"Visitor"> | string | null
    email?: StringNullableFilter<"Visitor"> | string | null
    purpose?: EnumPurposeNullableFilter<"Visitor"> | $Enums.Purpose | null
    createdAt?: DateTimeFilter<"Visitor"> | Date | string
    updatedAt?: DateTimeFilter<"Visitor"> | Date | string
    queues?: QueueListRelationFilter
  }, "id">

  export type VisitorOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    phone?: SortOrder
    address?: SortOrderInput | SortOrder
    age?: SortOrderInput | SortOrder
    gender?: SortOrderInput | SortOrder
    lastEducation?: SortOrderInput | SortOrder
    occupation?: SortOrderInput | SortOrder
    institution?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    purpose?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: VisitorCountOrderByAggregateInput
    _avg?: VisitorAvgOrderByAggregateInput
    _max?: VisitorMaxOrderByAggregateInput
    _min?: VisitorMinOrderByAggregateInput
    _sum?: VisitorSumOrderByAggregateInput
  }

  export type VisitorScalarWhereWithAggregatesInput = {
    AND?: VisitorScalarWhereWithAggregatesInput | VisitorScalarWhereWithAggregatesInput[]
    OR?: VisitorScalarWhereWithAggregatesInput[]
    NOT?: VisitorScalarWhereWithAggregatesInput | VisitorScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Visitor"> | string
    name?: StringWithAggregatesFilter<"Visitor"> | string
    phone?: StringWithAggregatesFilter<"Visitor"> | string
    address?: StringNullableWithAggregatesFilter<"Visitor"> | string | null
    age?: IntNullableWithAggregatesFilter<"Visitor"> | number | null
    gender?: EnumGenderNullableWithAggregatesFilter<"Visitor"> | $Enums.Gender | null
    lastEducation?: EnumLastEducationNullableWithAggregatesFilter<"Visitor"> | $Enums.LastEducation | null
    occupation?: StringNullableWithAggregatesFilter<"Visitor"> | string | null
    institution?: StringNullableWithAggregatesFilter<"Visitor"> | string | null
    email?: StringNullableWithAggregatesFilter<"Visitor"> | string | null
    purpose?: EnumPurposeNullableWithAggregatesFilter<"Visitor"> | $Enums.Purpose | null
    createdAt?: DateTimeWithAggregatesFilter<"Visitor"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Visitor"> | Date | string
  }

  export type QueueWhereInput = {
    AND?: QueueWhereInput | QueueWhereInput[]
    OR?: QueueWhereInput[]
    NOT?: QueueWhereInput | QueueWhereInput[]
    id?: StringFilter<"Queue"> | string
    queueNumber?: IntFilter<"Queue"> | number
    status?: EnumQueueStatusFilter<"Queue"> | $Enums.QueueStatus
    queueType?: EnumQueueTypeFilter<"Queue"> | $Enums.QueueType
    queueDate?: DateTimeFilter<"Queue"> | Date | string
    visitorId?: StringFilter<"Queue"> | string
    guestId?: StringNullableFilter<"Queue"> | string | null
    serviceId?: StringFilter<"Queue"> | string
    adminId?: StringNullableFilter<"Queue"> | string | null
    startTime?: DateTimeNullableFilter<"Queue"> | Date | string | null
    endTime?: DateTimeNullableFilter<"Queue"> | Date | string | null
    createdAt?: DateTimeFilter<"Queue"> | Date | string
    updatedAt?: DateTimeFilter<"Queue"> | Date | string
    tempUuid?: StringNullableFilter<"Queue"> | string | null
    filledSKD?: BoolFilter<"Queue"> | boolean
    trackingLink?: StringNullableFilter<"Queue"> | string | null
    visitor?: XOR<VisitorScalarRelationFilter, VisitorWhereInput>
    guest?: XOR<GuestNullableScalarRelationFilter, GuestWhereInput> | null
    service?: XOR<ServiceScalarRelationFilter, ServiceWhereInput>
    admin?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
  }

  export type QueueOrderByWithRelationInput = {
    id?: SortOrder
    queueNumber?: SortOrder
    status?: SortOrder
    queueType?: SortOrder
    queueDate?: SortOrder
    visitorId?: SortOrder
    guestId?: SortOrderInput | SortOrder
    serviceId?: SortOrder
    adminId?: SortOrderInput | SortOrder
    startTime?: SortOrderInput | SortOrder
    endTime?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    tempUuid?: SortOrderInput | SortOrder
    filledSKD?: SortOrder
    trackingLink?: SortOrderInput | SortOrder
    visitor?: VisitorOrderByWithRelationInput
    guest?: GuestOrderByWithRelationInput
    service?: ServiceOrderByWithRelationInput
    admin?: UserOrderByWithRelationInput
  }

  export type QueueWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tempUuid?: string
    trackingLink?: string
    queueDate_queueNumber?: QueueQueueDateQueueNumberCompoundUniqueInput
    AND?: QueueWhereInput | QueueWhereInput[]
    OR?: QueueWhereInput[]
    NOT?: QueueWhereInput | QueueWhereInput[]
    queueNumber?: IntFilter<"Queue"> | number
    status?: EnumQueueStatusFilter<"Queue"> | $Enums.QueueStatus
    queueType?: EnumQueueTypeFilter<"Queue"> | $Enums.QueueType
    queueDate?: DateTimeFilter<"Queue"> | Date | string
    visitorId?: StringFilter<"Queue"> | string
    guestId?: StringNullableFilter<"Queue"> | string | null
    serviceId?: StringFilter<"Queue"> | string
    adminId?: StringNullableFilter<"Queue"> | string | null
    startTime?: DateTimeNullableFilter<"Queue"> | Date | string | null
    endTime?: DateTimeNullableFilter<"Queue"> | Date | string | null
    createdAt?: DateTimeFilter<"Queue"> | Date | string
    updatedAt?: DateTimeFilter<"Queue"> | Date | string
    filledSKD?: BoolFilter<"Queue"> | boolean
    visitor?: XOR<VisitorScalarRelationFilter, VisitorWhereInput>
    guest?: XOR<GuestNullableScalarRelationFilter, GuestWhereInput> | null
    service?: XOR<ServiceScalarRelationFilter, ServiceWhereInput>
    admin?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
  }, "id" | "tempUuid" | "trackingLink" | "queueDate_queueNumber">

  export type QueueOrderByWithAggregationInput = {
    id?: SortOrder
    queueNumber?: SortOrder
    status?: SortOrder
    queueType?: SortOrder
    queueDate?: SortOrder
    visitorId?: SortOrder
    guestId?: SortOrderInput | SortOrder
    serviceId?: SortOrder
    adminId?: SortOrderInput | SortOrder
    startTime?: SortOrderInput | SortOrder
    endTime?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    tempUuid?: SortOrderInput | SortOrder
    filledSKD?: SortOrder
    trackingLink?: SortOrderInput | SortOrder
    _count?: QueueCountOrderByAggregateInput
    _avg?: QueueAvgOrderByAggregateInput
    _max?: QueueMaxOrderByAggregateInput
    _min?: QueueMinOrderByAggregateInput
    _sum?: QueueSumOrderByAggregateInput
  }

  export type QueueScalarWhereWithAggregatesInput = {
    AND?: QueueScalarWhereWithAggregatesInput | QueueScalarWhereWithAggregatesInput[]
    OR?: QueueScalarWhereWithAggregatesInput[]
    NOT?: QueueScalarWhereWithAggregatesInput | QueueScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Queue"> | string
    queueNumber?: IntWithAggregatesFilter<"Queue"> | number
    status?: EnumQueueStatusWithAggregatesFilter<"Queue"> | $Enums.QueueStatus
    queueType?: EnumQueueTypeWithAggregatesFilter<"Queue"> | $Enums.QueueType
    queueDate?: DateTimeWithAggregatesFilter<"Queue"> | Date | string
    visitorId?: StringWithAggregatesFilter<"Queue"> | string
    guestId?: StringNullableWithAggregatesFilter<"Queue"> | string | null
    serviceId?: StringWithAggregatesFilter<"Queue"> | string
    adminId?: StringNullableWithAggregatesFilter<"Queue"> | string | null
    startTime?: DateTimeNullableWithAggregatesFilter<"Queue"> | Date | string | null
    endTime?: DateTimeNullableWithAggregatesFilter<"Queue"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Queue"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Queue"> | Date | string
    tempUuid?: StringNullableWithAggregatesFilter<"Queue"> | string | null
    filledSKD?: BoolWithAggregatesFilter<"Queue"> | boolean
    trackingLink?: StringNullableWithAggregatesFilter<"Queue"> | string | null
  }

  export type QRCodeWhereInput = {
    AND?: QRCodeWhereInput | QRCodeWhereInput[]
    OR?: QRCodeWhereInput[]
    NOT?: QRCodeWhereInput | QRCodeWhereInput[]
    id?: StringFilter<"QRCode"> | string
    staticUuid?: StringFilter<"QRCode"> | string
    path?: StringFilter<"QRCode"> | string
    createdAt?: DateTimeFilter<"QRCode"> | Date | string
    updatedAt?: DateTimeFilter<"QRCode"> | Date | string
  }

  export type QRCodeOrderByWithRelationInput = {
    id?: SortOrder
    staticUuid?: SortOrder
    path?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type QRCodeWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    staticUuid?: string
    AND?: QRCodeWhereInput | QRCodeWhereInput[]
    OR?: QRCodeWhereInput[]
    NOT?: QRCodeWhereInput | QRCodeWhereInput[]
    path?: StringFilter<"QRCode"> | string
    createdAt?: DateTimeFilter<"QRCode"> | Date | string
    updatedAt?: DateTimeFilter<"QRCode"> | Date | string
  }, "id" | "staticUuid">

  export type QRCodeOrderByWithAggregationInput = {
    id?: SortOrder
    staticUuid?: SortOrder
    path?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: QRCodeCountOrderByAggregateInput
    _max?: QRCodeMaxOrderByAggregateInput
    _min?: QRCodeMinOrderByAggregateInput
  }

  export type QRCodeScalarWhereWithAggregatesInput = {
    AND?: QRCodeScalarWhereWithAggregatesInput | QRCodeScalarWhereWithAggregatesInput[]
    OR?: QRCodeScalarWhereWithAggregatesInput[]
    NOT?: QRCodeScalarWhereWithAggregatesInput | QRCodeScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"QRCode"> | string
    staticUuid?: StringWithAggregatesFilter<"QRCode"> | string
    path?: StringWithAggregatesFilter<"QRCode"> | string
    createdAt?: DateTimeWithAggregatesFilter<"QRCode"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"QRCode"> | Date | string
  }

  export type TempVisitorLinkWhereInput = {
    AND?: TempVisitorLinkWhereInput | TempVisitorLinkWhereInput[]
    OR?: TempVisitorLinkWhereInput[]
    NOT?: TempVisitorLinkWhereInput | TempVisitorLinkWhereInput[]
    id?: StringFilter<"TempVisitorLink"> | string
    uuid?: StringFilter<"TempVisitorLink"> | string
    expiresAt?: DateTimeFilter<"TempVisitorLink"> | Date | string
    createdAt?: DateTimeFilter<"TempVisitorLink"> | Date | string
    updatedAt?: DateTimeFilter<"TempVisitorLink"> | Date | string
    used?: BoolFilter<"TempVisitorLink"> | boolean
  }

  export type TempVisitorLinkOrderByWithRelationInput = {
    id?: SortOrder
    uuid?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    used?: SortOrder
  }

  export type TempVisitorLinkWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    uuid?: string
    AND?: TempVisitorLinkWhereInput | TempVisitorLinkWhereInput[]
    OR?: TempVisitorLinkWhereInput[]
    NOT?: TempVisitorLinkWhereInput | TempVisitorLinkWhereInput[]
    expiresAt?: DateTimeFilter<"TempVisitorLink"> | Date | string
    createdAt?: DateTimeFilter<"TempVisitorLink"> | Date | string
    updatedAt?: DateTimeFilter<"TempVisitorLink"> | Date | string
    used?: BoolFilter<"TempVisitorLink"> | boolean
  }, "id" | "uuid">

  export type TempVisitorLinkOrderByWithAggregationInput = {
    id?: SortOrder
    uuid?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    used?: SortOrder
    _count?: TempVisitorLinkCountOrderByAggregateInput
    _max?: TempVisitorLinkMaxOrderByAggregateInput
    _min?: TempVisitorLinkMinOrderByAggregateInput
  }

  export type TempVisitorLinkScalarWhereWithAggregatesInput = {
    AND?: TempVisitorLinkScalarWhereWithAggregatesInput | TempVisitorLinkScalarWhereWithAggregatesInput[]
    OR?: TempVisitorLinkScalarWhereWithAggregatesInput[]
    NOT?: TempVisitorLinkScalarWhereWithAggregatesInput | TempVisitorLinkScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"TempVisitorLink"> | string
    uuid?: StringWithAggregatesFilter<"TempVisitorLink"> | string
    expiresAt?: DateTimeWithAggregatesFilter<"TempVisitorLink"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"TempVisitorLink"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"TempVisitorLink"> | Date | string
    used?: BoolWithAggregatesFilter<"TempVisitorLink"> | boolean
  }

  export type NotificationWhereInput = {
    AND?: NotificationWhereInput | NotificationWhereInput[]
    OR?: NotificationWhereInput[]
    NOT?: NotificationWhereInput | NotificationWhereInput[]
    id?: StringFilter<"Notification"> | string
    type?: StringFilter<"Notification"> | string
    title?: StringFilter<"Notification"> | string
    message?: StringFilter<"Notification"> | string
    isRead?: BoolFilter<"Notification"> | boolean
    createdAt?: DateTimeFilter<"Notification"> | Date | string
    updatedAt?: DateTimeFilter<"Notification"> | Date | string
    userId?: StringNullableFilter<"Notification"> | string | null
    user?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
  }

  export type NotificationOrderByWithRelationInput = {
    id?: SortOrder
    type?: SortOrder
    title?: SortOrder
    message?: SortOrder
    isRead?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrderInput | SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type NotificationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: NotificationWhereInput | NotificationWhereInput[]
    OR?: NotificationWhereInput[]
    NOT?: NotificationWhereInput | NotificationWhereInput[]
    type?: StringFilter<"Notification"> | string
    title?: StringFilter<"Notification"> | string
    message?: StringFilter<"Notification"> | string
    isRead?: BoolFilter<"Notification"> | boolean
    createdAt?: DateTimeFilter<"Notification"> | Date | string
    updatedAt?: DateTimeFilter<"Notification"> | Date | string
    userId?: StringNullableFilter<"Notification"> | string | null
    user?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
  }, "id">

  export type NotificationOrderByWithAggregationInput = {
    id?: SortOrder
    type?: SortOrder
    title?: SortOrder
    message?: SortOrder
    isRead?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrderInput | SortOrder
    _count?: NotificationCountOrderByAggregateInput
    _max?: NotificationMaxOrderByAggregateInput
    _min?: NotificationMinOrderByAggregateInput
  }

  export type NotificationScalarWhereWithAggregatesInput = {
    AND?: NotificationScalarWhereWithAggregatesInput | NotificationScalarWhereWithAggregatesInput[]
    OR?: NotificationScalarWhereWithAggregatesInput[]
    NOT?: NotificationScalarWhereWithAggregatesInput | NotificationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Notification"> | string
    type?: StringWithAggregatesFilter<"Notification"> | string
    title?: StringWithAggregatesFilter<"Notification"> | string
    message?: StringWithAggregatesFilter<"Notification"> | string
    isRead?: BoolWithAggregatesFilter<"Notification"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Notification"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Notification"> | Date | string
    userId?: StringNullableWithAggregatesFilter<"Notification"> | string | null
  }

  export type GuestWhereInput = {
    AND?: GuestWhereInput | GuestWhereInput[]
    OR?: GuestWhereInput[]
    NOT?: GuestWhereInput | GuestWhereInput[]
    id?: StringFilter<"Guest"> | string
    fullName?: StringFilter<"Guest"> | string
    email?: StringNullableFilter<"Guest"> | string | null
    address?: StringNullableFilter<"Guest"> | string | null
    phone?: StringFilter<"Guest"> | string
    age?: IntNullableFilter<"Guest"> | number | null
    institution?: StringNullableFilter<"Guest"> | string | null
    gender?: EnumGenderNullableFilter<"Guest"> | $Enums.Gender | null
    lastEducation?: EnumLastEducationNullableFilter<"Guest"> | $Enums.LastEducation | null
    occupation?: StringNullableFilter<"Guest"> | string | null
    purpose?: EnumPurposeNullableFilter<"Guest"> | $Enums.Purpose | null
    createdAt?: DateTimeFilter<"Guest"> | Date | string
    updatedAt?: DateTimeFilter<"Guest"> | Date | string
    queues?: QueueListRelationFilter
  }

  export type GuestOrderByWithRelationInput = {
    id?: SortOrder
    fullName?: SortOrder
    email?: SortOrderInput | SortOrder
    address?: SortOrderInput | SortOrder
    phone?: SortOrder
    age?: SortOrderInput | SortOrder
    institution?: SortOrderInput | SortOrder
    gender?: SortOrderInput | SortOrder
    lastEducation?: SortOrderInput | SortOrder
    occupation?: SortOrderInput | SortOrder
    purpose?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    queues?: QueueOrderByRelationAggregateInput
  }

  export type GuestWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: GuestWhereInput | GuestWhereInput[]
    OR?: GuestWhereInput[]
    NOT?: GuestWhereInput | GuestWhereInput[]
    fullName?: StringFilter<"Guest"> | string
    email?: StringNullableFilter<"Guest"> | string | null
    address?: StringNullableFilter<"Guest"> | string | null
    phone?: StringFilter<"Guest"> | string
    age?: IntNullableFilter<"Guest"> | number | null
    institution?: StringNullableFilter<"Guest"> | string | null
    gender?: EnumGenderNullableFilter<"Guest"> | $Enums.Gender | null
    lastEducation?: EnumLastEducationNullableFilter<"Guest"> | $Enums.LastEducation | null
    occupation?: StringNullableFilter<"Guest"> | string | null
    purpose?: EnumPurposeNullableFilter<"Guest"> | $Enums.Purpose | null
    createdAt?: DateTimeFilter<"Guest"> | Date | string
    updatedAt?: DateTimeFilter<"Guest"> | Date | string
    queues?: QueueListRelationFilter
  }, "id">

  export type GuestOrderByWithAggregationInput = {
    id?: SortOrder
    fullName?: SortOrder
    email?: SortOrderInput | SortOrder
    address?: SortOrderInput | SortOrder
    phone?: SortOrder
    age?: SortOrderInput | SortOrder
    institution?: SortOrderInput | SortOrder
    gender?: SortOrderInput | SortOrder
    lastEducation?: SortOrderInput | SortOrder
    occupation?: SortOrderInput | SortOrder
    purpose?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: GuestCountOrderByAggregateInput
    _avg?: GuestAvgOrderByAggregateInput
    _max?: GuestMaxOrderByAggregateInput
    _min?: GuestMinOrderByAggregateInput
    _sum?: GuestSumOrderByAggregateInput
  }

  export type GuestScalarWhereWithAggregatesInput = {
    AND?: GuestScalarWhereWithAggregatesInput | GuestScalarWhereWithAggregatesInput[]
    OR?: GuestScalarWhereWithAggregatesInput[]
    NOT?: GuestScalarWhereWithAggregatesInput | GuestScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Guest"> | string
    fullName?: StringWithAggregatesFilter<"Guest"> | string
    email?: StringNullableWithAggregatesFilter<"Guest"> | string | null
    address?: StringNullableWithAggregatesFilter<"Guest"> | string | null
    phone?: StringWithAggregatesFilter<"Guest"> | string
    age?: IntNullableWithAggregatesFilter<"Guest"> | number | null
    institution?: StringNullableWithAggregatesFilter<"Guest"> | string | null
    gender?: EnumGenderNullableWithAggregatesFilter<"Guest"> | $Enums.Gender | null
    lastEducation?: EnumLastEducationNullableWithAggregatesFilter<"Guest"> | $Enums.LastEducation | null
    occupation?: StringNullableWithAggregatesFilter<"Guest"> | string | null
    purpose?: EnumPurposeNullableWithAggregatesFilter<"Guest"> | $Enums.Purpose | null
    createdAt?: DateTimeWithAggregatesFilter<"Guest"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Guest"> | Date | string
  }

  export type UserCreateInput = {
    id?: string
    username: string
    password: string
    name: string
    role?: $Enums.Role
    createdAt?: Date | string
    updatedAt?: Date | string
    queues?: QueueCreateNestedManyWithoutAdminInput
    notifications?: NotificationCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    username: string
    password: string
    name: string
    role?: $Enums.Role
    createdAt?: Date | string
    updatedAt?: Date | string
    queues?: QueueUncheckedCreateNestedManyWithoutAdminInput
    notifications?: NotificationUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    queues?: QueueUpdateManyWithoutAdminNestedInput
    notifications?: NotificationUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    queues?: QueueUncheckedUpdateManyWithoutAdminNestedInput
    notifications?: NotificationUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    username: string
    password: string
    name: string
    role?: $Enums.Role
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ServiceCreateInput = {
    id?: string
    name: string
    status?: $Enums.ServiceStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    queues?: QueueCreateNestedManyWithoutServiceInput
  }

  export type ServiceUncheckedCreateInput = {
    id?: string
    name: string
    status?: $Enums.ServiceStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    queues?: QueueUncheckedCreateNestedManyWithoutServiceInput
  }

  export type ServiceUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    status?: EnumServiceStatusFieldUpdateOperationsInput | $Enums.ServiceStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    queues?: QueueUpdateManyWithoutServiceNestedInput
  }

  export type ServiceUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    status?: EnumServiceStatusFieldUpdateOperationsInput | $Enums.ServiceStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    queues?: QueueUncheckedUpdateManyWithoutServiceNestedInput
  }

  export type ServiceCreateManyInput = {
    id?: string
    name: string
    status?: $Enums.ServiceStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ServiceUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    status?: EnumServiceStatusFieldUpdateOperationsInput | $Enums.ServiceStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ServiceUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    status?: EnumServiceStatusFieldUpdateOperationsInput | $Enums.ServiceStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VisitorCreateInput = {
    id?: string
    name: string
    phone: string
    address?: string | null
    age?: number | null
    gender?: $Enums.Gender | null
    lastEducation?: $Enums.LastEducation | null
    occupation?: string | null
    institution?: string | null
    email?: string | null
    purpose?: $Enums.Purpose | null
    createdAt?: Date | string
    updatedAt?: Date | string
    queues?: QueueCreateNestedManyWithoutVisitorInput
  }

  export type VisitorUncheckedCreateInput = {
    id?: string
    name: string
    phone: string
    address?: string | null
    age?: number | null
    gender?: $Enums.Gender | null
    lastEducation?: $Enums.LastEducation | null
    occupation?: string | null
    institution?: string | null
    email?: string | null
    purpose?: $Enums.Purpose | null
    createdAt?: Date | string
    updatedAt?: Date | string
    queues?: QueueUncheckedCreateNestedManyWithoutVisitorInput
  }

  export type VisitorUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    age?: NullableIntFieldUpdateOperationsInput | number | null
    gender?: NullableEnumGenderFieldUpdateOperationsInput | $Enums.Gender | null
    lastEducation?: NullableEnumLastEducationFieldUpdateOperationsInput | $Enums.LastEducation | null
    occupation?: NullableStringFieldUpdateOperationsInput | string | null
    institution?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    purpose?: NullableEnumPurposeFieldUpdateOperationsInput | $Enums.Purpose | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    queues?: QueueUpdateManyWithoutVisitorNestedInput
  }

  export type VisitorUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    age?: NullableIntFieldUpdateOperationsInput | number | null
    gender?: NullableEnumGenderFieldUpdateOperationsInput | $Enums.Gender | null
    lastEducation?: NullableEnumLastEducationFieldUpdateOperationsInput | $Enums.LastEducation | null
    occupation?: NullableStringFieldUpdateOperationsInput | string | null
    institution?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    purpose?: NullableEnumPurposeFieldUpdateOperationsInput | $Enums.Purpose | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    queues?: QueueUncheckedUpdateManyWithoutVisitorNestedInput
  }

  export type VisitorCreateManyInput = {
    id?: string
    name: string
    phone: string
    address?: string | null
    age?: number | null
    gender?: $Enums.Gender | null
    lastEducation?: $Enums.LastEducation | null
    occupation?: string | null
    institution?: string | null
    email?: string | null
    purpose?: $Enums.Purpose | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VisitorUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    age?: NullableIntFieldUpdateOperationsInput | number | null
    gender?: NullableEnumGenderFieldUpdateOperationsInput | $Enums.Gender | null
    lastEducation?: NullableEnumLastEducationFieldUpdateOperationsInput | $Enums.LastEducation | null
    occupation?: NullableStringFieldUpdateOperationsInput | string | null
    institution?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    purpose?: NullableEnumPurposeFieldUpdateOperationsInput | $Enums.Purpose | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VisitorUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    age?: NullableIntFieldUpdateOperationsInput | number | null
    gender?: NullableEnumGenderFieldUpdateOperationsInput | $Enums.Gender | null
    lastEducation?: NullableEnumLastEducationFieldUpdateOperationsInput | $Enums.LastEducation | null
    occupation?: NullableStringFieldUpdateOperationsInput | string | null
    institution?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    purpose?: NullableEnumPurposeFieldUpdateOperationsInput | $Enums.Purpose | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type QueueCreateInput = {
    id?: string
    queueNumber: number
    status?: $Enums.QueueStatus
    queueType?: $Enums.QueueType
    queueDate?: Date | string
    startTime?: Date | string | null
    endTime?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tempUuid?: string | null
    filledSKD?: boolean
    trackingLink?: string | null
    visitor: VisitorCreateNestedOneWithoutQueuesInput
    guest?: GuestCreateNestedOneWithoutQueuesInput
    service: ServiceCreateNestedOneWithoutQueuesInput
    admin?: UserCreateNestedOneWithoutQueuesInput
  }

  export type QueueUncheckedCreateInput = {
    id?: string
    queueNumber: number
    status?: $Enums.QueueStatus
    queueType?: $Enums.QueueType
    queueDate?: Date | string
    visitorId: string
    guestId?: string | null
    serviceId: string
    adminId?: string | null
    startTime?: Date | string | null
    endTime?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tempUuid?: string | null
    filledSKD?: boolean
    trackingLink?: string | null
  }

  export type QueueUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    queueNumber?: IntFieldUpdateOperationsInput | number
    status?: EnumQueueStatusFieldUpdateOperationsInput | $Enums.QueueStatus
    queueType?: EnumQueueTypeFieldUpdateOperationsInput | $Enums.QueueType
    queueDate?: DateTimeFieldUpdateOperationsInput | Date | string
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tempUuid?: NullableStringFieldUpdateOperationsInput | string | null
    filledSKD?: BoolFieldUpdateOperationsInput | boolean
    trackingLink?: NullableStringFieldUpdateOperationsInput | string | null
    visitor?: VisitorUpdateOneRequiredWithoutQueuesNestedInput
    guest?: GuestUpdateOneWithoutQueuesNestedInput
    service?: ServiceUpdateOneRequiredWithoutQueuesNestedInput
    admin?: UserUpdateOneWithoutQueuesNestedInput
  }

  export type QueueUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    queueNumber?: IntFieldUpdateOperationsInput | number
    status?: EnumQueueStatusFieldUpdateOperationsInput | $Enums.QueueStatus
    queueType?: EnumQueueTypeFieldUpdateOperationsInput | $Enums.QueueType
    queueDate?: DateTimeFieldUpdateOperationsInput | Date | string
    visitorId?: StringFieldUpdateOperationsInput | string
    guestId?: NullableStringFieldUpdateOperationsInput | string | null
    serviceId?: StringFieldUpdateOperationsInput | string
    adminId?: NullableStringFieldUpdateOperationsInput | string | null
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tempUuid?: NullableStringFieldUpdateOperationsInput | string | null
    filledSKD?: BoolFieldUpdateOperationsInput | boolean
    trackingLink?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type QueueCreateManyInput = {
    id?: string
    queueNumber: number
    status?: $Enums.QueueStatus
    queueType?: $Enums.QueueType
    queueDate?: Date | string
    visitorId: string
    guestId?: string | null
    serviceId: string
    adminId?: string | null
    startTime?: Date | string | null
    endTime?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tempUuid?: string | null
    filledSKD?: boolean
    trackingLink?: string | null
  }

  export type QueueUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    queueNumber?: IntFieldUpdateOperationsInput | number
    status?: EnumQueueStatusFieldUpdateOperationsInput | $Enums.QueueStatus
    queueType?: EnumQueueTypeFieldUpdateOperationsInput | $Enums.QueueType
    queueDate?: DateTimeFieldUpdateOperationsInput | Date | string
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tempUuid?: NullableStringFieldUpdateOperationsInput | string | null
    filledSKD?: BoolFieldUpdateOperationsInput | boolean
    trackingLink?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type QueueUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    queueNumber?: IntFieldUpdateOperationsInput | number
    status?: EnumQueueStatusFieldUpdateOperationsInput | $Enums.QueueStatus
    queueType?: EnumQueueTypeFieldUpdateOperationsInput | $Enums.QueueType
    queueDate?: DateTimeFieldUpdateOperationsInput | Date | string
    visitorId?: StringFieldUpdateOperationsInput | string
    guestId?: NullableStringFieldUpdateOperationsInput | string | null
    serviceId?: StringFieldUpdateOperationsInput | string
    adminId?: NullableStringFieldUpdateOperationsInput | string | null
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tempUuid?: NullableStringFieldUpdateOperationsInput | string | null
    filledSKD?: BoolFieldUpdateOperationsInput | boolean
    trackingLink?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type QRCodeCreateInput = {
    id?: string
    staticUuid: string
    path: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type QRCodeUncheckedCreateInput = {
    id?: string
    staticUuid: string
    path: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type QRCodeUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    staticUuid?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type QRCodeUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    staticUuid?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type QRCodeCreateManyInput = {
    id?: string
    staticUuid: string
    path: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type QRCodeUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    staticUuid?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type QRCodeUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    staticUuid?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TempVisitorLinkCreateInput = {
    id?: string
    uuid: string
    expiresAt: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    used?: boolean
  }

  export type TempVisitorLinkUncheckedCreateInput = {
    id?: string
    uuid: string
    expiresAt: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    used?: boolean
  }

  export type TempVisitorLinkUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    uuid?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    used?: BoolFieldUpdateOperationsInput | boolean
  }

  export type TempVisitorLinkUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    uuid?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    used?: BoolFieldUpdateOperationsInput | boolean
  }

  export type TempVisitorLinkCreateManyInput = {
    id?: string
    uuid: string
    expiresAt: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    used?: boolean
  }

  export type TempVisitorLinkUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    uuid?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    used?: BoolFieldUpdateOperationsInput | boolean
  }

  export type TempVisitorLinkUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    uuid?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    used?: BoolFieldUpdateOperationsInput | boolean
  }

  export type NotificationCreateInput = {
    id?: string
    type: string
    title: string
    message: string
    isRead?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    user?: UserCreateNestedOneWithoutNotificationsInput
  }

  export type NotificationUncheckedCreateInput = {
    id?: string
    type: string
    title: string
    message: string
    isRead?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    userId?: string | null
  }

  export type NotificationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    isRead?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneWithoutNotificationsNestedInput
  }

  export type NotificationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    isRead?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type NotificationCreateManyInput = {
    id?: string
    type: string
    title: string
    message: string
    isRead?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    userId?: string | null
  }

  export type NotificationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    isRead?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    isRead?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type GuestCreateInput = {
    id?: string
    fullName: string
    email?: string | null
    address?: string | null
    phone: string
    age?: number | null
    institution?: string | null
    gender?: $Enums.Gender | null
    lastEducation?: $Enums.LastEducation | null
    occupation?: string | null
    purpose?: $Enums.Purpose | null
    createdAt?: Date | string
    updatedAt?: Date | string
    queues?: QueueCreateNestedManyWithoutGuestInput
  }

  export type GuestUncheckedCreateInput = {
    id?: string
    fullName: string
    email?: string | null
    address?: string | null
    phone: string
    age?: number | null
    institution?: string | null
    gender?: $Enums.Gender | null
    lastEducation?: $Enums.LastEducation | null
    occupation?: string | null
    purpose?: $Enums.Purpose | null
    createdAt?: Date | string
    updatedAt?: Date | string
    queues?: QueueUncheckedCreateNestedManyWithoutGuestInput
  }

  export type GuestUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: StringFieldUpdateOperationsInput | string
    age?: NullableIntFieldUpdateOperationsInput | number | null
    institution?: NullableStringFieldUpdateOperationsInput | string | null
    gender?: NullableEnumGenderFieldUpdateOperationsInput | $Enums.Gender | null
    lastEducation?: NullableEnumLastEducationFieldUpdateOperationsInput | $Enums.LastEducation | null
    occupation?: NullableStringFieldUpdateOperationsInput | string | null
    purpose?: NullableEnumPurposeFieldUpdateOperationsInput | $Enums.Purpose | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    queues?: QueueUpdateManyWithoutGuestNestedInput
  }

  export type GuestUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: StringFieldUpdateOperationsInput | string
    age?: NullableIntFieldUpdateOperationsInput | number | null
    institution?: NullableStringFieldUpdateOperationsInput | string | null
    gender?: NullableEnumGenderFieldUpdateOperationsInput | $Enums.Gender | null
    lastEducation?: NullableEnumLastEducationFieldUpdateOperationsInput | $Enums.LastEducation | null
    occupation?: NullableStringFieldUpdateOperationsInput | string | null
    purpose?: NullableEnumPurposeFieldUpdateOperationsInput | $Enums.Purpose | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    queues?: QueueUncheckedUpdateManyWithoutGuestNestedInput
  }

  export type GuestCreateManyInput = {
    id?: string
    fullName: string
    email?: string | null
    address?: string | null
    phone: string
    age?: number | null
    institution?: string | null
    gender?: $Enums.Gender | null
    lastEducation?: $Enums.LastEducation | null
    occupation?: string | null
    purpose?: $Enums.Purpose | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GuestUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: StringFieldUpdateOperationsInput | string
    age?: NullableIntFieldUpdateOperationsInput | number | null
    institution?: NullableStringFieldUpdateOperationsInput | string | null
    gender?: NullableEnumGenderFieldUpdateOperationsInput | $Enums.Gender | null
    lastEducation?: NullableEnumLastEducationFieldUpdateOperationsInput | $Enums.LastEducation | null
    occupation?: NullableStringFieldUpdateOperationsInput | string | null
    purpose?: NullableEnumPurposeFieldUpdateOperationsInput | $Enums.Purpose | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GuestUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: StringFieldUpdateOperationsInput | string
    age?: NullableIntFieldUpdateOperationsInput | number | null
    institution?: NullableStringFieldUpdateOperationsInput | string | null
    gender?: NullableEnumGenderFieldUpdateOperationsInput | $Enums.Gender | null
    lastEducation?: NullableEnumLastEducationFieldUpdateOperationsInput | $Enums.LastEducation | null
    occupation?: NullableStringFieldUpdateOperationsInput | string | null
    purpose?: NullableEnumPurposeFieldUpdateOperationsInput | $Enums.Purpose | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type EnumRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleFilter<$PrismaModel> | $Enums.Role
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type QueueListRelationFilter = {
    every?: QueueWhereInput
    some?: QueueWhereInput
    none?: QueueWhereInput
  }

  export type NotificationListRelationFilter = {
    every?: NotificationWhereInput
    some?: NotificationWhereInput
    none?: NotificationWhereInput
  }

  export type QueueOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type NotificationOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    password?: SortOrder
    name?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    password?: SortOrder
    name?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    password?: SortOrder
    name?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type EnumRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRoleFilter<$PrismaModel>
    _max?: NestedEnumRoleFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type EnumServiceStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ServiceStatus | EnumServiceStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ServiceStatus[] | ListEnumServiceStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ServiceStatus[] | ListEnumServiceStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumServiceStatusFilter<$PrismaModel> | $Enums.ServiceStatus
  }

  export type ServiceCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ServiceMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ServiceMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumServiceStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ServiceStatus | EnumServiceStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ServiceStatus[] | ListEnumServiceStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ServiceStatus[] | ListEnumServiceStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumServiceStatusWithAggregatesFilter<$PrismaModel> | $Enums.ServiceStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumServiceStatusFilter<$PrismaModel>
    _max?: NestedEnumServiceStatusFilter<$PrismaModel>
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type EnumGenderNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.Gender | EnumGenderFieldRefInput<$PrismaModel> | null
    in?: $Enums.Gender[] | ListEnumGenderFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.Gender[] | ListEnumGenderFieldRefInput<$PrismaModel> | null
    not?: NestedEnumGenderNullableFilter<$PrismaModel> | $Enums.Gender | null
  }

  export type EnumLastEducationNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.LastEducation | EnumLastEducationFieldRefInput<$PrismaModel> | null
    in?: $Enums.LastEducation[] | ListEnumLastEducationFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.LastEducation[] | ListEnumLastEducationFieldRefInput<$PrismaModel> | null
    not?: NestedEnumLastEducationNullableFilter<$PrismaModel> | $Enums.LastEducation | null
  }

  export type EnumPurposeNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.Purpose | EnumPurposeFieldRefInput<$PrismaModel> | null
    in?: $Enums.Purpose[] | ListEnumPurposeFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.Purpose[] | ListEnumPurposeFieldRefInput<$PrismaModel> | null
    not?: NestedEnumPurposeNullableFilter<$PrismaModel> | $Enums.Purpose | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type VisitorCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    phone?: SortOrder
    address?: SortOrder
    age?: SortOrder
    gender?: SortOrder
    lastEducation?: SortOrder
    occupation?: SortOrder
    institution?: SortOrder
    email?: SortOrder
    purpose?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type VisitorAvgOrderByAggregateInput = {
    age?: SortOrder
  }

  export type VisitorMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    phone?: SortOrder
    address?: SortOrder
    age?: SortOrder
    gender?: SortOrder
    lastEducation?: SortOrder
    occupation?: SortOrder
    institution?: SortOrder
    email?: SortOrder
    purpose?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type VisitorMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    phone?: SortOrder
    address?: SortOrder
    age?: SortOrder
    gender?: SortOrder
    lastEducation?: SortOrder
    occupation?: SortOrder
    institution?: SortOrder
    email?: SortOrder
    purpose?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type VisitorSumOrderByAggregateInput = {
    age?: SortOrder
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type EnumGenderNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Gender | EnumGenderFieldRefInput<$PrismaModel> | null
    in?: $Enums.Gender[] | ListEnumGenderFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.Gender[] | ListEnumGenderFieldRefInput<$PrismaModel> | null
    not?: NestedEnumGenderNullableWithAggregatesFilter<$PrismaModel> | $Enums.Gender | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumGenderNullableFilter<$PrismaModel>
    _max?: NestedEnumGenderNullableFilter<$PrismaModel>
  }

  export type EnumLastEducationNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.LastEducation | EnumLastEducationFieldRefInput<$PrismaModel> | null
    in?: $Enums.LastEducation[] | ListEnumLastEducationFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.LastEducation[] | ListEnumLastEducationFieldRefInput<$PrismaModel> | null
    not?: NestedEnumLastEducationNullableWithAggregatesFilter<$PrismaModel> | $Enums.LastEducation | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumLastEducationNullableFilter<$PrismaModel>
    _max?: NestedEnumLastEducationNullableFilter<$PrismaModel>
  }

  export type EnumPurposeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Purpose | EnumPurposeFieldRefInput<$PrismaModel> | null
    in?: $Enums.Purpose[] | ListEnumPurposeFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.Purpose[] | ListEnumPurposeFieldRefInput<$PrismaModel> | null
    not?: NestedEnumPurposeNullableWithAggregatesFilter<$PrismaModel> | $Enums.Purpose | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumPurposeNullableFilter<$PrismaModel>
    _max?: NestedEnumPurposeNullableFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type EnumQueueStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.QueueStatus | EnumQueueStatusFieldRefInput<$PrismaModel>
    in?: $Enums.QueueStatus[] | ListEnumQueueStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.QueueStatus[] | ListEnumQueueStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumQueueStatusFilter<$PrismaModel> | $Enums.QueueStatus
  }

  export type EnumQueueTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.QueueType | EnumQueueTypeFieldRefInput<$PrismaModel>
    in?: $Enums.QueueType[] | ListEnumQueueTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.QueueType[] | ListEnumQueueTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumQueueTypeFilter<$PrismaModel> | $Enums.QueueType
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type VisitorScalarRelationFilter = {
    is?: VisitorWhereInput
    isNot?: VisitorWhereInput
  }

  export type GuestNullableScalarRelationFilter = {
    is?: GuestWhereInput | null
    isNot?: GuestWhereInput | null
  }

  export type ServiceScalarRelationFilter = {
    is?: ServiceWhereInput
    isNot?: ServiceWhereInput
  }

  export type UserNullableScalarRelationFilter = {
    is?: UserWhereInput | null
    isNot?: UserWhereInput | null
  }

  export type QueueQueueDateQueueNumberCompoundUniqueInput = {
    queueDate: Date | string
    queueNumber: number
  }

  export type QueueCountOrderByAggregateInput = {
    id?: SortOrder
    queueNumber?: SortOrder
    status?: SortOrder
    queueType?: SortOrder
    queueDate?: SortOrder
    visitorId?: SortOrder
    guestId?: SortOrder
    serviceId?: SortOrder
    adminId?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    tempUuid?: SortOrder
    filledSKD?: SortOrder
    trackingLink?: SortOrder
  }

  export type QueueAvgOrderByAggregateInput = {
    queueNumber?: SortOrder
  }

  export type QueueMaxOrderByAggregateInput = {
    id?: SortOrder
    queueNumber?: SortOrder
    status?: SortOrder
    queueType?: SortOrder
    queueDate?: SortOrder
    visitorId?: SortOrder
    guestId?: SortOrder
    serviceId?: SortOrder
    adminId?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    tempUuid?: SortOrder
    filledSKD?: SortOrder
    trackingLink?: SortOrder
  }

  export type QueueMinOrderByAggregateInput = {
    id?: SortOrder
    queueNumber?: SortOrder
    status?: SortOrder
    queueType?: SortOrder
    queueDate?: SortOrder
    visitorId?: SortOrder
    guestId?: SortOrder
    serviceId?: SortOrder
    adminId?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    tempUuid?: SortOrder
    filledSKD?: SortOrder
    trackingLink?: SortOrder
  }

  export type QueueSumOrderByAggregateInput = {
    queueNumber?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type EnumQueueStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.QueueStatus | EnumQueueStatusFieldRefInput<$PrismaModel>
    in?: $Enums.QueueStatus[] | ListEnumQueueStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.QueueStatus[] | ListEnumQueueStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumQueueStatusWithAggregatesFilter<$PrismaModel> | $Enums.QueueStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumQueueStatusFilter<$PrismaModel>
    _max?: NestedEnumQueueStatusFilter<$PrismaModel>
  }

  export type EnumQueueTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.QueueType | EnumQueueTypeFieldRefInput<$PrismaModel>
    in?: $Enums.QueueType[] | ListEnumQueueTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.QueueType[] | ListEnumQueueTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumQueueTypeWithAggregatesFilter<$PrismaModel> | $Enums.QueueType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumQueueTypeFilter<$PrismaModel>
    _max?: NestedEnumQueueTypeFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type QRCodeCountOrderByAggregateInput = {
    id?: SortOrder
    staticUuid?: SortOrder
    path?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type QRCodeMaxOrderByAggregateInput = {
    id?: SortOrder
    staticUuid?: SortOrder
    path?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type QRCodeMinOrderByAggregateInput = {
    id?: SortOrder
    staticUuid?: SortOrder
    path?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TempVisitorLinkCountOrderByAggregateInput = {
    id?: SortOrder
    uuid?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    used?: SortOrder
  }

  export type TempVisitorLinkMaxOrderByAggregateInput = {
    id?: SortOrder
    uuid?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    used?: SortOrder
  }

  export type TempVisitorLinkMinOrderByAggregateInput = {
    id?: SortOrder
    uuid?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    used?: SortOrder
  }

  export type NotificationCountOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    title?: SortOrder
    message?: SortOrder
    isRead?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
  }

  export type NotificationMaxOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    title?: SortOrder
    message?: SortOrder
    isRead?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
  }

  export type NotificationMinOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    title?: SortOrder
    message?: SortOrder
    isRead?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
  }

  export type GuestCountOrderByAggregateInput = {
    id?: SortOrder
    fullName?: SortOrder
    email?: SortOrder
    address?: SortOrder
    phone?: SortOrder
    age?: SortOrder
    institution?: SortOrder
    gender?: SortOrder
    lastEducation?: SortOrder
    occupation?: SortOrder
    purpose?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GuestAvgOrderByAggregateInput = {
    age?: SortOrder
  }

  export type GuestMaxOrderByAggregateInput = {
    id?: SortOrder
    fullName?: SortOrder
    email?: SortOrder
    address?: SortOrder
    phone?: SortOrder
    age?: SortOrder
    institution?: SortOrder
    gender?: SortOrder
    lastEducation?: SortOrder
    occupation?: SortOrder
    purpose?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GuestMinOrderByAggregateInput = {
    id?: SortOrder
    fullName?: SortOrder
    email?: SortOrder
    address?: SortOrder
    phone?: SortOrder
    age?: SortOrder
    institution?: SortOrder
    gender?: SortOrder
    lastEducation?: SortOrder
    occupation?: SortOrder
    purpose?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GuestSumOrderByAggregateInput = {
    age?: SortOrder
  }

  export type QueueCreateNestedManyWithoutAdminInput = {
    create?: XOR<QueueCreateWithoutAdminInput, QueueUncheckedCreateWithoutAdminInput> | QueueCreateWithoutAdminInput[] | QueueUncheckedCreateWithoutAdminInput[]
    connectOrCreate?: QueueCreateOrConnectWithoutAdminInput | QueueCreateOrConnectWithoutAdminInput[]
    createMany?: QueueCreateManyAdminInputEnvelope
    connect?: QueueWhereUniqueInput | QueueWhereUniqueInput[]
  }

  export type NotificationCreateNestedManyWithoutUserInput = {
    create?: XOR<NotificationCreateWithoutUserInput, NotificationUncheckedCreateWithoutUserInput> | NotificationCreateWithoutUserInput[] | NotificationUncheckedCreateWithoutUserInput[]
    connectOrCreate?: NotificationCreateOrConnectWithoutUserInput | NotificationCreateOrConnectWithoutUserInput[]
    createMany?: NotificationCreateManyUserInputEnvelope
    connect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
  }

  export type QueueUncheckedCreateNestedManyWithoutAdminInput = {
    create?: XOR<QueueCreateWithoutAdminInput, QueueUncheckedCreateWithoutAdminInput> | QueueCreateWithoutAdminInput[] | QueueUncheckedCreateWithoutAdminInput[]
    connectOrCreate?: QueueCreateOrConnectWithoutAdminInput | QueueCreateOrConnectWithoutAdminInput[]
    createMany?: QueueCreateManyAdminInputEnvelope
    connect?: QueueWhereUniqueInput | QueueWhereUniqueInput[]
  }

  export type NotificationUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<NotificationCreateWithoutUserInput, NotificationUncheckedCreateWithoutUserInput> | NotificationCreateWithoutUserInput[] | NotificationUncheckedCreateWithoutUserInput[]
    connectOrCreate?: NotificationCreateOrConnectWithoutUserInput | NotificationCreateOrConnectWithoutUserInput[]
    createMany?: NotificationCreateManyUserInputEnvelope
    connect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type EnumRoleFieldUpdateOperationsInput = {
    set?: $Enums.Role
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type QueueUpdateManyWithoutAdminNestedInput = {
    create?: XOR<QueueCreateWithoutAdminInput, QueueUncheckedCreateWithoutAdminInput> | QueueCreateWithoutAdminInput[] | QueueUncheckedCreateWithoutAdminInput[]
    connectOrCreate?: QueueCreateOrConnectWithoutAdminInput | QueueCreateOrConnectWithoutAdminInput[]
    upsert?: QueueUpsertWithWhereUniqueWithoutAdminInput | QueueUpsertWithWhereUniqueWithoutAdminInput[]
    createMany?: QueueCreateManyAdminInputEnvelope
    set?: QueueWhereUniqueInput | QueueWhereUniqueInput[]
    disconnect?: QueueWhereUniqueInput | QueueWhereUniqueInput[]
    delete?: QueueWhereUniqueInput | QueueWhereUniqueInput[]
    connect?: QueueWhereUniqueInput | QueueWhereUniqueInput[]
    update?: QueueUpdateWithWhereUniqueWithoutAdminInput | QueueUpdateWithWhereUniqueWithoutAdminInput[]
    updateMany?: QueueUpdateManyWithWhereWithoutAdminInput | QueueUpdateManyWithWhereWithoutAdminInput[]
    deleteMany?: QueueScalarWhereInput | QueueScalarWhereInput[]
  }

  export type NotificationUpdateManyWithoutUserNestedInput = {
    create?: XOR<NotificationCreateWithoutUserInput, NotificationUncheckedCreateWithoutUserInput> | NotificationCreateWithoutUserInput[] | NotificationUncheckedCreateWithoutUserInput[]
    connectOrCreate?: NotificationCreateOrConnectWithoutUserInput | NotificationCreateOrConnectWithoutUserInput[]
    upsert?: NotificationUpsertWithWhereUniqueWithoutUserInput | NotificationUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: NotificationCreateManyUserInputEnvelope
    set?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    disconnect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    delete?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    connect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    update?: NotificationUpdateWithWhereUniqueWithoutUserInput | NotificationUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: NotificationUpdateManyWithWhereWithoutUserInput | NotificationUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: NotificationScalarWhereInput | NotificationScalarWhereInput[]
  }

  export type QueueUncheckedUpdateManyWithoutAdminNestedInput = {
    create?: XOR<QueueCreateWithoutAdminInput, QueueUncheckedCreateWithoutAdminInput> | QueueCreateWithoutAdminInput[] | QueueUncheckedCreateWithoutAdminInput[]
    connectOrCreate?: QueueCreateOrConnectWithoutAdminInput | QueueCreateOrConnectWithoutAdminInput[]
    upsert?: QueueUpsertWithWhereUniqueWithoutAdminInput | QueueUpsertWithWhereUniqueWithoutAdminInput[]
    createMany?: QueueCreateManyAdminInputEnvelope
    set?: QueueWhereUniqueInput | QueueWhereUniqueInput[]
    disconnect?: QueueWhereUniqueInput | QueueWhereUniqueInput[]
    delete?: QueueWhereUniqueInput | QueueWhereUniqueInput[]
    connect?: QueueWhereUniqueInput | QueueWhereUniqueInput[]
    update?: QueueUpdateWithWhereUniqueWithoutAdminInput | QueueUpdateWithWhereUniqueWithoutAdminInput[]
    updateMany?: QueueUpdateManyWithWhereWithoutAdminInput | QueueUpdateManyWithWhereWithoutAdminInput[]
    deleteMany?: QueueScalarWhereInput | QueueScalarWhereInput[]
  }

  export type NotificationUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<NotificationCreateWithoutUserInput, NotificationUncheckedCreateWithoutUserInput> | NotificationCreateWithoutUserInput[] | NotificationUncheckedCreateWithoutUserInput[]
    connectOrCreate?: NotificationCreateOrConnectWithoutUserInput | NotificationCreateOrConnectWithoutUserInput[]
    upsert?: NotificationUpsertWithWhereUniqueWithoutUserInput | NotificationUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: NotificationCreateManyUserInputEnvelope
    set?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    disconnect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    delete?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    connect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    update?: NotificationUpdateWithWhereUniqueWithoutUserInput | NotificationUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: NotificationUpdateManyWithWhereWithoutUserInput | NotificationUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: NotificationScalarWhereInput | NotificationScalarWhereInput[]
  }

  export type QueueCreateNestedManyWithoutServiceInput = {
    create?: XOR<QueueCreateWithoutServiceInput, QueueUncheckedCreateWithoutServiceInput> | QueueCreateWithoutServiceInput[] | QueueUncheckedCreateWithoutServiceInput[]
    connectOrCreate?: QueueCreateOrConnectWithoutServiceInput | QueueCreateOrConnectWithoutServiceInput[]
    createMany?: QueueCreateManyServiceInputEnvelope
    connect?: QueueWhereUniqueInput | QueueWhereUniqueInput[]
  }

  export type QueueUncheckedCreateNestedManyWithoutServiceInput = {
    create?: XOR<QueueCreateWithoutServiceInput, QueueUncheckedCreateWithoutServiceInput> | QueueCreateWithoutServiceInput[] | QueueUncheckedCreateWithoutServiceInput[]
    connectOrCreate?: QueueCreateOrConnectWithoutServiceInput | QueueCreateOrConnectWithoutServiceInput[]
    createMany?: QueueCreateManyServiceInputEnvelope
    connect?: QueueWhereUniqueInput | QueueWhereUniqueInput[]
  }

  export type EnumServiceStatusFieldUpdateOperationsInput = {
    set?: $Enums.ServiceStatus
  }

  export type QueueUpdateManyWithoutServiceNestedInput = {
    create?: XOR<QueueCreateWithoutServiceInput, QueueUncheckedCreateWithoutServiceInput> | QueueCreateWithoutServiceInput[] | QueueUncheckedCreateWithoutServiceInput[]
    connectOrCreate?: QueueCreateOrConnectWithoutServiceInput | QueueCreateOrConnectWithoutServiceInput[]
    upsert?: QueueUpsertWithWhereUniqueWithoutServiceInput | QueueUpsertWithWhereUniqueWithoutServiceInput[]
    createMany?: QueueCreateManyServiceInputEnvelope
    set?: QueueWhereUniqueInput | QueueWhereUniqueInput[]
    disconnect?: QueueWhereUniqueInput | QueueWhereUniqueInput[]
    delete?: QueueWhereUniqueInput | QueueWhereUniqueInput[]
    connect?: QueueWhereUniqueInput | QueueWhereUniqueInput[]
    update?: QueueUpdateWithWhereUniqueWithoutServiceInput | QueueUpdateWithWhereUniqueWithoutServiceInput[]
    updateMany?: QueueUpdateManyWithWhereWithoutServiceInput | QueueUpdateManyWithWhereWithoutServiceInput[]
    deleteMany?: QueueScalarWhereInput | QueueScalarWhereInput[]
  }

  export type QueueUncheckedUpdateManyWithoutServiceNestedInput = {
    create?: XOR<QueueCreateWithoutServiceInput, QueueUncheckedCreateWithoutServiceInput> | QueueCreateWithoutServiceInput[] | QueueUncheckedCreateWithoutServiceInput[]
    connectOrCreate?: QueueCreateOrConnectWithoutServiceInput | QueueCreateOrConnectWithoutServiceInput[]
    upsert?: QueueUpsertWithWhereUniqueWithoutServiceInput | QueueUpsertWithWhereUniqueWithoutServiceInput[]
    createMany?: QueueCreateManyServiceInputEnvelope
    set?: QueueWhereUniqueInput | QueueWhereUniqueInput[]
    disconnect?: QueueWhereUniqueInput | QueueWhereUniqueInput[]
    delete?: QueueWhereUniqueInput | QueueWhereUniqueInput[]
    connect?: QueueWhereUniqueInput | QueueWhereUniqueInput[]
    update?: QueueUpdateWithWhereUniqueWithoutServiceInput | QueueUpdateWithWhereUniqueWithoutServiceInput[]
    updateMany?: QueueUpdateManyWithWhereWithoutServiceInput | QueueUpdateManyWithWhereWithoutServiceInput[]
    deleteMany?: QueueScalarWhereInput | QueueScalarWhereInput[]
  }

  export type QueueCreateNestedManyWithoutVisitorInput = {
    create?: XOR<QueueCreateWithoutVisitorInput, QueueUncheckedCreateWithoutVisitorInput> | QueueCreateWithoutVisitorInput[] | QueueUncheckedCreateWithoutVisitorInput[]
    connectOrCreate?: QueueCreateOrConnectWithoutVisitorInput | QueueCreateOrConnectWithoutVisitorInput[]
    createMany?: QueueCreateManyVisitorInputEnvelope
    connect?: QueueWhereUniqueInput | QueueWhereUniqueInput[]
  }

  export type QueueUncheckedCreateNestedManyWithoutVisitorInput = {
    create?: XOR<QueueCreateWithoutVisitorInput, QueueUncheckedCreateWithoutVisitorInput> | QueueCreateWithoutVisitorInput[] | QueueUncheckedCreateWithoutVisitorInput[]
    connectOrCreate?: QueueCreateOrConnectWithoutVisitorInput | QueueCreateOrConnectWithoutVisitorInput[]
    createMany?: QueueCreateManyVisitorInputEnvelope
    connect?: QueueWhereUniqueInput | QueueWhereUniqueInput[]
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableEnumGenderFieldUpdateOperationsInput = {
    set?: $Enums.Gender | null
  }

  export type NullableEnumLastEducationFieldUpdateOperationsInput = {
    set?: $Enums.LastEducation | null
  }

  export type NullableEnumPurposeFieldUpdateOperationsInput = {
    set?: $Enums.Purpose | null
  }

  export type QueueUpdateManyWithoutVisitorNestedInput = {
    create?: XOR<QueueCreateWithoutVisitorInput, QueueUncheckedCreateWithoutVisitorInput> | QueueCreateWithoutVisitorInput[] | QueueUncheckedCreateWithoutVisitorInput[]
    connectOrCreate?: QueueCreateOrConnectWithoutVisitorInput | QueueCreateOrConnectWithoutVisitorInput[]
    upsert?: QueueUpsertWithWhereUniqueWithoutVisitorInput | QueueUpsertWithWhereUniqueWithoutVisitorInput[]
    createMany?: QueueCreateManyVisitorInputEnvelope
    set?: QueueWhereUniqueInput | QueueWhereUniqueInput[]
    disconnect?: QueueWhereUniqueInput | QueueWhereUniqueInput[]
    delete?: QueueWhereUniqueInput | QueueWhereUniqueInput[]
    connect?: QueueWhereUniqueInput | QueueWhereUniqueInput[]
    update?: QueueUpdateWithWhereUniqueWithoutVisitorInput | QueueUpdateWithWhereUniqueWithoutVisitorInput[]
    updateMany?: QueueUpdateManyWithWhereWithoutVisitorInput | QueueUpdateManyWithWhereWithoutVisitorInput[]
    deleteMany?: QueueScalarWhereInput | QueueScalarWhereInput[]
  }

  export type QueueUncheckedUpdateManyWithoutVisitorNestedInput = {
    create?: XOR<QueueCreateWithoutVisitorInput, QueueUncheckedCreateWithoutVisitorInput> | QueueCreateWithoutVisitorInput[] | QueueUncheckedCreateWithoutVisitorInput[]
    connectOrCreate?: QueueCreateOrConnectWithoutVisitorInput | QueueCreateOrConnectWithoutVisitorInput[]
    upsert?: QueueUpsertWithWhereUniqueWithoutVisitorInput | QueueUpsertWithWhereUniqueWithoutVisitorInput[]
    createMany?: QueueCreateManyVisitorInputEnvelope
    set?: QueueWhereUniqueInput | QueueWhereUniqueInput[]
    disconnect?: QueueWhereUniqueInput | QueueWhereUniqueInput[]
    delete?: QueueWhereUniqueInput | QueueWhereUniqueInput[]
    connect?: QueueWhereUniqueInput | QueueWhereUniqueInput[]
    update?: QueueUpdateWithWhereUniqueWithoutVisitorInput | QueueUpdateWithWhereUniqueWithoutVisitorInput[]
    updateMany?: QueueUpdateManyWithWhereWithoutVisitorInput | QueueUpdateManyWithWhereWithoutVisitorInput[]
    deleteMany?: QueueScalarWhereInput | QueueScalarWhereInput[]
  }

  export type VisitorCreateNestedOneWithoutQueuesInput = {
    create?: XOR<VisitorCreateWithoutQueuesInput, VisitorUncheckedCreateWithoutQueuesInput>
    connectOrCreate?: VisitorCreateOrConnectWithoutQueuesInput
    connect?: VisitorWhereUniqueInput
  }

  export type GuestCreateNestedOneWithoutQueuesInput = {
    create?: XOR<GuestCreateWithoutQueuesInput, GuestUncheckedCreateWithoutQueuesInput>
    connectOrCreate?: GuestCreateOrConnectWithoutQueuesInput
    connect?: GuestWhereUniqueInput
  }

  export type ServiceCreateNestedOneWithoutQueuesInput = {
    create?: XOR<ServiceCreateWithoutQueuesInput, ServiceUncheckedCreateWithoutQueuesInput>
    connectOrCreate?: ServiceCreateOrConnectWithoutQueuesInput
    connect?: ServiceWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutQueuesInput = {
    create?: XOR<UserCreateWithoutQueuesInput, UserUncheckedCreateWithoutQueuesInput>
    connectOrCreate?: UserCreateOrConnectWithoutQueuesInput
    connect?: UserWhereUniqueInput
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumQueueStatusFieldUpdateOperationsInput = {
    set?: $Enums.QueueStatus
  }

  export type EnumQueueTypeFieldUpdateOperationsInput = {
    set?: $Enums.QueueType
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type VisitorUpdateOneRequiredWithoutQueuesNestedInput = {
    create?: XOR<VisitorCreateWithoutQueuesInput, VisitorUncheckedCreateWithoutQueuesInput>
    connectOrCreate?: VisitorCreateOrConnectWithoutQueuesInput
    upsert?: VisitorUpsertWithoutQueuesInput
    connect?: VisitorWhereUniqueInput
    update?: XOR<XOR<VisitorUpdateToOneWithWhereWithoutQueuesInput, VisitorUpdateWithoutQueuesInput>, VisitorUncheckedUpdateWithoutQueuesInput>
  }

  export type GuestUpdateOneWithoutQueuesNestedInput = {
    create?: XOR<GuestCreateWithoutQueuesInput, GuestUncheckedCreateWithoutQueuesInput>
    connectOrCreate?: GuestCreateOrConnectWithoutQueuesInput
    upsert?: GuestUpsertWithoutQueuesInput
    disconnect?: GuestWhereInput | boolean
    delete?: GuestWhereInput | boolean
    connect?: GuestWhereUniqueInput
    update?: XOR<XOR<GuestUpdateToOneWithWhereWithoutQueuesInput, GuestUpdateWithoutQueuesInput>, GuestUncheckedUpdateWithoutQueuesInput>
  }

  export type ServiceUpdateOneRequiredWithoutQueuesNestedInput = {
    create?: XOR<ServiceCreateWithoutQueuesInput, ServiceUncheckedCreateWithoutQueuesInput>
    connectOrCreate?: ServiceCreateOrConnectWithoutQueuesInput
    upsert?: ServiceUpsertWithoutQueuesInput
    connect?: ServiceWhereUniqueInput
    update?: XOR<XOR<ServiceUpdateToOneWithWhereWithoutQueuesInput, ServiceUpdateWithoutQueuesInput>, ServiceUncheckedUpdateWithoutQueuesInput>
  }

  export type UserUpdateOneWithoutQueuesNestedInput = {
    create?: XOR<UserCreateWithoutQueuesInput, UserUncheckedCreateWithoutQueuesInput>
    connectOrCreate?: UserCreateOrConnectWithoutQueuesInput
    upsert?: UserUpsertWithoutQueuesInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutQueuesInput, UserUpdateWithoutQueuesInput>, UserUncheckedUpdateWithoutQueuesInput>
  }

  export type UserCreateNestedOneWithoutNotificationsInput = {
    create?: XOR<UserCreateWithoutNotificationsInput, UserUncheckedCreateWithoutNotificationsInput>
    connectOrCreate?: UserCreateOrConnectWithoutNotificationsInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneWithoutNotificationsNestedInput = {
    create?: XOR<UserCreateWithoutNotificationsInput, UserUncheckedCreateWithoutNotificationsInput>
    connectOrCreate?: UserCreateOrConnectWithoutNotificationsInput
    upsert?: UserUpsertWithoutNotificationsInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutNotificationsInput, UserUpdateWithoutNotificationsInput>, UserUncheckedUpdateWithoutNotificationsInput>
  }

  export type QueueCreateNestedManyWithoutGuestInput = {
    create?: XOR<QueueCreateWithoutGuestInput, QueueUncheckedCreateWithoutGuestInput> | QueueCreateWithoutGuestInput[] | QueueUncheckedCreateWithoutGuestInput[]
    connectOrCreate?: QueueCreateOrConnectWithoutGuestInput | QueueCreateOrConnectWithoutGuestInput[]
    createMany?: QueueCreateManyGuestInputEnvelope
    connect?: QueueWhereUniqueInput | QueueWhereUniqueInput[]
  }

  export type QueueUncheckedCreateNestedManyWithoutGuestInput = {
    create?: XOR<QueueCreateWithoutGuestInput, QueueUncheckedCreateWithoutGuestInput> | QueueCreateWithoutGuestInput[] | QueueUncheckedCreateWithoutGuestInput[]
    connectOrCreate?: QueueCreateOrConnectWithoutGuestInput | QueueCreateOrConnectWithoutGuestInput[]
    createMany?: QueueCreateManyGuestInputEnvelope
    connect?: QueueWhereUniqueInput | QueueWhereUniqueInput[]
  }

  export type QueueUpdateManyWithoutGuestNestedInput = {
    create?: XOR<QueueCreateWithoutGuestInput, QueueUncheckedCreateWithoutGuestInput> | QueueCreateWithoutGuestInput[] | QueueUncheckedCreateWithoutGuestInput[]
    connectOrCreate?: QueueCreateOrConnectWithoutGuestInput | QueueCreateOrConnectWithoutGuestInput[]
    upsert?: QueueUpsertWithWhereUniqueWithoutGuestInput | QueueUpsertWithWhereUniqueWithoutGuestInput[]
    createMany?: QueueCreateManyGuestInputEnvelope
    set?: QueueWhereUniqueInput | QueueWhereUniqueInput[]
    disconnect?: QueueWhereUniqueInput | QueueWhereUniqueInput[]
    delete?: QueueWhereUniqueInput | QueueWhereUniqueInput[]
    connect?: QueueWhereUniqueInput | QueueWhereUniqueInput[]
    update?: QueueUpdateWithWhereUniqueWithoutGuestInput | QueueUpdateWithWhereUniqueWithoutGuestInput[]
    updateMany?: QueueUpdateManyWithWhereWithoutGuestInput | QueueUpdateManyWithWhereWithoutGuestInput[]
    deleteMany?: QueueScalarWhereInput | QueueScalarWhereInput[]
  }

  export type QueueUncheckedUpdateManyWithoutGuestNestedInput = {
    create?: XOR<QueueCreateWithoutGuestInput, QueueUncheckedCreateWithoutGuestInput> | QueueCreateWithoutGuestInput[] | QueueUncheckedCreateWithoutGuestInput[]
    connectOrCreate?: QueueCreateOrConnectWithoutGuestInput | QueueCreateOrConnectWithoutGuestInput[]
    upsert?: QueueUpsertWithWhereUniqueWithoutGuestInput | QueueUpsertWithWhereUniqueWithoutGuestInput[]
    createMany?: QueueCreateManyGuestInputEnvelope
    set?: QueueWhereUniqueInput | QueueWhereUniqueInput[]
    disconnect?: QueueWhereUniqueInput | QueueWhereUniqueInput[]
    delete?: QueueWhereUniqueInput | QueueWhereUniqueInput[]
    connect?: QueueWhereUniqueInput | QueueWhereUniqueInput[]
    update?: QueueUpdateWithWhereUniqueWithoutGuestInput | QueueUpdateWithWhereUniqueWithoutGuestInput[]
    updateMany?: QueueUpdateManyWithWhereWithoutGuestInput | QueueUpdateManyWithWhereWithoutGuestInput[]
    deleteMany?: QueueScalarWhereInput | QueueScalarWhereInput[]
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedEnumRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleFilter<$PrismaModel> | $Enums.Role
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedEnumRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRoleFilter<$PrismaModel>
    _max?: NestedEnumRoleFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumServiceStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ServiceStatus | EnumServiceStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ServiceStatus[] | ListEnumServiceStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ServiceStatus[] | ListEnumServiceStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumServiceStatusFilter<$PrismaModel> | $Enums.ServiceStatus
  }

  export type NestedEnumServiceStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ServiceStatus | EnumServiceStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ServiceStatus[] | ListEnumServiceStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ServiceStatus[] | ListEnumServiceStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumServiceStatusWithAggregatesFilter<$PrismaModel> | $Enums.ServiceStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumServiceStatusFilter<$PrismaModel>
    _max?: NestedEnumServiceStatusFilter<$PrismaModel>
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumGenderNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.Gender | EnumGenderFieldRefInput<$PrismaModel> | null
    in?: $Enums.Gender[] | ListEnumGenderFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.Gender[] | ListEnumGenderFieldRefInput<$PrismaModel> | null
    not?: NestedEnumGenderNullableFilter<$PrismaModel> | $Enums.Gender | null
  }

  export type NestedEnumLastEducationNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.LastEducation | EnumLastEducationFieldRefInput<$PrismaModel> | null
    in?: $Enums.LastEducation[] | ListEnumLastEducationFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.LastEducation[] | ListEnumLastEducationFieldRefInput<$PrismaModel> | null
    not?: NestedEnumLastEducationNullableFilter<$PrismaModel> | $Enums.LastEducation | null
  }

  export type NestedEnumPurposeNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.Purpose | EnumPurposeFieldRefInput<$PrismaModel> | null
    in?: $Enums.Purpose[] | ListEnumPurposeFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.Purpose[] | ListEnumPurposeFieldRefInput<$PrismaModel> | null
    not?: NestedEnumPurposeNullableFilter<$PrismaModel> | $Enums.Purpose | null
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumGenderNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Gender | EnumGenderFieldRefInput<$PrismaModel> | null
    in?: $Enums.Gender[] | ListEnumGenderFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.Gender[] | ListEnumGenderFieldRefInput<$PrismaModel> | null
    not?: NestedEnumGenderNullableWithAggregatesFilter<$PrismaModel> | $Enums.Gender | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumGenderNullableFilter<$PrismaModel>
    _max?: NestedEnumGenderNullableFilter<$PrismaModel>
  }

  export type NestedEnumLastEducationNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.LastEducation | EnumLastEducationFieldRefInput<$PrismaModel> | null
    in?: $Enums.LastEducation[] | ListEnumLastEducationFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.LastEducation[] | ListEnumLastEducationFieldRefInput<$PrismaModel> | null
    not?: NestedEnumLastEducationNullableWithAggregatesFilter<$PrismaModel> | $Enums.LastEducation | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumLastEducationNullableFilter<$PrismaModel>
    _max?: NestedEnumLastEducationNullableFilter<$PrismaModel>
  }

  export type NestedEnumPurposeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Purpose | EnumPurposeFieldRefInput<$PrismaModel> | null
    in?: $Enums.Purpose[] | ListEnumPurposeFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.Purpose[] | ListEnumPurposeFieldRefInput<$PrismaModel> | null
    not?: NestedEnumPurposeNullableWithAggregatesFilter<$PrismaModel> | $Enums.Purpose | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumPurposeNullableFilter<$PrismaModel>
    _max?: NestedEnumPurposeNullableFilter<$PrismaModel>
  }

  export type NestedEnumQueueStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.QueueStatus | EnumQueueStatusFieldRefInput<$PrismaModel>
    in?: $Enums.QueueStatus[] | ListEnumQueueStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.QueueStatus[] | ListEnumQueueStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumQueueStatusFilter<$PrismaModel> | $Enums.QueueStatus
  }

  export type NestedEnumQueueTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.QueueType | EnumQueueTypeFieldRefInput<$PrismaModel>
    in?: $Enums.QueueType[] | ListEnumQueueTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.QueueType[] | ListEnumQueueTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumQueueTypeFilter<$PrismaModel> | $Enums.QueueType
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedEnumQueueStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.QueueStatus | EnumQueueStatusFieldRefInput<$PrismaModel>
    in?: $Enums.QueueStatus[] | ListEnumQueueStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.QueueStatus[] | ListEnumQueueStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumQueueStatusWithAggregatesFilter<$PrismaModel> | $Enums.QueueStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumQueueStatusFilter<$PrismaModel>
    _max?: NestedEnumQueueStatusFilter<$PrismaModel>
  }

  export type NestedEnumQueueTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.QueueType | EnumQueueTypeFieldRefInput<$PrismaModel>
    in?: $Enums.QueueType[] | ListEnumQueueTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.QueueType[] | ListEnumQueueTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumQueueTypeWithAggregatesFilter<$PrismaModel> | $Enums.QueueType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumQueueTypeFilter<$PrismaModel>
    _max?: NestedEnumQueueTypeFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type QueueCreateWithoutAdminInput = {
    id?: string
    queueNumber: number
    status?: $Enums.QueueStatus
    queueType?: $Enums.QueueType
    queueDate?: Date | string
    startTime?: Date | string | null
    endTime?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tempUuid?: string | null
    filledSKD?: boolean
    trackingLink?: string | null
    visitor: VisitorCreateNestedOneWithoutQueuesInput
    guest?: GuestCreateNestedOneWithoutQueuesInput
    service: ServiceCreateNestedOneWithoutQueuesInput
  }

  export type QueueUncheckedCreateWithoutAdminInput = {
    id?: string
    queueNumber: number
    status?: $Enums.QueueStatus
    queueType?: $Enums.QueueType
    queueDate?: Date | string
    visitorId: string
    guestId?: string | null
    serviceId: string
    startTime?: Date | string | null
    endTime?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tempUuid?: string | null
    filledSKD?: boolean
    trackingLink?: string | null
  }

  export type QueueCreateOrConnectWithoutAdminInput = {
    where: QueueWhereUniqueInput
    create: XOR<QueueCreateWithoutAdminInput, QueueUncheckedCreateWithoutAdminInput>
  }

  export type QueueCreateManyAdminInputEnvelope = {
    data: QueueCreateManyAdminInput | QueueCreateManyAdminInput[]
    skipDuplicates?: boolean
  }

  export type NotificationCreateWithoutUserInput = {
    id?: string
    type: string
    title: string
    message: string
    isRead?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type NotificationUncheckedCreateWithoutUserInput = {
    id?: string
    type: string
    title: string
    message: string
    isRead?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type NotificationCreateOrConnectWithoutUserInput = {
    where: NotificationWhereUniqueInput
    create: XOR<NotificationCreateWithoutUserInput, NotificationUncheckedCreateWithoutUserInput>
  }

  export type NotificationCreateManyUserInputEnvelope = {
    data: NotificationCreateManyUserInput | NotificationCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type QueueUpsertWithWhereUniqueWithoutAdminInput = {
    where: QueueWhereUniqueInput
    update: XOR<QueueUpdateWithoutAdminInput, QueueUncheckedUpdateWithoutAdminInput>
    create: XOR<QueueCreateWithoutAdminInput, QueueUncheckedCreateWithoutAdminInput>
  }

  export type QueueUpdateWithWhereUniqueWithoutAdminInput = {
    where: QueueWhereUniqueInput
    data: XOR<QueueUpdateWithoutAdminInput, QueueUncheckedUpdateWithoutAdminInput>
  }

  export type QueueUpdateManyWithWhereWithoutAdminInput = {
    where: QueueScalarWhereInput
    data: XOR<QueueUpdateManyMutationInput, QueueUncheckedUpdateManyWithoutAdminInput>
  }

  export type QueueScalarWhereInput = {
    AND?: QueueScalarWhereInput | QueueScalarWhereInput[]
    OR?: QueueScalarWhereInput[]
    NOT?: QueueScalarWhereInput | QueueScalarWhereInput[]
    id?: StringFilter<"Queue"> | string
    queueNumber?: IntFilter<"Queue"> | number
    status?: EnumQueueStatusFilter<"Queue"> | $Enums.QueueStatus
    queueType?: EnumQueueTypeFilter<"Queue"> | $Enums.QueueType
    queueDate?: DateTimeFilter<"Queue"> | Date | string
    visitorId?: StringFilter<"Queue"> | string
    guestId?: StringNullableFilter<"Queue"> | string | null
    serviceId?: StringFilter<"Queue"> | string
    adminId?: StringNullableFilter<"Queue"> | string | null
    startTime?: DateTimeNullableFilter<"Queue"> | Date | string | null
    endTime?: DateTimeNullableFilter<"Queue"> | Date | string | null
    createdAt?: DateTimeFilter<"Queue"> | Date | string
    updatedAt?: DateTimeFilter<"Queue"> | Date | string
    tempUuid?: StringNullableFilter<"Queue"> | string | null
    filledSKD?: BoolFilter<"Queue"> | boolean
    trackingLink?: StringNullableFilter<"Queue"> | string | null
  }

  export type NotificationUpsertWithWhereUniqueWithoutUserInput = {
    where: NotificationWhereUniqueInput
    update: XOR<NotificationUpdateWithoutUserInput, NotificationUncheckedUpdateWithoutUserInput>
    create: XOR<NotificationCreateWithoutUserInput, NotificationUncheckedCreateWithoutUserInput>
  }

  export type NotificationUpdateWithWhereUniqueWithoutUserInput = {
    where: NotificationWhereUniqueInput
    data: XOR<NotificationUpdateWithoutUserInput, NotificationUncheckedUpdateWithoutUserInput>
  }

  export type NotificationUpdateManyWithWhereWithoutUserInput = {
    where: NotificationScalarWhereInput
    data: XOR<NotificationUpdateManyMutationInput, NotificationUncheckedUpdateManyWithoutUserInput>
  }

  export type NotificationScalarWhereInput = {
    AND?: NotificationScalarWhereInput | NotificationScalarWhereInput[]
    OR?: NotificationScalarWhereInput[]
    NOT?: NotificationScalarWhereInput | NotificationScalarWhereInput[]
    id?: StringFilter<"Notification"> | string
    type?: StringFilter<"Notification"> | string
    title?: StringFilter<"Notification"> | string
    message?: StringFilter<"Notification"> | string
    isRead?: BoolFilter<"Notification"> | boolean
    createdAt?: DateTimeFilter<"Notification"> | Date | string
    updatedAt?: DateTimeFilter<"Notification"> | Date | string
    userId?: StringNullableFilter<"Notification"> | string | null
  }

  export type QueueCreateWithoutServiceInput = {
    id?: string
    queueNumber: number
    status?: $Enums.QueueStatus
    queueType?: $Enums.QueueType
    queueDate?: Date | string
    startTime?: Date | string | null
    endTime?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tempUuid?: string | null
    filledSKD?: boolean
    trackingLink?: string | null
    visitor: VisitorCreateNestedOneWithoutQueuesInput
    guest?: GuestCreateNestedOneWithoutQueuesInput
    admin?: UserCreateNestedOneWithoutQueuesInput
  }

  export type QueueUncheckedCreateWithoutServiceInput = {
    id?: string
    queueNumber: number
    status?: $Enums.QueueStatus
    queueType?: $Enums.QueueType
    queueDate?: Date | string
    visitorId: string
    guestId?: string | null
    adminId?: string | null
    startTime?: Date | string | null
    endTime?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tempUuid?: string | null
    filledSKD?: boolean
    trackingLink?: string | null
  }

  export type QueueCreateOrConnectWithoutServiceInput = {
    where: QueueWhereUniqueInput
    create: XOR<QueueCreateWithoutServiceInput, QueueUncheckedCreateWithoutServiceInput>
  }

  export type QueueCreateManyServiceInputEnvelope = {
    data: QueueCreateManyServiceInput | QueueCreateManyServiceInput[]
    skipDuplicates?: boolean
  }

  export type QueueUpsertWithWhereUniqueWithoutServiceInput = {
    where: QueueWhereUniqueInput
    update: XOR<QueueUpdateWithoutServiceInput, QueueUncheckedUpdateWithoutServiceInput>
    create: XOR<QueueCreateWithoutServiceInput, QueueUncheckedCreateWithoutServiceInput>
  }

  export type QueueUpdateWithWhereUniqueWithoutServiceInput = {
    where: QueueWhereUniqueInput
    data: XOR<QueueUpdateWithoutServiceInput, QueueUncheckedUpdateWithoutServiceInput>
  }

  export type QueueUpdateManyWithWhereWithoutServiceInput = {
    where: QueueScalarWhereInput
    data: XOR<QueueUpdateManyMutationInput, QueueUncheckedUpdateManyWithoutServiceInput>
  }

  export type QueueCreateWithoutVisitorInput = {
    id?: string
    queueNumber: number
    status?: $Enums.QueueStatus
    queueType?: $Enums.QueueType
    queueDate?: Date | string
    startTime?: Date | string | null
    endTime?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tempUuid?: string | null
    filledSKD?: boolean
    trackingLink?: string | null
    guest?: GuestCreateNestedOneWithoutQueuesInput
    service: ServiceCreateNestedOneWithoutQueuesInput
    admin?: UserCreateNestedOneWithoutQueuesInput
  }

  export type QueueUncheckedCreateWithoutVisitorInput = {
    id?: string
    queueNumber: number
    status?: $Enums.QueueStatus
    queueType?: $Enums.QueueType
    queueDate?: Date | string
    guestId?: string | null
    serviceId: string
    adminId?: string | null
    startTime?: Date | string | null
    endTime?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tempUuid?: string | null
    filledSKD?: boolean
    trackingLink?: string | null
  }

  export type QueueCreateOrConnectWithoutVisitorInput = {
    where: QueueWhereUniqueInput
    create: XOR<QueueCreateWithoutVisitorInput, QueueUncheckedCreateWithoutVisitorInput>
  }

  export type QueueCreateManyVisitorInputEnvelope = {
    data: QueueCreateManyVisitorInput | QueueCreateManyVisitorInput[]
    skipDuplicates?: boolean
  }

  export type QueueUpsertWithWhereUniqueWithoutVisitorInput = {
    where: QueueWhereUniqueInput
    update: XOR<QueueUpdateWithoutVisitorInput, QueueUncheckedUpdateWithoutVisitorInput>
    create: XOR<QueueCreateWithoutVisitorInput, QueueUncheckedCreateWithoutVisitorInput>
  }

  export type QueueUpdateWithWhereUniqueWithoutVisitorInput = {
    where: QueueWhereUniqueInput
    data: XOR<QueueUpdateWithoutVisitorInput, QueueUncheckedUpdateWithoutVisitorInput>
  }

  export type QueueUpdateManyWithWhereWithoutVisitorInput = {
    where: QueueScalarWhereInput
    data: XOR<QueueUpdateManyMutationInput, QueueUncheckedUpdateManyWithoutVisitorInput>
  }

  export type VisitorCreateWithoutQueuesInput = {
    id?: string
    name: string
    phone: string
    address?: string | null
    age?: number | null
    gender?: $Enums.Gender | null
    lastEducation?: $Enums.LastEducation | null
    occupation?: string | null
    institution?: string | null
    email?: string | null
    purpose?: $Enums.Purpose | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VisitorUncheckedCreateWithoutQueuesInput = {
    id?: string
    name: string
    phone: string
    address?: string | null
    age?: number | null
    gender?: $Enums.Gender | null
    lastEducation?: $Enums.LastEducation | null
    occupation?: string | null
    institution?: string | null
    email?: string | null
    purpose?: $Enums.Purpose | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VisitorCreateOrConnectWithoutQueuesInput = {
    where: VisitorWhereUniqueInput
    create: XOR<VisitorCreateWithoutQueuesInput, VisitorUncheckedCreateWithoutQueuesInput>
  }

  export type GuestCreateWithoutQueuesInput = {
    id?: string
    fullName: string
    email?: string | null
    address?: string | null
    phone: string
    age?: number | null
    institution?: string | null
    gender?: $Enums.Gender | null
    lastEducation?: $Enums.LastEducation | null
    occupation?: string | null
    purpose?: $Enums.Purpose | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GuestUncheckedCreateWithoutQueuesInput = {
    id?: string
    fullName: string
    email?: string | null
    address?: string | null
    phone: string
    age?: number | null
    institution?: string | null
    gender?: $Enums.Gender | null
    lastEducation?: $Enums.LastEducation | null
    occupation?: string | null
    purpose?: $Enums.Purpose | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GuestCreateOrConnectWithoutQueuesInput = {
    where: GuestWhereUniqueInput
    create: XOR<GuestCreateWithoutQueuesInput, GuestUncheckedCreateWithoutQueuesInput>
  }

  export type ServiceCreateWithoutQueuesInput = {
    id?: string
    name: string
    status?: $Enums.ServiceStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ServiceUncheckedCreateWithoutQueuesInput = {
    id?: string
    name: string
    status?: $Enums.ServiceStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ServiceCreateOrConnectWithoutQueuesInput = {
    where: ServiceWhereUniqueInput
    create: XOR<ServiceCreateWithoutQueuesInput, ServiceUncheckedCreateWithoutQueuesInput>
  }

  export type UserCreateWithoutQueuesInput = {
    id?: string
    username: string
    password: string
    name: string
    role?: $Enums.Role
    createdAt?: Date | string
    updatedAt?: Date | string
    notifications?: NotificationCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutQueuesInput = {
    id?: string
    username: string
    password: string
    name: string
    role?: $Enums.Role
    createdAt?: Date | string
    updatedAt?: Date | string
    notifications?: NotificationUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutQueuesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutQueuesInput, UserUncheckedCreateWithoutQueuesInput>
  }

  export type VisitorUpsertWithoutQueuesInput = {
    update: XOR<VisitorUpdateWithoutQueuesInput, VisitorUncheckedUpdateWithoutQueuesInput>
    create: XOR<VisitorCreateWithoutQueuesInput, VisitorUncheckedCreateWithoutQueuesInput>
    where?: VisitorWhereInput
  }

  export type VisitorUpdateToOneWithWhereWithoutQueuesInput = {
    where?: VisitorWhereInput
    data: XOR<VisitorUpdateWithoutQueuesInput, VisitorUncheckedUpdateWithoutQueuesInput>
  }

  export type VisitorUpdateWithoutQueuesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    age?: NullableIntFieldUpdateOperationsInput | number | null
    gender?: NullableEnumGenderFieldUpdateOperationsInput | $Enums.Gender | null
    lastEducation?: NullableEnumLastEducationFieldUpdateOperationsInput | $Enums.LastEducation | null
    occupation?: NullableStringFieldUpdateOperationsInput | string | null
    institution?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    purpose?: NullableEnumPurposeFieldUpdateOperationsInput | $Enums.Purpose | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VisitorUncheckedUpdateWithoutQueuesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    age?: NullableIntFieldUpdateOperationsInput | number | null
    gender?: NullableEnumGenderFieldUpdateOperationsInput | $Enums.Gender | null
    lastEducation?: NullableEnumLastEducationFieldUpdateOperationsInput | $Enums.LastEducation | null
    occupation?: NullableStringFieldUpdateOperationsInput | string | null
    institution?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    purpose?: NullableEnumPurposeFieldUpdateOperationsInput | $Enums.Purpose | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GuestUpsertWithoutQueuesInput = {
    update: XOR<GuestUpdateWithoutQueuesInput, GuestUncheckedUpdateWithoutQueuesInput>
    create: XOR<GuestCreateWithoutQueuesInput, GuestUncheckedCreateWithoutQueuesInput>
    where?: GuestWhereInput
  }

  export type GuestUpdateToOneWithWhereWithoutQueuesInput = {
    where?: GuestWhereInput
    data: XOR<GuestUpdateWithoutQueuesInput, GuestUncheckedUpdateWithoutQueuesInput>
  }

  export type GuestUpdateWithoutQueuesInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: StringFieldUpdateOperationsInput | string
    age?: NullableIntFieldUpdateOperationsInput | number | null
    institution?: NullableStringFieldUpdateOperationsInput | string | null
    gender?: NullableEnumGenderFieldUpdateOperationsInput | $Enums.Gender | null
    lastEducation?: NullableEnumLastEducationFieldUpdateOperationsInput | $Enums.LastEducation | null
    occupation?: NullableStringFieldUpdateOperationsInput | string | null
    purpose?: NullableEnumPurposeFieldUpdateOperationsInput | $Enums.Purpose | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GuestUncheckedUpdateWithoutQueuesInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: StringFieldUpdateOperationsInput | string
    age?: NullableIntFieldUpdateOperationsInput | number | null
    institution?: NullableStringFieldUpdateOperationsInput | string | null
    gender?: NullableEnumGenderFieldUpdateOperationsInput | $Enums.Gender | null
    lastEducation?: NullableEnumLastEducationFieldUpdateOperationsInput | $Enums.LastEducation | null
    occupation?: NullableStringFieldUpdateOperationsInput | string | null
    purpose?: NullableEnumPurposeFieldUpdateOperationsInput | $Enums.Purpose | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ServiceUpsertWithoutQueuesInput = {
    update: XOR<ServiceUpdateWithoutQueuesInput, ServiceUncheckedUpdateWithoutQueuesInput>
    create: XOR<ServiceCreateWithoutQueuesInput, ServiceUncheckedCreateWithoutQueuesInput>
    where?: ServiceWhereInput
  }

  export type ServiceUpdateToOneWithWhereWithoutQueuesInput = {
    where?: ServiceWhereInput
    data: XOR<ServiceUpdateWithoutQueuesInput, ServiceUncheckedUpdateWithoutQueuesInput>
  }

  export type ServiceUpdateWithoutQueuesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    status?: EnumServiceStatusFieldUpdateOperationsInput | $Enums.ServiceStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ServiceUncheckedUpdateWithoutQueuesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    status?: EnumServiceStatusFieldUpdateOperationsInput | $Enums.ServiceStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUpsertWithoutQueuesInput = {
    update: XOR<UserUpdateWithoutQueuesInput, UserUncheckedUpdateWithoutQueuesInput>
    create: XOR<UserCreateWithoutQueuesInput, UserUncheckedCreateWithoutQueuesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutQueuesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutQueuesInput, UserUncheckedUpdateWithoutQueuesInput>
  }

  export type UserUpdateWithoutQueuesInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notifications?: NotificationUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutQueuesInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notifications?: NotificationUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutNotificationsInput = {
    id?: string
    username: string
    password: string
    name: string
    role?: $Enums.Role
    createdAt?: Date | string
    updatedAt?: Date | string
    queues?: QueueCreateNestedManyWithoutAdminInput
  }

  export type UserUncheckedCreateWithoutNotificationsInput = {
    id?: string
    username: string
    password: string
    name: string
    role?: $Enums.Role
    createdAt?: Date | string
    updatedAt?: Date | string
    queues?: QueueUncheckedCreateNestedManyWithoutAdminInput
  }

  export type UserCreateOrConnectWithoutNotificationsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutNotificationsInput, UserUncheckedCreateWithoutNotificationsInput>
  }

  export type UserUpsertWithoutNotificationsInput = {
    update: XOR<UserUpdateWithoutNotificationsInput, UserUncheckedUpdateWithoutNotificationsInput>
    create: XOR<UserCreateWithoutNotificationsInput, UserUncheckedCreateWithoutNotificationsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutNotificationsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutNotificationsInput, UserUncheckedUpdateWithoutNotificationsInput>
  }

  export type UserUpdateWithoutNotificationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    queues?: QueueUpdateManyWithoutAdminNestedInput
  }

  export type UserUncheckedUpdateWithoutNotificationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    queues?: QueueUncheckedUpdateManyWithoutAdminNestedInput
  }

  export type QueueCreateWithoutGuestInput = {
    id?: string
    queueNumber: number
    status?: $Enums.QueueStatus
    queueType?: $Enums.QueueType
    queueDate?: Date | string
    startTime?: Date | string | null
    endTime?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tempUuid?: string | null
    filledSKD?: boolean
    trackingLink?: string | null
    visitor: VisitorCreateNestedOneWithoutQueuesInput
    service: ServiceCreateNestedOneWithoutQueuesInput
    admin?: UserCreateNestedOneWithoutQueuesInput
  }

  export type QueueUncheckedCreateWithoutGuestInput = {
    id?: string
    queueNumber: number
    status?: $Enums.QueueStatus
    queueType?: $Enums.QueueType
    queueDate?: Date | string
    visitorId: string
    serviceId: string
    adminId?: string | null
    startTime?: Date | string | null
    endTime?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tempUuid?: string | null
    filledSKD?: boolean
    trackingLink?: string | null
  }

  export type QueueCreateOrConnectWithoutGuestInput = {
    where: QueueWhereUniqueInput
    create: XOR<QueueCreateWithoutGuestInput, QueueUncheckedCreateWithoutGuestInput>
  }

  export type QueueCreateManyGuestInputEnvelope = {
    data: QueueCreateManyGuestInput | QueueCreateManyGuestInput[]
    skipDuplicates?: boolean
  }

  export type QueueUpsertWithWhereUniqueWithoutGuestInput = {
    where: QueueWhereUniqueInput
    update: XOR<QueueUpdateWithoutGuestInput, QueueUncheckedUpdateWithoutGuestInput>
    create: XOR<QueueCreateWithoutGuestInput, QueueUncheckedCreateWithoutGuestInput>
  }

  export type QueueUpdateWithWhereUniqueWithoutGuestInput = {
    where: QueueWhereUniqueInput
    data: XOR<QueueUpdateWithoutGuestInput, QueueUncheckedUpdateWithoutGuestInput>
  }

  export type QueueUpdateManyWithWhereWithoutGuestInput = {
    where: QueueScalarWhereInput
    data: XOR<QueueUpdateManyMutationInput, QueueUncheckedUpdateManyWithoutGuestInput>
  }

  export type QueueCreateManyAdminInput = {
    id?: string
    queueNumber: number
    status?: $Enums.QueueStatus
    queueType?: $Enums.QueueType
    queueDate?: Date | string
    visitorId: string
    guestId?: string | null
    serviceId: string
    startTime?: Date | string | null
    endTime?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tempUuid?: string | null
    filledSKD?: boolean
    trackingLink?: string | null
  }

  export type NotificationCreateManyUserInput = {
    id?: string
    type: string
    title: string
    message: string
    isRead?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type QueueUpdateWithoutAdminInput = {
    id?: StringFieldUpdateOperationsInput | string
    queueNumber?: IntFieldUpdateOperationsInput | number
    status?: EnumQueueStatusFieldUpdateOperationsInput | $Enums.QueueStatus
    queueType?: EnumQueueTypeFieldUpdateOperationsInput | $Enums.QueueType
    queueDate?: DateTimeFieldUpdateOperationsInput | Date | string
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tempUuid?: NullableStringFieldUpdateOperationsInput | string | null
    filledSKD?: BoolFieldUpdateOperationsInput | boolean
    trackingLink?: NullableStringFieldUpdateOperationsInput | string | null
    visitor?: VisitorUpdateOneRequiredWithoutQueuesNestedInput
    guest?: GuestUpdateOneWithoutQueuesNestedInput
    service?: ServiceUpdateOneRequiredWithoutQueuesNestedInput
  }

  export type QueueUncheckedUpdateWithoutAdminInput = {
    id?: StringFieldUpdateOperationsInput | string
    queueNumber?: IntFieldUpdateOperationsInput | number
    status?: EnumQueueStatusFieldUpdateOperationsInput | $Enums.QueueStatus
    queueType?: EnumQueueTypeFieldUpdateOperationsInput | $Enums.QueueType
    queueDate?: DateTimeFieldUpdateOperationsInput | Date | string
    visitorId?: StringFieldUpdateOperationsInput | string
    guestId?: NullableStringFieldUpdateOperationsInput | string | null
    serviceId?: StringFieldUpdateOperationsInput | string
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tempUuid?: NullableStringFieldUpdateOperationsInput | string | null
    filledSKD?: BoolFieldUpdateOperationsInput | boolean
    trackingLink?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type QueueUncheckedUpdateManyWithoutAdminInput = {
    id?: StringFieldUpdateOperationsInput | string
    queueNumber?: IntFieldUpdateOperationsInput | number
    status?: EnumQueueStatusFieldUpdateOperationsInput | $Enums.QueueStatus
    queueType?: EnumQueueTypeFieldUpdateOperationsInput | $Enums.QueueType
    queueDate?: DateTimeFieldUpdateOperationsInput | Date | string
    visitorId?: StringFieldUpdateOperationsInput | string
    guestId?: NullableStringFieldUpdateOperationsInput | string | null
    serviceId?: StringFieldUpdateOperationsInput | string
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tempUuid?: NullableStringFieldUpdateOperationsInput | string | null
    filledSKD?: BoolFieldUpdateOperationsInput | boolean
    trackingLink?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type NotificationUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    isRead?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    isRead?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    isRead?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type QueueCreateManyServiceInput = {
    id?: string
    queueNumber: number
    status?: $Enums.QueueStatus
    queueType?: $Enums.QueueType
    queueDate?: Date | string
    visitorId: string
    guestId?: string | null
    adminId?: string | null
    startTime?: Date | string | null
    endTime?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tempUuid?: string | null
    filledSKD?: boolean
    trackingLink?: string | null
  }

  export type QueueUpdateWithoutServiceInput = {
    id?: StringFieldUpdateOperationsInput | string
    queueNumber?: IntFieldUpdateOperationsInput | number
    status?: EnumQueueStatusFieldUpdateOperationsInput | $Enums.QueueStatus
    queueType?: EnumQueueTypeFieldUpdateOperationsInput | $Enums.QueueType
    queueDate?: DateTimeFieldUpdateOperationsInput | Date | string
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tempUuid?: NullableStringFieldUpdateOperationsInput | string | null
    filledSKD?: BoolFieldUpdateOperationsInput | boolean
    trackingLink?: NullableStringFieldUpdateOperationsInput | string | null
    visitor?: VisitorUpdateOneRequiredWithoutQueuesNestedInput
    guest?: GuestUpdateOneWithoutQueuesNestedInput
    admin?: UserUpdateOneWithoutQueuesNestedInput
  }

  export type QueueUncheckedUpdateWithoutServiceInput = {
    id?: StringFieldUpdateOperationsInput | string
    queueNumber?: IntFieldUpdateOperationsInput | number
    status?: EnumQueueStatusFieldUpdateOperationsInput | $Enums.QueueStatus
    queueType?: EnumQueueTypeFieldUpdateOperationsInput | $Enums.QueueType
    queueDate?: DateTimeFieldUpdateOperationsInput | Date | string
    visitorId?: StringFieldUpdateOperationsInput | string
    guestId?: NullableStringFieldUpdateOperationsInput | string | null
    adminId?: NullableStringFieldUpdateOperationsInput | string | null
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tempUuid?: NullableStringFieldUpdateOperationsInput | string | null
    filledSKD?: BoolFieldUpdateOperationsInput | boolean
    trackingLink?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type QueueUncheckedUpdateManyWithoutServiceInput = {
    id?: StringFieldUpdateOperationsInput | string
    queueNumber?: IntFieldUpdateOperationsInput | number
    status?: EnumQueueStatusFieldUpdateOperationsInput | $Enums.QueueStatus
    queueType?: EnumQueueTypeFieldUpdateOperationsInput | $Enums.QueueType
    queueDate?: DateTimeFieldUpdateOperationsInput | Date | string
    visitorId?: StringFieldUpdateOperationsInput | string
    guestId?: NullableStringFieldUpdateOperationsInput | string | null
    adminId?: NullableStringFieldUpdateOperationsInput | string | null
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tempUuid?: NullableStringFieldUpdateOperationsInput | string | null
    filledSKD?: BoolFieldUpdateOperationsInput | boolean
    trackingLink?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type QueueCreateManyVisitorInput = {
    id?: string
    queueNumber: number
    status?: $Enums.QueueStatus
    queueType?: $Enums.QueueType
    queueDate?: Date | string
    guestId?: string | null
    serviceId: string
    adminId?: string | null
    startTime?: Date | string | null
    endTime?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tempUuid?: string | null
    filledSKD?: boolean
    trackingLink?: string | null
  }

  export type QueueUpdateWithoutVisitorInput = {
    id?: StringFieldUpdateOperationsInput | string
    queueNumber?: IntFieldUpdateOperationsInput | number
    status?: EnumQueueStatusFieldUpdateOperationsInput | $Enums.QueueStatus
    queueType?: EnumQueueTypeFieldUpdateOperationsInput | $Enums.QueueType
    queueDate?: DateTimeFieldUpdateOperationsInput | Date | string
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tempUuid?: NullableStringFieldUpdateOperationsInput | string | null
    filledSKD?: BoolFieldUpdateOperationsInput | boolean
    trackingLink?: NullableStringFieldUpdateOperationsInput | string | null
    guest?: GuestUpdateOneWithoutQueuesNestedInput
    service?: ServiceUpdateOneRequiredWithoutQueuesNestedInput
    admin?: UserUpdateOneWithoutQueuesNestedInput
  }

  export type QueueUncheckedUpdateWithoutVisitorInput = {
    id?: StringFieldUpdateOperationsInput | string
    queueNumber?: IntFieldUpdateOperationsInput | number
    status?: EnumQueueStatusFieldUpdateOperationsInput | $Enums.QueueStatus
    queueType?: EnumQueueTypeFieldUpdateOperationsInput | $Enums.QueueType
    queueDate?: DateTimeFieldUpdateOperationsInput | Date | string
    guestId?: NullableStringFieldUpdateOperationsInput | string | null
    serviceId?: StringFieldUpdateOperationsInput | string
    adminId?: NullableStringFieldUpdateOperationsInput | string | null
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tempUuid?: NullableStringFieldUpdateOperationsInput | string | null
    filledSKD?: BoolFieldUpdateOperationsInput | boolean
    trackingLink?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type QueueUncheckedUpdateManyWithoutVisitorInput = {
    id?: StringFieldUpdateOperationsInput | string
    queueNumber?: IntFieldUpdateOperationsInput | number
    status?: EnumQueueStatusFieldUpdateOperationsInput | $Enums.QueueStatus
    queueType?: EnumQueueTypeFieldUpdateOperationsInput | $Enums.QueueType
    queueDate?: DateTimeFieldUpdateOperationsInput | Date | string
    guestId?: NullableStringFieldUpdateOperationsInput | string | null
    serviceId?: StringFieldUpdateOperationsInput | string
    adminId?: NullableStringFieldUpdateOperationsInput | string | null
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tempUuid?: NullableStringFieldUpdateOperationsInput | string | null
    filledSKD?: BoolFieldUpdateOperationsInput | boolean
    trackingLink?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type QueueCreateManyGuestInput = {
    id?: string
    queueNumber: number
    status?: $Enums.QueueStatus
    queueType?: $Enums.QueueType
    queueDate?: Date | string
    visitorId: string
    serviceId: string
    adminId?: string | null
    startTime?: Date | string | null
    endTime?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tempUuid?: string | null
    filledSKD?: boolean
    trackingLink?: string | null
  }

  export type QueueUpdateWithoutGuestInput = {
    id?: StringFieldUpdateOperationsInput | string
    queueNumber?: IntFieldUpdateOperationsInput | number
    status?: EnumQueueStatusFieldUpdateOperationsInput | $Enums.QueueStatus
    queueType?: EnumQueueTypeFieldUpdateOperationsInput | $Enums.QueueType
    queueDate?: DateTimeFieldUpdateOperationsInput | Date | string
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tempUuid?: NullableStringFieldUpdateOperationsInput | string | null
    filledSKD?: BoolFieldUpdateOperationsInput | boolean
    trackingLink?: NullableStringFieldUpdateOperationsInput | string | null
    visitor?: VisitorUpdateOneRequiredWithoutQueuesNestedInput
    service?: ServiceUpdateOneRequiredWithoutQueuesNestedInput
    admin?: UserUpdateOneWithoutQueuesNestedInput
  }

  export type QueueUncheckedUpdateWithoutGuestInput = {
    id?: StringFieldUpdateOperationsInput | string
    queueNumber?: IntFieldUpdateOperationsInput | number
    status?: EnumQueueStatusFieldUpdateOperationsInput | $Enums.QueueStatus
    queueType?: EnumQueueTypeFieldUpdateOperationsInput | $Enums.QueueType
    queueDate?: DateTimeFieldUpdateOperationsInput | Date | string
    visitorId?: StringFieldUpdateOperationsInput | string
    serviceId?: StringFieldUpdateOperationsInput | string
    adminId?: NullableStringFieldUpdateOperationsInput | string | null
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tempUuid?: NullableStringFieldUpdateOperationsInput | string | null
    filledSKD?: BoolFieldUpdateOperationsInput | boolean
    trackingLink?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type QueueUncheckedUpdateManyWithoutGuestInput = {
    id?: StringFieldUpdateOperationsInput | string
    queueNumber?: IntFieldUpdateOperationsInput | number
    status?: EnumQueueStatusFieldUpdateOperationsInput | $Enums.QueueStatus
    queueType?: EnumQueueTypeFieldUpdateOperationsInput | $Enums.QueueType
    queueDate?: DateTimeFieldUpdateOperationsInput | Date | string
    visitorId?: StringFieldUpdateOperationsInput | string
    serviceId?: StringFieldUpdateOperationsInput | string
    adminId?: NullableStringFieldUpdateOperationsInput | string | null
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tempUuid?: NullableStringFieldUpdateOperationsInput | string | null
    filledSKD?: BoolFieldUpdateOperationsInput | boolean
    trackingLink?: NullableStringFieldUpdateOperationsInput | string | null
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}