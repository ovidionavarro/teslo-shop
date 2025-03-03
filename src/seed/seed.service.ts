import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from "./Data/data";

@Injectable()
export class SeedService {
  constructor(
    private readonly productService: ProductsService
  ) {}

  async runSeed() {
    await this.productService.deteAllProducts();
    const products = initialData.products;
    const insertPromise:Promise<any>[] = []

    products.forEach(product => {
      insertPromise.push(this.productService.create(product))
    })
    await Promise.all(insertPromise)
    return true
  }
} 