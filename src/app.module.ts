import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';


@Module({
  imports: [ 
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type:'postgres',
      host:process.env.DB_HOST,
      port:+(process.env.DB_PORT || 5432),
      database:'teslodb',
      username:'root',
      password:process.env.DB_PASSWORD,
      autoLoadEntities:true,
      synchronize:true
    }),
  ],
 
})
export class AppModule {}
