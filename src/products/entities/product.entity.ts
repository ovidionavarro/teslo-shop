import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product_image } from "./product_image.entity";

@Entity({name:'products'})
export class Product {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text',{
        unique:true
    })
    title: string; 

    @Column('float',{
        default:0
    })
    price: number;

    @Column({
        type:'text',
        nullable:true
    })
    description: string;   

    @Column({
        type:'text',
        nullable:true,
        unique:true

    })
    slug: string;
    
    @Column('int',{
        default:0
    })
    stock: number;

    @Column('text',{
        array: true,
    })
    size: string[];


    @Column('text') 
    gender: string;

    @Column('text',{
        array:true,
        default:[]
    })
    tags:string[];

    @OneToMany(
      ()=>Product_image,
      (productImage:Product_image)=>productImage.product,
      {
          cascade:true,
          eager:true,

      }
    )
    images?:Product_image[]

    @BeforeInsert()
    checkSlugInsert(){

        if(!this.slug){
            this.slug=this.title
            .toLowerCase()
            .replaceAll(' ','_')
            .replaceAll("'",'')
          }
    }

    @BeforeUpdate()
    checkSlugUpdate(){
        if(this.slug){
            this.slug=this.slug
              .toLowerCase()
              .replaceAll(' ','_')
              .replaceAll("'",'')
        }
    }
}
