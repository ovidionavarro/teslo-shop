import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { CommonModule } from './common/common.module';


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
    ProductsModule,
    CommonModule,
  ],
 
})
export class AppModule {}
