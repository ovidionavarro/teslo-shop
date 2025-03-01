import { IsPositive,IsOptional } from "class-validator";
import { Type } from "class-transformer";

export  class PaginationDto{
  @IsOptional()
  @IsPositive()
  @Type(()=>Number)
  limit?:number

  @IsOptional()
  @Type(()=>Number)
  offset?:number

}