import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  BooleanTransformer,
  EnvKey,
  GenericKey,
  IntTransformer,
  NestedKey,
  generateConfigDoc,
} from './index';

export enum NODE_ENV {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}

export class GeneralConfig {
  @GenericKey('port')
  @IntTransformer()
  @IsInt()
  port = 3000;

  @EnvKey('NODE_ENV')
  @IsEnum(NODE_ENV)
  env: NODE_ENV = NODE_ENV.PRODUCTION;

  @GenericKey('version')
  @IsString()
  version = 'local_version';

  @GenericKey('corsOrigin')
  @IsString()
  @IsOptional()
  corsOrigin?: string;

  @GenericKey('adminEmail')
  @IsString()
  @IsOptional()
  adminEmail?: string;

  @GenericKey('adminPassword')
  @IsString()
  @IsOptional()
  adminPassword?: string;
}

export class MysqlConfig {
  @GenericKey('database')
  @IsString()
  database!: string;

  @GenericKey('host')
  @IsString()
  host!: string;

  @GenericKey('port')
  @IntTransformer()
  @IsInt()
  port = 3306;

  @GenericKey('user')
  @IsString()
  user!: string;

  @GenericKey('password')
  @IsString()
  password!: string;

  @GenericKey('runMigrations')
  @BooleanTransformer()
  @IsBoolean()
  runMigrations = false;

  @GenericKey('logTypeOrmQueries')
  @BooleanTransformer()
  @IsBoolean()
  logTypeOrmQueries = false;
}

export class LoggingConfig {
  @GenericKey('allContextsEnabled')
  @BooleanTransformer()
  @IsBoolean()
  allContextsEnabled = true;

  @GenericKey('colors')
  @BooleanTransformer()
  @IsBoolean()
  colors = false;
}

export class AuthConfig {
  @GenericKey('sessionRedisPrefix')
  @IsString()
  sessionRedisPrefix = 'sess_';

  @GenericKey('sessionLifeTime')
  @IntTransformer()
  @IsInt()
  sessionLifeTime = 31e9;

  @GenericKey('cookieName')
  @IsString()
  cookieName = 'admnseqwe';
}

export class RedisConfig {
  @GenericKey('host')
  @IsString()
  host!: string;

  @GenericKey('port')
  @IntTransformer()
  @IsInt()
  port = 6379;
}

export class FilesConfig {
  @GenericKey('imageServerUrl')
  @IsString()
  imageServerUrl!: string;

  @GenericKey('imagesPathPrefix')
  @IsString()
  imagesPathPrefix = '';
}

export class CacheConfig {
  @GenericKey('defaultTTL')
  @IntTransformer()
  @IsInt()
  defaultTTL = 300;
}

export class GamesImagesConfig {
  @GenericKey('resizeToHeightPx')
  @IntTransformer()
  @IsInt()
  resizeToHeightPx = 600;

  @GenericKey('resizeToWidthPx')
  @IntTransformer()
  @IsInt()
  resizeToWidthPx = 600;

  @GenericKey('maxSizeKb')
  @IntTransformer()
  @IsInt()
  maxSizeKb = 512;
}

export class CurrencyLibConfig {
  @GenericKey('apiBaseUrl')
  @IsString()
  apiBaseUrl!: string;

  @GenericKey('cacheKey')
  @IsString()
  cacheKey = 'exchange_rates';

  @GenericKey('cacheTtl')
  @IntTransformer()
  @IsInt()
  cacheTtl = 3600;
}

export class LibsConfig {
  @NestedKey('currency', CurrencyLibConfig)
  @ValidateNested()
  @Type(() => CurrencyLibConfig)
  currency!: CurrencyLibConfig;
}

export class AppConfig {
  @NestedKey('app', GeneralConfig)
  @ValidateNested()
  @Type(() => GeneralConfig)
  app!: GeneralConfig;

  @NestedKey('auth', AuthConfig)
  @ValidateNested()
  @Type(() => AuthConfig)
  auth!: AuthConfig;

  @NestedKey('log', LoggingConfig)
  @ValidateNested()
  @Type(() => LoggingConfig)
  logging!: LoggingConfig;

  @NestedKey('mysql.admin', MysqlConfig)
  @ValidateNested()
  @Type(() => MysqlConfig)
  adminMysql!: MysqlConfig;

  @NestedKey('mysql.casino', MysqlConfig)
  @ValidateNested()
  @Type(() => MysqlConfig)
  casinoMysql!: MysqlConfig;

  @NestedKey('mysql.onewin', MysqlConfig)
  @ValidateNested()
  @Type(() => MysqlConfig)
  oneWinMysql!: MysqlConfig;

  @NestedKey('redis', RedisConfig)
  @ValidateNested()
  @Type(() => RedisConfig)
  redis!: RedisConfig;

  @NestedKey('libs', LibsConfig)
  @ValidateNested()
  @Type(() => LibsConfig)
  libs!: LibsConfig;

  @NestedKey('cache', CacheConfig)
  @ValidateNested()
  @Type(() => CacheConfig)
  cache!: CacheConfig;

  @NestedKey('gameImages', GamesImagesConfig)
  @ValidateNested()
  @Type(() => GamesImagesConfig)
  gameImages!: GamesImagesConfig;

  @NestedKey('files', FilesConfig)
  @ValidateNested()
  @Type(() => FilesConfig)
  files!: FilesConfig;
}

const main = async () => {
  const res = await generateConfigDoc(AppConfig);
  console.log(res);
};

main().catch(console.error);
