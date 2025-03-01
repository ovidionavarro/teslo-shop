import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from "../common/dtos/pagination.dto";
import { isUUID } from "class-validator";

@Injectable()
export class ProductsService {
  
  private readonly logger=new Logger('ProductsService')
  
  constructor(
    
    @InjectRepository(Product)
    private readonly productRepository:Repository<Product>
  ){}


  async create(createProductDto: CreateProductDto) {
    try {

      const product= this.productRepository.create(createProductDto)
      await this.productRepository.save(product)
      return product

    } catch (error) {
      this.handleExceptions(error)
    }  
  
  }

  async findAll(paginationDto:PaginationDto) {
      const {limit=10,offset=0}=paginationDto
      const products=this.productRepository.find({
        take:limit,
        skip:offset
      })
      return products
   
  }

  async findOne(term:string) {

    let product:Product|null;

    if(isUUID(term)){
      product= await this.productRepository.findOneBy({id:term})
    }else {
      const queryBuilder=this.productRepository.createQueryBuilder();
      // @ts-ignore
      product= await queryBuilder
        .where('title =:title or slug =:slug', {
        title:term,
        slug:term,
      }).getOne()
    }

    // @ts-ignore
    if (!product) {
      throw new NotFoundException(`Product with ${term} not found`);
    }
    return product;

  }

  async update(id:string, updateProductDto: UpdateProductDto) {
    try {
      const product= await this.productRepository.preload({
        id:id,
        ...updateProductDto
      })
      if(!product)
        throw new NotFoundException(`Product with id :${id} not found`)
      await this.productRepository.save(product)
      return product

    } catch (error) {
      this.handleExceptions(error)
    }
  }

  async remove(id:string) {
    

      const product=await this.findOne(id)
      if (!product) {
        throw new BadRequestException(`Product with id ${id} not found`); // Manejo de error si no se encuentra el producto.
      }
      await this.productRepository.remove(product)
      return product
      
    
  }

  private handleExceptions(error:any){
    if(error.code==='23505')
      throw new BadRequestException(error.detail)

    this.logger.error(error)
    throw new InternalServerErrorException('Unexpected error, check server logs')


  }
}
  