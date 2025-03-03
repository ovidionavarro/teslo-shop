import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from "../common/dtos/pagination.dto";
import { isUUID } from "class-validator";
import { Product_image } from "./entities/product_image.entity";
import { query } from 'express';

@Injectable()
export class ProductsService {
  
  private readonly logger=new Logger('ProductsService')
  
  constructor(
    
    @InjectRepository(Product)
    private readonly productRepository:Repository<Product>,
    @InjectRepository(Product_image)
    private  readonly product_ImageRepository:Repository<Product_image>,
    private readonly dataSource:DataSource
  ){}


  async create(createProductDto: CreateProductDto) {
    try {
      const {images=[],...productDetails}=createProductDto
      const product= this.productRepository.create({
        ...productDetails,
        images:images.map(image=>this.product_ImageRepository.create({url:image}))
      })
      await this.productRepository.save(product)
      return { ...product,images }

    } catch (error) {
      this.handleExceptions(error)
    }  
  
  }

  async findAll(paginationDto:PaginationDto) {
      const {limit=10,offset=0}=paginationDto
      const products=await this.productRepository.find({
        take:limit,
        skip:offset,
        relations:{
          images:true
        }
      })
      return products.map(product=>({
        ...product,
        images: product.images?.map(img=>img.url)
      }))
   
  }

  async findOne(term:string) {
    let product:Product|null;
    if(isUUID(term)){
      product= await this.productRepository.findOneBy({id:term})
    }else {
      const queryBuilder=this.productRepository.createQueryBuilder('prod');
      // @ts-ignore
      product= await queryBuilder
        .where('title =:title or slug =:slug', {
        title:term,
        slug:term,
      })
        .leftJoinAndSelect('prod.images','prodImages')
        .getOne()
    }

    // @ts-ignore
    if (!product) {
      throw new NotFoundException(`Product with ${term} not found`);
    }
    return product;
  }
  async findOnePlain(term:string){
    const {images=[], ...rest}=await this.findOne(term)
    return{
      ...rest,
      images:images.map(image=>image.url)
    }
  }

  async update(id:string, updateProductDto: UpdateProductDto) {
    
 
      const {images,...toUpdate}=updateProductDto
      const product= await this.productRepository.preload({
        id,
        ...toUpdate
      })
      if(!product)
        throw new NotFoundException(`Prod ct with id :${id} not found`)
      const queryRunner=this.dataSource.createQueryRunner()
      await queryRunner.connect()
      await queryRunner.startTransaction() 
      
      try {
        if(images){
          await queryRunner.manager.delete(Product_image,{product:{id} })
          product.images=images.map(image=>this.product_ImageRepository.create({url:image}))
        }

        await queryRunner.manager.save(product)
        await queryRunner.commitTransaction()
        await queryRunner.release()
  
        return this.findOnePlain(id)

    } catch (error) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        this.handleExceptions(error)
    }
  }

  async remove(id:string) {
      const product=await this.findOne(id)
      if (!product) {
        throw new BadRequestException(`Product with id ${id} not found`); // Manejo de error si no se encuentra el producto.
      }
      await this.productRepository.remove(product) 
  }

  async deteAllProducts(){
    const query =this.productRepository.createQueryBuilder('product')
    try {
      return await query
      .delete()
      .where({})
      .execute()
    } catch (error) {
      this.handleExceptions(error)     
    }
  }

  private handleExceptions(error:any){
    if(error.code==='23505')
      throw new BadRequestException(error.detail)

    this.logger.error(error)
    throw new InternalServerErrorException('Unexpected error, check server logs')

  }
}
  